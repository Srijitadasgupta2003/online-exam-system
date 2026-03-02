import { useState } from 'react';
import api from '../../api/axios';

const CourseCard = ({ course, type, onPurchase }) => {
  const [showModal, setShowModal] = useState(false);
  const [enrollData, setEnrollData] = useState({
    paymentMode: 'UPI',
    transactionReference: ''
  });

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      // Maps exactly to EnrollmentRequest.java
      await api.post(`/enrollments/course/${course.id}`, {
        courseId: course.id,
        paymentMode: enrollData.paymentMode,
        transactionReference: enrollData.transactionReference
      });
      alert("Request sent! Waiting for Admin approval.");
      setShowModal(false);
      if (onPurchase) onPurchase();
    } catch (err) {
      // Pulls the message from GlobalExceptionHandler.java
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
      <h3 className="text-xl font-bold text-gray-800">{course.title || course.courseTitle}</h3>
      <p className="text-gray-600 text-sm mt-2">{course.description}</p>
      
      <div className="flex items-center justify-between mt-6">
        {type === 'explore' ? (
          <>
            <span className="text-2xl font-bold text-red-600">₹{course.price}</span>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
            >
              Buy Now
            </button>
          </>
        ) : (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            course.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {course.status || 'Pending Approval'}
          </span>
        )}
      </div>

      {/* ENROLLMENT MODAL */}
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Purchase</h2>
      <p className="text-gray-600 mb-4 font-medium border-b pb-2">Course: {course.title}</p>
      
      <form onSubmit={handleEnroll} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
          <select 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500"
            value={enrollData.paymentMode}
            onChange={(e) => setEnrollData({...enrollData, paymentMode: e.target.value})}
          >
            <option value="UPI">UPI / GPay (QR Code)</option>
            <option value="CASH">Cash at Reception</option>
          </select>
        </div>

        {/* DYNAMIC QR CODE SECTION */}
        {enrollData.paymentMode === 'UPI' && (
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Scan to Pay ₹{course.price}</p>
            {/* Replace /qr-code.png with your actual image path in the public folder */}
            <img 
              src="/path-to-your-qr-code.png" 
              alt="Payment QR Code" 
              className="mx-auto w-48 h-48 object-contain shadow-sm bg-white p-2 rounded"
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">After payment, please enter the Transaction ID below.</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            {enrollData.paymentMode === 'UPI' ? 'Transaction ID (UTR)' : 'Reference Note'}
          </label>
          <input 
            type="text" 
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-red-500"
            placeholder={enrollData.paymentMode === 'UPI' ? "12-digit UTR Number" : "Enter your name or note"}
            value={enrollData.transactionReference}
            onChange={(e) => setEnrollData({...enrollData, transactionReference: e.target.value})}
          />
        </div>

        <div className="flex gap-3 mt-6 pt-2">
          <button 
            type="button" 
            onClick={() => setShowModal(false)}
            className="flex-1 bg-gray-100 text-gray-800 py-2 rounded font-bold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 transition shadow-lg shadow-red-200"
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