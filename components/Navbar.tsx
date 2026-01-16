import React from 'react';
import { Briefcase, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { User, UserRole, ViewState } from '../types';
import { Button } from './ui/Button';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, onLoginClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer" 
              onClick={() => onNavigate({ name: 'HOME' })}
            >
              <Briefcase className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NexusJob<span className="text-primary-600">AI</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => onNavigate({ name: 'HOME' })}>
              Find Jobs
            </Button>
            
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => onNavigate({ name: 'DASHBOARD' })}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <div className="flex items-center space-x-2 border-l pl-4 ml-2">
                  <div className="flex flex-col text-right hidden sm:block">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.role === UserRole.EMPLOYER ? 'Employer' : 'Job Seeker'}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <button onClick={onLogout} className="text-gray-400 hover:text-gray-600 ml-2">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Button variant="primary" size="sm" onClick={onLoginClick}>
                Sign In / Register
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};