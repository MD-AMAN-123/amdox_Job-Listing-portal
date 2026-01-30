import { supabase } from './supabaseClient';
import { Job, Application } from '../types';

export const jobService = {
    getJobs: async (): Promise<Job[]> => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('posted_at', { ascending: false });

        if (error) throw error;
        return data.map(mapDbJobToJob);
    },

    createJob: async (job: Omit<Job, 'id' | 'postedAt'>): Promise<Job> => {
        const dbJob = {
            employer_id: job.employerId,
            company_name: job.companyName,
            title: job.title,
            location: job.location,
            type: job.type,
            salary_range: job.salaryRange,
            description: job.description,
            requirements: job.requirements,
            tags: job.tags
        };

        const { data, error } = await supabase
            .from('jobs')
            .insert([dbJob])
            .select()
            .single();

        if (error) throw error;
        return mapDbJobToJob(data);
    },

    deleteJob: async (jobId: string) => {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId);
        if (error) throw error;
    },

    getAllApplications: async (): Promise<Application[]> => {
        const { data, error } = await supabase
            .from('applications')
            .select('*');

        if (error) throw error;
        return data.map(mapDbAppToApp);
    },

    createApplication: async (app: Omit<Application, 'id' | 'status' | 'appliedAt'>): Promise<Application> => {
        const dbApp = {
            job_id: app.jobId,
            seeker_id: app.seekerId,
            seeker_name: app.seekerName,
            cover_letter: app.coverLetter
        };

        const { data, error } = await supabase
            .from('applications')
            .insert([dbApp])
            .select()
            .single();

        if (error) throw error;
        return mapDbAppToApp(data);
    },

    updateJob: async (job: Job): Promise<Job> => {
        const dbJob = {
            employer_id: job.employerId,
            company_name: job.companyName,
            title: job.title,
            location: job.location,
            type: job.type,
            salary_range: job.salaryRange,
            description: job.description,
            requirements: job.requirements,
            tags: job.tags
        };

        const { data, error } = await supabase
            .from('jobs')
            .update(dbJob)
            .eq('id', job.id)
            .select()
            .single();

        if (error) throw error;
        return mapDbJobToJob(data);
    },

    updateApplicationStatus: async (appId: string, status: string) => {
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', appId);
        if (error) throw error;
    },

    subscribeToApplications: (onUpdate: (app: Application) => void) => {
        const channel = supabase
            .channel('public:applications')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'applications' },
                (payload) => {
                    onUpdate(mapDbAppToApp(payload.new));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
};

// Helpers
const mapDbJobToJob = (j: any): Job => ({
    id: j.id,
    employerId: j.employer_id,
    companyName: j.company_name,
    title: j.title,
    location: j.location,
    type: j.type,
    salaryRange: j.salary_range,
    description: j.description,
    requirements: j.requirements,
    postedAt: new Date(j.posted_at),
    tags: j.tags
});

const mapDbAppToApp = (a: any): Application => ({
    id: a.id,
    jobId: a.job_id,
    seekerId: a.seeker_id,
    seekerName: a.seeker_name,
    status: a.status,
    appliedAt: new Date(a.applied_at),
    coverLetter: a.cover_letter
});
