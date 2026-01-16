import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './views/Home';
import { JobDetails } from './views/JobDetails';
import { Dashboard } from './views/Dashboard';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Job, User, UserRole, ViewState, Application } from './types';
import { Button } from './components/ui/Button';
import { authService } from './services/authService';

// Mock Jobs (kept static for demo content, though typically this would also be fetched)
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    employerId: 'emp1',
    companyName: 'TechNova',
    title: 'Senior React Developer',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salaryRange: '$140k - $180k',
    description: 'We are seeking a highly skilled Senior React Developer to join our dynamic team. You will be responsible for building scalable web applications, optimizing front-end performance, and mentoring junior developers. We use the latest stack including React 18, TypeScript, and Tailwind.',
    requirements: ['5+ years of experience with React', 'Strong TypeScript skills', 'Experience with state management', 'Knowledge of modern build tools'],
    postedAt: new Date(),
    tags: ['React', 'TypeScript', 'Frontend']
  },
  {
    id: '2',
    employerId: 'emp2',
    companyName: 'GreenEarth',
    title: 'Sustainability Analyst',
    location: 'Remote',
    type: 'Contract',
    salaryRange: '$50/hr',
    description: 'Help us analyze environmental data to improve our sustainability initiatives. You will work with large datasets, generate reports, and provide actionable insights for our clients.',
    requirements: ['Degree in Environmental Science', 'Data analysis experience', 'Proficiency in Python or R', 'Strong communication skills'],
    postedAt: new Date(Date.now() - 86400000),
    tags: ['Data', 'Environment', 'Analytics']
  },
  {
    id: '3',
    employerId: 'emp1',
    companyName: 'TechNova',
    title: 'UX/UI Designer',
    location: 'New York, NY',
    type: 'Full-time',
    salaryRange: '$100k - $130k',
    description: 'Join our design team to create intuitive and beautiful user experiences. You will collaborate with product managers and engineers to define and implement innovative solutions.',
    requirements: ['Portfolio demonstrating strong UX skills', 'Experience with Figma', 'Understanding of accessible design', 'Creative problem solving'],
    postedAt: new Date(Date.now() - 172800000),
    tags: ['Design', 'UX', 'Figma']
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ name: 'HOME' });
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<Application[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize Auth Service
  useEffect(() => {
    authService.initialize();
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setAllUsers(authService.getAllUsers());
  }, []);

  // Sync users when switching views to ensure recommendations are up to date
  useEffect(() => {
    setAllUsers(authService.getAllUsers());
  }, [view]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView({ name: 'HOME' });
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView({ name: 'HOME' });
  };

  const handlePostJob = (jobData: Omit<Job, 'id' | 'postedAt' | 'employerId'>) => {
    if (!user || user.role !== UserRole.EMPLOYER) return;
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9),
      postedAt: new Date(),
      employerId: user.id
    };
    setJobs([newJob, ...jobs]);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleApply = (jobId: string, coverLetter: string) => {
    if (!user || user.role !== UserRole.SEEKER) return;
    const newApp: Application = {
      id: Math.random().toString(36).substr(2, 9),
      jobId,
      seekerId: user.id,
      seekerName: user.name,
      status: 'Pending',
      appliedAt: new Date(),
      coverLetter
    };
    setApplications([...applications, newApp]);
    setView({ name: 'DASHBOARD' });
  };

  const handleUpdateAppStatus = (appId: string, status: Application['status']) => {
    setApplications(applications.map(app => 
      app.id === appId ? { ...app, status } : app
    ));
  };

  // View Routing Logic
  if (view.name === 'LOGIN') {
    return (
      <Login 
        onLogin={handleLoginSuccess} 
        onNavigate={setView} 
      />
    );
  }

  if (view.name === 'REGISTER') {
    return (
      <Register 
        onRegister={handleLoginSuccess} 
        onNavigate={setView} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar 
        user={user} 
        onNavigate={setView} 
        onLogout={handleLogout}
        onLoginClick={() => setView({ name: 'LOGIN' })}
      />

      <main>
        {view.name === 'HOME' && (
          <Home jobs={jobs} onNavigate={setView} />
        )}

        {view.name === 'JOB_DETAILS' && (
          <JobDetails 
            job={jobs.find(j => j.id === view.jobId)!} 
            user={user}
            onNavigate={setView}
            onApply={handleApply}
            hasApplied={applications.some(a => a.jobId === view.jobId && a.seekerId === user?.id)}
          />
        )}

        {view.name === 'DASHBOARD' && user && (
          <Dashboard 
            user={user} 
            jobs={jobs} 
            applications={applications}
            allUsers={allUsers}
            onPostJob={handlePostJob}
            onDeleteJob={handleDeleteJob}
            onUpdateApplicationStatus={handleUpdateAppStatus}
          />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 NexusJob AI. Powered by Google Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;