import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // Loads the session manager
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(''); // Clear previous errors
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Save data globally and in localStorage
    login(response.data, response.data.token);
    
    // REDIRECTION LOGIC: Based on the role returned by backend
    if (response.data.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  } catch (err) {
    // Access the structured error body from GlobalExceptionHandler.java
    const errorData = err.response?.data;

    if (errorData?.message) {
      // Displays specific backend messages like "User not found" or "Unauthorized Access"
      setError(errorData.message);
    } else if (errorData?.errors) {
      // Handles field validation errors if they occur during login
      const validationMessages = Object.values(errorData.errors).join(". ");
      setError(validationMessages);
    } else {
      // Fallback for network issues
      setError("Unable to connect to the login server.");
    }
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm font-medium">
            <strong>Login Error: </strong> {error}
          </div>
)}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            type="email" name="email" placeholder="Email Address" onChange={handleChange} required
          />
          <input
            className="w-full rounded border border-gray-300 p-3 focus:border-red-500 focus:outline-none"
            type="password" name="password" placeholder="Password" onChange={handleChange} required
          />

          <div className="text-right">
            <Link to="/forgot-password" size="sm" className="text-sm text-red-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full rounded bg-red-600 p-3 font-bold text-white hover:bg-red-700 transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          New to ExamHub? <Link to="/register" className="font-bold text-red-600 hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;