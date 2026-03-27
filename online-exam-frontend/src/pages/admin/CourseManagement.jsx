import { useState, useEffect } from 'react';
import api from '../../api/axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [courseExams, setCourseExams] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: 0, active: false });
  const [newExam, setNewExam] = useState({ title: '', description: '', examType: 'MCQ', duration: 60, maxMarks: 100, passMarks: 40, active: false });
  const [newQuestion, setNewQuestion] = useState({
    content: '', option1: '', option2: '', option3: '', option4: '', correctOption: "1"
  });

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedExam) { fetchQuestions(selectedExam.id); }
  }, [selectedExam]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/admin/all');
      setCourses(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const fetchCourseExams = async (courseId) => {
    try {
      const res = await api.get(`/exams/course/${courseId}`);
      setCourseExams(res.data);
    } catch (err) { console.error("Failed to fetch course exams", err); }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchCourseExams(course.id);
  };

  const handleArchiveCourse = async (e, courseId) => {
    e.stopPropagation();
    if (window.confirm("Archive this course? It will be moved to the Archive tab.")) {
      try {
        await api.delete(`/courses/${courseId}`);
        setCourses(courses.filter(c => c.id !== courseId));
        alert("Course archived successfully");
      } catch (err) { 
        alert("Archive failed: " + (err.response?.data?.message || err.message)); 
      }
    }
  };

  const handleArchiveExam = async (e, examId) => {
    e.stopPropagation();
    if (window.confirm("Archive this exam? It will be moved to the Archive tab.")) {
      try {
        await api.delete(`/exams/${examId}`);
        setCourseExams(courseExams.filter(ex => ex.id !== examId));
        alert("Exam archived successfully");
      } catch (err) { 
        alert("Archive failed: " + (err.response?.data?.message || err.message)); 
      }
    }
  };

  const handleToggleCourseStatus = async () => {
    try {
      const updatedStatus = !selectedCourse.active;
      const payload = { ...selectedCourse, active: updatedStatus };
      await api.put(`/courses/${selectedCourse.id}`, payload);
      
      setSelectedCourse(payload);
      setCourses(courses.map(c => c.id === selectedCourse.id ? payload : c));
    } catch (err) { alert("Update failed"); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setNewCourse({ title: '', description: '', price: 0, active: false });
      setShowAddCourse(false);
      fetchCourses();
    } catch (err) { alert("Creation failed"); }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...newExam, 
        examType: newExam.examType.toUpperCase(),
        duration: parseInt(newExam.duration),
        maxMarks: parseInt(newExam.maxMarks),
        passMarks: parseInt(newExam.passMarks)
      };
      await api.post(`/exams/course/${selectedCourse.id}`, payload);
      setNewExam({ title: '', description: '', examType: 'MCQ', duration: 60, maxMarks: 100, passMarks: 40, active: false });
      setShowAddExam(false);
      fetchCourseExams(selectedCourse.id);
    } catch (err) { alert("Exam creation failed"); }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const isMCQ = selectedExam.examType === 'MCQ';
      
      const payload = {
        content: newQuestion.content,
        option1: isMCQ ? newQuestion.option1 : null,
        option2: isMCQ ? newQuestion.option2 : null,
        option3: isMCQ ? newQuestion.option3 : null,
        option4: isMCQ ? newQuestion.option4 : null,
        correctOption: isMCQ ? String(newQuestion.correctOption) : null
      };

      await api.post(`/questions/exam/${selectedExam.id}`, payload);
      
      setNewQuestion({ content: '', option1: '', option2: '', option3: '', option4: '', correctOption: "1" });
      fetchQuestions(selectedExam.id);
    } catch (err) {
      const rawServerError = err.response?.data;
      alert(`Error: ${rawServerError?.message || "Check Console"}`);
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      await api.patch(`/exams/${examId}/status`, { active: true });
      fetchCourseExams(selectedCourse.id);
      setSelectedExam(null);
    } catch (err) { alert("Failed to publish"); }
  };

  const fetchQuestions = async (examId) => {
    try {
      const res = await api.get(`/questions/exam/${examId}`);
      setExamQuestions(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm("Delete question?")) {
      try {
        await api.delete(`/questions/${qId}`);
        setExamQuestions(examQuestions.filter(q => q.id !== qId));
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-white font-sans">
      {/* 1. COURSE LIST VIEW */}
      {!selectedCourse && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Course Management</h2>
            <button onClick={() => setShowAddCourse(true)} className="btn-primary">+ Create Course</button>
          </div>

          {showAddCourse && (
            <form onSubmit={handleCreateCourse} className="mb-8 card p-6 space-y-4">
              <input type="text" placeholder="Course Title" required value={newCourse.title} className="input-field" onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} />
              <textarea placeholder="Description" required value={newCourse.description} className="input-field" onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} />
              <input type="number" placeholder="Course Price (₹)" required min="0" step="1" value={newCourse.price} className="input-field" onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })} />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Save Course</button>
                <button type="button" onClick={() => setShowAddCourse(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div key={c.id} className="card-hover p-5 flex justify-between items-center cursor-pointer group" onClick={() => handleSelectCourse(c)}>
                <div>
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {c.active ? (
                      <span className="badge-success">Live</span>
                    ) : (
                      <span className="badge-warning">Draft</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => handleArchiveCourse(e, c.id)} className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div className="text-primary-600 dark:text-primary-400 font-bold">Exams →</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 2. EXAM LIST VIEW */}
      {selectedCourse && !selectedExam && (
        <div>
          <button onClick={() => setSelectedCourse(null)} className="text-gray-400 mb-4 hover:text-red-600 font-medium">← Back to Courses</button>
          <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-primary-500">{selectedCourse.title}</h2>
              <p className="text-sm text-gray-400">Manage exams for this course</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleToggleCourseStatus} className={`px-4 py-2 rounded font-bold text-white ${selectedCourse.active ? 'bg-yellow-600' : 'bg-green-600'}`}>{selectedCourse.active ? "Make Draft" : "Publish Course"}</button>
              <button onClick={() => setShowAddExam(true)} className="btn-primary">+ New Exam</button>
            </div>
          </div>

          {showAddExam && (
            <form onSubmit={handleCreateExam} className="mb-8 card p-6 space-y-4">
              <input type="text" placeholder="Exam Title" required className="input-field" onChange={(e) => setNewExam({ ...newExam, title: e.target.value })} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="number" required placeholder="Duration (Min)" className="input-field" onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })} />
                <input type="number" required placeholder="Max Marks" className="input-field" onChange={(e) => setNewExam({ ...newExam, maxMarks: e.target.value })} />
                <input type="number" required placeholder="Pass Marks" className="input-field" onChange={(e) => setNewExam({ ...newExam, passMarks: e.target.value })} />
                <select className="input-field" onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}>
                  <option value="MCQ">MCQ</option>
                  <option value="SUBJECTIVE">Subjective</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Create Exam</button>
                <button type="button" onClick={() => setShowAddExam(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {courseExams.map(ex => (
              <div key={ex.id} onClick={() => setSelectedExam(ex)} className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 flex justify-between items-center cursor-pointer hover:bg-gray-700/50 transition group">
                <div>
                  <span className="font-bold block">{ex.title}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{ex.examType} | {ex.active ? "LIVE" : "DRAFT"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={(e) => handleArchiveExam(e, ex.id)} className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">Archive</button>
                  <span className="text-red-600 text-sm font-bold underline">Manage Questions →</span>
                </div>
              </div>
            ))}
            {courseExams.length === 0 && <p className="text-center text-gray-400 py-10">No exams created yet.</p>}
          </div>
        </div>
      )}

      {/* 3. QUESTION BUILDER VIEW */}
      {selectedExam && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <button onClick={() => setSelectedExam(null)} className="text-gray-400 hover:text-red-600">← Back to Exams</button>
              <h2 className="text-xl font-bold mt-2">Question Builder: {selectedExam.title}</h2>
              <p className="text-xs text-slate-500">Exam Type: {selectedExam.examType} | Max Marks: {selectedExam.maxMarks}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedExam(null)} className="btn-secondary">DONE</button>
              {!selectedExam.active && <button onClick={() => handlePublishExam(selectedExam.id)} className="btn-primary">MAKE EXAM LIVE</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleAddQuestion} className="card p-6 border-2 border-dashed border-gray-700 space-y-4">
              <textarea required value={newQuestion.content} placeholder="Enter Question Statement" className="input-field min-h-[100px]" onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })} />
              
              {/* Only show options if MCQ */}
              {selectedExam.examType === 'MCQ' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input required value={newQuestion.option1} placeholder="Option 1" className="p-2 border rounded" onChange={(e) => setNewQuestion({ ...newQuestion, option1: e.target.value })} />
                    <input required value={newQuestion.option2} placeholder="Option 2" className="p-2 border rounded" onChange={(e) => setNewQuestion({ ...newQuestion, option2: e.target.value })} />
                    <input required value={newQuestion.option3} placeholder="Option 3" className="p-2 border rounded" onChange={(e) => setNewQuestion({ ...newQuestion, option3: e.target.value })} />
                    <input required value={newQuestion.option4} placeholder="Option 4" className="p-2 border rounded" onChange={(e) => setNewQuestion({ ...newQuestion, option4: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold">Correct Option:</label>
                    <select className="p-2 border rounded flex-1" value={newQuestion.correctOption} onChange={(e) => setNewQuestion({ ...newQuestion, correctOption: e.target.value })}>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                      <option value="4">Option 4</option>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                {selectedExam.examType === 'MCQ' ? "ADD MCQ QUESTION" : "ADD SUBJECTIVE QUESTION"}
              </button>
            </form>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <h3 className="font-bold border-b pb-2">Exam Preview ({examQuestions.length} Questions)</h3>
              {examQuestions.map((q, i) => (
                <div key={q.id} className="p-4 bg-gray-800/50 border border-gray-700 rounded shadow-sm relative group hover:border-red-700">
                  <button onClick={() => handleDeleteQuestion(q.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400">✕</button>
                  <p className="font-bold text-sm text-white">{i + 1}. {q.content}</p>
                  {selectedExam.examType === 'MCQ' && (
                    <div className="mt-2 grid grid-cols-2 text-xs text-gray-400">
                      <p className={q.correctOption === "1" ? "font-bold text-green-400" : ""}>1. {q.option1}</p>
                      <p className={q.correctOption === "2" ? "font-bold text-green-400" : ""}>2. {q.option2}</p>
                      <p className={q.correctOption === "3" ? "font-bold text-green-400" : ""}>3. {q.option3}</p>
                      <p className={q.correctOption === "4" ? "font-bold text-green-400" : ""}>4. {q.option4}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;