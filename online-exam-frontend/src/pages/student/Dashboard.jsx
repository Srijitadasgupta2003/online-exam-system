import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import CourseCard from '../../components/student/CourseCard';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-learning');
  const [allCourses, setAllCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Results tab state
  const [submissions, setSubmissions] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'results' && submissions.length === 0) {
      fetchSubmissions();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const coursesRes = await api.get('/courses');
      setAllCourses(coursesRes.data);

      console.log("Fetching enrollments for user:", user.id);
      const enrollmentsRes = await api.get(`/enrollments/user/${user.id}`);
      console.log("Enrollments received:", enrollmentsRes.data);
      setMyEnrollments(enrollmentsRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setResultsLoading(true);
    try {
      const res = await api.get('/submissions/my-results');
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions", err);
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchSubmissionDetails = async (submissionId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(res.data);
    } catch (err) {
      alert("Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownloadCertificate = async (submissionId) => {
    try {
      const res = await api.get(`/certificates/download/${submissionId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download certificate");
    }
  };

  const filteredSubmissions = statusFilter === 'ALL'
    ? submissions
    : submissions.filter(s => s.status === statusFilter);

  const groupedByCourse = filteredSubmissions.reduce((acc, sub) => {
    const course = sub.courseTitle || 'Unknown Course';
    if (!acc[course]) acc[course] = [];
    acc[course].push(sub);
    return acc;
  }, {});

  const passedCount = submissions.filter(s => s.status === 'PASSED').length;
  const pendingCount = submissions.filter(s => s.status === 'PENDING').length;
  const failedCount = submissions.filter(s => s.status === 'FAILED').length;

  const filteredExplore = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    course.active
  );

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {user.fullName}</h1>
            <p className="text-gray-400">Learning dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`py-2 px-4 font-semibold ${activeTab === 'my-learning' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-primary-400'}`}
          >
            My Learning
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-2 px-4 font-semibold ${activeTab === 'explore' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-primary-400'}`}
          >
            Explore Courses
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-4 font-semibold ${activeTab === 'results' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400 hover:text-primary-400'}`}
          >
            My Results
          </button>
        </div>

        {/* Explore Tab Search Bar */}
        {activeTab === 'explore' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search courses by name..."
              className="input-field max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* My Learning & Explore Content */}
        {(activeTab === 'my-learning' || activeTab === 'explore') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'my-learning' ? (
              myEnrollments.length > 0 ? (
                myEnrollments.map(enrol => (
                  <CourseCard key={enrol.id} course={enrol} type="enrolled" />
                ))
              ) : (
                <p className="text-gray-400 italic">You haven't enrolled in any courses yet.</p>
              )
            ) : (
              filteredExplore.map(course => (
                <CourseCard key={course.id} course={course} type="explore" onPurchase={() => { fetchData(); setActiveTab('my-learning'); }} />
              ))
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{passedCount}</p>
                <p className="text-xs sm:text-sm text-green-500 font-medium">Passed</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{pendingCount}</p>
                <p className="text-xs sm:text-sm text-yellow-500 font-medium">Pending</p>
              </div>
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-red-400">{failedCount}</p>
                <p className="text-xs sm:text-sm text-red-500 font-medium">Failed</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['ALL', 'PASSED', 'PENDING', 'FAILED'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    statusFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Results Content */}
            {resultsLoading ? (
              <p className="text-center text-gray-400 py-10">Loading results...</p>
            ) : Object.keys(groupedByCourse).length === 0 ? (
              <p className="text-center text-gray-400 py-10 italic">
                {statusFilter === 'ALL' ? 'No exam results yet.' : `No ${statusFilter.toLowerCase()} exams.`}
              </p>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(groupedByCourse).map(([courseTitle, courseSubmissions]) => (
                  <div key={courseTitle}>
                    <h3 className="text-base sm:text-lg font-bold text-white border-b border-gray-700 pb-2 mb-3 sm:mb-4">
                      {courseTitle}
                    </h3>
                    <div className="space-y-3">
                      {courseSubmissions.map(sub => (
                        <div key={sub.id} className="card-hover p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className={`text-xl sm:text-2xl ${sub.status === 'PASSED' ? 'text-green-400' : sub.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {sub.status === 'PASSED' ? '✅' : sub.status === 'FAILED' ? '❌' : '⏳'}
                            </span>
                            <div>
                              <p className="font-bold text-white">{sub.examTitle}</p>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {sub.totalMarksAwarded != null ? `${sub.totalMarksAwarded.toFixed(2)}/${sub.maxMarks}` : 'Pending'}
                                {' · '}{new Date(sub.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              onClick={() => fetchSubmissionDetails(sub.id)}
                              className="btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                            >
                              View Details
                            </button>
                            {sub.status === 'PASSED' && (
                              <button
                                onClick={() => handleDownloadCertificate(sub.id)}
                                className="btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                              >
                                Certificate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="card w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedSubmission.examTitle}</h2>
                    <p className="text-sm text-gray-400">
                      {selectedSubmission.totalMarksAwarded.toFixed(2)}/{selectedSubmission.examMaxMarks} marks
                      {' · '}{selectedSubmission.status}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {detailLoading ? (
                  <p className="text-center text-gray-400">Loading...</p>
                ) : (
                  selectedSubmission.answers?.map((ans, i) => (
                    <div key={ans.answerId} className={`p-4 rounded-lg border ${
                      ans.marksAwarded > 0 
                        ? 'bg-green-900/20 border-green-800' 
                        : 'bg-red-900/20 border-red-800'
                    }`}>
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-sm text-white flex-1">
                          {i + 1}. {ans.questionContent}
                        </p>
                        <span className={`ml-3 text-lg ${ans.marksAwarded > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ans.marksAwarded > 0 ? '✅' : '❌'}
                        </span>
                      </div>

                      {/* MCQ */}
                      {ans.selectedOption && (
                        <div className="mt-2 text-sm space-y-1">
                          <p className={ans.marksAwarded > 0 ? 'text-green-400' : 'text-red-400'}>
                            Your answer: Option {ans.selectedOption}
                          </p>
                          {ans.marksAwarded === 0 && ans.correctAnswer && (
                            <p className="text-green-400">
                              Correct: Option {ans.correctAnswer}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Subjective */}
                      {ans.subjectiveText && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-300">
                            <span className="font-medium">Your answer:</span> {ans.subjectiveText}
                          </p>
                          <p className="text-gray-400 mt-1">
                            Marks: {ans.marksAwarded.toFixed(2)}/{ans.maxQuestionMarks.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
