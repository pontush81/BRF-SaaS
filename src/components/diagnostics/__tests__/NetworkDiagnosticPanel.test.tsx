import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NetworkDiagnosticPanel from '../NetworkDiagnosticPanel';
import { getServerDiagnostics } from '@/utils/network-diagnostics';

// Mocka getServerDiagnostics
jest.mock('@/utils/network-diagnostics', () => ({
  getServerDiagnostics: jest.fn().mockResolvedValue({
    status: 'ok',
    version: '1.0',
  }),
}));

// Mocka document.cookie för att kunna testa cookie-information
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: 'test-cookie=value; sb-test=value',
});

// Set up environment variable
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';

describe('NetworkDiagnosticPanel Component', () => {
  it('renders correctly with normal status', () => {
    const networkStatus = {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
    };

    render(<NetworkDiagnosticPanel networkStatus={networkStatus} />);

    expect(screen.getByText(/Server:/i)).toBeInTheDocument();
    // Använd regex för att matcha URL som kan ha ellipsis
    expect(screen.getByText(/https:\/\/example.supa/)).toBeInTheDocument();
    expect(screen.getByText('Anslutning OK')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /visa diagnostik/i })).toBeInTheDocument();
  });

  it('shows connection issue when directSupabase is false', () => {
    const networkStatus = {
      directSupabase: false,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
    };

    render(<NetworkDiagnosticPanel networkStatus={networkStatus} />);

    expect(screen.getByText('Anslutning OK (via proxy)')).toBeInTheDocument();
  });

  it('shows checking status when checking is true', () => {
    const networkStatus = {
      directSupabase: true,
      proxySupabase: true,
      checking: true,
      lastChecked: null,
    };

    render(<NetworkDiagnosticPanel networkStatus={networkStatus} />);

    expect(screen.getByText('Kontrollerar anslutning...')).toBeInTheDocument();
  });

  it('toggles debug mode when debug button is clicked', async () => {
    const networkStatus = {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
    };

    render(<NetworkDiagnosticPanel networkStatus={networkStatus} />);

    // Först är debug läget av
    const debugButton = screen.getByRole('button', { name: /visa diagnostik/i });
    expect(debugButton).toBeInTheDocument();

    // Klicka på knappen för att aktivera debug läge
    fireEvent.click(debugButton);

    // Diagnostik visas nu
    await waitFor(() => {
      expect(screen.getByText('Diagnostik:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dölj diagnostik/i })).toBeInTheDocument();
    });

    // Klicka igen för att dölja
    fireEvent.click(screen.getByRole('button', { name: /dölj diagnostik/i }));

    // Diagnostik är nu dold igen
    expect(screen.queryByText('Diagnostik:')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /visa diagnostik/i })).toBeInTheDocument();
  });

  it('shows detailed error when provided', () => {
    const networkStatus = {
      directSupabase: false,
      proxySupabase: false,
      checking: false,
      lastChecked: new Date(),
      error: 'Anslutningsfel',
      detailedError: 'DNS fel uppstod',
    };

    render(
      <NetworkDiagnosticPanel
        networkStatus={networkStatus}
        initialDiagnosticInfo={{ message: 'test' }}
      />
    );

    expect(screen.getByText('Anslutningsproblem')).toBeInTheDocument();

    // Aktivera debug-läge för att se felmeddelandet
    fireEvent.click(screen.getByRole('button', { name: /visa diagnostik/i }));

    expect(screen.getByText('Fel:')).toBeInTheDocument();
    expect(screen.getByText('DNS fel uppstod')).toBeInTheDocument();
  });

  it('shows diagnostic info when provided', async () => {
    const networkStatus = {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
    };

    const diagnosticInfo = {
      status: 'ok',
      version: '1.0',
    };

    render(
      <NetworkDiagnosticPanel
        networkStatus={networkStatus}
        initialDiagnosticInfo={diagnosticInfo}
      />
    );

    // Aktivera debug-läge för att se diagnostiken
    fireEvent.click(screen.getByRole('button', { name: /visa diagnostik/i }));

    // Kontrollera att serverinformation visas
    expect(screen.getByText('Server info:')).toBeInTheDocument();
    // Använd en mer flexibel kontroll som letar efter delar av texten istället för exakt matchning
    expect(screen.getByText(/status/)).toBeInTheDocument();
    expect(screen.getByText(/version/)).toBeInTheDocument();

    // Kontrollera cookie-informationen
    expect(screen.getByText('Cookies:')).toBeInTheDocument();
    expect(screen.getByText(/test-cookie=value/)).toBeInTheDocument();
  });
});
