import React from 'react';
import { IconBug } from '@tabler/icons-react';

interface DebugToggleProps {
  debugMode: boolean;
  onToggle: () => void;
}

/**
 * DebugToggle Component
 *
 * En komponent som tillåter användare att växla debugläge på/av.
 * Visar olika stilar beroende på tillstånd.
 */
export const DebugToggle: React.FC<DebugToggleProps> = ({ debugMode, onToggle }) => {
  return (
    <div className="text-center mt-4">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center px-3 py-1 text-xs rounded-md ${
          debugMode
            ? 'bg-blue-100 text-blue-700'
            : 'text-blue-500 hover:bg-blue-50'
        } transition-colors duration-200`}
      >
        <IconBug size={14} className="mr-1" />
        {debugMode ? 'Dölj diagnostik' : 'Visa diagnostik'}
      </button>
    </div>
  );
};
