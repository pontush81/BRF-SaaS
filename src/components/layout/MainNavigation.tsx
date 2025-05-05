import { useSession } from '@/context/SessionContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  Menu,
  Group,
  Center,
  Burger,
  Container,
  Title,
  Button,
  Drawer,
  ScrollArea,
  Divider,
  UnstyledButton,
  Loader,
  Avatar,
  Text,
  Box,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import {
  IconLogout,
  IconUser,
  IconSettings,
  IconChevronDown,
  IconToolsOff,
  IconChartLine,
  IconAdjustments,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

// Definiera typer för att fixa implicit any på menuItems
interface MenuItem {
  link: string;
  label: string;
  icon: React.ReactNode;
}

// CSS-klasser istället för createStyles
const styles = {
  link: 'px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md flex items-center',
  linkActive: 'bg-blue-50 text-blue-700',
  userMenu:
    'flex items-center gap-2 border border-gray-300 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer',
  userButton: 'flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100',
};

export default function MainNavigation() {
  const { user, isLoading } = useSession(); // Ändrat från loading till isLoading
  const { setUser } = useAuth(); // Ta bort logOut som inte finns
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();

  // Logga ut funktion
  const handleLogout = () => {
    setUser(null);
    // Här kan vi lägga till omdirigering till login-sidan om det behövs
  };

  // Explicit typning för menuItems
  const menuItems: MenuItem[] = [
    {
      link: '/dashboard',
      label: 'Dashboard',
      icon: <IconChartLine size={16} stroke={1.5} />,
    },
    {
      link: '/settings',
      label: 'Inställningar',
      icon: <IconSettings size={16} stroke={1.5} />,
    },
  ];

  // Lägg till länkar för utvecklingsläge eller för inloggade användare
  const devAndAuthLinks: MenuItem[] = [];

  // Om vi är i utveckling eller användaren är inloggad, lägg till diagnostiklänk
  if (process.env.NODE_ENV === 'development' || user) {
    devAndAuthLinks.push({
      link: '/diagnostics',
      label: 'Diagnostik',
      icon: <IconAlertCircle size={16} stroke={1.5} />,
    });
  }

  // Kombinera alla menylänkar
  const allMenuItems: MenuItem[] = [...menuItems, ...devAndAuthLinks];

  const items = allMenuItems.map(item => (
    <Link
      href={item.link}
      key={item.label}
      className={`${styles.link} ${pathname === item.link ? styles.linkActive : ''}`}
    >
      <span className="mr-2">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  ));

  const mobileItems = allMenuItems.map(item => (
    <UnstyledButton
      className={`${styles.link} ${pathname === item.link ? styles.linkActive : ''}`}
      key={item.label}
      component={Link}
      href={item.link}
      onClick={closeDrawer}
    >
      <span className="mr-2">{item.icon}</span>
      <span>{item.label}</span>
    </UnstyledButton>
  ));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Visa inget under SSR
  if (!hasMounted) return null;

  return (
    <div className="border-b border-gray-200 bg-white">
      <Container size="xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo och menylänkar */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-8">
              <Image
                src="/logo.svg"
                alt="BRF-SaaS Logo"
                width={36}
                height={36}
                className="mr-2"
              />
              <Title order={3} className="text-blue-600">
                BRF-SaaS
              </Title>
            </Link>

            <div className="hidden md:flex space-x-1">{items}</div>
          </div>

          {/* Användarmenyn för desktop */}
          <div className="hidden md:flex items-center">
            {isLoading ? (
              <Loader size="sm" />
            ) : user ? (
              <Menu
                position="bottom-end"
                opened={userMenuOpened}
                onChange={setUserMenuOpened}
              >
                <Menu.Target>
                  <Button variant="subtle" className={styles.userMenu}>
                    <Avatar color="blue" radius="xl" size="sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <Text size="sm" className="font-medium mr-3">
                      {user.email || 'Användare'}
                    </Text>
                    <IconChevronDown size={16} stroke={1.5} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => (window.location.href = '/profile')}
                  >
                    <IconUser size={16} stroke={1.5} className="mr-2" />
                    <span>Min profil</span>
                  </div>

                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => (window.location.href = '/settings')}
                  >
                    <IconSettings size={16} stroke={1.5} className="mr-2" />
                    <span>Inställningar</span>
                  </div>

                  <Divider my="xs" />

                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                    onClick={handleLogout}
                  >
                    <IconLogout size={16} stroke={1.5} className="mr-2" />
                    <span>Logga ut</span>
                  </div>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button component={Link} href="/auth/login">
                Logga in
              </Button>
            )}
          </div>

          {/* Hamburgarmenyn för mobil */}
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            className="md:hidden"
          />
        </div>
      </Container>

      {/* Mobil sidopanel */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        padding="md"
        size="xs"
        className="md:hidden"
      >
        <ScrollArea h="calc(100vh - 60px)" mx="-md">
          <div className="p-4">
            {mobileItems}

            <Divider my="sm" />

            {isLoading ? (
              <Center>
                <Loader size="sm" />
              </Center>
            ) : user ? (
              <>
                <UnstyledButton
                  className={styles.userButton}
                  component={Link}
                  href="/profile"
                >
                  <Avatar color="blue" radius="xl" size="sm" mr={8}>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <div>
                    <Text size="sm" className="font-medium">
                      {user.email || 'Användare'}
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      Min profil
                    </Text>
                  </div>
                </UnstyledButton>

                <Button
                  className="bg-red-50 hover:bg-red-100 text-red-600 mt-4 w-full flex items-center justify-center"
                  onClick={handleLogout}
                  variant="subtle"
                >
                  <IconLogout size={16} stroke={1.5} className="mr-2" />
                  Logga ut
                </Button>
              </>
            ) : (
              <Button component={Link} href="/auth/login" fullWidth>
                Logga in
              </Button>
            )}
          </div>
        </ScrollArea>
      </Drawer>
    </div>
  );
}
