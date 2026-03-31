import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/auth/Login';

jest.mock('../api/axios', () => ({
  post: jest.fn(),
  defaults: { baseURL: 'http://localhost:8080/api/v1' }
}));

const mockApi = require('../api/axios');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all fields', () => {
    renderLogin();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  test('renders create account link', () => {
    renderLogin();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  test('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  test('login with valid credentials calls API', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { id: 1, token: 'test-token', fullName: 'Test User', email: 'test@test.com', role: 'STUDENT' }
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password123' });
    });
  });

  test('login with invalid credentials shows error', async () => {
    mockApi.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
