import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extracts the UUID from URL
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic aligns with AuthServiceImpl resetPassword
      await api.post('/auth/reset-password', { token, newPassword });
      alert("Password reset successful!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Set New Password</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full border p-3 rounded" 
            type="password" placeholder="Enter new password" 
            onChange={(e) => setNewPassword(e.target.value)} required 
          />
          <button className="w-full bg-red-600 text-white p-3 rounded font-bold hover:bg-red-700">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;