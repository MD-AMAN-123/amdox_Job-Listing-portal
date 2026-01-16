import React, { useState } from 'react';
import { Plus, Users, Briefcase, FileText, CheckCircle, Clock, XCircle, Sparkles, Loader2, Building, MapPin, Search } from 'lucide-react';
import { Job, User, UserRole, Application } from '../types';
import { Button } from '../components/ui/Button';
import { generateJobDescription, recommendJobs, recommendCandidates } from '../services/geminiService';

interface DashboardProps {
  user: User;
  jobs: Job[];
  applications: Application[];
  allUsers: User[]; // Needed for employer recommendations
  onPostJob: (job: Omit<Job, 'id' | 'postedAt' | 'employerId'>) => void;
  onDeleteJob: (id: string) => void;
  onUpdateApplicationStatus: (appId: string, status: Application['status']) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  jobs, 
  applications,
  allUsers,
  onPostJob,
  onDeleteJob,
  onUpdateApplicationStatus
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications'>('overview');

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobSkills, setNewJobSkills] = useState('');
  const [newJobLocation, setNewJobLocation] = useState('');
  const [newJobType, setNewJobType] = useState<Job['type']>('Full-time');
  const [newJobSalary, setNewJobSalary] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [generatedReqs, setGeneratedReqs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Recommendation State
  const [recommendedJobs, setRecommendedJobs] = useState<{job: Job, reason: string}[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [candidateRecs, setCandidateRecs] = useState<{userId: string, matchScore: number, reason: string}[]>([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedJobForRecs, setSelectedJobForRecs] = useState<Job | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const handleGenerateAI = async () => {
    if (!newJobTitle || !newJobSkills) return;
    setIsGenerating(true);
    const result = await generateJobDescription(newJobTitle, user.companyName || 'Our Company', newJobSkills);
    setGeneratedDesc(result.description);
    setGeneratedReqs(result.requirements);
    setIsGenerating(false);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostJob({
      companyName: user.companyName || 'Company',
      title: newJobTitle,
      location: newJobLocation,
      type: newJobType,
      salaryRange: newJobSalary,
      description: generatedDesc,
      requirements: generatedReqs,
      tags: newJobSkills.split(',').map(s => s.trim()).filter(s => s),
    });
    setShowPostModal(false);
    // Reset form
    setNewJobTitle('');
    setNewJobSkills('');
    setGeneratedDesc('');
    setGeneratedReqs([]);
  };

  const fetchJobRecommendations = async () => {
    setLoadingRecs(true);
    const recs = await recommendJobs(user, jobs);
    const enrichedRecs = recs
      .map(r => ({ job: jobs.find(j => j.id === r.jobId), reason: r.reason }))
      .filter(r => r.job !== undefined) as {job: Job, reason: string}[];
    setRecommendedJobs(enrichedRecs);
    setLoadingRecs(false);
  };

  const fetchCandidateRecommendations = async (job: Job) => {
    setSelectedJobForRecs(job);
    setShowCandidateModal(true);
    setLoadingCandidates(true);
    const seekers = allUsers.filter(u => u.role === UserRole.SEEKER);
    const results = await recommendCandidates(job, seekers);
    setCandidateRecs(results.sort((a, b) => b.matchScore - a.matchScore));
    setLoadingCandidates(false);
  };

  const myJobs = jobs.filter(j => j.employerId === user.id);
  const myApplications = applications.filter(a => a.seekerId === user.id);
  const receivedApplications = applications.filter(a => myJobs.some(j => j.id === a.jobId));

  if (user.role === UserRole.EMPLOYER) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-500">Manage your postings and find talent.</p>
          </div>
          <Button onClick={() => setShowPostModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{myJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <p className="text-2xl font-semibold text-gray-900">{receivedApplications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hired Candidates</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {receivedApplications.filter(a => a.status === 'Accepted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Jobs with AI Recs */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Job Postings & Recommendations</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {myJobs.length > 0 ? (
              myJobs.map(job => (
                <li key={job.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fetchCandidateRecommendations(job)}>
                      <Sparkles className="h-4 w-4 mr-2 text-primary-600" />
                      Find AI Candidates
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">No active jobs. Post one to see recommendations!</li>
            )}
          </ul>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {receivedApplications.length > 0 ? (
              receivedApplications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-600 mb-1">Applying for: {job?.title}</p>
                        <h4 className="text-lg font-bold text-gray-900">{app.seekerName}</h4>
                        <p className="text-sm text-gray-500 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                        {app.coverLetter && (
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-600 italic">
                            "{app.coverLetter}"
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-medium 
                          ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                           {app.status}
                         </span>
                         {app.status === 'Pending' && (
                           <div className="flex gap-2 mt-2">
                             <Button size="sm" variant="outline" onClick={() => onUpdateApplicationStatus(app.id, 'Rejected')}>Reject</Button>
                             <Button size="sm" onClick={() => onUpdateApplicationStatus(app.id, 'Accepted')}>Accept</Button>
                           </div>
                         )}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-6 text-center text-gray-500">No applications received yet.</li>
            )}
          </ul>
        </div>

        {/* Create Job Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Post a New Job</h2>
                <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="e.g. Senior React Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      placeholder="e.g. New York, Remote"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={newJobType}
                      onChange={(e) => setNewJobType(e.target.value as any)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(e.target.value)}
                      placeholder="e.g. $120k - $150k"
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills / Keywords (for AI)</label>
                   <div className="flex gap-2">
                     <input 
                        type="text" 
                        className="flex-grow border border-gray-300 rounded-lg p-2"
                        value={newJobSkills}
                        onChange={(e) => setNewJobSkills(e.target.value)}
                        placeholder="e.g. React, TypeScript, Tailwind, 5+ years exp"
                      />
                      <Button type="button" onClick={handleGenerateAI} disabled={isGenerating || !newJobTitle || !newJobSkills} variant="secondary">
                        {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        {isGenerating ? 'Drafting...' : 'AI Draft'}
                      </Button>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Enter skills and click AI Draft to auto-generate description.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2 min-h-[150px]"
                    value={generatedDesc}
                    onChange={(e) => setGeneratedDesc(e.target.value)}
                    placeholder="Job description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setShowPostModal(false)}>Cancel</Button>
                  <Button type="submit">Post Job</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Recommendation Modal */}
        {showCandidateModal && selectedJobForRecs && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-xl font-bold">Recommended Candidates</h2>
                    <p className="text-sm text-gray-500">For {selectedJobForRecs.title}</p>
                 </div>
                 <button onClick={() => setShowCandidateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {loadingCandidates ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-2" />
                  <p className="text-gray-500">AI is analyzing profiles...</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {candidateRecs.length > 0 ? (
                      candidateRecs.map((rec) => {
                        const candidate = allUsers.find(u => u.id === rec.userId);
                        if (!candidate) return null;
                        return (
                          <div key={rec.userId} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                  {candidate.name.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                                  <p className="text-xs text-gray-500">{candidate.email}</p>
                                </div>
                              </div>
                              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                {rec.matchScore}% Match
                              </span>
                            </div>
                            <div className="mt-3 bg-blue-50 p-3 rounded text-sm text-blue-800">
                               <Sparkles className="inline h-3 w-3 mr-1" />
                               {rec.reason}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                               {candidate.skills?.map(s => (
                                 <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                   {s}
                                 </span>
                               ))}
                            </div>
                          </div>
                        )
                      })
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       No strong matches found for this position.
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // SEEKER DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Recommendation Section */}
      <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-900 flex items-center">
               <Sparkles className="h-6 w-6 text-primary-600 mr-2" />
               Recommended for You
             </h2>
             <p className="text-gray-600 text-sm mt-1">AI-curated jobs based on your profile.</p>
          </div>
          <Button onClick={fetchJobRecommendations} disabled={loadingRecs} size="sm">
            {loadingRecs ? <Loader2 className="animate-spin h-4 w-4" /> : 'Refresh Matches'}
          </Button>
        </div>

        {recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map(({ job, reason }) => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-2">
                   <h3 className="font-bold text-gray-900">{job.title}</h3>
                   <p className="text-xs text-gray-500">{job.companyName}</p>
                </div>
                <div className="bg-yellow-50 text-yellow-800 p-2 rounded text-xs mb-3">
                   {reason}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                   <span>{job.location}</span>
                   <span className="font-medium text-green-600">{job.salaryRange}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-6 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-300">
             {loadingRecs ? 'Analyzing your profile against thousands of jobs...' : 'Click "Refresh Matches" to see personalized job recommendations.'}
           </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
      <p className="text-gray-500 mb-8">Track the status of your job applications.</p>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {myApplications.length > 0 ? (
            myApplications.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <li key={app.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{job?.title}</h4>
                      <div className="flex items-center text-gray-600 mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="mr-4">{job?.companyName}</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job?.location}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                          ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {app.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                          {app.status === 'Accepted' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {app.status === 'Rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {app.status}
                       </span>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="p-12 text-center">
              <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="text-gray-500 mb-4">Start searching for your dream job today.</p>
              <Button>Find Jobs</Button>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};