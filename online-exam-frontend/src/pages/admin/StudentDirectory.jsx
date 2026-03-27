import { useState, useEffect } from 'react';
import api from '../../api/axios';

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);

const StudentDirectory = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [answersLoading, setAnswersLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/students');
        setStudents(res.data.content || res.data);
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

  const handleViewProgress = async (student) => {
    setSelectedStudent(student);
    setShowProgressModal(true);
    setProgressLoading(true);
    try {
      const [enrollmentsRes, submissionsRes] = await Promise.all([
        api.get(`/enrollments/user/${student.id}`),
        api.get(`/admin/students/${student.id}/submissions`)
      ]);
      setStudentEnrollments(enrollmentsRes.data);
      setStudentSubmissions(submissionsRes.data);
    } catch (err) {
      console.error("Failed to fetch student progress", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleViewAnswers = async (submission) => {
    setSelectedSubmission(submission);
    setShowAnswersModal(true);
    setAnswersLoading(true);
    try {
      const res = await api.get(`/submissions/user/${selectedStudent.id}/exam/${submission.examId}`);
      setSubmissionDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch submission details", err);
      setSubmissionDetails(null);
    } finally {
      setAnswersLoading(false);
    }
  };

  const handleUnlockStudent = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to unlock this student? They will get 1 more attempt.')) {
      return;
    }
    try {
      await api.post(`/enrollments/${enrollmentId}/unlock`);
      alert('Student unlocked successfully! They can now retake exams.');
      if (selectedStudent) {
        const [enrollmentsRes, submissionsRes] = await Promise.all([
          api.get(`/enrollments/user/${selectedStudent.id}`),
          api.get(`/admin/students/${selectedStudent.id}/submissions`)
        ]);
        setStudentEnrollments(enrollmentsRes.data);
        setStudentSubmissions(submissionsRes.data);
      }
    } catch (err) {
      alert('Failed to unlock student: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedStudent(null);
    setStudentEnrollments([]);
    setStudentSubmissions([]);
  };

  const closeAnswersModal = () => {
    setShowAnswersModal(false);
    setSelectedSubmission(null);
    setSubmissionDetails(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED': return <span className="text-green-500"><CheckIcon /></span>;
      case 'FAILED': return <span className="text-red-500"><XIcon /></span>;
      default: return <span className="text-yellow-500"><ClockIcon /></span>;
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Directory</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input-field w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map(student => (
          <div key={student.id} className="card-hover p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{student.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
            </div>
            <button
              onClick={() => handleViewProgress(student)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View Progress
            </button>
          </div>
        ))}
      </div>

      {/* Progress Modal */}
      {showProgressModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="card w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedStudent.fullName}</h2>
                  <p className="text-sm text-gray-400">{selectedStudent.email}</p>
                </div>
                <button onClick={closeProgressModal} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>
            </div>

            <div className="p-6">
              {progressLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading progress...</p>
              ) : studentEnrollments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10 italic">No enrollments found.</p>
              ) : (
                <div className="space-y-6">
                  {studentEnrollments.map(enrollment => {
                    const courseSubmissions = studentSubmissions.filter(
                      s => s.courseTitle === enrollment.courseTitle
                    );
                    return (
                      <div key={enrollment.id} className="border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white">{enrollment.courseTitle}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Status: <span className={
                                enrollment.status === 'PAID' ? 'text-green-600 dark:text-green-400 font-medium' :
                                enrollment.status === 'EXAM_LOCKED' ? 'text-red-600 dark:text-red-400 font-medium' :
                                'text-yellow-600 dark:text-yellow-400'
                              }>
                                {enrollment.status}
                              </span>
                            </p>
                            {enrollment.status === 'EXAM_LOCKED' && (
                              <button
                                onClick={() => handleUnlockStudent(enrollment.id)}
                                className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                              >
                                <UnlockIcon /> Unlock
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          {courseSubmissions.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No exams attempted yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {courseSubmissions.map(submission => (
                                <div key={submission.id} className="flex items-center justify-between border border-gray-700 rounded p-3 bg-gray-800/50">
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(submission.status)}
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{submission.examTitle}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {submission.totalMarksAwarded != null ? `${submission.totalMarksAwarded.toFixed(2)}/${submission.maxMarks}` : 'Pending'}
                                        {' · '}{new Date(submission.submittedAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleViewAnswers(submission)}
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                  >
                                    View Answers
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Answers Modal */}
      {showAnswersModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="card w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedSubmission.examTitle}</h2>
                  <p className="text-sm text-gray-400">
                    {selectedSubmission.status} · {selectedSubmission.totalMarksAwarded != null ? `${selectedSubmission.totalMarksAwarded.toFixed(2)}/${selectedSubmission.maxMarks}` : 'Pending'}
                  </p>
                </div>
                <button onClick={closeAnswersModal} className="text-gray-400 hover:text-white text-2xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {answersLoading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">Loading answers...</p>
              ) : !submissionDetails || !submissionDetails.answers ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10 italic">No answers found.</p>
              ) : (
                submissionDetails.answers.map((answer, i) => (
                  <div key={answer.answerId} className={`p-4 rounded-lg border ${
                    answer.marksAwarded > 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-sm text-gray-900 dark:text-white flex-1">
                        {i + 1}. {answer.questionContent}
                      </p>
                      <span className={`ml-3 ${answer.marksAwarded > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {answer.marksAwarded > 0 ? <CheckIcon /> : <XIcon />}
                      </span>
                    </div>

                    {/* MCQ */}
                    {answer.selectedOption && (
                      <div className="mt-2 text-sm space-y-1">
                        <p className={answer.marksAwarded > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                          Student's answer: Option {answer.selectedOption}
                        </p>
                        {answer.marksAwarded === 0 && answer.correctAnswer && (
                          <p className="text-green-700 dark:text-green-400">
                            Correct: Option {answer.correctAnswer}
                          </p>
                        )}
                        {answer.marksAwarded > 0 && (
                          <p className="text-green-600 dark:text-green-400 text-xs">Correct answer</p>
                        )}
                      </div>
                    )}

                    {/* Subjective */}
                    {answer.subjectiveText && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Student's answer:</span> {answer.subjectiveText}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          Marks: {answer.marksAwarded.toFixed(2)}/{answer.maxQuestionMarks.toFixed(2)}
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
  );
};

export default StudentDirectory;
