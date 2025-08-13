import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SESSION_KEY = '@SkillSpark_user_session';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export interface AuthUser {
  id: string;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

class AuthService {
  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      const user: AuthUser = {
        id: data.data.id,
        username: data.data.username,
      };

      // Store user session
      await this.storeUserSession(user);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const user: AuthUser = {
        id: data.data.id,
        username: data.data.username,
      };

      // Store user session
      await this.storeUserSession(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user session
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const userSession = await AsyncStorage.getItem(USER_SESSION_KEY);
      return userSession ? JSON.parse(userSession) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Store user session
  private async storeUserSession(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Store user session error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export default new AuthService();
