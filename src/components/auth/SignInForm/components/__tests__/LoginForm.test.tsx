import React from 'react';
/*
 * ======================================================
 * DETTA TESTFILE ANVÄNDS INTE LÄNGRE
 * EFTER REFAKTORERING AV SIGNINFORM-KOMPONENTEN
 * Se istället: src/components/auth/__tests__/SignInForm.test.tsx
 * ======================================================
 */
/*
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('LoginForm Component', () => {
  const defaultProps = {
    email: 'test@example.com',
    password: 'password123',
    isLoading: false,
    onEmailChange: jest.fn(),
    onPasswordChange: jest.fn(),
    onSubmit: jest.fn(),
    onProxyLogin: jest.fn(),
    networkStatus: {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
      error: undefined,
      detailedError: undefined
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with normal state', () => {
    render(<LoginForm {...defaultProps} />);

    // Kontrollera att formuläret finns
    expect(screen.getByRole('form')).toBeInTheDocument();

    // Kontrollera att fälten finns och har rätt värden
    const emailInput = screen.getByLabelText('E-post') as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.value).toBe('test@example.com');

    const passwordInput = screen.getByLabelText('Lösenord') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput.value).toBe('password123');

    // Kontrollera att knappar finns
    expect(screen.getByRole('button', { name: 'Logga in' })).toBeInTheDocument();

    // Proxy-knappen ska inte visas när directSupabase är true
    expect(screen.queryByText('Logga in via proxy')).not.toBeInTheDocument();

    // Kontrollera att glömt lösenord-länken finns
    expect(screen.getByText('Glömt lösenord?')).toBeInTheDocument();
  });

  it('renders correctly when in loading state', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />);

    // Kontrollera att inloggningsknappen visar laddningstext
    expect(screen.getByRole('button', { name: 'Loggar in...' })).toBeInTheDocument();

    // Kontrollera att fälten är inaktiverade
    const emailInput = screen.getByLabelText('E-post') as HTMLInputElement;
    expect(emailInput).toBeDisabled();

    const passwordInput = screen.getByLabelText('Lösenord') as HTMLInputElement;
    expect(passwordInput).toBeDisabled();
  });

  it('shows proxy login button when direct connection fails', () => {
    render(
      <LoginForm
        {...defaultProps}
        networkStatus={{
          directSupabase: false,
          proxySupabase: true,
          checking: false,
          lastChecked: new Date(),
          error: 'Kunde inte ansluta direkt'
        }}
      />
    );

    // Kontrollera att proxyknappen visas
    expect(screen.getByText('Logga in via proxy')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<LoginForm {...defaultProps} />);

    // Simulera formulärinlämning
    fireEvent.submit(screen.getByRole('form'));

    // Kontrollera att onSubmit har anropats
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onEmailChange when email field is changed', () => {
    render(<LoginForm {...defaultProps} />);

    // Simulera e-post-ändring
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'new@example.com' } });

    // Kontrollera att onEmailChange har anropats
    expect(defaultProps.onEmailChange).toHaveBeenCalledTimes(1);
  });

  it('calls onPasswordChange when password field is changed', () => {
    render(<LoginForm {...defaultProps} />);

    // Simulera lösenordsändring
    fireEvent.change(screen.getByLabelText('Lösenord'), { target: { value: 'newpassword' } });

    // Kontrollera att onPasswordChange har anropats
    expect(defaultProps.onPasswordChange).toHaveBeenCalledTimes(1);
  });

  it('calls onProxyLogin when proxy button is clicked', () => {
    render(
      <LoginForm
        {...defaultProps}
        networkStatus={{
          directSupabase: false,
          proxySupabase: true,
          checking: false,
          lastChecked: new Date(),
          error: 'Kunde inte ansluta direkt'
        }}
      />
    );

    // Simulera klick på proxyknappen
    fireEvent.click(screen.getByText('Logga in via proxy'));

    // Kontrollera att onProxyLogin har anropats
    expect(defaultProps.onProxyLogin).toHaveBeenCalledTimes(1);
  });
});
*/

// Skapa ett tomt test för att Jest inte ska klaga
describe('LoginForm (Gammal struktur)', () => {
  it('är inte längre i användning efter refaktorering', () => {
    expect(true).toBe(true);
  });
});
