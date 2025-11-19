import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import { vi } from 'vitest';

// Mock the api module
vi.mock('../../api', () => ({
  registerUser: vi.fn(),
}));

// Provide a mock navigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: actual.Link,
  };
});

import { registerUser } from '../../api';

describe('Register page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders form fields and submits data to registerUser', async () => {
    // Arrange
    registerUser.mockResolvedValue({ message: 'Verification OTP sent' });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email ID');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    // Act
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // Assert: registerUser called with expected payload
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // alert called and navigate called to verifyemail
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/verifyemail', { state: { email: 'test@example.com' } });
    });

    alertSpy.mockRestore();
  });

  it('renders the register banner image', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const img = screen.getByAltText('Register Banner');
    expect(img).toBeDefined();
  });

  it('validates required fields', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please fill out all fields.'));
    alertSpy.mockRestore();
  });

  it('validates email format', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email ID');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address.'));
    alertSpy.mockRestore();
  });

  it('validates password length', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email ID');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: 'User' } });
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Password must be at least 8 characters long.'));
    alertSpy.mockRestore();
  });

  it('shows alert on registerUser failure and resets form', async () => {
    registerUser.mockRejectedValue(new Error('Email already exists'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email ID');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'testfail@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Email already exists');
      // form should be reset in finally block
      expect(screen.getByPlaceholderText('Name').value).toBe('');
      expect(screen.getByPlaceholderText('Email ID').value).toBe('');
      expect(screen.getByPlaceholderText('Password').value).toBe('');
    });

    alertSpy.mockRestore();
  });

  it('shows default alert message on success when no message is returned', async () => {
    registerUser.mockResolvedValue({}); // No message property
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email ID'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Verification OTP sent to your email');
    });

    alertSpy.mockRestore();
  });

  it('shows default alert message on failure when no message is returned', async () => {
    registerUser.mockRejectedValue({}); // No message property
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Email ID'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Registration failed');
    });

    alertSpy.mockRestore();
  });
});
