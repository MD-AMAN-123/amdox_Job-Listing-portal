import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { User as UserIcon, Building, MapPin, Phone, Globe, Linkedin, Github, FileText, Upload, Save, Check } from 'lucide-react';

interface ProfileProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onNavigate: (view: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onNavigate }) => {
    const [formData, setFormData] = useState<User>(user);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveSuccess(false);
    };

    const handleSocialChange = (platform: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate network delay for "realtime" feeling
        await new Promise(resolve => setTimeout(resolve, 600));
        onUpdateUser(formData);
        setSaveSuccess(true);
        setIsSaving(false);

        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulate upload
            setTimeout(() => {
                handleChange('resumeUrl', `https://fake-storage.com/${file.name}`);
                alert('Resume uploaded successfully! (Simulation)');
            }, 1000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
                    <p className="text-gray-500">Manage your personal information and preferences.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveSuccess && <span className="text-green-600 flex items-center text-sm font-medium"><Check className="h-4 w-4 mr-1" /> Saved</span>}
                    <Button onClick={handleSave} isLoading={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        {user.role === UserRole.SEEKER ? <UserIcon className="h-5 w-5 mr-2 text-primary-600" /> : <Building className="h-5 w-5 mr-2 text-primary-600" />}
                        Basic Information
                    </h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                disabled
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-gray-500 cursor-not-allowed"
                                value={formData.email}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.address || ''}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="City, State"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.socialLinks?.linkedin || ''}
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website / Portfolio</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg p-2 pl-9 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    value={formData.website || formData.socialLinks?.portfolio || ''}
                                    onChange={(e) => {
                                        if (user.role === UserRole.EMPLOYER) handleChange('website', e.target.value);
                                        else handleSocialChange('portfolio', e.target.value);
                                    }}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {user.role === UserRole.SEEKER && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-primary-600" />
                            Professional Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.bio || ''}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.skills?.join(', ') || ''}
                                onChange={(e) => handleChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                placeholder="React, TypeScript, Node.js"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV</label>
                            <div className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                <Upload className="h-8 w-8 text-gray-400 mr-4" />
                                <div className="flex-grow">
                                    {formData.resumeUrl ? (
                                        <div className="flex items-center text-green-600">
                                            <FileText className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Resume Uploaded</span>
                                            <a href={formData.resumeUrl} target="_blank" rel="noreferrer" className="ml-2 text-xs underline text-primary-600">View</a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Upload your PDF resume here.</p>
                                    )}
                                    <input type="file" accept=".pdf,.doc,.docx" className="mt-2 text-sm text-gray-500" onChange={handleResumeUpload} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {user.role === UserRole.EMPLOYER && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Building className="h-5 w-5 mr-2 text-primary-600" />
                            Company Details
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.companyName || ''}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                value={formData.companyDescription || ''}
                                onChange={(e) => handleChange('companyDescription', e.target.value)}
                                placeholder="Describe your company culture and mission..."
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
