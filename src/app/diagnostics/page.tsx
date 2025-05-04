'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Text, Container, Title, Badge, Divider, Group, Code, Box, Stack, Alert } from '@mantine/core';
import { IconServer, IconCloud, IconNetwork, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';

// Definiera datastrukturen för diagnostikdata
interface DiagnosticData {
  timestamp: string;
  environment: {
    isVercel: boolean;
    nodeEnv: string;
    runtime: string;
    region?: string;
  };
  supabase: {
    url: string;
    projectId?: string;
  };
  connectionTests?: {
    direct?: {
      status: boolean;
      statusCode?: number;
      error?: string;
      responseTime?: number;
    };
    proxy?: {
      status: boolean;
      statusCode?: number;
      error?: string;
      responseTime?: number;
    };
  };
  error?: string;
}

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [directTestLoading, setDirectTestLoading] = useState<boolean>(false);
  const [proxyTestLoading, setProxyTestLoading] = useState<boolean>(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [directTestResult, setDirectTestResult] = useState<any>(null);
  const [proxyTestResult, setProxyTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Ladda diagnostikdata när sidan laddas
  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // Hämta diagnostikdata från API
  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/proxy/debug', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server svarade med status: ${response.status}`);
      }
      
      const data = await response.json();
      setDiagnosticData(data);
    } catch (error) {
      console.error('Fel vid hämtning av diagnostik:', error);
      setError(error instanceof Error ? error.message : 'Okänt fel vid hämtning av diagnostik');
    } finally {
      setLoading(false);
    }
  };

  // Testa direktanslutning till Supabase
  const testDirectConnection = async () => {
    setDirectTestLoading(true);
    setDirectTestResult(null);
    
    try {
      const startTime = performance.now();
      const response = await fetch('/api/proxy/test-direct', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store'
        }
      });
      const endTime = performance.now();
      
      const responseData = await response.json();
      setDirectTestResult({
        ...responseData,
        responseTime: Math.round(endTime - startTime)
      });
    } catch (error) {
      console.error('Fel vid test av direktanslutning:', error);
      setDirectTestResult({
        status: false,
        error: error instanceof Error ? error.message : 'Okänt fel vid test av direktanslutning'
      });
    } finally {
      setDirectTestLoading(false);
    }
  };

  // Testa proxyanslutning till Supabase
  const testProxyConnection = async () => {
    setProxyTestLoading(true);
    setProxyTestResult(null);
    
    try {
      const startTime = performance.now();
      const response = await fetch('/api/proxy/health?verbose=true', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store'
        }
      });
      const endTime = performance.now();
      
      const responseData = await response.json();
      setProxyTestResult({
        ...responseData,
        responseTime: Math.round(endTime - startTime)
      });
    } catch (error) {
      console.error('Fel vid test av proxyanslutning:', error);
      setProxyTestResult({
        status: false,
        error: error instanceof Error ? error.message : 'Okänt fel vid test av proxyanslutning'
      });
    } finally {
      setProxyTestLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Systemdiagnostik</Title>
      <Text color="dimmed" mb="xl">
        Denna sida visar diagnostisk information om systemet och anslutningar till Supabase.
      </Text>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <Group position="apart" mb="xl">
        <Button 
          leftIcon={<IconServer size={16} />} 
          loading={loading} 
          onClick={fetchDiagnostics}
        >
          Uppdatera diagnostik
        </Button>
        
        <Group>
          <Button 
            variant="outline" 
            leftIcon={<IconCloud size={16} />} 
            loading={directTestLoading} 
            onClick={testDirectConnection}
          >
            Testa direktanslutning
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<IconNetwork size={16} />} 
            loading={proxyTestLoading} 
            onClick={testProxyConnection}
          >
            Testa proxyanslutning
          </Button>
        </Group>
      </Group>

      {diagnosticData && (
        <Stack spacing="lg">
          <Card withBorder shadow="sm" p="md">
            <Title order={3} mb="md">Miljöinformation</Title>
            <Group position="apart" mb="xs">
              <Text weight={500}>Körs på Vercel:</Text>
              <Badge color={diagnosticData.environment.isVercel ? 'green' : 'gray'}>
                {diagnosticData.environment.isVercel ? 'Ja' : 'Nej'}
              </Badge>
            </Group>
            <Group position="apart" mb="xs">
              <Text weight={500}>Node-miljö:</Text>
              <Badge color={diagnosticData.environment.nodeEnv === 'production' ? 'blue' : 'yellow'}>
                {diagnosticData.environment.nodeEnv}
              </Badge>
            </Group>
            <Group position="apart" mb="xs">
              <Text weight={500}>Runtime:</Text>
              <Text>{diagnosticData.environment.runtime}</Text>
            </Group>
            {diagnosticData.environment.region && (
              <Group position="apart">
                <Text weight={500}>Vercel-region:</Text>
                <Text>{diagnosticData.environment.region}</Text>
              </Group>
            )}
          </Card>

          <Card withBorder shadow="sm" p="md">
            <Title order={3} mb="md">Supabase-konfiguration</Title>
            <Group position="apart" mb="xs">
              <Text weight={500}>URL:</Text>
              <Code>{diagnosticData.supabase.url}</Code>
            </Group>
            {diagnosticData.supabase.projectId && (
              <Group position="apart">
                <Text weight={500}>Projekt-ID:</Text>
                <Text>{diagnosticData.supabase.projectId}</Text>
              </Group>
            )}
          </Card>

          {diagnosticData.connectionTests && (
            <Card withBorder shadow="sm" p="md">
              <Title order={3} mb="md">Anslutningstest (Server)</Title>
              
              <Text weight={500} mb="xs">Direktanslutning till Supabase:</Text>
              <Group mb="md">
                <Badge color={diagnosticData.connectionTests.direct?.status ? 'green' : 'red'}>
                  {diagnosticData.connectionTests.direct?.status ? 'Lyckades' : 'Misslyckades'}
                </Badge>
                {diagnosticData.connectionTests.direct?.statusCode && (
                  <Badge color="blue">Status: {diagnosticData.connectionTests.direct.statusCode}</Badge>
                )}
                {diagnosticData.connectionTests.direct?.responseTime && (
                  <Badge color="gray">{diagnosticData.connectionTests.direct.responseTime}ms</Badge>
                )}
              </Group>
              {diagnosticData.connectionTests.direct?.error && (
                <Alert color="red" mb="md">
                  {diagnosticData.connectionTests.direct.error}
                </Alert>
              )}
              
              <Divider my="md" />
              
              <Text weight={500} mb="xs">Proxyanslutning till Supabase:</Text>
              <Group mb="md">
                <Badge color={diagnosticData.connectionTests.proxy?.status ? 'green' : 'red'}>
                  {diagnosticData.connectionTests.proxy?.status ? 'Lyckades' : 'Misslyckades'}
                </Badge>
                {diagnosticData.connectionTests.proxy?.statusCode && (
                  <Badge color="blue">Status: {diagnosticData.connectionTests.proxy.statusCode}</Badge>
                )}
                {diagnosticData.connectionTests.proxy?.responseTime && (
                  <Badge color="gray">{diagnosticData.connectionTests.proxy.responseTime}ms</Badge>
                )}
              </Group>
              {diagnosticData.connectionTests.proxy?.error && (
                <Alert color="red" mb="md">
                  {diagnosticData.connectionTests.proxy.error}
                </Alert>
              )}
            </Card>
          )}
          
          <Card withBorder shadow="sm" p="md">
            <Title order={3} mb="md">Tidsstämpel</Title>
            <Text>{new Date(diagnosticData.timestamp).toLocaleString()}</Text>
          </Card>
        </Stack>
      )}

      {directTestResult && (
        <Card withBorder shadow="sm" p="md" mt="xl">
          <Title order={3} mb="md">Resultat av direktanslutningstest</Title>
          <Box mb="md">
            <Group mb="xs">
              <Text weight={500}>Status:</Text>
              <Badge color={directTestResult.status ? 'green' : 'red'}>
                {directTestResult.status ? 'Lyckades' : 'Misslyckades'}
              </Badge>
              {directTestResult.responseTime && (
                <Badge color="gray">{directTestResult.responseTime}ms</Badge>
              )}
            </Group>
            {directTestResult.error && (
              <Alert color="red" mt="xs">
                {directTestResult.error}
              </Alert>
            )}
          </Box>
          <Code block>{JSON.stringify(directTestResult, null, 2)}</Code>
        </Card>
      )}

      {proxyTestResult && (
        <Card withBorder shadow="sm" p="md" mt="xl">
          <Title order={3} mb="md">Resultat av proxyanslutningstest</Title>
          <Box mb="md">
            <Group mb="xs">
              <Text weight={500}>Status:</Text>
              <Badge color={proxyTestResult.supabase?.reachable ? 'green' : 'red'}>
                {proxyTestResult.supabase?.reachable ? 'Lyckades' : 'Misslyckades'}
              </Badge>
              {proxyTestResult.responseTime && (
                <Badge color="gray">{proxyTestResult.responseTime}ms</Badge>
              )}
            </Group>
            {proxyTestResult.supabase?.error && (
              <Alert color="red" mt="xs">
                {proxyTestResult.supabase.error}
              </Alert>
            )}
          </Box>
          <Code block>{JSON.stringify(proxyTestResult, null, 2)}</Code>
        </Card>
      )}
    </Container>
  );
} 