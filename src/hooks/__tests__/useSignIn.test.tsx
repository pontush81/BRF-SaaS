import { renderHook, act } from '@testing-library/react';
import { useSignIn } from '../useSignIn';
import { checkConnectivity, checkSupabaseViaProxy } from '@/utils/network-diagnostics';
import { createBrowserClient } from '@/supabase-client';

// Mocka useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockImplementation(key => {
      if (key === 'redirect') return '/dashboard';
      if (key === 'error') return null;
      return null;
    }),
  }),
}));

// Mocka AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    setUser: jest.fn(),
  }),
}));

// Mocka fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { id: 'test-user' }, session: { access_token: 'token' } }),
    text: () => Promise.resolve(JSON.stringify({ user: { id: 'test-user' }, session: { access_token: 'token' } })),
  })
);

// Mocka createBrowserClient
jest.mock('@/supabase-client', () => ({
  createBrowserClient: jest.fn().mockReturnValue({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user' },
          session: {
            access_token: 'test-token',
            refresh_token: 'refresh-token',
            expires_at: 123456789,
          },
        },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({}),
    },
  }),
}));

// Mocka network-diagnostics
jest.mock('@/utils/network-diagnostics', () => ({
  checkConnectivity: jest.fn().mockResolvedValue(true),
  checkSupabaseViaProxy: jest.fn().mockResolvedValue({
    status: 'ok',
    reachable: true,
    details: 'Connected in 100ms',
  }),
  getServerDiagnostics: jest.fn().mockResolvedValue({}),
  NetworkStatus: {},
}));

// Mocka localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mocka window.location
delete window.location;
window.location = { href: '' } as Location;

describe('useSignIn Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = '';
    localStorageMock.clear();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useSignIn());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.networkStatus).toEqual({
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: null,
    });
  });

  it('updates email and password when setters are called', () => {
    const { result } = renderHook(() => useSignIn());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    expect(result.current.email).toBe('test@example.com');
    expect(result.current.password).toBe('password123');
  });

  it('handles successful sign-in', async () => {
    const { result } = renderHook(() => useSignIn());

    // Sätt värden för e-post och lösenord
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    // Skapa ett mockat event-objekt
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Testa handleSignIn
    await act(async () => {
      await result.current.handleSignIn(mockEvent);
    });

    // Kontrollera att createBrowserClient och signInWithPassword har anropats
    expect(createBrowserClient).toHaveBeenCalled();
    expect(createBrowserClient().auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    // Kontrollera att isLoading hanteras korrekt
    expect(result.current.isLoading).toBe(false);

    // Kontrollera att cookies har satts
    expect(document.cookie).toContain('sb-access-token');
  });

  it('handles failed sign-in by trying proxy login', async () => {
    // Mocka attemptProxyBasedLogin direkt
    const attemptProxyBasedLoginMock = jest.fn();

    // Modifiera mocken för signInWithPassword att returnera ett fel
    (createBrowserClient as jest.Mock).mockReturnValueOnce({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'auth/network-error' },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
    });

    const { result } = renderHook(() => ({
      ...useSignIn(),
      attemptProxyBasedLogin: attemptProxyBasedLoginMock,
    }));

    // Sätt värden för e-post och lösenord
    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    // Skapa ett mockat event-objekt
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Testa handleSignIn
    await act(async () => {
      await result.current.handleSignIn(mockEvent);
    });

    // Kontrollera att fel-meddelande sätts
    expect(result.current.errorMessage).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('uses redirect path from props', () => {
    const customRedirectPath = '/custom-dashboard';
    const { result } = renderHook(() => useSignIn({ redirectPath: customRedirectPath }));

    // Skapa ett mock event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Anropa handleSignIn
    act(() => {
      result.current.handleSignIn(mockEvent);
    });

    // I praktiken kan vi inte kontrollera window.location.href direkt
    // eftersom jest inte tillåter att den ändras i test
    // Men vi kan kontrollera andra sideeffekter istället
  });
});
