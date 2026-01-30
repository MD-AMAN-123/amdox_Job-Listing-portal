import React, { useState } from 'react';
import { ArrowLeft, MapPin, DollarSign, Calendar, Building, Sparkles, XCircle } from 'lucide-react';
import { Job, User, UserRole, ViewState, Application } from '../types';
import { Button } from '../components/ui/Button';
import { enhanceCoverLetter } from '../services/geminiService';

interface JobDetailsProps {
  job: Job;
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onApply: (jobId: string, coverLetter: string) => void;
  hasApplied: boolean;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, user, onNavigate, onApply, hasApplied }) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!coverLetter.trim()) return;
    setIsEnhancing(true);
    const enhanced = await enhanceCoverLetter(coverLetter, job.title);
    setCoverLetter(enhanced);
    setIsEnhancing(false);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(job.id, coverLetter);
    setShowApplyModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Button variant="outline" size="sm" onClick={() => onNavigate({ name: 'HOME' })} className="mb-6 hover:bg-white/50">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{job.title}</h1>
              <div className="flex items-center mt-3 text-xl text-gray-700 font-bold">
                <div className="p-1.5 bg-blue-50 rounded-lg mr-3">
                  <Building className="h-6 w-6 text-primary-600" />
                </div>
                {job.companyName}
              </div>
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-green-700">{job.salaryRange}</span>
                </div>
                <div className="flex items-center px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  Posted {new Date(job.postedAt).toLocaleDateString()}
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-100 uppercase text-xs tracking-wider flex items-center">
                  {job.type}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 pt-2">
              {user?.role === UserRole.EMPLOYER && user.id === job.employerId ? (
                <div className="text-sm bg-yellow-50 text-yellow-800 px-5 py-3 rounded-xl border border-yellow-200 font-medium flex items-center shadow-sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  You posted this job
                </div>
              ) : hasApplied ? (
                <Button disabled variant="secondary" size="lg" className="px-8 bg-gray-100 text-gray-400 border-gray-200">Applied</Button>
              ) : (
                <Button size="lg" className="px-8 shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all text-lg h-12" onClick={() => user ? setShowApplyModal(true) : onNavigate({ name: 'LOGIN' })}>
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Job Description</h2>
            <div className="prose text-gray-600 max-w-none whitespace-pre-line leading-relaxed text-lg">
              {job.description}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Requirements</h2>
            <ul className="space-y-4">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start group">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs mt-0.5 mr-4 group-hover:bg-indigo-100 transition-colors">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 text-lg">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Desired Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Apply for <span className="text-primary-600">{job.title}</span></h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Resume / CV</label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="space-y-1 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary-500 transition-colors mb-3">
                      <Building className="h-full w-full" />
                      {/* Using placeholder icon represents file generic */}
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer rounded-md font-bold text-primary-600 hover:text-primary-700 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-gray-700">Cover Letter (Optional)</label>
                  <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={isEnhancing || !coverLetter}
                    className="text-xs flex items-center font-semibold text-primary-600 hover:text-primary-800 disabled:opacity-50 transition-colors bg-primary-50 px-2 py-1 rounded-md"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isEnhancing ? 'Optimizing with AI...' : 'AI Enhance'}
                  </button>
                </div>
                <textarea
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all min-h-[120px]"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                <Button type="submit" className="shadow-lg shadow-primary-600/20">Submit Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};