import "@/styles/globals.css";
import React, { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // Import FingerprintJS
import { firebase } from '../Firebase/config';
import { useRouter } from 'next/router'; // Import useRouter

export default function App({ Component, pageProps }) {
  const [userdata, setUserData] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading status
  const [fingerprint, setFingerprint] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const getFingerprint = async () => {
      let storedFingerprint = localStorage.getItem('fingerprint');

      if (storedFingerprint) {
        // Use the stored fingerprint
        setFingerprint(storedFingerprint);
      } else {
        // Generate a new fingerprint and store it
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        storedFingerprint = result.visitorId;
        localStorage.setItem('fingerprint', storedFingerprint);
        setFingerprint(storedFingerprint);
      }
    };

    getFingerprint();
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (authUser) {
        fetchUsers(); // Fetch users if authenticated
      } else {
        setLoading(false); // Set loading to false if no user is authenticated
      }
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

 

  const fetchUsers = async () => {
    if (!fingerprint) return; // Only fetch users if fingerprint is available

    try {
      setLoading(true); // Set loading to true before fetching
      const usersRef = firebase.firestore().collection('users')
        .where("fingerprint", "==", fingerprint)
        .where("active", "==", true);

      const snapshot = await usersRef.get();
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (userData.length === 0) {
        // Redirect to login page if no data found
        router.push('https://www.youtube.com/watch?v=mjJzaiGkaQA');
        return;
      }

      setAuthenticated(true);
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    if (!loading) {
      if (userdata.length === 0) {
        // Redirect to login page if userdata is empty
        router.push('https://www.youtube.com/watch?v=mjJzaiGkaQA');
      } else if (authenticated && router.pathname === '/login') {
        // Redirect to a different page if authenticated and on the login page
        router.push('/'); // Change to the page you want to redirect to
      }
    }
  }, [loading, userdata, authenticated, router]);

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator
  }

  return <Component {...pageProps} />;
}
