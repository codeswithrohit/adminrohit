// Footer.js
import Link from 'next/link';
import React from 'react';
import { FaAddressBook, FaQrcode, FaFileAlt, FaCog } from 'react-icons/fa';

const Adminhomefooter = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-white p-4 flex justify-around">
        <Link href='/studentlist'>
     <FaAddressBook size={24} style={{ color: 'blue' }} /></Link>
      <FaQrcode size={24} />
      <Link href='/TransactionRecord'>
      <FaFileAlt size={24} style={{ color: 'blue' }} /></Link>
      <FaCog size={24} />
    </div>
  );
};

export default Adminhomefooter;
