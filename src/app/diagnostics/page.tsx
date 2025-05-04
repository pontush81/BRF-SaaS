'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Container, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Alert, 
  Card, 
  List, 
  Divider, 
  Accordion, 
  Badge,
  Code,
  Loader,
  Paper,
  ScrollArea
} from '@mantine/core';
import { IconAlertCircle, IconRefresh, IconCheck, IconX } from '@tabler/icons-react';
import { createClient } from '@supabase/supabase-js';

type DiagnosticData = {
  timestamp: string;
  processingTime: number;
  environment: {
    nodeEnv: string;
    vercelEnv: string;
    region: string;
    supabaseUrl: string;
    supabaseKey: string | null;
    hasKey: boolean;
  };
  cookies: Record<string, string>;
  connectionTests: {
    directSupabase: {
      url: string;
      success: boolean;
      responseTime: number;
      errorMessage?: string;
      statusCode?: number;
    };
    proxySupabase: {
      url: string;
      success: boolean;
      responseTime: number;
      errorMessage?: string;
      statusCode?: number;
    };
    projectPage: {
      url: string;
      success: boolean;
      responseTime: number;
      errorMessage?: string;
      statusCode?: number;
    };
  };
};

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [clientDiagnostics, setClientDiagnostics] = useState<{
    clientSupabase: boolean;
    clientSupabaseError?: string;
    userAgent: string;
    language: string;
    cookiesEnabled: boolean;
    localStorageAvailable: boolean;
    connectionType?: string;
    dnsTest?: {
      success: boolean;
      error?: string;
    };
  } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Perform server diagnostics
      const response = await fetch('/api/debug');
      const serverData = await response.json();
      setData(serverData);
      
      // Perform client diagnostics
      const clientDiags = {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        localStorageAvailable: !!window.localStorage,
        connectionType: (navigator as any).connection 
          ? (navigator as any).connection.effectiveType 
          : 'unknown',
      };
      
      // Test client-side Supabase connection
      try {
        const supabaseUrl = serverData.environment.supabaseUrl;
        if (!supabaseUrl) throw new Error('No Supabase URL available');
        
        // Only create client if URL is available - use anonymous key for test
        const supabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
        
        // Test a harmless query
        const { error: supabaseError } = await supabase.from('health_check').select('*').limit(1);
        
        setClientDiagnostics({
          ...clientDiags,
          clientSupabase: !supabaseError,
          clientSupabaseError: supabaseError?.message,
        });
      } catch (clientError: any) {
        setClientDiagnostics({
          ...clientDiags,
          clientSupabase: false,
          clientSupabaseError: clientError.message,
        });
      }
    } catch (e: any) {
      setError(`Failed to run diagnostics: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>Systemdiagnostik</Title>
          <Button 
            onClick={runDiagnostics} 
            leftSection={<IconRefresh size={16} />}
            loading={loading}
          >
            Uppdatera
          </Button>
        </Group>

        {error && (
          <Alert 
            color="red" 
            title="Diagnostikfel" 
            icon={<IconAlertCircle size={16} />}
          >
            {error}
          </Alert>
        )}

        {loading && !data && (
          <Card withBorder p="xl">
            <Group justify="center">
              <Loader size="lg" />
              <Text fw={500}>Hämtar diagnostikinformation...</Text>
            </Group>
          </Card>
        )}

        {data && (
          <Stack gap="lg">
            <Card withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Sammanfattning</Title>
                  <Text color="dimmed" size="sm">
                    Utförd {formatDate(data.timestamp)} ({data.processingTime.toFixed(2)}ms)
                  </Text>
                </Group>
                
                <Group>
                  <Badge 
                    color={data.environment.supabaseUrl ? "green" : "red"}
                    size="lg"
                  >
                    Supabase URL: {data.environment.supabaseUrl ? "Konfigurerad" : "Saknas"}
                  </Badge>
                  
                  <Badge 
                    color={data.environment.hasKey ? "green" : "red"}
                    size="lg"
                  >
                    Supabase API Nyckel: {data.environment.hasKey ? "Konfigurerad" : "Saknas"}
                  </Badge>
                  
                  <Badge 
                    color={data.connectionTests.directSupabase.success ? "green" : "red"}
                    size="lg"
                  >
                    Direkt Supabase-anslutning: {data.connectionTests.directSupabase.success ? "OK" : "Fel"}
                  </Badge>
                  
                  <Badge 
                    color={data.connectionTests.proxySupabase.success ? "green" : "red"}
                    size="lg"
                  >
                    Proxy Supabase-anslutning: {data.connectionTests.proxySupabase.success ? "OK" : "Fel"}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            <Accordion multiple defaultValue={['environment']}>
              <Accordion.Item value="environment">
                <Accordion.Control>
                  <Title order={4}>Miljöinformation</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <List spacing="sm">
                    <List.Item>
                      <Text span fw={500}>Node miljö:</Text> {data.environment.nodeEnv}
                    </List.Item>
                    <List.Item>
                      <Text span fw={500}>Vercel miljö:</Text> {data.environment.vercelEnv || 'Ej Vercel'}
                    </List.Item>
                    <List.Item>
                      <Text span fw={500}>Region:</Text> {data.environment.region || 'Okänd'}
                    </List.Item>
                    <List.Item>
                      <Text span fw={500}>Supabase URL:</Text> {data.environment.supabaseUrl || 'Ej konfigurerad'}
                    </List.Item>
                    <List.Item>
                      <Text span fw={500}>Supabase API Nyckel:</Text> {data.environment.hasKey ? 'Konfigurerad (dold)' : 'Ej konfigurerad'}
                    </List.Item>
                  </List>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="clientDiags">
                <Accordion.Control>
                  <Title order={4}>Klientdiagnostik</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  {clientDiagnostics ? (
                    <List spacing="sm">
                      <List.Item>
                        <Group>
                          <Text fw={500}>Klient Supabase-anslutning:</Text> 
                          {clientDiagnostics.clientSupabase ? 
                            <Badge color="green"><IconCheck size={14} /> OK</Badge> : 
                            <Badge color="red"><IconX size={14} /> Fel</Badge>}
                        </Group>
                        {clientDiagnostics.clientSupabaseError && (
                          <Text color="red" size="sm" mt={5}>Fel: {clientDiagnostics.clientSupabaseError}</Text>
                        )}
                      </List.Item>
                      <List.Item>
                        <Text span fw={500}>Webbläsare:</Text> {clientDiagnostics.userAgent}
                      </List.Item>
                      <List.Item>
                        <Text span fw={500}>Språk:</Text> {clientDiagnostics.language}
                      </List.Item>
                      <List.Item>
                        <Text span fw={500}>Cookies aktiverade:</Text> {clientDiagnostics.cookiesEnabled ? 'Ja' : 'Nej'}
                      </List.Item>
                      <List.Item>
                        <Text span fw={500}>LocalStorage tillgängligt:</Text> {clientDiagnostics.localStorageAvailable ? 'Ja' : 'Nej'}
                      </List.Item>
                      {clientDiagnostics.connectionType && (
                        <List.Item>
                          <Text span fw={500}>Anslutningstyp:</Text> {clientDiagnostics.connectionType}
                        </List.Item>
                      )}
                    </List>
                  ) : (
                    <Text>Laddar klientinformation...</Text>
                  )}
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="connectionTests">
                <Accordion.Control>
                  <Title order={4}>Anslutningstest</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    <Paper withBorder p="md">
                      <Stack gap="xs">
                        <Group>
                          <Text fw={500}>Direkt Supabase-anslutning:</Text>
                          {data.connectionTests.directSupabase.success ? (
                            <Badge color="green"><IconCheck size={14} /> OK ({data.connectionTests.directSupabase.responseTime}ms)</Badge>
                          ) : (
                            <Badge color="red"><IconX size={14} /> Fel</Badge>
                          )}
                        </Group>
                        
                        <Text size="sm">URL: {data.connectionTests.directSupabase.url}</Text>
                        
                        {!data.connectionTests.directSupabase.success && (
                          <Alert 
                            color="red" 
                            title="Anslutningsfel" 
                            icon={<IconAlertCircle size={16} />}
                          >
                            <Text>{data.connectionTests.directSupabase.errorMessage}</Text>
                            {data.connectionTests.directSupabase.statusCode && (
                              <Text>Status: {data.connectionTests.directSupabase.statusCode}</Text>
                            )}
                          </Alert>
                        )}
                      </Stack>
                    </Paper>

                    <Paper withBorder p="md">
                      <Stack gap="xs">
                        <Group>
                          <Text fw={500}>Proxy Supabase-anslutning:</Text>
                          {data.connectionTests.proxySupabase.success ? (
                            <Badge color="green"><IconCheck size={14} /> OK ({data.connectionTests.proxySupabase.responseTime}ms)</Badge>
                          ) : (
                            <Badge color="red"><IconX size={14} /> Fel</Badge>
                          )}
                        </Group>
                        
                        <Text size="sm">URL: {data.connectionTests.proxySupabase.url}</Text>
                        
                        {!data.connectionTests.proxySupabase.success && (
                          <Alert 
                            color="red" 
                            title="Anslutningsfel" 
                            icon={<IconAlertCircle size={16} />}
                          >
                            <Text>{data.connectionTests.proxySupabase.errorMessage}</Text>
                            {data.connectionTests.proxySupabase.statusCode && (
                              <Text>Status: {data.connectionTests.proxySupabase.statusCode}</Text>
                            )}
                          </Alert>
                        )}
                      </Stack>
                    </Paper>

                    <Paper withBorder p="md">
                      <Stack gap="xs">
                        <Group>
                          <Text fw={500}>Projektsida:</Text>
                          {data.connectionTests.projectPage.success ? (
                            <Badge color="green"><IconCheck size={14} /> OK ({data.connectionTests.projectPage.responseTime}ms)</Badge>
                          ) : (
                            <Badge color="red"><IconX size={14} /> Fel</Badge>
                          )}
                        </Group>
                        
                        <Text size="sm">URL: {data.connectionTests.projectPage.url}</Text>
                        
                        {!data.connectionTests.projectPage.success && (
                          <Alert 
                            color="red" 
                            title="Anslutningsfel" 
                            icon={<IconAlertCircle size={16} />}
                          >
                            <Text>{data.connectionTests.projectPage.errorMessage}</Text>
                            {data.connectionTests.projectPage.statusCode && (
                              <Text>Status: {data.connectionTests.projectPage.statusCode}</Text>
                            )}
                          </Alert>
                        )}
                      </Stack>
                    </Paper>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="cookies">
                <Accordion.Control>
                  <Title order={4}>Cookies</Title>
                </Accordion.Control>
                <Accordion.Panel>
                  {Object.keys(data.cookies).length > 0 ? (
                    <ScrollArea h={200}>
                      <Code block>
                        {JSON.stringify(data.cookies, null, 2)}
                      </Code>
                    </ScrollArea>
                  ) : (
                    <Text>Inga cookies hittades</Text>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        )}
      </Stack>
    </Container>
  );
} 