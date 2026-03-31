import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Register from '../pages/auth/Register';

jest.mock('../api/axios', () => ({
  post: jest.fn(),
  defaults: { baseURL: 'http://localhost:8080/api/v1' }
}));

const mockApi = require('../api/axios');

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form with all fields', () => {
    renderRegister();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('renders role dropdown', () => {
    renderRegister();
    expect(screen.getByText('Register as')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('shows admin code field when Admin role selected', async () => {
    renderRegister();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ADMIN' } });
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter secret admin code')).toBeInTheDocument();
    });
  });

  test('hides admin code field when Student role selected', async () => {
    renderRegister();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'STUDENT' } });
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Enter secret admin code')).not.toBeInTheDocument();
    });
  });

  test('register with valid credentials calls API', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { id: 1, token: 'test-token', fullName: 'New Student', email: 'new@test.com', role: 'STUDENT' }
    });

    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'New Student' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        fullName: 'New Student',
        email: 'new@test.com',
        password: 'password123',
        role: 'STUDENT',
        adminCode: ''
      });
    });
  });

  test('renders login link', () => {
    renderRegister();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
