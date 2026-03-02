import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import CourseCard from '../../components/student/CourseCard';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('my-learning');
  const [allCourses, setAllCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all active courses for the 'Explore' tab
      const coursesRes = await api.get('/courses');
      setAllCourses(coursesRes.data);

      // Fetch student-specific enrollments for 'My Learning'
      const enrollmentsRes = await api.get(`/enrollments/user/${user.id}`);
      setMyEnrollments(enrollmentsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for the Search Bar
  const filteredExplore = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    course.active // Matches the 'active' boolean in your Course entity
  );

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.fullName}</h1>
            <p className="text-gray-600">Learning dashboard</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`py-2 px-4 font-semibold ${activeTab === 'my-learning' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-500'}`}
          >
            My Learning
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-2 px-4 font-semibold ${activeTab === 'explore' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-red-500'}`}
          >
            Explore Courses
          </button>
        </div>

        {/* Explore Tab Search Bar */}
        {activeTab === 'explore' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses by name..."
              className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'my-learning' ? (
            myEnrollments.length > 0 ? (
              myEnrollments.map(enrol => (
                <CourseCard key={enrol.id} course={enrol} type="enrolled" />
              ))
            ) : (
              <p className="text-gray-500 italic">You haven't enrolled in any courses yet.</p>
            )
          ) : (
            filteredExplore.map(course => (
              <CourseCard key={course.id} course={course} type="explore" onPurchase={fetchData} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;