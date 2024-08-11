import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { firebase } from '../../Firebase/config'; // Adjust path as needed

const StudentDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (id) {
                try {
                    const db = firebase.firestore();
                    const doc = await db.collection('registrations').doc(id).get();
                    
                    if (doc.exists) {
                        setStudent(doc.data());
                    } else {
                        console.error('No such document!');
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

    if (loading) return <div>Loading...</div>;
    if (!student) return <div>No student details found.</div>;

    return (
        <div className="min-h-screen bg-white p-4">
            <h1 className="text-2xl font-bold mb-4">Student Details</h1>
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <img src={student.imageUrl} alt="Student" className="w-32 h-32 rounded-full mx-auto mb-4" />
                <p><strong>Name:</strong> {student.firstName} {student.middleName} {student.lastName}</p>
                <p><strong>College:</strong> {student.collegeName}</p>
                <p><strong>Branch:</strong> {student.branch}</p>
                <p><strong>WhatsApp Number:</strong> {student.whatsappNumber}</p>
                <p><strong>Calling Number:</strong> {student.callingNumber}</p>
                
                <h2 className="text-xl font-semibold mt-4">Subjects</h2>
                <ul>
                    {student.subjects.map((subject, index) => (
                        <li key={index} className="py-1">
                            <strong>Subject:</strong> {subject.subjectName} - <strong>Fees:</strong> {subject.totalFees}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentDetails;
