import { supabase } from './supabaseClient';
import { User, UserRole } from '../types';

export const authService = {
  initialize: async () => {
    // Check for existing session safely
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Auth session check failed:", error);
      return null;
    }
    return data?.session?.user || null;
  },

  getAllUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;
    return data.map(mapProfileToUser);
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    return authService.getCurrentUser(data.user.id) as Promise<User>;
  },

  register: async (data: Omit<User, 'id'> & { password: string }): Promise<User> => {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // Skip email confirmation for development
        emailRedirectTo: undefined,
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Registration failed - no user returned');
    }

    // Check if user needs email confirmation
    if (authData.session === null) {
      throw new Error('Please check your email to confirm your account before logging in.');
    }

    // 2. Create Profile entry
    const profileData = {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: data.role,
      phone_number: data.phoneNumber,
      address: data.address,
      bio: data.bio,
      skills: data.skills,
      experience: data.experience,
      company_name: data.companyName,
      company_description: data.companyDescription,
      website: data.website,
      social_links: data.socialLinks
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    return { ...data, id: authData.user.id };
  },

  updateUser: async (updatedUser: User): Promise<User> => {
    const profileData = {
      name: updatedUser.name,
      phone_number: updatedUser.phoneNumber,
      address: updatedUser.address,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      experience: updatedUser.experience,
      company_name: updatedUser.companyName,
      company_description: updatedUser.companyDescription,
      website: updatedUser.website,
      social_links: updatedUser.socialLinks
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', updatedUser.id);

    if (error) throw error;
    return updatedUser;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (userId?: string): Promise<User | null> => {
    const id = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!id) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapProfileToUser(data);
  }
};

const mapProfileToUser = (p: any): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  role: p.role as UserRole,
  avatar: p.avatar,
  phoneNumber: p.phone_number,
  address: p.address,
  socialLinks: p.social_links,
  bio: p.bio,
  skills: p.skills,
  experience: p.experience,
  resumeUrl: p.resume_url,
  companyName: p.company_name,
  companyDescription: p.company_description,
  website: p.website,
  logoUrl: p.logo_url
});