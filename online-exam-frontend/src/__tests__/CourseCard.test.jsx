import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from '../components/student/CourseCard';

jest.mock('../api/axios', () => ({
  post: jest.fn(),
  defaults: { baseURL: 'http://localhost:8080/api/v1' }
}));

const mockApi = require('../api/axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockCourse = {
  id: 1,
  courseId: 1,
  title: 'Java Fundamentals',
  description: 'Learn Java from scratch',
  price: 99.99,
  status: 'PAID'
};

const renderCourseCard = (props = {}) => {
  return render(
    <BrowserRouter>
      <CourseCard course={mockCourse} type="explore" {...props} />
    </BrowserRouter>
  );
};

describe('CourseCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders course title and description', () => {
    renderCourseCard();
    expect(screen.getByText('Java Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Learn Java from scratch')).toBeInTheDocument();
  });

  test('renders course price for explore type', () => {
    renderCourseCard({ type: 'explore' });
    expect(screen.getByText('₹99.99')).toBeInTheDocument();
  });

  test('renders Buy Now button for explore type', () => {
    renderCourseCard({ type: 'explore' });
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
  });

  test('renders View Exams button for enrolled course', () => {
    renderCourseCard({ type: 'enrolled' });
    expect(screen.getByText('View Exams')).toBeInTheDocument();
  });

  test('renders Enrolled status badge', () => {
    renderCourseCard({ type: 'enrolled' });
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  test('opens enrollment modal when Buy Now clicked', async () => {
    renderCourseCard({ type: 'explore' });
    fireEvent.click(screen.getByText('Buy Now'));
    await waitFor(() => {
      expect(screen.getByText('Complete Purchase')).toBeInTheDocument();
    });
  });

  test('navigates to course exams when View Exams clicked', () => {
    renderCourseCard({ type: 'enrolled' });
    fireEvent.click(screen.getByText('View Exams'));
    expect(mockNavigate).toHaveBeenCalledWith('/student/course/1/exams');
  });
});
