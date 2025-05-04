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
  createStyles
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { IconLogout, IconUser, IconSettings, IconChevronDown, IconToolsOff, IconChartLine, IconAdjustments, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function MainNavigation() {
  const { user, loading } = useSession();
  const { classes, cx, theme } = useStyles();
  const { logOut } = useAuth();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  
  const menuItems = [
    // ... existing links ...
  ];
  
  // Lägg till länkar för utvecklingsläge eller för inloggade användare
  const devAndAuthLinks = [];
  
  // Om vi är i utveckling eller användaren är inloggad, lägg till diagnostiklänk
  if (process.env.NODE_ENV === 'development' || user) {
    devAndAuthLinks.push({
      link: '/diagnostics',
      label: 'Diagnostik',
      icon: <IconAlertCircle size={16} stroke={1.5} />
    });
  }
  
  // Kombinera alla menylänkar
  const allMenuItems = [...menuItems, ...devAndAuthLinks];

  const items = allMenuItems.map((item) => (
    <Link href={item.link} key={item.label} className={classes.link}>
      <Group spacing="xs">
        {item.icon}
        <span>{item.label}</span>
      </Group>
    </Link>
  ));

  const mobileItems = allMenuItems.map((item) => (
    <UnstyledButton 
      className={cx(classes.link, { [classes.linkActive]: pathname === item.link })} 
      key={item.label}
      component={Link}
      href={item.link}
      onClick={closeDrawer}
    >
      <Group>
        {item.icon}
        <span>{item.label}</span>
      </Group>
    </UnstyledButton>
  ));
} 