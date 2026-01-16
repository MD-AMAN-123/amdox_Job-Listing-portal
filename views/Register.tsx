import React, { useState } from 'react';
import { User, ViewState, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { AlertCircle, Check } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: User) => void;
  onNavigate: (view: ViewState) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.SEEKER,
    companyName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === UserRole.EMPLOYER && !formData.companyName) {
      setError('Company name is required for employers');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.role === UserRole.EMPLOYER ? formData.companyName : undefined,
        // Default empty fields for recommendation engine
        skills: [],
        experience: '',
        bio: ''
      });
      
      onRegister(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 mt-2">Join NexusJob to find your future</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === UserRole.SEEKER ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleRoleSelect(UserRole.SEEKER)}
          >
            Job Seeker
          </button>
          <button
             type="button"
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === UserRole.EMPLOYER ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             onClick={() => handleRoleSelect(UserRole.EMPLOYER)}
          >
            Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {formData.role === UserRole.EMPLOYER && (
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg mt-2" 
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <div className="text-center mt-6">
             <span className="text-gray-600">Already have an account? </span>
             <button 
               type="button" 
               onClick={() => onNavigate({ name: 'LOGIN' })}
               className="text-primary-600 font-semibold hover:text-primary-800 transition-colors"
             >
               Sign In
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};