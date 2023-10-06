import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import List from "./components/List";

function App() {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("anilist-token") || ""
  );
  const [loggedIn, setLoggedIn] = useState(false);

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

  function logOut() {
    setLoggedIn(false);
    setAccessToken("");
    localStorage.setItem("anilist-token", "");
    localStorage.setItem("anilist-expires", "");
  }

  return (
    <div className="main">
      <Navbar loggedIn={loggedIn} logOut={logOut} />
      <div className="container">
        {loggedIn ? <List accessToken={accessToken} /> : null}
      </div>
    </div>
  );
}

export default App;
