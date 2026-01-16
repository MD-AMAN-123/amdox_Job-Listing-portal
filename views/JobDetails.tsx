import React, { useState } from 'react';
import { ArrowLeft, MapPin, DollarSign, Calendar, Building, Sparkles } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="outline" size="sm" onClick={() => onNavigate({ name: 'HOME' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center mt-2 text-lg text-gray-600 font-medium">
                <Building className="h-5 w-5 mr-2" />
                {job.companyName}
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salaryRange}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {new Date(job.postedAt).toLocaleDateString()}
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {job.type}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
               {user?.role === UserRole.EMPLOYER && user.id === job.employerId ? (
                 <div className="text-sm bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200">
                   You posted this job
                 </div>
               ) : hasApplied ? (
                  <Button disabled variant="secondary" size="lg">Applied</Button>
               ) : (
                  <Button size="lg" onClick={() => user ? setShowApplyModal(true) : onNavigate({name: 'LOGIN'})}>
                    Apply Now
                  </Button>
               )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose text-gray-600 max-w-none whitespace-pre-line">
              {job.description}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-primary-500 mt-2 mr-3"></span>
                  <span className="text-gray-600">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Apply for {job.title}</h2>
            <form onSubmit={handleApplySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Cover Letter (Optional)</label>
                  <button 
                    type="button" 
                    onClick={handleEnhance}
                    disabled={isEnhancing || !coverLetter}
                    className="text-xs flex items-center text-primary-600 hover:text-primary-800 disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isEnhancing ? 'Optimizing...' : 'AI Enhance'}
                  </button>
                </div>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a great fit..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                <Button type="submit">Submit Application</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};