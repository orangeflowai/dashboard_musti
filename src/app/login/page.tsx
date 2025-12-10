'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Login error:', signInError);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Login successful, user:', data.user.email);
        
        // Wait for session to be properly set in cookies
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check session one more time
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session after login:', session ? 'exists' : 'missing');
        
        // Force a hard navigation to ensure cookies are set
        window.location.href = '/dashboard';
      } else {
        console.error('Login failed: no user data');
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFAEC' }}>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-medium" style={{ color: '#111111' }}>
            Sign in to Dashboard
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="px-4 py-3 rounded" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C' }}>
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-[#B91C1C] focus:z-10 sm:text-sm"
                style={{ color: '#111111' }}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#B91C1C] focus:border-[#B91C1C] focus:z-10 sm:text-sm"
                style={{ color: '#111111' }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
              style={{ backgroundColor: '#B91C1C' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991919'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

