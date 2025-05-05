import React from 'react';
import { render, screen } from '@testing-library/react';
import { NetworkStatusCheck } from '../NetworkStatusCheck';

// Mocka Mantine-komponenter
jest.mock('@mantine/core', () => ({
  Alert: ({ children, title, icon, color, className }: any) => (
    <div role="alert" className={className} data-color={color}>
      <div data-testid="alert-title">{title}</div>
      <div data-testid="alert-icon">{icon}</div>
      <div data-testid="alert-content">{children}</div>
    </div>
  ),
}));

// Mocka ikoner
jest.mock('@tabler/icons-react', () => ({
  IconAlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe('NetworkStatusCheck Component', () => {
  const defaultProps = {
    networkStatus: {
      directSupabase: true,
      proxySupabase: true,
      checking: false,
      lastChecked: new Date(),
      error: undefined,
      detailedError: undefined,
    },
    debugMode: false,
    diagnosticInfo: null,
  };

  it('renders nothing when all connections are working', () => {
    const { container } = render(<NetworkStatusCheck {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when connections are being checked', () => {
    const props = {
      ...defaultProps,
      networkStatus: {
        ...defaultProps.networkStatus,
        directSupabase: false,
        proxySupabase: false,
        checking: true,
      },
    };
    const { container } = render(<NetworkStatusCheck {...props} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays alert when proxy connection fails', () => {
    const props = {
      ...defaultProps,
      networkStatus: {
        ...defaultProps.networkStatus,
        directSupabase: true,
        proxySupabase: false,
        error: 'Kunde inte ansluta till proxy',
      },
    };
    render(<NetworkStatusCheck {...props} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-color', 'orange');
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Anslutningsproblem');
    expect(screen.getByTestId('alert-content')).toHaveTextContent('Vi kunde inte ansluta');
  });

  it('displays alert when direct connection fails', () => {
    const props = {
      ...defaultProps,
      networkStatus: {
        ...defaultProps.networkStatus,
        directSupabase: false,
        proxySupabase: true,
        error: 'Kunde inte ansluta direkt',
      },
    };
    render(<NetworkStatusCheck {...props} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByTestId('alert-content')).toHaveTextContent('nåbar via proxy');
  });

  it('displays error details when in debug mode', () => {
    const props = {
      ...defaultProps,
      networkStatus: {
        ...defaultProps.networkStatus,
        directSupabase: false,
        proxySupabase: false,
        error: 'Anslutningsfel',
        detailedError: 'Connection timed out',
      },
      debugMode: true,
    };
    render(<NetworkStatusCheck {...props} />);

    expect(screen.getByText('Felmeddelande:')).toBeInTheDocument();
    expect(screen.getByText('Anslutningsfel')).toBeInTheDocument();
    expect(screen.getByText('Detaljer:')).toBeInTheDocument();
    expect(screen.getByText('Connection timed out')).toBeInTheDocument();
  });

  it('displays diagnostic information when in debug mode with diagnosticInfo', () => {
    const diagnosticInfo = { version: '1.0.0', status: 'online' };
    const props = {
      ...defaultProps,
      networkStatus: {
        ...defaultProps.networkStatus,
        directSupabase: false,
        proxySupabase: false,
      },
      debugMode: true,
      diagnosticInfo,
    };
    render(<NetworkStatusCheck {...props} />);

    expect(screen.getByText('Diagnostik:')).toBeInTheDocument();
    expect(screen.getByText(JSON.stringify(diagnosticInfo, null, 2))).toBeInTheDocument();
  });
});
