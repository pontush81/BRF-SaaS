import { redirect } from 'next/navigation';
import { getCurrentUserServer } from '@/lib/auth/server-utils';
import Home from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));
jest.mock('@/lib/auth/server-utils', () => ({
  getCurrentUserServer: jest.fn(),
}));

describe('Home page redirect', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to /dashboard if user is logged in', async () => {
    (getCurrentUserServer as jest.Mock).mockResolvedValue({ id: 'user1', email: 'test@example.com' });
    await Home();
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('does not redirect if user is not logged in', async () => {
    (getCurrentUserServer as jest.Mock).mockResolvedValue(null);
    const result = await Home();
    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy(); // Komponent returneras
  });
}); 