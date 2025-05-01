import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending'); // pending, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            const userId = searchParams.get('user');

            // If we have token and userId in URL, attempt verification
            if (token && userId) {
                try {
                    const response = await authService.verifyEmail(token, userId);
                    setStatus('success');
                    setMessage(response.message);

                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } catch (error) {
                    setStatus('error');
                    setMessage(error.message || 'Verification failed. Please try again.');
                }
            } else {
                // Show instructions page if no token (user just registered)
                setStatus('instructions');
                setMessage(location.state?.message || 'Please check your email to verify your account.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate, location.state]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {status === 'pending' && 'Verifying your email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                        {status === 'instructions' && 'Verify Your Email'}
                    </h2>

                    <div className="mt-4">
                        {status === 'pending' && (
                            <div className="animate-pulse text-gray-600">
                                Please wait while we verify your email address...
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                                {message}
                                <p className="mt-2 text-sm">
                                    Redirecting to dashboard...
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {message}
                                <p className="mt-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-[#FFDC5E] hover:text-[#441913]"
                                    >
                                        Return to login
                                    </button>
                                </p>
                            </div>
                        )}

                        {status === 'instructions' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">
                                    {message}
                                </p>
                                <div className="text-gray-600">
                                    <p>A verification link has been sent to:</p>
                                    <p className="font-medium">{location.state?.email}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>If you don't see the email, please check your spam folder.</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-[#FFDC5E] hover:text-[#441913]"
                                    >
                                        Return to login
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}