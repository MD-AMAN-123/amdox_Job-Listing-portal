import React, { useState } from 'react';
import { Plus, Users, Briefcase, FileText, CheckCircle, Clock, XCircle, Sparkles, Loader2, Building, MapPin, Search, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { Job, User, UserRole, Application, ViewState } from '../types';
import { Button } from '../components/ui/Button';
import { generateJobDescription, recommendJobs, recommendCandidates } from '../services/geminiService';
import { chatService } from '../services/chatService';

interface DashboardProps {
  user: User;
  jobs: Job[];
  applications: Application[];
  allUsers: User[]; // Needed for employer recommendations
  onPostJob: (job: Omit<Job, 'id' | 'postedAt' | 'employerId'>) => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (id: string) => void;
  onUpdateApplicationStatus: (appId: string, status: Application['status']) => void;
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  jobs,
  applications,
  allUsers,
  onPostJob,
  onEditJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onNavigate
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

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
  const [recommendedJobs, setRecommendedJobs] = useState<{ job: Job, reason: string }[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [candidateRecs, setCandidateRecs] = useState<{ userId: string, matchScore: number, reason: string }[]>([]);
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

  const openPostModal = () => {
    setEditingJob(null);
    setNewJobTitle('');
    setNewJobSkills('');
    setNewJobLocation('');
    setNewJobType('Full-time');
    setNewJobSalary('');
    setGeneratedDesc('');
    setGeneratedReqs([]);
    setShowPostModal(true);
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setNewJobTitle(job.title);
    setNewJobSkills(job.tags?.join(', ') || '');
    setNewJobLocation(job.location);
    setNewJobType(job.type);
    setNewJobSalary(job.salaryRange);
    setGeneratedDesc(job.description);
    setGeneratedReqs(job.requirements);
    setShowPostModal(true);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const jobData = {
      companyName: user.companyName || 'Company',
      title: newJobTitle,
      location: newJobLocation,
      type: newJobType,
      salaryRange: newJobSalary,
      description: generatedDesc,
      requirements: generatedReqs,
      tags: newJobSkills.split(',').map(s => s.trim()).filter(s => s),
    };

    if (editingJob) {
      onEditJob({
        ...editingJob,
        ...jobData,
      });
    } else {
      onPostJob(jobData);
    }

    setShowPostModal(false);
    setEditingJob(null);
  };

  const fetchJobRecommendations = async () => {
    setLoadingRecs(true);
    const recs = await recommendJobs(user, jobs);
    const enrichedRecs = recs
      .map(r => ({ job: jobs.find(j => j.id === r.jobId), reason: r.reason }))
      .filter(r => r.job !== undefined) as { job: Job, reason: string }[];
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Employer Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Manage your postings and find top talent with AI.</p>
          </div>
          <Button onClick={openPostModal} className="shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{myJobs.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-900">{receivedApplications.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hired Candidates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {receivedApplications.filter(a => a.status === 'Accepted').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Jobs with AI Recs */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
              Your Job Postings
            </h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {myJobs.length > 0 ? (
              myJobs.map(job => (
                <li key={job.id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {job.title}
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          {job.type}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> {job.location}
                        <span className="mx-2">•</span>
                        <span className="text-green-600 font-medium">{job.salaryRange}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => fetchCandidateRecommendations(job)} className="hover:border-primary-300 hover:bg-primary-50">
                        <Sparkles className="h-4 w-4 mr-2 text-primary-600" />
                        AI Match
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(job)} className="text-gray-600 hover:text-blue-600 hover:border-blue-300">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDeleteJob(job.id)} className="text-gray-600 hover:text-red-600 hover:border-red-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No active jobs</h3>
                <p className="mt-1">Post your first job to see AI recommendations!</p>
                <Button onClick={openPostModal} className="mt-4" variant="outline">Create Job</Button>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Applications</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {receivedApplications.length > 0 ? (
              receivedApplications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                            {job?.title}
                          </span>
                          <span className="text-xs text-gray-400">• {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{app.seekerName}</h4>
                        {app.coverLetter && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 italic border border-gray-100">
                            "{app.coverLetter}"
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[120px]">
                        {app.status === 'Accepted' ? (
                          <Button
                            size="sm"
                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm flex items-center gap-2 group"
                            onClick={async () => {
                              try {
                                const chat = await chatService.getChatByApplicationId(app.id);
                                if (chat) {
                                  onNavigate({ name: 'CHAT', chatId: chat.id });
                                }
                              } catch (error) {
                                console.error('Error opening chat:', error);
                              }
                            }}
                          >
                            <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Open Chat
                          </Button>
                        ) : (
                          <>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border
                              ${app.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                              {app.status}
                            </span>
                            {app.status === 'Pending' && (
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => onUpdateApplicationStatus(app.id, 'Rejected')}>Reject</Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={async () => {
                                    onUpdateApplicationStatus(app.id, 'Accepted');
                                    // Create chat for accepted application
                                    try {
                                      const existingChat = await chatService.getChatByApplicationId(app.id);
                                      if (!existingChat) {
                                        await chatService.createChat(app, job?.title || 'Position', user.id);
                                      }
                                    } catch (error) {
                                      console.error('Error creating chat:', error);
                                    }
                                  }}
                                >
                                  Accept
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-12 text-center text-gray-500">No applications received yet.</li>
            )}
          </ul>
        </div>

        {/* Create/Edit Job Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{editingJob ? 'Edit Job Posting' : 'Post a New Job'}</h2>
                  <p className="text-sm text-gray-500">Fill in the details below to reach potential candidates.</p>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handlePostSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      placeholder="e.g. Senior React Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      value={newJobLocation}
                      onChange={(e) => setNewJobLocation(e.target.value)}
                      placeholder="e.g. New York, Remote"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Employment Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Salary Range</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      value={newJobSalary}
                      onChange={(e) => setNewJobSalary(e.target.value)}
                      placeholder="e.g. $120k - $150k"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Key Skills / Keywords (for AI)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-grow border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      value={newJobSkills}
                      onChange={(e) => setNewJobSkills(e.target.value)}
                      placeholder="e.g. React, TypeScript, Tailwind, 5+ years exp"
                    />
                    <Button type="button" onClick={handleGenerateAI} disabled={isGenerating || !newJobTitle || !newJobSkills} variant="secondary" className="whitespace-nowrap">
                      {isGenerating ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {isGenerating ? 'Drafting...' : 'AI Draft'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter skills and click AI Draft to auto-generate description.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    value={generatedDesc}
                    onChange={(e) => setGeneratedDesc(e.target.value)}
                    placeholder="Job description..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setShowPostModal(false)}>Cancel</Button>
                  <Button type="submit">{editingJob ? 'Save Changes' : 'Post Job'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Recommendation Modal */}
        {showCandidateModal && selectedJobForRecs && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recommended Candidates</h2>
                  <p className="text-sm text-gray-500">AI-matched for <span className="font-semibold text-primary-600">{selectedJobForRecs.title}</span></p>
                </div>
                <button onClick={() => setShowCandidateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {loadingCandidates ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-4" />
                  <p className="text-gray-600 font-medium">AI is analyzing profiles...</p>
                  <p className="text-sm text-gray-400 mt-1">Finding the best talent for you.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateRecs.length > 0 ? (
                    candidateRecs.map((rec) => {
                      const candidate = allUsers.find(u => u.id === rec.userId);
                      if (!candidate) return null;
                      return (
                        <div key={rec.userId} className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm">
                                {candidate.name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <h3 className="font-bold text-gray-900">{candidate.name}</h3>
                                <p className="text-sm text-gray-500">{candidate.email}</p>
                              </div>
                            </div>
                            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                              {rec.matchScore}% Match
                            </span>
                          </div>
                          <div className="mt-4 bg-blue-50/50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
                            <Sparkles className="inline h-3 w-3 mr-1.5" />
                            {rec.reason}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {candidate.skills?.map(s => (
                              <span key={s} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No strong matches found for this position.</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Recommendation Section */}
      <div className="mb-10 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-8 border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="h-6 w-6 text-primary-600 mr-2" />
              Recommended for You
            </h2>
            <p className="text-gray-600 mt-1">AI-curated jobs based on your unique profile and skills.</p>
          </div>
          <Button onClick={fetchJobRecommendations} disabled={loadingRecs} size="sm" className="shadow-md">
            {loadingRecs ? <Loader2 className="animate-spin h-4 w-4" /> : 'Refresh Matches'}
          </Button>
        </div>

        {recommendedJobs.length > 0 ? (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map(({ job, reason }) => (
              <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-bold text-lg text-gray-900">{job.title}</div>
                  <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    {job.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 flex items-center">
                  <Building className="h-3 w-3 mr-1" /> {job.companyName}
                </p>
                <div className="bg-yellow-50 text-yellow-800 p-2.5 rounded-lg text-xs mb-4 border border-yellow-100 leading-relaxed">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {reason}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-50">
                  <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {job.location}</span>
                  <span className="font-bold text-gray-900">{job.salaryRange}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10 text-center py-12 text-gray-500 bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
            {loadingRecs ? 'Analyzing your profile against thousands of jobs...' : 'Click "Refresh Matches" to see personalized job recommendations.'}
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
      <p className="text-gray-500 mb-8">Track the status of your job applications.</p>

      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {myApplications.length > 0 ? (
            myApplications.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <li key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{job?.title}</h4>
                      <div className="flex items-center text-gray-600 mt-2 text-sm">
                        <Building className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span className="mr-4 font-medium">{job?.companyName}</span>
                        <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span>{job?.location}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {app.status === 'Accepted' ? (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all px-6 py-2 rounded-full flex items-center gap-2 group"
                          onClick={async () => {
                            try {
                              const chat = await chatService.getChatByApplicationId(app.id);
                              if (chat) {
                                onNavigate({ name: 'CHAT', chatId: chat.id });
                              } else {
                                alert("Initialising chat... please wait a moment.");
                              }
                            } catch (error) {
                              console.error('Error opening chat:', error);
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          Chat with Employer
                        </Button>
                      ) : (
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm 
                            ${app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {app.status === 'Pending' && <Clock className="h-4 w-4 mr-2" />}
                          {app.status === 'Rejected' && <XCircle className="h-4 w-4 mr-2" />}
                          {app.status}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="p-16 text-center flex flex-col items-center">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                <FileText className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">No applications yet</h3>
              <p className="text-gray-500 mb-6 mt-2 max-w-sm">You haven't applied to any jobs yet. Start searching for your dream job today.</p>
              {/* Note: onNavigate is not available here easily unless passed, assuming user knows to go Home */}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};