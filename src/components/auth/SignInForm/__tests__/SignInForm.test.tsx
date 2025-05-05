import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInForm } from '../SignInForm';
import * as signInHandlers from '../handlers/signInHandlers';

// Mocka alla importer som behövs
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: { redirect: '/dashboard' }
  })
}));

jest.mock('../useSignInFormState', () => ({
  useSignInFormState: () => ({
    isLoading: false,
    setIsLoading: jest.fn(),
    email: 'test@example.com',
    setEmail: jest.fn(),
    password: 'password123',
    setPassword: jest.fn(),
    errorMessage: null,
    setErrorMessage: jest.fn(),
    networkStatus: {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date().toISOString()
    },
    debugMode: false,
    diagnosticInfo: null,
    setUser: jest.fn(),
    router: {
      push: jest.fn()
    },
    redirectPath: '/dashboard',
    toggleDebugMode: jest.fn()
  })
}));

describe('SignInForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<SignInForm />);

    // Kontrollera att rubriken finns
    expect(screen.getByText('Logga in på ditt konto')).toBeInTheDocument();

    // Kontrollera att formulärfälten finns
    expect(screen.getByLabelText('E-post')).toBeInTheDocument();
    expect(screen.getByLabelText('Lösenord')).toBeInTheDocument();

    // Kontrollera att inloggningsknappen finns
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument();

    // Kontrollera att länken för glömt lösenord finns
    expect(screen.getByText('Glömt lösenord?')).toBeInTheDocument();
  });

  it('calls handleSignIn when form is submitted', async () => {
    // Spionera på handleSignIn funktionen
    const handleSignInSpy = jest.spyOn(signInHandlers, 'handleSignIn');

    render(<SignInForm />);

    // Simulera formulärinlämning
    fireEvent.submit(screen.getByRole('form'));

    // Verifiera att handleSignIn kallas med rätt parametrar
    await waitFor(() => {
      expect(handleSignInSpy).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        expect.any(Function),
        expect.any(Function),
        expect.any(Object),
        '/dashboard',
        expect.any(Function)
      );
    });
  });

  it('displays the debug information when debug mode is enabled', () => {
    // Modifiera mocken för useSignInFormState för detta test
    jest.requireMock('../useSignInFormState').useSignInFormState = () => ({
      isLoading: false,
      setIsLoading: jest.fn(),
      email: 'test@example.com',
      setEmail: jest.fn(),
      password: 'password123',
      setPassword: jest.fn(),
      errorMessage: null,
      setErrorMessage: jest.fn(),
      networkStatus: {
        directSupabase: true,
        proxySupabase: true,
        checking: false,
        lastChecked: new Date().toISOString()
      },
      debugMode: true, // Sätt debugMode till true
      diagnosticInfo: { version: '1.0.0' },
      setUser: jest.fn(),
      router: {
        push: jest.fn()
      },
      redirectPath: '/dashboard',
      toggleDebugMode: jest.fn()
    });

    render(<SignInForm />);

    // Kontrollera att diagnostikinformation visas
    expect(screen.getByText('Diagnostik:')).toBeInTheDocument();
    expect(screen.getByText('Server info:')).toBeInTheDocument();
  });

  it('shows proxy login button when direct connection fails', () => {
    // Modifiera mocken för useSignInFormState för detta test
    jest.requireMock('../useSignInFormState').useSignInFormState = () => ({
      isLoading: false,
      setIsLoading: jest.fn(),
      email: 'test@example.com',
      setEmail: jest.fn(),
      password: 'password123',
      setPassword: jest.fn(),
      errorMessage: null,
      setErrorMessage: jest.fn(),
      networkStatus: {
        directSupabase: false, // Sätt directSupabase till false
        proxySupabase: true,   // men proxySupabase till true
        checking: false,
        lastChecked: new Date().toISOString(),
        error: 'Kunde inte ansluta direkt till Supabase'
      },
      debugMode: false,
      diagnosticInfo: null,
      setUser: jest.fn(),
      router: {
        push: jest.fn()
      },
      redirectPath: '/dashboard',
      toggleDebugMode: jest.fn()
    });

    render(<SignInForm />);

    // Kontrollera att proxyinloggningsknappen visas
    expect(screen.getByText('Logga in via proxy')).toBeInTheDocument();

    // Kontrollera att varningsmeddelandet visas
    expect(screen.getByText(/Anslutningsproblem/)).toBeInTheDocument();
  });
});
