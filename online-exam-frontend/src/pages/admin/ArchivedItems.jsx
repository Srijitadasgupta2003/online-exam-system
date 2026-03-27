import { useState, useEffect } from 'react';
import api from '../../api/axios';

// SVG Icons
const ArchiveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ArchivedItems = () => {
  const [archivedCourses, setArchivedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseExams, setCourseExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedCourses();
  }, []);

  const fetchArchivedCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/archived/courses');
      setArchivedCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch archived courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourseExams = async (course) => {
    setSelectedCourse(course);
    setSelectedExam(null);
    setExamSubmissions([]);
    try {
      const res = await api.get(`/admin/archived/courses/${course.id}/exams`);
      setCourseExams(res.data);
    } catch (err) {
      console.error("Failed to fetch archived exams", err);
    }
  };

  const handleViewExamSubmissions = async (exam) => {
    setSelectedExam(exam);
    try {
      const res = await api.get(`/admin/archived/exams/${exam.id}/submissions`);
      setExamSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch exam submissions", err);
      setExamSubmissions([]);
    }
  };

  const handleViewSubmissionDetails = async (submissionId) => {
    try {
      const res = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(res.data);
    } catch (err) {
      console.error("Failed to fetch submission details", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED': return <span className="text-green-400"><CheckIcon /></span>;
      case 'FAILED': return <span className="text-red-400"><XIcon /></span>;
      default: return <span className="text-yellow-400"><ClockIcon /></span>;
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <p className="text-gray-400">Loading archived items...</p>
      </div>
    );
  }

  // Submission details view
  if (selectedSubmission) {
    return (
      <div className="card p-4 sm:p-6">
        <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 mb-4 hover:text-primary-400 text-sm">
          ← Back to Exam
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">{selectedSubmission.examTitle}</h2>
        <p className="text-sm text-gray-400 mb-4">
          Student: {selectedSubmission.studentName} · {selectedSubmission.totalMarksAwarded?.toFixed(2)}/{selectedSubmission.examMaxMarks}
        </p>
        <div className="space-y-4">
          {selectedSubmission.answers?.map((answer, i) => (
            <div key={answer.answerId} className={`p-3 sm:p-4 rounded-lg border ${
              answer.marksAwarded > 0 
                ? 'bg-green-900/20 border-green-800' 
                : 'bg-red-900/20 border-red-800'
            }`}>
              <div className="flex items-start justify-between">
                <p className="font-bold text-sm text-white flex-1">
                  {i + 1}. {answer.questionContent}
                </p>
                <span className={`ml-3 ${answer.marksAwarded > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {answer.marksAwarded > 0 ? <CheckIcon /> : <XIcon />}
                </span>
              </div>
              {answer.selectedOption && (
                <div className="mt-2 text-sm">
                  <p className={answer.marksAwarded > 0 ? 'text-green-400' : 'text-red-400'}>
                    Student's answer: Option {answer.selectedOption}
                  </p>
                  {answer.marksAwarded === 0 && answer.correctAnswer && (
                    <p className="text-green-400">Correct: Option {answer.correctAnswer}</p>
                  )}
                </div>
              )}
              {answer.subjectiveText && (
                <div className="mt-2 text-sm">
                  <p className="text-gray-300">Student's answer: {answer.subjectiveText}</p>
                  <p className="text-gray-400 mt-1">Marks: {answer.marksAwarded?.toFixed(2)}/{answer.maxQuestionMarks?.toFixed(2)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Exam submissions view
  if (selectedExam) {
    return (
      <div className="card p-4 sm:p-6">
        <button onClick={() => setSelectedExam(null)} className="text-gray-400 mb-4 hover:text-primary-400 text-sm">
          ← Back to Exams
        </button>
        <div className="flex items-center gap-2 mb-4">
          <UserIcon />
          <h2 className="text-lg sm:text-xl font-bold text-white">{selectedExam.title}</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">Student Submissions</p>
        {examSubmissions.length === 0 ? (
          <p className="text-gray-400 italic">No submissions found for this exam.</p>
        ) : (
          <div className="space-y-3">
            {examSubmissions.map(sub => (
              <div key={sub.id} className="card-hover p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(sub.status)}
                  <div>
                    <p className="font-medium text-white">{sub.studentName || 'Student'}</p>
                    <p className="text-xs text-gray-400">
                      {sub.totalMarksAwarded != null ? `${sub.totalMarksAwarded.toFixed(2)}/${sub.maxMarks}` : 'Pending'}
                      {' · '}{new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleViewSubmissionDetails(sub.id)} className="text-sm font-semibold text-primary-400 self-start sm:self-auto">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Course exams view
  if (selectedCourse) {
    return (
      <div className="card p-4 sm:p-6">
        <button onClick={() => setSelectedCourse(null)} className="text-gray-400 mb-4 hover:text-primary-400 text-sm">
          ← Back to Courses
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{selectedCourse.title}</h2>
        <p className="text-sm text-gray-400 mb-4">Archived Exams</p>
        {courseExams.length === 0 ? (
          <p className="text-gray-400 italic">No archived exams for this course.</p>
        ) : (
          <div className="space-y-3">
            {courseExams.map(exam => (
              <div key={exam.id} className="card-hover p-3 sm:p-4 flex items-center justify-between cursor-pointer" onClick={() => handleViewExamSubmissions(exam)}>
                <div>
                  <p className="font-medium text-white">{exam.title}</p>
                  <p className="text-xs text-gray-400">
                    {exam.examType} · {exam.maxMarks} marks · {exam.duration} min
                  </p>
                </div>
                <ChevronRightIcon />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main view - list of archived courses
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <ArchiveIcon />
        <h2 className="text-lg sm:text-xl font-bold text-white">Archived Courses</h2>
      </div>
      {archivedCourses.length === 0 ? (
        <p className="text-gray-400 italic">No archived courses found.</p>
      ) : (
        <div className="space-y-3">
          {archivedCourses.map(course => (
            <div key={course.id} className="card-hover p-3 sm:p-4 flex items-center justify-between cursor-pointer" onClick={() => handleViewCourseExams(course)}>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{course.title}</p>
                <p className="text-xs text-gray-400 truncate">{course.description || 'No description'}</p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="badge-warning hidden sm:inline-flex">Archived</span>
                <ChevronRightIcon />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedItems;
