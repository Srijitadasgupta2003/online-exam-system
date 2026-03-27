import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CourseCard = ({ course, type, onPurchase }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [enrollData, setEnrollData] = useState({
    paymentMode: 'UPI',
    transactionReference: ''
  });

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/enrollments/course/${course.id}`, {
        courseId: course.id,
        paymentMode: enrollData.paymentMode,
        transactionReference: enrollData.transactionReference
      });
      alert("Request sent! Waiting for Admin approval.");
      setShowModal(false);
      if (onPurchase) onPurchase();
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  return (
    <div className="card-hover p-5">
      <h3 className="text-xl font-bold text-white">{course.title || course.courseTitle}</h3>
      <p className="text-gray-400 text-sm mt-2">{course.description}</p>
      
      <div className="flex items-center justify-between mt-6">
        {type === 'explore' ? (
          <>
            <span className="text-2xl font-bold text-primary-500">₹{course.price}</span>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Buy Now
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className={`badge ${
              course.status === 'PAID' ? 'badge-success' : 
              course.status === 'EXAM_LOCKED' ? 'badge-error' : 
              'badge-warning'
            }`}>
              {course.status === 'EXAM_LOCKED' ? 'Locked' : (course.status || 'Pending')}
            </span>
            {course.status === 'PAID' && (
              <button 
                onClick={() => navigate(`/student/course/${course.courseId}/exams`)}
                className="btn-primary"
              >
                View Exams
              </button>
            )}
            {course.status === 'EXAM_LOCKED' && (
              <span className="text-sm text-red-400 font-medium">Contact Admin</span>
            )}
          </div>
        )}
      </div>

      {/* ENROLLMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="card p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Complete Purchase</h2>
            <p className="text-gray-400 mb-4 font-medium border-b border-gray-700 pb-2">Course: {course.title}</p>
            
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Payment Method</label>
                <select 
                  className="input-field"
                  value={enrollData.paymentMode}
                  onChange={(e) => setEnrollData({...enrollData, paymentMode: e.target.value})}
                >
                  <option value="UPI">UPI / GPay (QR Code)</option>
                  <option value="CASH">Cash at Reception</option>
                </select>
              </div>

              {/* DYNAMIC QR CODE SECTION */}
              {enrollData.paymentMode === 'UPI' && (
                <div className="bg-gray-800/50 p-4 rounded-lg border-2 border-dashed border-gray-600 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Scan to Pay ₹{course.price}</p>
                  <img 
                    src="http://localhost:8080/api/v1/admin/qr-code/image" 
                    alt="Payment QR Code" 
                    className="mx-auto w-48 h-48 object-contain shadow-sm bg-gray-700 p-2 rounded"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic">After payment, please enter the Transaction ID below.</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">
                  {enrollData.paymentMode === 'UPI' ? 'Transaction ID (UTR)' : 'Reference Note'}
                </label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  placeholder={enrollData.paymentMode === 'UPI' ? "12-digit UTR Number" : "Enter your name or note"}
                  value={enrollData.transactionReference}
                  onChange={(e) => setEnrollData({...enrollData, transactionReference: e.target.value})}
                />
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
