import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Filter, Briefcase, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Job, ViewState } from '../types';
import { Button } from '../components/ui/Button';

interface HomeProps {
  jobs: Job[];
  onNavigate: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ jobs, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || job.type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 pb-20 pt-24 lg:pt-32">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center rounded-full bg-blue-800/50 px-4 py-1.5 mb-8 border border-blue-700 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-300 mr-2" />
            <span className="text-sm font-medium text-blue-100">AI-Powered Job Matching</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl mb-6 drop-shadow-sm">
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">dream job</span><br />
            faster than ever.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100/80 mb-10 leading-relaxed">
            Stop searching and start working. Our intelligent algorithms connect you with opportunities that perfectly match your skills and aspirations.
          </p>

          <div className="max-w-4xl mx-auto transform transition-all hover:scale-[1.01] duration-300">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-white/20 flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-grow w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-blue-200 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400/50 focus:border-transparent focus:bg-white/20 outline-none transition-all"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-1/3 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-blue-200 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-blue-200/70 focus:ring-2 focus:ring-blue-400/50 focus:border-transparent focus:bg-white/20 outline-none transition-all"
                  placeholder="City or Remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Button size="lg" className="w-full md:w-auto h-[60px] px-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none shadow-lg shadow-blue-900/40 text-lg font-semibold">
                Search Jobs
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${typeFilter === type
                      ? 'bg-white text-blue-900 border-white shadow-md transform scale-105'
                      : 'bg-white/10 text-blue-100 border-white/10 hover:bg-white/20'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-100 relative z-20 -mt-8 mx-4 md:mx-auto max-w-5xl rounded-2xl shadow-xl flex justify-around py-8 px-4 text-center">
        <div>
          <p className="text-3xl font-extrabold text-gray-900">20k+</p>
          <p className="text-sm text-gray-500 font-medium">Active Jobs</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div>
          <p className="text-3xl font-extrabold text-gray-900">10k+</p>
          <p className="text-sm text-gray-500 font-medium">Companies</p>
        </div>
        <div className="w-px bg-gray-100"></div>
        <div>
          <p className="text-3xl font-extrabold text-gray-900">50k+</p>
          <p className="text-sm text-gray-500 font-medium">Seekers</p>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-3 h-8 w-8 text-primary-600" />
            Latest Opportunities
          </h2>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">{filteredJobs.length} jobs found</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col cursor-pointer group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              onClick={() => onNavigate({ name: 'JOB_DETAILS', jobId: job.id })}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-5 w-5 text-primary-500" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center shadow-inner">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-indigo-600">
                    {job.companyName.charAt(0)}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-wide">
                  {job.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{job.title}</h3>
              <p className="text-gray-500 text-sm font-medium mb-4 flex items-center">
                {job.companyName}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center font-semibold text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                    {job.salaryRange}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                  {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs">+ {job.tags.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-500 max-w-sm mx-auto">We couldn't find any positions matching your search. Try adjusting your keywords or location.</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter('All'); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};