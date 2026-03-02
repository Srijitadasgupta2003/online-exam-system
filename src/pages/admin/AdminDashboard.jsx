import { useState } from 'react';
import PendingEnrollments from './PendingEnrollments';
import SubjectiveGrading from './SubjectiveGrading';
import StudentDirectory from './StudentDirectory';
import CourseManagement from './CourseManagement';
import TransactionHistory from './TransactionHistory';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals');

  // Inside AdminDashboard.jsx
const menuItems = [
  { id: 'approvals', label: 'Enrollment Requests', icon: '👤+' },
  { id: 'history', label: 'Transaction History', icon: '💰' }, // New Tab
  { id: 'grading', label: 'Grading Queue', icon: '📝' },
  { id: 'students', label: 'All Students', icon: '👥' },
  { id: 'courses', label: 'Manage Courses', icon: '📚' },
];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 text-red-500">Admin Portal</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === item.id ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="mr-3">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'approvals' && <PendingEnrollments />}
          {activeTab === 'history' && <TransactionHistory />}
          {activeTab === 'grading' && <SubjectiveGrading />}
          {activeTab === 'students' && <StudentDirectory />}
          {activeTab === 'courses' && <CourseManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;