import { Center, Loader } from "@mantine/core";
import List from "./components/List";
import { useEffect, useState } from "react";
import Charts from "./components/Charts";
import { AnimeList } from "./interfaces";

interface AppProps {
  loggedIn: boolean;
  accessToken: string;
  page: number;
}

function App({ loggedIn, accessToken, page }: AppProps) {
  const [idx, setIdx] = useState(page || 0);
  const [animeList, setAnimeList] = useState<AnimeList[]>([]);
  const [tagList, setTags] = useState({});

  useEffect(() => {
    if (page != undefined) setIdx(page);
  }, [page]);
  if (!loggedIn) return <div></div>;
  switch (idx) {
    case 0:
      return (
        <div className="main">
          <div className="container">
            <List
              accessToken={accessToken}
              animeList={animeList}
              setAnimeList={setAnimeList}
              tagList={tagList}
              setTags={setTags}
            />
          </div>
        </div>
      );
    case 1:
      return (
        <div className="main">
          <div className="container">
            <Charts animeList={animeList} tagList={tagList} />
          </div>
        </div>
      );
    default:
      return (
        <div className="main h-full border border-red-500">
          <div className="container border border-blue-500">
            <Center className="border h-full border-green-500">
              <Loader />
            </Center>
          </div>
        </div>
      );
  }
}

export default App;
