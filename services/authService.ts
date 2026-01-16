import { User, UserRole } from '../types';

const USERS_KEY = 'nexus_job_users';
const CURRENT_USER_KEY = 'nexus_job_session';

// Mock initial data with passwords (in a real app, passwords would be hashed)
// We use a simple hash simulation here for demonstration
const INITIAL_USERS = [
  {
    id: 'seeker1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    passwordHash: 'cGFzc3dvcmQ=', // 'password' in base64
    role: UserRole.SEEKER,
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Frontend'],
    experience: '3 years of experience building web apps with React.',
    bio: 'Passionate frontend developer looking for challenging React roles.'
  },
  {
    id: 'seeker2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    passwordHash: 'cGFzc3dvcmQ=',
    role: UserRole.SEEKER,
    skills: ['Data Analysis', 'Python', 'Environmental Science', 'Statistics'],
    experience: '5 years in environmental data analysis.',
    bio: 'Data scientist with a focus on sustainability and climate change.'
  },
  {
    id: 'seeker3',
    name: 'Sam Lee',
    email: 'sam@example.com',
    passwordHash: 'cGFzc3dvcmQ=',
    role: UserRole.SEEKER,
    skills: ['UI Design', 'Figma', 'Prototyping', 'User Research'],
    experience: 'Mid-level designer with a strong portfolio.',
    bio: 'Creative UX/UI designer focused on accessibility.'
  },
  {
    id: 'emp1',
    name: 'Sarah Connor',
    email: 'sarah@technova.com',
    passwordHash: 'cGFzc3dvcmQ=',
    role: UserRole.EMPLOYER,
    companyName: 'TechNova'
  },
  {
    id: 'emp2',
    name: 'David Chen',
    email: 'david@greenearth.com',
    passwordHash: 'cGFzc3dvcmQ=',
    role: UserRole.EMPLOYER,
    companyName: 'GreenEarth'
  }
];

// Helper to simulate hashing
const hashPassword = (password: string) => btoa(password);

export const authService = {
  initialize: () => {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
  },

  getAllUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : INITIAL_USERS;
  },

  login: (email: string, password: string): User => {
    const users = authService.getAllUsers();
    const hashedPassword = hashPassword(password);
    
    // In a real app, this lookup would happen securely on the backend
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && (u as any).passwordHash === hashedPassword);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Remove password hash from returned object for security
    const { passwordHash, ...safeUser } = user as any;
    
    // Persist session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    
    return safeUser;
  },

  register: (data: Omit<User, 'id'> & { password: string }): User => {
    const users = authService.getAllUsers();
    
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const newUser = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      passwordHash: hashPassword(data.password)
    };
    
    // Remove password field from data object to avoid storing plain text
    delete (newUser as any).password;

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const { passwordHash, ...safeUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};