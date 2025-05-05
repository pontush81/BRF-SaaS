import React from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorMessageProps {
  message: string | null;
}

/**
 * ErrorMessage Component
 *
 * Visar ett felmeddelande i ett standardformat om det finns ett.
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert
      color="red"
      title="Inloggning misslyckades"
      icon={<IconAlertCircle size={16} />}
    >
      {message}
    </Alert>
  );
};
