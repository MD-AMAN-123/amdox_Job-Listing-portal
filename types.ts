export enum UserRole {
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };

  // For seekers
  bio?: string;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;

  // For employers
  companyName?: string;
  companyDescription?: string;
  website?: string;
  logoUrl?: string;
}

export interface Job {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requirements: string[];
  postedAt: Date;
  tags: string[];
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Rejected';
  appliedAt: Date;
  coverLetter?: string;
}

export type ViewState =
  | { name: 'HOME' }
  | { name: 'JOB_DETAILS'; jobId: string }
  | { name: 'DASHBOARD' }
  | { name: 'PROFILE' }
  | { name: 'LOGIN' }
  | { name: 'REGISTER' };