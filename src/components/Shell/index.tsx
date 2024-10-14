import {
  AppShell,
  Box,
  Burger,
  Button,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import App from "../../App";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import {
  faChartSimple,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const pages = [
  { title: "Airing", icon: faCalendar },
  { title: "Recommendations", icon: faThumbsUp },
  { title: "Charts", icon: faChartSimple },
];

export default function Shell() {
  const [page, setPage] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("anilist-token") || ""
  );
  const [opened, { toggle }] = useDisclosure();
  function logOut() {
    setLoggedIn(false);
    setAccessToken("");
    localStorage.setItem("anilist-token", "");
    localStorage.setItem("anilist-expires", "");
  }

  useEffect(() => {
    if (location.hash.length) {
      const hash: string = location.hash.substring(1);
      const expiresIn: number = parseInt(hash.split("&")[2].split("=")[1]);
      const accessToken: string = hash.split("&")[0].split("=")[1];
      const expiresAt: Date = new Date(Date.now() + expiresIn);
      localStorage.setItem("anilist-token", accessToken);
      localStorage.setItem("anilist-expires", expiresAt + "");
      setAccessToken(accessToken);
      window.location.replace("");
    }
    const tokenTime = localStorage.getItem("anilist-expires");
    if (tokenTime && new Date(tokenTime) > new Date()) {
      setLoggedIn(true);
    } else setLoggedIn(false);
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, idx: number) {
    e.preventDefault();
    setPage(idx);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      withBorder={false}
    >
      <AppShell.Header>
        <Group justify="space-between" align="center" m={8} h={60}>
          <Group align="center">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Stack align="center" p={24}>
              <Title size="h4" lh={0.1}>
                勧め
              </Title>
              <Text lh={0} size="sm" c="dimmed">
                susume
              </Text>
            </Stack>
          </Group>
          <Box>
            {loggedIn ? (
              <Button variant="subtle" onClick={() => logOut()}>
                Log Out
              </Button>
            ) : (
              <a href="https://anilist.co/api/v2/oauth/authorize?client_id=10680&response_type=token">
                <Button>Login with AniList</Button>
              </a>
            )}
          </Box>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {pages.map((e, i) => (
          <NavLink
            href="#"
            label={e.title}
            key={i}
            onClick={(e) => handleClick(e, i)}
            leftSection={<FontAwesomeIcon icon={e.icon} />}
            rightSection={<FontAwesomeIcon icon={faChevronRight} size="xs" />}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <App loggedIn={loggedIn} accessToken={accessToken} page={page} />
      </AppShell.Main>
    </AppShell>
  );
}
