import React, { useState, useEffect, useRef } from 'react';
import { firebase } from '../Firebase/config';
import { useRouter } from 'next/router';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { FaUserEdit, FaQrcode, FaFileAlt, FaCog,FaPlus } from 'react-icons/fa';
import { MdOutlinePayments } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const db = firebase.firestore();
const IconWithLabel = ({ icon, label, onClick }) => {
    return (
      <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
        {icon}
        <span className="text-sm mt-1">{label}</span>
      </div>
    );
  };
  
  const Adminregistrattionfooter = ({ }) => {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-white p-4 flex justify-around">
        <IconWithLabel icon={<FaUserEdit size={24} style={{ color: 'blue' }} />} label="Edit"      />
        <IconWithLabel icon={<FaQrcode size={24} style={{ color: 'blue' }} />} label="Screenshot QR Code"/>
        <IconWithLabel icon={<MdOutlinePayments size={24} style={{ color: 'blue' }} />} label="New Payment"  />
      </div>
    );
  };

 



const StudentDetails = () => {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (id) {
                try {
                    const db = firebase.firestore();
                    const querySnapshot = await db.collection('registrations').get();

                    if (!querySnapshot.empty) {
                        // Filter students by ID
                        const studentData = querySnapshot.docs
                            .map(doc => doc.data())
                            .find(student => student.id === Number(id));

                        setStudent(studentData || null); // Set student data or null if not found
                    } else {
                        console.error('No student documents found!');
                        setStudent(null);
                    }
                } catch (error) {
                    console.error('Error fetching student details:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchStudentDetails();
    }, [id]);

    console.log("student",student)

    const [showPersonalDetails, setShowPersonalDetails] = useState(false);
    const [showPaymentdetails, setShowPaymentdetails] = useState(false);
  
  
    const togglePersonalDetails = () => {
      setShowPersonalDetails(!showPersonalDetails);
    };
  
    const togglePaymentDetails = () => {
      setShowPaymentdetails(!showPaymentdetails);
    };


      
    
    
    
      
      
    

    if (loading) return <div>Loading...</div>;
    if (!student) return <div>No student details found.</div>;

    return (
        <div className="min-h-screen bg-white p-4">
           <div className="mb-4">
          
          <div className="flex justify-center items-center">
            <div className="w-48 h-48">
              <img className="w-full h-full object-cover" src={student.imageUrl} alt="rohit" />
            </div>
          </div>
          <h2 className="text-sm md:text-xl font-bold mb-2">
            Student Name: {`${student.firstName} ${student.middleName} ${student.lastName}`}
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <th className="border border-gray-300 p-2">Name of Subject</th>
                {student.subjects.map((subject, index) => (
                  <td key={index} className="border border-gray-300 p-2">
                    {subject.subjectName}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="border border-gray-300 p-2">Fees</th>
                {student.subjects.map((subject, index) => (
                  <td key={index} className="border border-gray-300 p-2">
                  {subject.totalFees}
                </td>
                ))}
              </tr>
              <tr>
  <th className="border border-gray-300 p-2">Paid</th>
  {student.subjects.map((subject, index) => (
    <td key={index} className="border border-gray-300 p-2">
      {subject.columns && subject.columns.reduce((acc, cur) => {
        const parsedAmount = parseFloat(cur.amount);
        return !isNaN(parsedAmount) ? acc + parsedAmount : acc;
      }, 0) !== 0
        ? subject.columns.reduce((acc, cur) => {
            const parsedAmount = parseFloat(cur.amount);
            return !isNaN(parsedAmount) ? acc + parsedAmount : acc;
          }, 0)
        : 0}
    </td>
  ))}
</tr>


<tr>
  <th className="border border-gray-300 p-2">Remain</th>
  {student.subjects.map((subject, index) => (
    <td key={index} className="border border-gray-300 p-2">
      {subject.columns
        ? parseFloat(subject.totalFees) -
          (subject.columns.reduce((acc, cur) => {
            const parsedAmount = parseFloat(cur.amount);
            return !isNaN(parsedAmount) ? acc + parsedAmount : acc;
          }, 0) || parseFloat(subject.totalFees))
        : parseFloat(subject.totalFees)}
    </td>
  ))}
</tr>



            </tbody>
          </table>

          <div className="mb-4 mt-8">
            <button
              type="button"
              onClick={togglePaymentDetails}
              className="text-blue-500 focus:outline-none flex text-xl font-bold"
            >
              {showPaymentdetails ? <FaAngleUp size={20} className="mt-1" /> : <FaAngleDown size={20} className="mt-1" />}
              {showPaymentdetails ? ' Payment Details' : ' Payment Details'}
            </button>
           
            {showPaymentdetails ? (
  student &&
  student.subjects.map((subject, index) => (
    <div key={index}>
      <h1 className="text-xl">{subject.subjectName}</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Date & Time</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">Mode of Payment</th>
            <th className="border border-gray-300 p-2">Received</th>
          </tr>
        </thead>
        <tbody>
          {subject.columns && subject.columns.map((column, columnIndex) => (
            <tr key={columnIndex}>
              <td className="border border-gray-300 p-2">
                <p>{column.date}</p>
              </td>
              <td className="border border-gray-300 p-2">
                <p>{column.amount}</p>
              </td>
              <td className="border border-gray-300 p-2">
                <p>{column.mode}</p>
              </td>
              <td className="border border-gray-300 p-2">
                <p>{column.received}</p>
              </td>
            </tr>
          ))}
        
        </tbody>
      </table>
     
    </div>
  ))
) : null}





        
            
          </div>

          <div className="mb-4 mt-8">
            <button
              type="button"
              onClick={togglePersonalDetails}
              className="text-blue-500 focus:outline-none flex text-xl font-bold"
            >
              {showPersonalDetails ? <FaAngleUp size={20} className="mt-1" /> : <FaAngleDown size={20} className="mt-1" />}
              {showPersonalDetails ? ' Personal Details' : ' Personal Details'}
            </button>
            {showPersonalDetails ? (
              <div>
                <p>
                  <strong>College Name:</strong> {student.collegeName}
                </p>
                <p>
                  <strong>Branch:</strong> {student.branch}
                </p>
                <p>
                  <strong>Calling Number:</strong> {student.callingNumber}
                </p>
                <p>
                  <strong>whatsappNumber:</strong> {student.whatsappNumber}
                </p>
                {/* Display other personal details similarly */}
              </div>
            ) : null}
          </div>

          <Adminregistrattionfooter   />
        </div>
        </div>
    );
};

export default StudentDetails;
