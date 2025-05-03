'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@/lib/auth/roleUtils';

// Interface för organisation
interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  role: UserRole;
  isDefault: boolean;
}

export default function OrganizationSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { organizations, currentOrganization, switchOrganization } = useAuth();

  // Om användaren inte har några organisationer eller bara en, visa inget
  if (!organizations || organizations.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between space-x-1 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <span className="font-medium text-blue-700 mr-1">{currentOrganization?.name || 'Välj organisation'}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs text-gray-500 border-b">
              Byt organisation
            </div>
            <div className="max-h-60 overflow-y-auto">
              {organizations.map((org: Organization) => (
                <button
                  key={org.id}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    org.id === currentOrganization?.id ? 'bg-blue-50 font-medium text-blue-600' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    switchOrganization(org.id);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                >
                  <div className="flex items-center justify-between">
                    <span>{org.name}</span>
                    {org.isDefault && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Standard
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 