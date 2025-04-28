const ADMIN_EMAIL = 'admin@aximotravo.com';
const ADMIN_PASSWORD = 'aximotrav01234';

interface AuthData {
  email: string;
  isAdmin: boolean;
  expiresAt: number;
}

function generateAuthData(email: string): AuthData {
  return {
    email,
    isAdmin: true,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
}

export function login(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const authData = generateAuthData(email);
    localStorage.setItem('authData', JSON.stringify(authData));
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem('authData');
}

export function isAuthenticated(): boolean {
  try {
    const authDataStr = localStorage.getItem('authData');
    if (!authDataStr) return false;

    const authData: AuthData = JSON.parse(authDataStr);
    return authData.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function isAdmin(): boolean {
  try {
    const authDataStr = localStorage.getItem('authData');
    if (!authDataStr) return false;

    const authData: AuthData = JSON.parse(authDataStr);
    return authData.isAdmin && authData.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(navigate: (path: string) => void): boolean {
  if (!isAdmin()) {
    navigate('/admin/login');
    return false;
  }
  return true;
}