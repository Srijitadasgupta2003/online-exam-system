import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const response = await api.post('/auth/register', formData);
    login(response.data, response.data.token);
    
    if (response.data.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  } catch (err) {
    const errorData = err.response?.data;

    // 1. Handle field-specific validation errors (e.g., Password too short)
    if (errorData?.errors) {
      // Joins all specific error messages into one string
      const validationMessages = Object.values(errorData.errors).join(". ");
      setError(validationMessages);
    } 
    // 2. Handle specific backend logic errors (e.g., Invalid Admin Code)
    else if (errorData?.message) {
      setError(errorData.message);
    } 
    // 3. Fallback for network issues or unexpected server crashes
    else {
      setError("Unable to connect to the server. Please try again later.");
    }
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600 border border-red-400">
            <strong>Registration Error: </strong>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            name="fullName" placeholder="Full Name" onChange={handleChange} required
          />
          <input
            className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            type="email" name="email" placeholder="Email Address" onChange={handleChange} required
          />
          <input
            className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            type="password" name="password" placeholder="Password (min 6 characters)" onChange={handleChange} required
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Register as:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* DYNAMIC FIELD: Only appears for Admin selection as per your plan */}
          {formData.role === 'ADMIN' && (
            <input
              className="w-full rounded border-2 border-red-200 bg-red-50 p-3 focus:border-red-500 focus:outline-none"
              name="adminCode" placeholder="Enter Secret Admin Code" onChange={handleChange} required
            />
          )}

          <button 
            type="submit" 
            className="w-full rounded bg-red-600 p-3 font-bold text-white hover:bg-red-700 transition duration-200"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-bold text-red-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;