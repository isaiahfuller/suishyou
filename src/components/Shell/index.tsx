import { AppShell, Box, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import App from "../../App";
import Navbar from "../Navbar";
import { useEffect, useState } from "react";

export default function Shell() {
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
    }
    const tokenTime = localStorage.getItem("anilist-expires");
    if (tokenTime && new Date(tokenTime) > new Date()) {
      setLoggedIn(true);
    } else setLoggedIn(false);
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="space-between" m={8}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <div>Logo</div>
          </Group>
          <div></div>
          <Box>
            {loggedIn ? (
              <button className="button" onClick={() => logOut()}>
                Log Out
              </button>
            ) : (
              <a
                className="button"
                href="https://anilist.co/api/v2/oauth/authorize?client_id=10680&response_type=token"
              >
                Login with AniList
              </a>
            )}
          </Box>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md"></AppShell.Navbar>

      <AppShell.Main>
        <App loggedIn={loggedIn} accessToken={accessToken} />
      </AppShell.Main>
    </AppShell>
  );
}
