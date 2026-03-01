import { useState, useEffect } from 'react';
import api from '../../api/axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    price: 0, 
    active: false 
  });

  const [newExam, setNewExam] = useState({ 
    title: '', 
    description: '', 
    examType: 'MCQ', 
    durationMinutes: 60, 
    active: false 
  });

  const [newQuestion, setNewQuestion] = useState({
    content: '', option1: '', option2: '', option3: '', option4: '',
    correctOption: 1, marks: 5
  });

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedExam) { fetchQuestions(selectedExam.id); }
  }, [selectedExam]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) { console.error("Fetch failed", err); }
  };

  const fetchQuestions = async (examId) => {
    try {
      const res = await api.get(`/questions/exam/${examId}`);
      setExamQuestions(res.data);
    } catch (err) { console.error("Questions fetch failed", err); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    const cleanTitle = newCourse.title.trim();

    if (cleanTitle.length < 3) {
      alert("Title must be at least 3 characters");
      return;
    }

    try {
      const payload = {
        title: cleanTitle,
        description: newCourse.description.trim(),
        price: parseFloat(newCourse.price) || 0,
        active: newCourse.active
      };

      console.log("Sending Payload:", payload);

      await api.post('/courses', payload);
      alert("Course Created Successfully!");
      
      // Reset and Refresh
      setNewCourse({ title: '', description: '', price: 0, active: false });
      setShowAddCourse(false);
      fetchCourses();
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      alert(err.response?.data?.message || "Conflict: Title likely already exists.");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newExam.title,
        description: newExam.description || "No description provided",
        examType: newExam.examType.toUpperCase(),
        durationMinutes: parseInt(newExam.durationMinutes),
        active: false
      };

      await api.post(`/exams/course/${selectedCourse.id}`, payload); 
      alert("Exam added!");
      setShowAddExam(false);
      fetchCourses(); // Refresh to show the new exam in the list
    } catch (err) {
      console.error("Exam Error:", err.response?.data);
      alert("Failed: " + (err.response?.data?.message || "Check Console"));
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/questions/exam/${selectedExam.id}`, newQuestion);
      setNewQuestion({ content: '', option1: '', option2: '', option3: '', option4: '', correctOption: 1, marks: 5 });
      fetchQuestions(selectedExam.id);
    } catch (err) { alert("Failed to add question"); }
  };

  const handlePublishExam = async (examId) => {
    try {
      await api.patch(`/exams/${examId}/status`, { active: true });
      alert("Exam is now LIVE!");
      fetchCourses();
      setSelectedExam(null);
    } catch (err) { alert("Failed to publish exam"); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await api.delete(`/questions/${qId}`);
        fetchQuestions(selectedExam.id);
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm min-h-screen text-slate-800 font-sans">
      {!selectedCourse && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Course Management</h2>
            <button 
              onClick={() => setShowAddCourse(true)} 
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold transition"
            >
              + Create New Course
            </button>
          </div>

          {showAddCourse && (
            <form onSubmit={handleCreateCourse} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4 shadow-inner">
              <h3 className="font-bold text-gray-700">Add New Course</h3>
              <input 
                type="text" 
                placeholder="Course Title (e.g. Core Java Basics)" 
                required 
                value={newCourse.title}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none" 
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} 
              />
              <textarea 
                placeholder="Detailed Description" 
                required 
                value={newCourse.description}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none" 
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} 
              />
              <div className="flex items-center gap-6">
                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1">PRICE</label>
                   <input 
                     type="number" 
                     value={newCourse.price}
                     className="p-2 border rounded w-32" 
                     onChange={(e) => setNewCourse({...newCourse, price: e.target.value})} 
                   />
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newCourse.active}
                    onChange={(e) => setNewCourse({...newCourse, active: e.target.checked})} 
                  /> 
                  <span className="text-sm font-bold">Publish Immediately?</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">Save Course</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddCourse(false)} 
                  className="bg-gray-200 px-6 py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(c => (
              <div 
                key={c.id} 
                className="border p-5 rounded-xl flex justify-between items-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition" 
                onClick={() => setSelectedCourse(c)}
              >
                <div>
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-gray-500">{c.active ? "✅ Active" : "📁 Draft Mode"}</p>
                </div>
                <div className="text-red-600 font-bold flex items-center gap-1">
                  Exams <span className="text-xl">→</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* --- SELECTED COURSE VIEW (EXAM LIST) --- */}
      {selectedCourse && !selectedExam && (
        <div>
          <button onClick={() => setSelectedCourse(null)} className="text-gray-400 mb-4 hover:text-red-600 font-medium">← Back to Courses</button>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold">Exams for: <span className="text-red-600">{selectedCourse.title}</span></h2>
            <button onClick={() => setShowAddExam(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-900">+ New Exam</button>
          </div>

          {showAddExam && (
            <form onSubmit={handleCreateExam} className="mb-8 p-6 bg-slate-50 border rounded-xl space-y-4">
              <input 
                type="text" 
                placeholder="Exam Title" 
                required 
                className="w-full p-2 border rounded" 
                onChange={(e) => setNewExam({...newExam, title: e.target.value})} 
              />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Duration (Mins)</label>
                  <input type="number" defaultValue="60" className="w-full p-2 border rounded" onChange={(e) => setNewExam({...newExam, durationMinutes: parseInt(e.target.value)})} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Exam Type</label>
                  <select className="w-full p-2 border rounded" onChange={(e) => setNewExam({...newExam, examType: e.target.value})}>
                    <option value="MCQ">MCQ</option>
                    <option value="SUBJECTIVE">Subjective</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                 <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold">Save Exam</button>
                 <button type="button" onClick={() => setShowAddExam(false)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
             {selectedCourse.exams && selectedCourse.exams.length > 0 ? (
               selectedCourse.exams.map(ex => (
                 <div key={ex.id} onClick={() => setSelectedExam(ex)} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center cursor-pointer hover:bg-white hover:shadow-md transition">
                   <div>
                     <span className="font-bold block">{ex.title}</span>
                     <span className="text-xs text-gray-400 uppercase tracking-widest">{ex.examType}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded ${ex.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {ex.active ? "LIVE" : "DRAFT"}
                     </span>
                     <span className="text-gray-400 text-sm font-bold">Manage Questions →</span>
                   </div>
                 </div>
               ))
             ) : (
               <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">No exams created for this course yet.</div>
             )}
          </div>
        </div>
      )}

      {/* --- SELECTED EXAM VIEW (QUESTION BUILDER) --- */}
      {selectedExam && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          <div>
            <button onClick={() => setSelectedExam(null)} className="text-gray-400 mb-4 hover:text-red-600">← Back to Exams</button>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Question Builder</h2>
                <p className="text-sm text-gray-400">{selectedExam.title}</p>
              </div>
              {!selectedExam.active && (
                <button onClick={() => handlePublishExam(selectedExam.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 shadow-lg">
                  GO LIVE
                </button>
              )}
            </div>

            <form onSubmit={handleAddQuestion} className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
              <textarea 
                required 
                className="w-full p-3 border rounded-xl h-24 outline-none focus:border-slate-400" 
                value={newQuestion.content} 
                placeholder="Question Text..." 
                onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})} 
              />
              
              {selectedExam.examType === 'MCQ' ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(num => (
                    <input 
                      key={num} 
                      type="text" 
                      placeholder={`Option ${num}`} 
                      required 
                      className="p-2 border rounded text-sm bg-white" 
                      value={newQuestion[`option${num}`]} 
                      onChange={(e) => setNewQuestion({...newQuestion, [`option${num}`]: e.target.value})} 
                    />
                  ))}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Correct Option Index (1-4)</label>
                    <input 
                      type="number" 
                      min="1" max="4" 
                      required 
                      className="w-full p-2 border rounded bg-white" 
                      value={newQuestion.correctOption} 
                      onChange={(e) => setNewQuestion({...newQuestion, correctOption: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm italic">
                  Subjective exam: No options required. Students will provide written answers.
                </div>
              )}
              
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">
                Add to Exam
              </button>
            </form>
          </div>

          <div className="border-l pl-8 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white z-10 py-2">Exam Preview ({examQuestions.length})</h2>
            <div className="space-y-4">
              {examQuestions.length > 0 ? (
                examQuestions.map((q, i) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-lg relative group border hover:border-slate-300">
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)} 
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                    <p className="text-sm font-bold pr-6">{i + 1}. {q.content}</p>
                    {selectedExam.examType === 'MCQ' && (
                      <div className="mt-2 grid grid-cols-2 gap-1">
                         <span className={`text-[9px] px-1 ${q.correctOption === 1 ? 'font-black text-green-600' : 'text-gray-400'}`}>1: {q.option1}</span>
                         <span className={`text-[9px] px-1 ${q.correctOption === 2 ? 'font-black text-green-600' : 'text-gray-400'}`}>2: {q.option2}</span>
                         <span className={`text-[9px] px-1 ${q.correctOption === 3 ? 'font-black text-green-600' : 'text-gray-400'}`}>3: {q.option3}</span>
                         <span className={`text-[9px] px-1 ${q.correctOption === 4 ? 'font-black text-green-600' : 'text-gray-400'}`}>4: {q.option4}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-300 italic text-sm py-10 text-center">No questions added yet...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;