'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const urlToken = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    }
  }, [urlToken]);

  const handleVerify = async (verificationToken: string) => {
    setLoading(true);
    setError('');

    try {
      await verifyEmail(verificationToken);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a verification code');
      return;
    }
    await handleVerify(token);
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address not found. Please try signing up again.');
      return;
    }

    setResending(true);
    setError('');

    try {
      await resendVerification(email);
      setError(''); // Clear any previous errors
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'text-sm text-green-600 mb-2';
      successMsg.textContent = 'Verification email sent! Check your inbox.';
      const form = document.querySelector('form');
      if (form) {
        form.insertBefore(successMsg, form.firstChild);
        setTimeout(() => successMsg.remove(), 5000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to your email address.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              Please enter the verification code from your email to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter verification code"
                  required
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Button 
                  onClick={handleResend} 
                  variant="outline" 
                  className="w-full"
                  disabled={resending || !email}
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/auth/signin" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
