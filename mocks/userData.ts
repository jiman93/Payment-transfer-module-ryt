import { UUID } from '../types/models';

/**
 * User interface for mock data
 */
export interface MockUser {
  id: UUID;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pin: string;
  preferredAuthMethod: 'PIN' | 'FACE_ID' | 'TOUCH_ID';
  isActive: boolean;
  createdAt: string;
}

/**
 * Default mock user
 */
export const DEFAULT_USER: MockUser = {
  id: 'user_123456',
  username: 'rytuser',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+60123456789',
  pin: '111111',
  preferredAuthMethod: 'PIN',
  isActive: true,
  createdAt: new Date().toISOString(),
};

/**
 * Returns the mock users
 * Currently just returns the default user, but could be expanded
 */
export const getMockUsers = (): MockUser[] => {
  return [DEFAULT_USER];
};

/**
 * Gets a user by ID
 */
export const getMockUserById = (userId: UUID): MockUser | undefined => {
  return getMockUsers().find((user) => user.id === userId) || DEFAULT_USER;
};

/**
 * Validates user credentials
 */
export const validateUserCredentials = (userId: string, pin?: string): boolean => {
  const user = getMockUserById(userId);

  // If no PIN is provided, just check that the user exists
  if (!pin) {
    return !!user;
  }

  // Otherwise, check that the PIN matches
  return user?.pin === pin;
};
