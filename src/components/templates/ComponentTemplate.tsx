import React, { useState, useCallback } from 'react';

/**
 * Component Props Interface
 * - Keep props interface separate for better readability
 * - Use explicit types for all props
 * - Use optional properties (?) sparingly
 */
interface ComponentTemplateProps {
  /** Primary title to display */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Content items to display */
  items: Array<{
    id: string;
    name: string;
    value: number;
  }>;
  /** Callback when an item is selected */
  onItemSelect: (id: string) => void;
  /** Whether the component is in loading state */
  isLoading: boolean;
}

/**
 * Component Template
 * 
 * A template component demonstrating best practices for TypeScript and React.
 * 
 * Key features:
 * - Explicit TypeScript types
 * - Proper prop documentation
 * - Extract complex logic to custom hooks
 * - Split into smaller sub-components
 */
export const ComponentTemplate: React.FC<ComponentTemplateProps> = ({
  title,
  subtitle,
  items,
  onItemSelect,
  isLoading,
}) => {
  // State management
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Event handlers with explicit typing
  const handleItemClick = useCallback((id: string) => {
    setSelectedId(id);
    onItemSelect(id);
  }, [onItemSelect]);
  
  // Render methods for complex UI elements
  const renderHeader = () => (
    <div className="header">
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  );
  
  // Loading state
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  // Empty state
  if (items.length === 0) {
    return <EmptyState message="No items available" />;
  }
  
  // Main render
  return (
    <div className="component-template">
      {renderHeader()}
      
      <div className="items-container">
        {items.map((item) => (
          <ItemComponent
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            onClick={handleItemClick}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Sub-component for individual items
 * - Extract repeating elements to their own components
 * - Keep component complexity manageable
 */
interface ItemComponentProps {
  item: {
    id: string;
    name: string;
    value: number;
  };
  isSelected: boolean;
  onClick: (id: string) => void;
}

const ItemComponent: React.FC<ItemComponentProps> = ({
  item,
  isSelected,
  onClick,
}) => {
  const handleClick = useCallback(() => {
    onClick(item.id);
  }, [item.id, onClick]);
  
  return (
    <div 
      className={`item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <span className="name">{item.name}</span>
      <span className="value">{item.value}</span>
    </div>
  );
};

/**
 * Loading indicator component
 */
const LoadingIndicator: React.FC = () => {
  return <div className="loading">Loading...</div>;
};

/**
 * Empty state component
 */
interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return <div className="empty-state">{message}</div>;
}; 