import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './views/Home';
import { JobDetails } from './views/JobDetails';
import { Dashboard } from './views/Dashboard';
import { Profile } from './views/Profile';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { ChatView } from './views/ChatView';
import { Job, User, UserRole, ViewState, Application } from './types';
import { authService } from './services/authService';
import { jobService } from './services/jobService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ name: 'HOME' });
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check Auth & Load Data
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await authService.initialize();
        if (currentUser) {
          // Re-fetch full user profile to get roles etc
          const fullUser = await authService.getCurrentUser(currentUser.id);
          setUser(fullUser);
        }

        await loadData();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedJobs, fetchedApps, fetchedUsers] = await Promise.all([
        jobService.getJobs(),
        jobService.getAllApplications(),
        authService.getAllUsers()
      ]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Sync users/data when switching views or just keep them typically synced?
  // We can re-fetch occasionally. For now, init is enough or trigger on actions.
  useEffect(() => {
    if (view.name === 'DASHBOARD' || view.name === 'HOME') {
      loadData();
    }
  }, [view.name]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView({ name: 'HOME' });
    loadData();
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setView({ name: 'HOME' });
  };

  const handlePostJob = async (jobData: Omit<Job, 'id' | 'postedAt' | 'employerId'>) => {
    if (!user || user.role !== UserRole.EMPLOYER) return;

    try {
      const newJob = await jobService.createJob({
        ...jobData,
        employerId: user.id
      });
      setJobs([newJob, ...jobs]);
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleApply = async (jobId: string, coverLetter: string) => {
    if (!user || user.role !== UserRole.SEEKER) return;

    try {
      const newApp = await jobService.createApplication({
        jobId,
        seekerId: user.id,
        seekerName: user.name,
        coverLetter
      });
      setApplications([...applications, newApp]);
      setView({ name: 'DASHBOARD' });
    } catch (error) {
      console.error("Error applying:", error);
      alert("Failed to apply for job");
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: Application['status']) => {
    try {
      await jobService.updateApplicationStatus(appId, status);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const savedUser = await authService.updateUser(updatedUser);
      setUser(savedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  // View Routing Logic
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
            onEditJob={async (updatedJob) => {
              try {
                const savedJob = await jobService.updateJob(updatedJob);
                setJobs(jobs.map(j => j.id === savedJob.id ? savedJob : j));
              } catch (error) {
                console.error("Error updating job:", error);
                alert("Failed to update job");
              }
            }}
            onDeleteJob={handleDeleteJob}
            onUpdateApplicationStatus={handleUpdateAppStatus}
            onNavigate={setView}
          />
        )}

        {view.name === 'CHAT' && user && (
          <ChatView
            user={user}
            initialChatId={view.chatId}
            onNavigate={setView}
          />
        )}

        {view.name === 'PROFILE' && user && (
          <Profile
            user={user}
            onUpdateUser={handleUpdateUser}
            onNavigate={setView}
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