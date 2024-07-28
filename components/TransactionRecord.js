import React, { useState, useEffect } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { firebase } from '../Firebase/config';

const TransactionRecordPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const subjects = ['M1', 'M2', 'M3', 'EM', 'EG', 'DS'];
  const installmentHeadings = ['1st Installment', '2nd Installment', '3rd Installment'];
  const [registrationData, setRegistrationData] = useState([]);
  const [totalCollectionOnline, setTotalCollectionOnline] = useState(0);
  const [totalCollectionOffline, setTotalCollectionOffline] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');

  useEffect(() => {
    const db = firebase.firestore();
    const docRef = db.collection('Newregistrations');

    docRef
      .get()
      .then((snapshot) => {
        const allRegistrationData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          allRegistrationData.push(data);
        });
        setRegistrationData(allRegistrationData);
      })
      .catch((error) => {
        console.error('Error getting documents:', error);
      });
  }, []);

  console.log(registrationData)

  useEffect(() => {
    if (selectedSubject) {
      const filterByDateRange = (data) => {
        if (!fromDateTime || !toDateTime) return data;

        const fromDate = new Date(fromDateTime);
        const toDate = new Date(toDateTime);

        return data.filter((student) =>
          student.subjects.some((subject) =>
            subject.columns.some((column) => {
              const paymentDate = new Date(column.date);
              return paymentDate >= fromDate && paymentDate <= toDate;
            })
          )
        );
      };

      const filteredData = filterByDateRange(registrationData).filter((data) =>
        data.subjects.some((subject) => subject.subjectName === selectedSubject)
      );

      const totalCollectedAmountOnline = filteredData.reduce((total, data) => {
        const subjectData = data.subjects.find((subject) => subject.subjectName === selectedSubject);
        if (subjectData && subjectData.columns) {
          const onlinePayments = subjectData.columns.filter((column) => column.mode === 'online');
          const totalOnline = onlinePayments.reduce((acc, column) => acc + parseFloat(column.amount || 0), 0);
          return total + totalOnline;
        }
        return total;
      }, 0);

      const totalCollectedAmountOffline = filteredData.reduce((total, data) => {
        const subjectData = data.subjects.find((subject) => subject.subjectName === selectedSubject);
        if (subjectData && subjectData.columns) {
          const offlinePayments = subjectData.columns.filter((column) => column.mode === 'offline');
          const totalOffline = offlinePayments.reduce((acc, column) => acc + parseFloat(column.amount || 0), 0);
          return total + totalOffline;
        }
        return total;
      }, 0);

      const remainingBalance = totalCollectedAmountOnline + totalCollectedAmountOffline;
      setTotalCollectionOnline(totalCollectedAmountOnline);
      setTotalCollectionOffline(totalCollectedAmountOffline);
      setRemainingBalance(remainingBalance);
    }
  }, [selectedSubject, registrationData, fromDateTime, toDateTime]);

  return (
    <div className="flex min-h-screen bg-white dark:bg-white">
      <div className="p-8 overflow-x-auto">
        <div className="flex items-center mb-4">
          <FaFileAlt className="mr-2 text-2xl" />
          <h1 className="text-2xl font-bold">Transaction Record</h1>
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="subjectSelect">
            Select Subject:
          </label>
          <select
            id="subjectSelect"
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => setSelectedSubject(e.target.value)}
            value={selectedSubject}
          >
            <option value="">Select a Subject</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="flex mb-4">
        <div className="flex-1">
            <h2 className="font-semibold mb-2 mr-4">Total Collection Cash:</h2>
            <p className="border border-gray-300 rounded p-2">{totalCollectionOffline} </p>
          </div>
          <div className="flex-1 ml-4 ">
            <h2 className="font-semibold mb-2">Total Collection Online:</h2>
            <p className="border border-gray-300 rounded p-2">{totalCollectionOnline} </p>
          </div>
         
        </div>

        <div className="flex mb-4">
          <div className="flex-1">
            <label className="font-semibold mb-2 mr-4" htmlFor="fromDateTime">
              From Date & Time:
            </label>
            <input
              id="fromDateTime"
              type="datetime-local"
              className="border border-gray-300 rounded px-4 py-2"
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="font-semibold mb-2 ml-4" htmlFor="toDateTime">
              To Date & Time:
            </label>
            <input
              id="toDateTime"
              type="datetime-local"
              className="border border-gray-300 rounded px-4 py-2"
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
            />
          </div>
        </div>


        <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
  <tr className="bg-gray-200">
  <th className="border text-sm border-gray-300 px-4 py-2">Date & Time</th>
    <th className="border text-sm border-gray-300 px-4 py-2">Student Name</th>
    <th className="border text-sm border-gray-300 px-4 py-2">Contact Details</th>
  
    <th className="border text-sm border-gray-300 px-4 py-2">Subject</th>
    <th className="border text-sm border-gray-300 px-4 py-2">Amount</th>
    <th className="border text-sm border-gray-300 px-4 py-2">Mode Of Payment</th>
    <th className="border text-sm border-gray-300 px-4 py-2">Received By</th>
  </tr>
</thead>
          <tbody>
  {registrationData.map((student, index) => {
    const subjectsData = student.subjects.find((subject) => subject.subjectName === selectedSubject);
    if (subjectsData) {
      const columnsData = subjectsData.columns || [];

      return columnsData.map((column, i) => (
        <tr key={i} className="bg-gray-100">
           <td className="border border-gray-300 px-4 py-2">
            {column.date} {/* Date and Time of Payment */}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {`${student.firstName} ${student.lastName}`}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {student.callingNumber}
          </td>
         
          <td className="border border-gray-300 px-4 py-2">
            {selectedSubject} {/* Subject */}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {`${column.amount} `} {/* Amount */}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {column.mode} {/* Mode */}
          </td>
          <td className="border border-gray-300 px-4 py-2">
            {column.received} {/* Received By */}
          </td>
        </tr>
      ));
    }
    return null;
  })}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionRecordPage;

