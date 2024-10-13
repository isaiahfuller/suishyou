import { Center, Loader } from "@mantine/core";
import List from "./components/List";
import { useEffect, useState } from "react";
import Charts from "./components/Charts";
import { AnimeEntry, AnimeList } from "./interfaces";
import Airing from "./components/Airing";
import { getAnimeList } from "./utils/getAnimeList";

interface AppProps {
  loggedIn: boolean;
  accessToken: string;
  page: number;
}

function App({ loggedIn, accessToken, page }: AppProps) {
  const [idx, setIdx] = useState(page || 0);
  const [animeList, setAnimeList] = useState<AnimeList[]>([]);
  const [tagList, setTags] = useState({});
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [displayTags, setDisplayTags] = useState(structuredClone(tagList));
  const [averageScore, setAverageScore] = useState(50);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (page != undefined) setIdx(page);
  }, [page]);

  useEffect(() => {
    const query = `
    {
      Viewer{
        id
      }
    }
    `;
    const list = localStorage.getItem("full-list");
    const tags = localStorage.getItem("full-tags");
    if (list && tags) {
      setAnimeList(JSON.parse(list));
      setTags(JSON.parse(tags));
      setLoading(false);
    } else {
      setLoading(true);
      fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: query,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          const id = parseInt(res.data.Viewer.id);
          getAnimeList(id, accessToken, setAverageScore, setTags);
          setLoading(false);
        });
    }
  }, []);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  function weightedRandom(min: number, max: number) {
    return Math.ceil(max / (Math.random() * max + min));
  }

  async function randomSearch(tags: { [key: string]: any } = tagList) {
    const mainCast = tags["Cast-Main Cast"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Cast-Main Cast"][b].listScore -
        tags["Cast-Main Cast"][a].listScore
    );
    const trait = tags["Cast-Traits"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Cast-Traits"][b].listScore - tags["Cast-Traits"][a].listScore
    );
    const setting = tags["Setting-Universe"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Setting-Universe"][b].listScore -
        tags["Setting-Universe"][a].listScore
    );
    const scene = tags["Setting-Scene"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Setting-Scene"][b].listScore - tags["Setting-Scene"][a].listScore
    );
    const time = tags["Setting-Time"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Setting-Time"][b].listScore - tags["Setting-Time"][a].listScore
    );
    const demographic = tags["Demographic"].keys.sort(
      (a: string | number, b: string | number) =>
        tags["Demographic"][b].listScore - tags["Demographic"][a].listScore
    );
    const idxs = [
      weightedRandom(1, mainCast.length) - 1,
      weightedRandom(1, trait.length) - 1,
      weightedRandom(1, setting.length) - 1,
      weightedRandom(1, scene.length) - 1,
      weightedRandom(1, time.length) - 1,
      weightedRandom(1, demographic.length) - 1,
    ];
    search(
      `"${mainCast[idxs[0]]}"`,
      `"${trait[idxs[1]]}"`,
      `"${setting[idxs[2]]}"`,
      `"${scene[idxs[3]]}"`,
      `"${time[idxs[4]]}"`,
      `"${demographic[idxs[5]]}"`
    );
  }

  async function search(
    mainCast: string,
    trait: string,
    setting: string,
    scene: string,
    time: string,
    demographic: string
  ) {
    await delay(100);
    const tags = [mainCast, trait, setting, scene, time, demographic];
    const currentTags = new Set();
    const results: AnimeEntry[] = [];
    let attempts = 0;
    do {
      if (attempts > 0 && attempts % 5 === 0) {
        if (attempts === 12) break;
        currentTags.clear();
      }
      const tagNames = tags.filter((e) => !currentTags.has(e));
      let str = "";
      tagNames.forEach((e) => {
        str += e.replace(/"/g, "") + ", ";
      });
      str = str.substring(0, str.length - 2);
      if (usedTags.includes(str)) {
        attempts++;
        continue;
      }
      const query = `
      {
        Page(page:0, perPage:10){
          media(tag_in:[${tagNames.join(",")}],type:ANIME){
            title{
              userPreferred,
              romaji
            }
            id
            seasonYear
            episodes
            type
            genres
            meanScore
            siteUrl
            coverImage{
              large
            }
            tags {
              id
              name
              rank
              category
              isAdult
            }
          }
        }
      }
      `;
      // await fetch("https://graphql.anilist.co", {
      //   method: "POST",
      //   headers: {
      //     Authorization: "Bearer " + accessToken,
      //     "Content-Type": "application/json",
      //     Accept: "application/json",
      //   },
      //   body: JSON.stringify({
      //     query: query,
      //   }),
      // }).then((res) => res.json());
    } while (!results.length);
  }

  if (!loggedIn) return <div></div>;
  if (loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }
  switch (idx) {
    case 0:
      return <Airing tags={tagList} />;
    case 1:
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
    case 2:
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
