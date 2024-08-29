import List from "./components/List";

interface AppProps {
  loggedIn: boolean;
  accessToken: string;
}

function App({ loggedIn, accessToken }: AppProps) {
  return (
    <div className="main">
      <div className="container">
        {loggedIn ? <List accessToken={accessToken} /> : null}
      </div>
    </div>
  );
}

export default App;
