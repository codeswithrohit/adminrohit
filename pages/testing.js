import React, { useState, useEffect } from 'react';
import { firebase } from '../Firebase/config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';

const TransactionRecordPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedMode, setSelectedMode] = useState('');
  const [registrationData, setRegistrationData] = useState([]);
  const [totalCollectionOnline, setTotalCollectionOnline] = useState(0);
  const [totalCollectionOffline, setTotalCollectionOffline] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isDataVisible, setIsDataVisible] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const db = firebase.firestore();
        const subjectsSnapshot = await db.collection('subjects').get();
        const subjects = subjectsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setSubjects(subjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const db = firebase.firestore();
        const docRef = db.collection('registrations');
        const snapshot = await docRef.get();
        const allRegistrationData = [];
        snapshot.forEach((doc) => {
          allRegistrationData.push(doc.data());
        });
        setRegistrationData(allRegistrationData);
      } catch (error) {
        console.error('Error getting documents:', error);
      }
    };

    fetchRegistrationData();
  }, []);

  useEffect(() => {
    const filterData = () => {
      let data = registrationData;
  
      // Log initial registration data
      console.log('Initial Registration Data:', data);
  
      // Filter by selected subject
      if (selectedSubject) {
        data = data.map((student) => ({
          ...student,
          subjects: student.subjects.filter((subject) => subject.subjectName === selectedSubject),
        })).filter((student) => student.subjects.length > 0);
      }
  
      // Log data after subject filtering
      console.log('Data After Subject Filtering:', data);
  
      // Filter by selected mode
      if (selectedMode && selectedMode !== 'All') {
        data = data.map((student) => ({
          ...student,
          subjects: student.subjects.map((subject) => ({
            ...subject,
            columns: subject.columns ? subject.columns.filter((column) => column.mode === selectedMode) : [],
          })).filter((subject) => subject.columns.length > 0),
        })).filter((student) => student.subjects.length > 0);
      }
  
      // Log data after mode filtering
      console.log('Data After Mode Filtering:', data);
  
      // Filter by date range
      if (fromDateTime && toDateTime) {
        const fromDate = moment(fromDateTime, 'YYYY-MM-DDTHH:mm').startOf('day').toDate();
        const toDate = moment(toDateTime, 'YYYY-MM-DDTHH:mm').endOf('day').toDate();
  
        // Log selected date range
        console.log('Selected Date Range:', {
          fromDate: moment(fromDate).format('DD/MM/YYYY HH:mm:ss'),
          toDate: moment(toDate).format('DD/MM/YYYY HH:mm:ss')
        });
  
        data = data.map((student) => ({
          ...student,
          subjects: student.subjects.map((subject) => ({
            ...subject,
            columns: subject.columns ? subject.columns.filter((column) => {
              const columnDate = moment(column.date, 'DD/MM/YYYY HH:mm:ss').toDate();
  
              // Log each column date and its comparison result
              console.log('Column Date:', moment(column.date, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY HH:mm:ss'));
              console.log('Is Column Date Within Range:', columnDate >= fromDate && columnDate <= toDate);
  
              return columnDate >= fromDate && columnDate <= toDate;
            }) : [],
          })).filter((subject) => subject.columns.length > 0),
        })).filter((student) => student.subjects.length > 0);
  
        // Log data after date range filtering
        console.log('Data After Date Range Filtering:', data);
      }
  
      console.log('Filtered Data:', data); // Log the filtered data to the console
  
      return data;
    };
  
    const data = filterData();
    setFilteredData(data);
    setIsDataVisible(data.length > 0);
  
    const calculateTotalCollection = (data, mode) => {
      return data.reduce((total, student) => {
        const subjectData = student.subjects?.find((subject) => subject.subjectName === selectedSubject);
        if (subjectData && subjectData.columns) {
          const payments = mode === 'All'
            ? subjectData.columns
            : subjectData.columns.filter((column) => column.mode === mode);
          const totalAmount = payments.reduce((acc, column) => acc + parseFloat(column.amount || 0), 0);
          return total + totalAmount;
        }
        return total;
      }, 0);
    };
  
    let totalOnline = 0;
    let totalOffline = 0;
  
    if (selectedMode === 'All' || selectedMode === '') {
      totalOnline = calculateTotalCollection(data, 'Online');
      totalOffline = calculateTotalCollection(data, 'Cash');
    } else {
      totalOnline = calculateTotalCollection(data, 'Online');
      totalOffline = calculateTotalCollection(data, 'Cash');
    }
  
    const totalBalance = totalOnline + totalOffline;
  
    setTotalCollectionOnline(totalOnline);
    setTotalCollectionOffline(totalOffline);
    setRemainingBalance(totalBalance);
  }, [selectedSubject, selectedMode, registrationData, fromDateTime, toDateTime]);
  

  const downloadPDF = () => {
    const input = document.getElementById('pdfTable');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const now = moment().format('DD/MM/YYYY HH:mm:ss');
      const fileName = `transaction-record-${now}.pdf`;

      pdf.save(fileName);
    });
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-white">
      <div className="p-8 overflow-x-auto">
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
            {subjects.map(sub => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="modeSelect">
            Select Mode:
          </label>
          <select
            id="modeSelect"
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => setSelectedMode(e.target.value)}
            value={selectedMode}
          >
            <option value="">Select a Mode</option>
            <option value="All">All</option>
            <option value="Online">Online</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">From Date & Time:</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => {
              setFromDateTime(e.target.value);
              console.log('From DateTime:', e.target.value);
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">To Date & Time:</label>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded px-4 py-2"
            onChange={(e) => {
              setToDateTime(e.target.value);
              console.log('To DateTime:', e.target.value);
            }}
          />
        </div>

        {isDataVisible && (
          <div>
            <button onClick={downloadPDF} className="bg-blue-500 text-white px-4 py-2 rounded">
              Download PDF
            </button>
            <div id="pdfTable" className="mt-4">
              <h2 className="text-2xl mb-4">Transaction Records</h2>
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2">Subject</th>
                    <th className="border-b px-4 py-2">Mode</th>
                    <th className="border-b px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((student, studentIndex) =>
                    student.subjects.map((subject, subjectIndex) =>
                      subject.columns.map((column, columnIndex) => (
                        <tr key={`${studentIndex}-${subjectIndex}-${columnIndex}`}>
                          <td className="border-b px-4 py-2">{subject.subjectName}</td>
                          <td className="border-b px-4 py-2">{column.mode}</td>
                          <td className="border-b px-4 py-2">{column.amount}</td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
              <div className="mt-4">
                <p>Total Collection Online: {totalCollectionOnline}</p>
                <p>Total Collection Offline: {totalCollectionOffline}</p>
                <p>Remaining Balance: {remainingBalance}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionRecordPage;
