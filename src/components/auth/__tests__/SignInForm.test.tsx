import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInForm from '../SignInForm';
import * as useSignInModule from '@/hooks/useSignIn';
import { MantineProvider } from '@mantine/core';

// Mocka useSignIn-hooken
jest.mock('@/hooks/useSignIn', () => {
  const originalModule = jest.requireActual('@/hooks/useSignIn');

  return {
    __esModule: true,
    ...originalModule,
    useSignIn: jest.fn(),
  };
});

// Mocka NetworkDiagnosticPanel
jest.mock('@/components/diagnostics/NetworkDiagnosticPanel', () => {
  return {
    __esModule: true,
    default: ({ networkStatus, initialDiagnosticInfo }: any) => (
      <div data-testid="network-diagnostic-panel">
        Mock NetworkDiagnosticPanel
        {networkStatus && networkStatus.checking && <span>Checking network</span>}
        {!networkStatus?.directSupabase && <span>Connection issues</span>}
        {initialDiagnosticInfo && <span>Has diagnostic info</span>}
      </div>
    ),
  };
});

// Mocka checkSupabaseCookies
jest.mock('@/utils/network-diagnostics', () => ({
  checkSupabaseCookies: jest.fn().mockReturnValue(['sb-test=value']),
  checkConnectivity: jest.fn().mockResolvedValue(true),
  checkSupabaseViaProxy: jest.fn().mockResolvedValue({
    status: 'ok',
    reachable: true,
    details: 'Mock connection details'
  }),
  getServerDiagnostics: jest.fn().mockResolvedValue({ status: 'ok' }),
}));

// Mocka next/navigation
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

// Wrapper-komponent med MantineProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
      {children}
    </MantineProvider>
  );
};

describe('SignInForm', () => {
  const mockSetEmail = jest.fn();
  const mockSetPassword = jest.fn();
  const mockHandleSignIn = jest.fn();
  const mockAttemptProxyBasedLogin = jest.fn();

  const mockHookValues = {
    email: '',
    password: '',
    setEmail: mockSetEmail,
    setPassword: mockSetPassword,
    isLoading: false,
    errorMessage: null,
    handleSignIn: mockHandleSignIn,
    networkStatus: {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: null,
    },
    attemptProxyBasedLogin: mockAttemptProxyBasedLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Sätt mock implementationen för useSignIn
    (useSignInModule.useSignIn as jest.Mock).mockReturnValue(mockHookValues);
  });

  it('renders the sign-in form', () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/e-post/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lösenord/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logga in/i })).toBeInTheDocument();
  });

  it('calls setEmail when email input changes', () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/e-post/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(mockSetEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('calls setPassword when password input changes', () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/lösenord/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(mockSetPassword).toHaveBeenCalledWith('password123');
  });

  it('calls handleSignIn on form submission', () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    const form = screen.getByTestId('sign-in-form').querySelector('form');
    fireEvent.submit(form!);

    expect(mockHandleSignIn).toHaveBeenCalled();
  });

  it('displays loading spinner when isLoading is true', () => {
    (useSignInModule.useSignIn as jest.Mock).mockReturnValue({
      ...mockHookValues,
      isLoading: true,
    });

    render(<SignInForm />, { wrapper: TestWrapper });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loggar in/i })).toBeDisabled();
  });

  it('displays error message when errorMessage is provided', () => {
    const errorMessage = 'Invalid credentials';
    (useSignInModule.useSignIn as jest.Mock).mockReturnValue({
      ...mockHookValues,
      errorMessage,
    });

    render(<SignInForm />, { wrapper: TestWrapper });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays network diagnostic panel when network issues detected', () => {
    (useSignInModule.useSignIn as jest.Mock).mockReturnValue({
      ...mockHookValues,
      networkStatus: {
        ...mockHookValues.networkStatus,
        directSupabase: false,
      },
    });

    render(<SignInForm />, { wrapper: TestWrapper });

    const diagnosticPanel = screen.getByTestId('network-diagnostic-panel');
    expect(diagnosticPanel).toBeInTheDocument();
    expect(screen.getByText('Connection issues')).toBeInTheDocument();
  });

  it('displays network diagnostic panel even when no issues detected', () => {
    render(<SignInForm />, { wrapper: TestWrapper });

    const diagnosticPanel = screen.getByTestId('network-diagnostic-panel');
    expect(diagnosticPanel).toBeInTheDocument();
    expect(screen.queryByText('Connection issues')).not.toBeInTheDocument();
  });

  it('shows network check in progress', () => {
    (useSignInModule.useSignIn as jest.Mock).mockReturnValue({
      ...mockHookValues,
      networkStatus: {
        ...mockHookValues.networkStatus,
        checking: true,
      },
    });

    render(<SignInForm />, { wrapper: TestWrapper });

    expect(screen.getByText('Checking network')).toBeInTheDocument();
  });
});
