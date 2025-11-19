import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEmail from '../VerifyMail';
import { vi } from 'vitest';

// mock api
vi.mock('../../api', () => ({
  verifyEmail: vi.fn(),
}));

// mocks for react-router
const mockNavigate = vi.fn();
let mockLocation = { state: {} };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Link: actual.Link,
  };
});

import { verifyEmail } from '../../api';

describe('VerifyEmail page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockClear();
    mockLocation = { state: {} };
  });

  it('prefills email from location.state', () => {
    mockLocation = { state: { email: 'prefill@example.com' } };
    render(<VerifyEmail />);
    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput.value).toBe('prefill@example.com');
  });

  it('validates missing email/code and shows alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<VerifyEmail />);
    // submit with both empty
    fireEvent.click(screen.getByRole('button', { name: /Verify Email/i }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please provide both email and OTP code'));
    alertSpy.mockRestore();
  });

  it('calls verifyEmail and navigates on success', async () => {
    verifyEmail.mockResolvedValue({ message: 'Verified' });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Verify Email/i }));

    await waitFor(() => expect(verifyEmail).toHaveBeenCalledWith({ email: 'a@b.com', code: '123456' }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Verified'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));

    alertSpy.mockRestore();
  });

  it('shows error alert on verifyEmail rejection', async () => {
    verifyEmail.mockRejectedValue(new Error('Bad'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'e@f.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Email/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Bad'));

    alertSpy.mockRestore();
  });

  it('shows loading state while verifyEmail is pending', async () => {
    let resolve;
    const p = new Promise((res) => { resolve = res; });
    verifyEmail.mockReturnValue(p);

    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'loading@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '999999' } });

    const btn = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(btn);

    // button should show verifying and be disabled
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toContain('Verifying...');

    // resolve and wait for navigation
    resolve({ message: 'OK' });
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('resend shows instructional alert', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<VerifyEmail />);
    fireEvent.click(screen.getByText("Didn't receive code?"));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("Check your inbox/spam for the OTP. If you still didn't receive it, try registering again or contact support."));
    alertSpy.mockRestore();
  });

  it('shows default success message when verifyEmail returns no message', async () => {
    verifyEmail.mockResolvedValue({}); // no message
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'no-msg@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '111111' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Email/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Email verified successfully'));

    alertSpy.mockRestore();
  });

  it('shows default failure message when reject has no message', async () => {
    verifyEmail.mockRejectedValue({}); // rejection with empty object
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<VerifyEmail />);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'no-msg@x.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '222222' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify Email/i }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Verification failed'));

    alertSpy.mockRestore();
  });
});
