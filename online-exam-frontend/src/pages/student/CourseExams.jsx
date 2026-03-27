import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CourseExams = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [nextExam, setNextExam] = useState(null);
  const [courseStatus, setCourseStatus] = useState('loading');
  const [passedSubmission, setPassedSubmission] = useState(null);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const examsRes = await api.get(`/exams/course/${courseId}`);
      const exams = examsRes.data
        .filter(e => e.active)
        .sort((a, b) => a.id - b.id);

      if (exams.length === 0) {
        setCourseStatus('no-exams');
        setLoading(false);
        return;
      }

      setCourseTitle(exams[0].courseTitle || 'Course');

      const submissionsRes = await api.get('/submissions/my-results');
      const courseSubmissions = submissionsRes.data.filter(
        s => exams.some(e => e.title === s.examTitle && e.courseTitle === s.courseTitle)
      );

      const passed = courseSubmissions.find(s => s.status === 'PASSED');
      if (passed) {
        setPassedSubmission(passed);
        setCourseStatus('completed');
        setLoading(false);
        return;
      }

      const failedCount = courseSubmissions.filter(s => s.status === 'FAILED').length;

      if (failedCount >= 3) {
        setCourseStatus('locked');
        setLoading(false);
        return;
      }

      const attemptedExamIds = new Set(courseSubmissions.map(s => {
        const exam = exams.find(e => e.title === s.examTitle);
        return exam ? exam.id : null;
      }));

      const next = exams.find(e => !attemptedExamIds.has(e.id));

      if (next) {
        setNextExam(next);
        setCourseStatus('ready');
      } else {
        setCourseStatus('all-attempted');
      }
    } catch (err) {
      console.error("Error fetching course exams", err);
      setCourseStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const res = await api.get(`/certificates/course/${courseId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_course_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download certificate");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="text-gray-400 mb-6 hover:text-primary-400 font-medium"
        >
          ← Back to Dashboard
        </button>

        <div className="card p-6">
          <h2 className="text-2xl font-bold text-white mb-1">{courseTitle}</h2>
          <p className="text-gray-400 text-sm mb-6">Exam Portal</p>

          {/* Course Completed */}
          {courseStatus === 'completed' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-400 mb-2">Course Completed!</h3>
              <p className="text-gray-400 mb-6">
                Congratulations! You have successfully passed an exam in this course.
              </p>
              <button
                onClick={handleDownloadCertificate}
                className="btn-primary"
              >
                Download Certificate
              </button>
            </div>
          )}

          {/* Ready to Take Exam */}
          {courseStatus === 'ready' && nextExam && (
            <div className="py-4">
              <div className="border border-gray-700 rounded-lg p-5 bg-gray-800/50">
                <h3 className="text-lg font-bold text-white mb-3">{nextExam.title}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-400 mb-5">
                  <div>
                    <span className="font-medium">Type:</span> {nextExam.examType}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {nextExam.duration} min
                  </div>
                  <div>
                    <span className="font-medium">Max Marks:</span> {nextExam.maxMarks}
                  </div>
                  <div>
                    <span className="font-medium">Pass Marks:</span> {nextExam.passMarks}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/exam/${nextExam.id}`)}
                  className="btn-primary w-full"
                >
                  Start Exam
                </button>
              </div>

              <div className="mt-5 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg text-sm text-yellow-400">
                <p className="font-bold mb-1">Important</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>This exam is timed. Once started, the timer cannot be paused.</li>
                  <li>Tab switching is monitored. 3 warnings = auto-submit.</li>
                  <li>You have one attempt per exam.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Locked */}
          {courseStatus === 'locked' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Course Locked</h3>
              <p className="text-gray-400 mb-4">
                You have exceeded 3 failed attempts for this course.
              </p>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-400 font-medium mb-2">
                  To unlock your access:
                </p>
                <ul className="text-sm text-yellow-500 text-left list-disc list-inside space-y-1">
                  <li>Contact the administrator</li>
                  <li>Request to unlock your exam access</li>
                  <li>The admin will reset your failed attempts</li>
                </ul>
              </div>
            </div>
          )}

          {/* All Attempted */}
          {courseStatus === 'all-attempted' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">All Exams Attempted</h3>
              <p className="text-gray-400">
                You have attempted all available exams. Check the Results tab for your scores.
              </p>
            </div>
          )}

          {/* No Exams */}
          {courseStatus === 'no-exams' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Exams Available</h3>
              <p className="text-gray-400">
                No active exams are available for this course yet.
              </p>
            </div>
          )}

          {/* Error */}
          {courseStatus === 'error' && (
            <div className="text-center py-8">
              <p className="text-red-400">Failed to load exam data. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseExams;
