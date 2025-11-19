import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OtpPage from '../Auth';
import { vi } from 'vitest';

// mock react-router navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: actual.Link,
  };
});

describe('OtpPage (Auth.jsx)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockClear();
  });

  it('renders input and buttons', () => {
    render(<OtpPage />);
    expect(screen.getByPlaceholderText('Enter OTP')).toBeDefined();
    expect(screen.getByRole('button', { name: /Verify OTP/i })).toBeDefined();
    expect(screen.getByText(/Resend OTP/i)).toBeDefined();
  });

  it('shows success alert and navigates when OTP is correct', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<OtpPage />);

    const input = screen.getByPlaceholderText('Enter OTP');
    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify OTP/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('✅ OTP Verified Successfully!'));
    expect(mockNavigate).toHaveBeenCalledWith('/login');

    alertSpy.mockRestore();
  });

  it('shows invalid OTP alert when OTP is incorrect', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<OtpPage />);

    const input = screen.getByPlaceholderText('Enter OTP');
    fireEvent.change(input, { target: { value: '0000' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify OTP/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Invalid OTP! Please try again.'));

    alertSpy.mockRestore();
  });

  it('resend button triggers OTP Resent alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<OtpPage />);

    fireEvent.click(screen.getByText(/Resend OTP/i));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('OTP Resent!'));

    alertSpy.mockRestore();
  });
});
