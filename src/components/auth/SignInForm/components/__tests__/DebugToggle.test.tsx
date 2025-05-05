import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebugToggle } from '../DebugToggle';

describe('DebugToggle Component', () => {
  const mockToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with debugMode false', () => {
    render(<DebugToggle debugMode={false} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Visa diagnostik');
    expect(toggleButton).toHaveClass('text-blue-500');
    expect(toggleButton).not.toHaveClass('bg-blue-100');
  });

  it('renders correctly with debugMode true', () => {
    render(<DebugToggle debugMode={true} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('Dölj diagnostik');
    expect(toggleButton).toHaveClass('bg-blue-100');
  });

  it('calls onToggle when button is clicked', () => {
    render(<DebugToggle debugMode={false} onToggle={mockToggle} />);

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
