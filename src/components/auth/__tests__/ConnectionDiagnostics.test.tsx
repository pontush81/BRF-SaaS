import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ConnectionDiagnostics } from '../ConnectionDiagnostics';
import * as networkDiagnostics from '@/utils/network-diagnostics';

// Mock the diagnostics utilities
jest.mock('@/utils/network-diagnostics', () => ({
  checkConnectivity: jest.fn(),
  checkSupabaseViaProxy: jest.fn(),
  getServerDiagnostics: jest.fn(),
}));

describe('ConnectionDiagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    render(<ConnectionDiagnostics visible={false} />);
    expect(screen.queryByText('Anslutningsdiagnostik')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(<ConnectionDiagnostics visible={true} />);
    expect(screen.getByText('Anslutningsdiagnostik')).toBeInTheDocument();
  });

  it('should show loading state while checking', async () => {
    // Mock diagnostics to delay
    (networkDiagnostics.checkConnectivity as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    (networkDiagnostics.checkSupabaseViaProxy as jest.Mock).mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ reachable: true }), 100)
        )
    );
    (networkDiagnostics.getServerDiagnostics as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    render(<ConnectionDiagnostics visible={true} />);
    expect(
      screen.getByText('Kontrollerar anslutningen...')
    ).toBeInTheDocument();
  });

  it('should detect DNS issues', async () => {
    // Mock direct Supabase connection failure but proxy success
    (networkDiagnostics.checkConnectivity as jest.Mock).mockImplementation(
      url => {
        if (url.includes('google.com')) return Promise.resolve(true);
        return Promise.resolve(false); // Supabase direct connection fails
      }
    );
    (networkDiagnostics.checkSupabaseViaProxy as jest.Mock).mockResolvedValue({
      reachable: true,
      status: 'ok',
    });
    (networkDiagnostics.getServerDiagnostics as jest.Mock).mockResolvedValue(
      {}
    );

    render(<ConnectionDiagnostics visible={true} />);

    await waitFor(() => {
      expect(screen.getByText('DNS-problem upptäckt')).toBeInTheDocument();
    });
  });

  it('should detect general connection issues', async () => {
    // Mock both direct and proxy connection failures
    (networkDiagnostics.checkConnectivity as jest.Mock).mockResolvedValue(
      false
    );
    (networkDiagnostics.checkSupabaseViaProxy as jest.Mock).mockResolvedValue({
      reachable: false,
      status: 'error',
      error: 'Connection failed',
    });
    (networkDiagnostics.getServerDiagnostics as jest.Mock).mockResolvedValue(
      {}
    );

    render(<ConnectionDiagnostics visible={true} />);

    await waitFor(() => {
      expect(screen.getByText('Anslutningsproblem')).toBeInTheDocument();
    });
  });

  it('should show proxy success message when direct fails but proxy works', async () => {
    // Mock direct connection failure but proxy success
    (networkDiagnostics.checkConnectivity as jest.Mock).mockImplementation(
      url => {
        if (url.includes('google.com')) return Promise.resolve(true);
        return Promise.resolve(false); // Supabase direct connection fails
      }
    );
    (networkDiagnostics.checkSupabaseViaProxy as jest.Mock).mockResolvedValue({
      reachable: true,
      status: 'ok',
    });
    (networkDiagnostics.getServerDiagnostics as jest.Mock).mockResolvedValue(
      {}
    );

    render(<ConnectionDiagnostics visible={true} />);

    await waitFor(() => {
      expect(screen.getByText('Begränsad anslutning')).toBeInTheDocument();
    });
  });

  it('should call onRetry when retry button is clicked', async () => {
    const mockRetry = jest.fn();
    (networkDiagnostics.checkConnectivity as jest.Mock).mockResolvedValue(true);
    (networkDiagnostics.checkSupabaseViaProxy as jest.Mock).mockResolvedValue({
      reachable: true,
      status: 'ok',
    });
    (networkDiagnostics.getServerDiagnostics as jest.Mock).mockResolvedValue(
      {}
    );

    render(<ConnectionDiagnostics visible={true} onRetry={mockRetry} />);

    await waitFor(() => {
      expect(screen.getByText('Försök logga in igen')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Försök logga in igen'));
    expect(mockRetry).toHaveBeenCalled();
  });
});
