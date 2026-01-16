import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Filter } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 pb-12 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Find your <span className="text-primary-600">dream job</span> with AI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Intelligent matching for job seekers. Powerful tools for employers.
          </p>

          <div className="mt-10 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-1/3">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City or Remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <Button size="lg" className="w-full md:w-auto h-[50px]">
                Search
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    typeFilter === type 
                      ? 'bg-primary-100 text-primary-800 border border-primary-200' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
          <span className="text-gray-500">{filteredJobs.length} jobs found</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 flex flex-col cursor-pointer group"
              onClick={() => onNavigate({ name: 'JOB_DETAILS', jobId: job.id })}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="text-2xl font-bold text-primary-600">{job.companyName.charAt(0)}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {job.type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">{job.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{job.companyName}</p>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salaryRange}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};