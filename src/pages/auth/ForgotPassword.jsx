import { useState } from 'react';
import api from '../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Connects to AuthController forgotPassword endpoint
      await api.post('/auth/forgot-password', { email });
      setMessage("A reset link has been sent to your email.");
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full border p-3 rounded" 
            type="email" placeholder="Enter your email" 
            onChange={(e) => setEmail(e.target.value)} required 
          />
          <button className="w-full bg-red-600 text-white p-3 rounded font-bold hover:bg-red-700">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;