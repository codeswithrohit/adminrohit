import React, { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs'; // Import FingerprintJS
import { firebase } from '../Firebase/config';
import { useRouter } from 'next/router'; // Import useRouter

const Testing = () => {
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
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);

  useEffect(() => {
    if (!fingerprint || !user) return; // Only fetch users if fingerprint and user are available

    const fetchUsers = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const usersRef = firebase.firestore().collection('users')
          .where("fingerprint", "==", fingerprint) // Correct query syntax
          .where("active", "==", true); // Correct query syntax and type for boolean

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

    fetchUsers();
  }, [fingerprint, user, router]); // Depend on fingerprint, user, and router to fetch users and handle redirection

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator
  }

  

  return (
    <div>
      <h1>User Data</h1>
      {userdata.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {userdata.map((user) => (
            <li key={user.id}>
              {user.name} {/* Adjust this based on your user data structure */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Testing;
