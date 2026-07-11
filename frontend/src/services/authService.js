import api from './api';

/**
 * Toggle for mock auth.
 * Defaults to TRUE (mock mode) so the app works without a backend.
 * Once your backend is ready, set VITE_USE_MOCK_AUTH=false in your .env
 * (or just flip the constant below) and every call here switches
 * to the real api.post(...) automatically — no other file needs to change.
 */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const MOCK_DELAY_MS = 600;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateMockToken = () =>
  `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export async function loginRequest({ email, password }) {
  if (USE_MOCK_AUTH) {
    await wait(MOCK_DELAY_MS);

    if (!email || !password) {
      throw { response: { data: { message: 'Email and password are required.' } } };
    }

    return {
      data: {
        access_token: generateMockToken(),
        user: { email, name: email.split('@')[0] },
      },
    };
  }

  return api.post('/accounts/login/', { email, password });
}

export async function signupRequest({ firstName, lastName, email, password }) {
  if (USE_MOCK_AUTH) {
    await wait(MOCK_DELAY_MS);

    return {
      data: {
        access_token: generateMockToken(),
        user: { email, name: `${firstName} ${lastName}`.trim() },
      },
    };
  }

  return api.post('/accounts/signup/', {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  });
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  if (USE_MOCK_AUTH) {
    await wait(MOCK_DELAY_MS);
    return { data: { message: 'Password changed successfully.' } };
  }
  return api.put('/accounts/change-password/', {
    old_password: currentPassword,
    new_password: newPassword,
  });
}

export { USE_MOCK_AUTH };
