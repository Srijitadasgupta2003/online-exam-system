import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import PendingEnrollments from './PendingEnrollments';
import SubjectiveGrading from './SubjectiveGrading';
import StudentDirectory from './StudentDirectory';
import CourseManagement from './CourseManagement';
import TransactionHistory from './TransactionHistory';
import LockedStudents from './LockedStudents';
import ArchivedItems from './ArchivedItems';
import QRCodeSettings from './QRCodeSettings';

// SVG Icons
const UserPlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GradingIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ArchiveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [historyKey, setHistoryKey] = useState(0);
  const [lockedKey, setLockedKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'approvals', label: 'Enrollment Requests', icon: <UserPlusIcon /> },
    { id: 'history', label: 'Transaction History', icon: <CurrencyIcon /> },
    { id: 'grading', label: 'Grading Queue', icon: <GradingIcon /> },
    { id: 'locked', label: 'Locked Students', icon: <LockIcon /> },
    { id: 'students', label: 'All Students', icon: <UsersIcon /> },
    { id: 'courses', label: 'Manage Courses', icon: <BookIcon /> },
    { id: 'archived', label: 'Archived', icon: <ArchiveIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const tabTitles = {
    approvals: 'Enrollment Requests',
    history: 'Transaction History',
    grading: 'Grading Queue',
    locked: 'Locked Students',
    students: 'All Students',
    courses: 'Manage Courses',
    archived: 'Archived Items',
    settings: 'Settings',
  };

  return (
    <div className="flex min-h-screen bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        menuItems={menuItems} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Hamburger menu (mobile only) */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <MenuIcon />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  {tabTitles[activeTab]}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 hidden sm:block">
                  Manage your exam portal
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'approvals' && <PendingEnrollments onApproval={() => setHistoryKey(prev => prev + 1)} />}
            {activeTab === 'history' && <TransactionHistory key={historyKey} historyKey={historyKey} />}
            {activeTab === 'grading' && <SubjectiveGrading />}
            {activeTab === 'locked' && <LockedStudents key={lockedKey} />}
            {activeTab === 'students' && <StudentDirectory />}
            {activeTab === 'courses' && <CourseManagement />}
            {activeTab === 'archived' && <ArchivedItems />}
            {activeTab === 'settings' && <QRCodeSettings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
