import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (view: ViewState) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);

      // Handle specific Supabase errors with user-friendly messages
      let errorMessage = 'Login failed';

      if (err.message) {
        const msg = err.message.toLowerCase();

        if (msg.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
        } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (msg.includes('email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before logging in.';
        } else if (msg.includes('user not found')) {
          errorMessage = 'No account found with this email. Please sign up first.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            isLoading={isLoading}
          >
            Sign In
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate({ name: 'REGISTER' })}
              className="text-primary-600 font-semibold hover:text-primary-800 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Please register a new account to started with the database.</p>
        </div>
      </div>
    </div>
  );
};