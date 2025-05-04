'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/use-toast';
import { MantineProvider, createTheme } from '@mantine/core';

// Skapa ett tema för Mantine v7
const theme = createTheme({
  // Du kan anpassa temat här om det behövs
  primaryColor: 'blue',
  colors: {
    // Använd samma blå färg som resten av applikationen
    blue: ['#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766'],
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider theme={theme} withNormalizeCSS>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </MantineProvider>
  );
} 