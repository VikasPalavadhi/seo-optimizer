
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
    isAdmin: true
  },
  {
    username: 'vikas',
    password: 'WPBmartech@i2025',
    entities: ['ei', 'enbd'],
    isAdmin: true
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
    isAdmin: false
  }
];

// Helper function to validate user
export const validateUser = (username: string, password: string): UserConfig | null => {
  const user = USERS_CONFIG.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  return user || null;
};

// Helper function to get user by username
export const getUserByUsername = (username: string): UserConfig | null => {
  return USERS_CONFIG.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
};

// Helper function to check if user is admin
export const isUserAdmin = (username: string): boolean => {
  const user = getUserByUsername(username);
  return user?.isAdmin || false;
};
