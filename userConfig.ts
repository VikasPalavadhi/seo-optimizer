
// User configuration - stores users, passwords, and entity access
export interface UserConfig {
  username: string;
  password: string;
  entities: string[]; // List of entity IDs the user has access to
  isAdmin?: boolean;
}

// Default users configuration
// In production, this should be stored in a database or secure backend
export const USERS_CONFIG: UserConfig[] = [
  {
    username: 'hakan',
    password: 'WPBmartech@i2025',
    entities: ['ei', 'enbd'],
    isAdmin: false
  },
  {
    username: 'vikas',
    password: 'WPBmartech@i2025',
    entities: ['ei', 'enbd'],
    isAdmin: false
  },
  {
    username: 'sudhir',
    password: 'WPBmartech@i2025',
    entities: ['ei', 'enbd'],
    isAdmin: false
  },
  {
    username: 'pvikas',
    password: 'WPBmartech@i2025',
    entities: ['alfardan'],
    isAdmin: true
  }
];

const STORAGE_KEY = 'seo_tool_users_override';

// Returns the active user list — localStorage overrides take priority over hardcoded config
const getActiveUsers = (): UserConfig[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return USERS_CONFIG;
};

// Helper function to validate user
export const validateUser = (username: string, password: string): UserConfig | null => {
  const user = getActiveUsers().find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  return user || null;
};

// Helper function to get user by username
export const getUserByUsername = (username: string): UserConfig | null => {
  return getActiveUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
};

// Helper function to check if user is admin
export const isUserAdmin = (username: string): boolean => {
  const user = getUserByUsername(username);
  return user?.isAdmin || false;
};
