import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Hits AdminController.getAllStudents
        const res = await api.get('/admin/students');
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch directory", err);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Student Directory</h2>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="border p-2 rounded w-64 focus:ring-2 focus:ring-red-500 outline-none"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map(student => (
          <div key={student.id} className="border p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{student.fullName}</p>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
            <button className="text-red-600 text-sm font-bold hover:underline">View Progress</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDirectory;