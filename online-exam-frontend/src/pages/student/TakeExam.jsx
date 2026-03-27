import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CelebrationIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();


  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);


  const [screen, setScreen] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_screen`);
    return saved || 'start';
  });
  const [currentQ, setCurrentQ] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_currentQ`);
    return saved ? parseInt(saved) : 0;
  });
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_answers`);
    return saved ? JSON.parse(saved) : {};
  });
  const [questionStates, setQuestionStates] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_questionStates`);
    return saved ? JSON.parse(saved) : {};
  });


  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_timeLeft`);
    return saved ? parseInt(saved) : 0;
  });
  const timerRef = useRef(null);


  const [warnings, setWarnings] = useState(() => {
    const saved = sessionStorage.getItem(`exam_${examId}_warnings`);
    const value = saved ? parseInt(saved) : 0;
    return value;
  });
  const warningsRef = useRef(0);
  const submittingRef = useRef(false);


  useEffect(() => {
    warningsRef.current = warnings;
  }, []);


  const [result, setResult] = useState(null);


  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const [examRes, questionsRes] = await Promise.all([
          api.get(`/exams/${examId}`),
          api.get(`/questions/exam/${examId}`)
        ]);

        setExam(examRes.data);
        setQuestions(questionsRes.data);


        const savedQuestionStates = sessionStorage.getItem(`exam_${examId}_questionStates`);
        if (!savedQuestionStates) {
          const states = {};
          questionsRes.data.forEach((q, i) => {
            states[q.id] = i === 0 ? 'visited' : 'not-visited';
          });
          setQuestionStates(states);
        }


        const savedTimeLeft = sessionStorage.getItem(`exam_${examId}_timeLeft`);
        if (!savedTimeLeft) {
          setTimeLeft(examRes.data.duration * 60);
        }
      } catch (err) {
        alert("Failed to load exam data");
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId, navigate]);


  useEffect(() => {
    if (screen === 'exam') {
      sessionStorage.setItem(`exam_${examId}_screen`, screen);
      sessionStorage.setItem(`exam_${examId}_currentQ`, currentQ.toString());
      sessionStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
      sessionStorage.setItem(`exam_${examId}_questionStates`, JSON.stringify(questionStates));
      sessionStorage.setItem(`exam_${examId}_timeLeft`, timeLeft.toString());
      sessionStorage.setItem(`exam_${examId}_warnings`, warnings.toString());
    } else if (screen === 'result') {

      sessionStorage.removeItem(`exam_${examId}_screen`);
      sessionStorage.removeItem(`exam_${examId}_currentQ`);
      sessionStorage.removeItem(`exam_${examId}_answers`);
      sessionStorage.removeItem(`exam_${examId}_questionStates`);
      sessionStorage.removeItem(`exam_${examId}_timeLeft`);
      sessionStorage.removeItem(`exam_${examId}_warnings`);
    }
  }, [screen, currentQ, answers, questionStates, timeLeft, warnings, examId]);


  useEffect(() => {
    if (screen === 'exam' && !timerRef.current && timeLeft > 0) {
      setExamStarted(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimeout(() => submitExam(true), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [screen, timeLeft]);

  const handleWarning = useCallback(() => {
    if (submittingRef.current) return;
    
    warningsRef.current += 1;
    const newCount = warningsRef.current;
    setWarnings(newCount);

    if (newCount === 1) {
      alert("Warning 1/3: Tab switching detected. 2 more warnings will auto-submit your exam.");
    } else if (newCount === 2) {
      alert("Warning 2/3: One more tab switch will auto-submit your exam.");
    } else if (newCount >= 3) {
      alert("Warning 3/3: Auto-submitting your exam due to tab switching.");
      submitExam(true);
    }
  }, []);


  const startExam = async () => {
    try {
      await api.post('/submissions/start', { examId: parseInt(examId) });
      setExamStarted(true);
      setScreen('exam');
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimeout(() => submitExam(true), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to start exam";
      alert(msg);
      navigate('/student/dashboard');
    }
  };


  const saveAnswer = async (questionId, value) => {
    try {
      const isMCQ = exam.examType === 'MCQ';
      
      await api.post('/submissions/save-answer', {
        examId: parseInt(examId),
        questionId: questionId,
        selectedOption: isMCQ ? value : null,
        subjectiveText: !isMCQ ? value : null
      });
    } catch (err) {
      console.error("Failed to save answer:", err);
    }
  };


  const submitExam = async (isAutoSubmit = false) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await api.post(`/submissions/submit/${examId}`);
      setResult(res.data);
      setScreen('result');
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed";
      alert(msg);
      setScreen('result');
    }
  };


  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };


  const handleSave = async () => {
    const qId = questions[currentQ].id;
    const value = answers[qId];
    
    if (value) {
      await saveAnswer(qId, value);
      
      setQuestionStates(prev => {
        const current = prev[qId];
        if (current === 'marked' || current === 'answered-marked') {
          return { ...prev, [qId]: 'answered-marked' };
        }
        return { ...prev, [qId]: 'answered' };
      });
    }
    
    if (currentQ < questions.length - 1) {
      goToQuestion(currentQ + 1);
    }
  };


  const handleMark = () => {
    const qId = questions[currentQ].id;
    setQuestionStates(prev => {
      const current = prev[qId];
      if (current === 'answered') {
        return { ...prev, [qId]: 'answered-marked' };
      }
      return { ...prev, [qId]: 'marked' };
    });
  };


  const handleSaveAndMark = async () => {
    const qId = questions[currentQ].id;
    const value = answers[qId];
    
    if (value) {
      await saveAnswer(qId, value);
    }
    
    setQuestionStates(prev => ({
      ...prev,
      [qId]: 'answered-marked'
    }));
    
    if (currentQ < questions.length - 1) {
      goToQuestion(currentQ + 1);
    }
  };


  const handleSkip = () => {
    if (currentQ < questions.length - 1) {
      goToQuestion(currentQ + 1);
    }
  };


  const goToQuestion = (index) => {
    setCurrentQ(index);
    const qId = questions[index].id;
    setQuestionStates(prev => {
      if (prev[qId] === 'not-visited') {
        return { ...prev, [qId]: 'visited' };
      }
      return prev;
    });
  };


  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  const getStateColor = (state) => {
    switch (state) {
      case 'not-visited': return 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300';
      case 'visited': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700';
      case 'answered': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700';
      case 'marked': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700';
      case 'answered-marked': return 'bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-600';
      default: return 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300';
    }
  };


  const answeredCount = Object.values(questionStates).filter(
    s => s === 'answered' || s === 'answered-marked'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading exam...</p>
      </div>
    );
  }


  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center transition-colors duration-200">
        <div className="card max-w-lg w-full p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{exam.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{exam.description || 'No description provided'}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-bold text-gray-900 dark:text-white">{exam.examType}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-bold text-gray-900 dark:text-white">{exam.duration} min</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Max Marks</p>
              <p className="font-bold text-gray-900 dark:text-white">{exam.maxMarks}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pass Marks</p>
              <p className="font-bold text-gray-900 dark:text-white">{exam.passMarks}</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 font-bold mb-2">
              <WarningIcon /> Rules
            </div>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>Timer starts immediately and cannot be paused.</li>
              <li>Tab switching is monitored. 3 warnings = auto-submit.</li>
              <li>Do not press Escape, Alt, or switch tabs.</li>
              <li>You have one attempt. Make it count.</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="btn-primary w-full py-3 text-lg"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

 Screen
  if (screen === 'result') {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center transition-colors duration-200">
        <div className="card max-w-lg w-full p-8 text-center">
          {result ? (
            <>
              {exam.examType === 'MCQ' ? (
                <>
                  <div className="mb-4 flex justify-center">
                    {result.status === 'PASSED' 
                      ? <span className="text-green-500"><CheckIcon /></span>
                      : <span className="text-red-500"><XIcon /></span>
                    }
                  </div>
                  <h1 className={`text-2xl font-bold mb-2 ${result.status === 'PASSED' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {result.status}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Score: <span className="font-bold">{result.marksObtained?.toFixed(2) || result.totalMarksAwarded?.toFixed(2) || '0.00'}</span> / {result.totalMarks || result.maxMarks || 0}
                  </p>
                  {result.status === 'PASSED' ? (
                    <p className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center justify-center gap-2">
                      <CelebrationIcon /> Congratulations! You passed the exam.
                    </p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                      You did not pass. Check with admin for next steps.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 flex justify-center text-blue-500">
                    <DocumentIcon />
                  </div>
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Submitted</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your exam is being reviewed by an administrator. Check the Results tab for updates.
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center text-yellow-500">
                <WarningIcon />
              </div>
              <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">Exam Ended</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {warnings >= 3
                  ? 'Your exam was auto-submitted due to tab switching.'
                  : 'Your exam was auto-submitted because time ran out.'}
              </p>
            </>
          )}

          <button
            onClick={() => navigate('/student/dashboard')}
            className="btn-secondary w-full py-3"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  const currentQuestion = questions[currentQ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Top Bar */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-900 dark:text-white">{exam.title}</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentQ + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {warnings > 0 && (
            <span className="text-red-600 dark:text-red-400 font-bold text-sm flex items-center gap-1">
              <WarningIcon /> {warnings}/3
            </span>
          )}
          <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold flex items-center gap-2 ${
            timeLeft < 60 
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-200'
          }`}>
            <ClockIcon /> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="card p-6 max-w-3xl">
            <div className="mb-6">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Q{currentQ + 1}.</span>
              <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">{currentQuestion.content}</p>
            </div>

            {/* MCQ Options */}
            {exam.examType === 'MCQ' && (
              <div className="space-y-3 mb-6">
                {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4].map((opt, i) => (
                  <label
                    key={i}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      answers[currentQuestion.id] === String(i + 1)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      value={String(i + 1)}
                      checked={answers[currentQuestion.id] === String(i + 1)}
                      onChange={() => handleAnswer(currentQuestion.id, String(i + 1))}
                      className="mr-3 accent-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Subjective Textarea */}
            {exam.examType === 'SUBJECTIVE' && (
              <div className="mb-6">
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="input-field min-h-[200px] resize-y"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleSave} className="btn-primary">
                Save & Next
              </button>
              <button onClick={handleMark} className="btn-outline">
                Mark for Review
              </button>
              <button onClick={handleSaveAndMark} className="btn-secondary">
                Save & Mark
              </button>
              <button onClick={handleSkip} className="btn-ghost">
                Skip
              </button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => goToQuestion(currentQ - 1)}
                disabled={currentQ === 0}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => goToQuestion(currentQ + 1)}
                disabled={currentQ === questions.length - 1}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-l border-gray-700 p-4 hidden lg:block">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Questions</h3>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition ${getStateColor(questionStates[q.id])} ${
                  i === currentQ ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-gray-800' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600"></span> Not Visited
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></span> Visited
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/30"></span> Marked
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-purple-200 dark:bg-purple-800/50"></span> Answered + Marked
            </div>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>Answered: {answeredCount} / {questions.length}</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to submit? You have answered ${answeredCount} out of ${questions.length} questions.`)) {
                submitExam(false);
              }
            }}
            className="btn-primary w-full"
          >
            Submit Exam
          </button>
        </div>
      </div>

      {/* Mobile Submit Button */}
      <div className="lg:hidden bg-gray-800 border-t border-gray-700 p-4 sticky bottom-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Answered: {answeredCount}/{questions.length}</span>
          {warnings > 0 && (
            <span className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-1">
              <WarningIcon /> {warnings}/3
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Submit exam? Answered ${answeredCount}/${questions.length} questions.`)) {
              submitExam(false);
            }
          }}
          className="btn-primary w-full"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default TakeExam;
