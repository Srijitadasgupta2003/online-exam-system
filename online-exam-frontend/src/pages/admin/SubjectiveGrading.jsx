import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SubjectiveGrading = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [grades, setGrades] = useState({});
  const [gradingLoading, setGradingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions/pending');
      setPendingSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch pending grades", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeNow = async (submission) => {
    setSelectedSubmission(submission);
    setGradingLoading(true);
    try {
      const res = await api.get(`/submissions/${submission.id}`);
      setSubmissionDetails(res.data);

      const initialGrades = {};
      res.data.answers.forEach(ans => {
        initialGrades[ans.answerId] = 0;
      });
      setGrades(initialGrades);
    } catch (err) {
      alert("Failed to load submission details");
      setSelectedSubmission(null);
    } finally {
      setGradingLoading(false);
    }
  };

  const handleGradeChange = (answerId, value, maxMarks) => {
    const numValue = parseFloat(value) || 0;
    const clampedValue = Math.min(Math.max(numValue, 0), maxMarks);
    setGrades(prev => ({ ...prev, [answerId]: clampedValue }));
  };

  const calculateTotal = () => {
    return Object.values(grades).reduce((sum, val) => sum + val, 0);
  };

  const handleSubmitGrades = async () => {
    if (!submissionDetails) return;

    const allGraded = submissionDetails.answers.every(ans =>
      grades[ans.answerId] !== undefined && grades[ans.answerId] !== null
    );

    if (!allGraded) {
      alert("Please assign marks to all questions.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        submissionId: submissionDetails.id,
        grades: Object.entries(grades).map(([answerId, marksAwarded]) => ({
          answerId: parseInt(answerId),
          marksAwarded: parseFloat(marksAwarded)
        }))
      };

      await api.post('/submissions/grade', payload);
      alert("Exam graded successfully!");
      setSelectedSubmission(null);
      setSubmissionDetails(null);
      setGrades({});
      fetchPending();
    } catch (err) {
      const msg = err.response?.data?.message || "Grading failed";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToList = () => {
    setSelectedSubmission(null);
    setSubmissionDetails(null);
    setGrades({});
  };

  if (selectedSubmission) {
    return (
      <div className="card p-6 min-h-screen">
        <button
          onClick={handleBackToList}
          className="text-gray-400 mb-4 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
        >
          ← Back to Queue
        </button>

        {gradingLoading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading submission...</p>
        ) : submissionDetails ? (
          <div>
            {/* Header */}
            <div className="border-b border-gray-700 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white">{submissionDetails.examTitle}</h2>
              <div className="flex gap-6 mt-2 text-sm text-gray-400">
                <p><span className="font-medium">Student:</span> {submissionDetails.studentName}</p>
                <p><span className="font-medium">Attempt:</span> #{submissionDetails.attemptNumber}</p>
                <p><span className="font-medium">Submitted:</span> {new Date(submissionDetails.submittedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-6 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Exam Max:</span> {submissionDetails.examMaxMarks}</p>
                <p><span className="font-medium">Max per Question:</span> {submissionDetails.answers[0]?.maxQuestionMarks?.toFixed(2)}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {submissionDetails.answers.map((ans, i) => (
                <div key={ans.answerId} className="border border-gray-700 rounded-lg p-5 bg-gray-800/50">
                  <p className="font-bold text-white mb-2">
                    Q{i + 1}. {ans.questionContent}
                  </p>

                  {/* Student's Answer */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-3 mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">Student's Answer:</p>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {ans.subjectiveText || <span className="italic text-gray-500">No answer provided</span>}
                    </p>
                  </div>

                  {/* Marks Input */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-300">Marks:</label>
                    <input
                      type="number"
                      min="0"
                      max={ans.maxQuestionMarks}
                      step="0.5"
                      value={grades[ans.answerId] ?? 0}
                      onChange={(e) => handleGradeChange(ans.answerId, e.target.value, ans.maxQuestionMarks)}
                      className="input-field w-24 text-center"
                    />
                    <span className="text-sm text-gray-400">
                      / {ans.maxQuestionMarks?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Submit */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex items-center justify-between">
              <div className="text-lg text-white">
                <span className="font-bold">Total:</span>{' '}
                <span className="font-bold text-red-600">{calculateTotal().toFixed(2)}</span>
                {' / '}
                <span>{submissionDetails.examMaxMarks}</span>
              </div>

              <button
                onClick={handleSubmitGrades}
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Grades"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">Failed to load submission details.</p>
        )}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Subjective Grading Queue</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : pendingSubmissions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">No exams are currently waiting for manual grading.</p>
      ) : (
        <div className="space-y-4">
          {pendingSubmissions.map(sub => (
            <div key={sub.id} className="card-hover p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{sub.studentName}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">{sub.examTitle} (Attempt #{sub.attemptNumber})</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleGradeNow(sub)}
                className="btn-primary"
              >
                Grade Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectiveGrading;
