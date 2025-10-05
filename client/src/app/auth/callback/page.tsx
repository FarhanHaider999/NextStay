'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { handleGoogleCallback } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const success = searchParams.get('success');

        if (!token || success !== 'true') {
          setError('Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        // Call handleGoogleCallback (it updates state and fetches user)
        handleGoogleCallback(token);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (err) {
        console.error('Google callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setLoading(false);
      }
    };

    handleCallback();
  }, [handleGoogleCallback, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Authenticating...</CardTitle>
            <CardDescription>
              Please wait while we complete your Google sign-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Authentication Failed</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/auth/signin')} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
