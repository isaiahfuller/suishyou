import "./navbar.css";
export default function Navbar(props: {
  loggedIn: boolean;
  logOut: () => void;
}) {
  const { loggedIn, logOut } = props;
  return (
    <div className="navbar">
      <div className="navbar-left"></div>
      <div className="navbar-center"></div>
      <div className="navbar-right">
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
      </div>
    </div>
  );
}
