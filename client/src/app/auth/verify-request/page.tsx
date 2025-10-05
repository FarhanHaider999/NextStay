'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a magic link to sign in. Please check your email and click the link to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the email? Check your spam folder or</p>
            <Button variant="link" className="p-0 h-auto">
              try again
            </Button>
          </div>
          <div className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
