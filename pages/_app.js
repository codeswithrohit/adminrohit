import "@/styles/globals.css";
import React, { useState, useEffect, useCallback } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { firebase } from '../Firebase/config';
import { useRouter } from 'next/router';
import Button from "../components/Button";

export default function App({ Component, pageProps }) {
  const [userdata, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getFingerprint = useCallback(async () => {
    let storedFingerprint = localStorage.getItem('fingerprint');

    if (storedFingerprint) {
      setFingerprint(storedFingerprint);
    } else {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      storedFingerprint = result.visitorId;
      localStorage.setItem('fingerprint', storedFingerprint);
      setFingerprint(storedFingerprint);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!fingerprint) return;

    try {
      setLoading(true);
      const usersRef = firebase.firestore().collection('users')
        .where("fingerprint", "==", fingerprint)
        .where("active", "==", true);

      const snapshot = await usersRef.get();
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Save userData to localStorage
      localStorage.setItem('userdata', JSON.stringify(userData));

      if (userData.length === 0) {
        router.push('https://www.youtube.com/watch?v=mjJzaiGkaQA');
        return;
      }

      setAuthenticated(true);
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [fingerprint, router]);

  const listenForChanges = useCallback(() => {
    if (!fingerprint) return;

    const usersRef = firebase.firestore().collection('users')
      .where("fingerprint", "==", fingerprint)
      .where("active", "==", true);

    const unsubscribe = usersRef.onSnapshot((snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update userData in localStorage
      localStorage.setItem('userdata', JSON.stringify(userData));
      setUserData(userData);
    }, (error) => {
      console.error('Error listening for changes:', error);
    });

    return unsubscribe;
  }, [fingerprint]);

  useEffect(() => {
    getFingerprint();
  }, [getFingerprint]);

  useEffect(() => {
    const unsubscribeAuth = firebase.auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        fetchUsers(); // Fetch users if authenticated
        const unsubscribeData = listenForChanges(); // Start listening for changes

        return () => {
          unsubscribeAuth(); // Clean up auth subscription
          unsubscribeData(); // Clean up data listener
        };
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Clean up the auth subscription on unmount
  }, [fetchUsers, listenForChanges]);

  useEffect(() => {
    if (!loading) {
      const { pathname } = router;

      if (userdata.length === 0) {
        if (pathname !== '/login' && pathname !== '/fingerprint') {
          router.push('https://www.youtube.com/watch?v=mjJzaiGkaQA');
        }
      } else if (authenticated && router.pathname === '/login') {
        router.push('/'); // Redirect if authenticated and on login page
      }
    }
  }, [loading, userdata, authenticated, router]);

  if (loading) {
    return <div aria-label="Loading..." role="status" class="flex min-h-screen justify-center items-center space-x-2">
    <svg class="h-20 w-20 animate-spin stroke-gray-500" viewBox="0 0 256 256">
        <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
        <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
        </line>
        <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
        <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
        </line>
        <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round"
            stroke-width="24"></line>
        <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24">
        </line>
    </svg>
    <span class="text-4xl font-medium text-gray-500">Loading...</span>
</div>; // Display loading indicator
  }

  return (
    <>
      <Component userdata={userdata} {...pageProps} />
      <Button />
    </>
  );

}
