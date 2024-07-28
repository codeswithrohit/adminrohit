import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { toast,ToastContainer } from 'react-toastify'; // Import react-toastify for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify


const Test = () => {
  const [fingerprint, setFingerprint] = useState('');
  
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fingerprint).then(() => {
      toast.success('Copied to clipboard!'); // Show success notification
    }).catch(err => {
      toast.error('Failed to copy!'); // Show error notification
    });
  };

  return (
    <div className='min-h-screen bg-white' >
    <div className="flex flex-col items-center p-4 bg-white ">
      <h1 className="text-xl font-semibold mb-4">Your Fingerprint</h1>
      <div className="flex flex-col items-center space-x-2">
        <span className="text-lg font-mono bg-white p-2 border rounded-md shadow-sm">{fingerprint}</span>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Copy
        </button>
      </div>
      <ToastContainer/>
    </div>
    </div>
  );
}

export default Test;
