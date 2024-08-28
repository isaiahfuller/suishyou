import { useEffect, useState } from "react";
import "./index.css";
import TagDisplay from "../TagDisplay";
import Carousel from "../Carousel";
import { AnimeEntry, AnimeList } from "../../interfaces";
import Airing from "../Airing";
import { Accordion, Box, Button } from "@mantine/core";

export default function List(props: { accessToken: string }) {
  const { accessToken } = props;
  const [animeList, setAnimeList] = useState<AnimeList[]>([]);
  const [tagList, setTags] = useState({});
  const [recommendations, setRecs] = useState<AnimeEntry[] | Array<any>>([]);
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [displayTags, setDisplayTags] = useState(structuredClone(tagList));
  const [averageScore, setAverageScore] = useState(50);

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
      console.log(list, tags);
      console.log("List/tags from storage");
      setAnimeList(JSON.parse(list));
      setTags(JSON.parse(tags));
    } else {
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
          getList(id);
        });
    }
  }, []);

  function getList(id: number) {
    // 57505
    const query = `
    {
      MediaListCollection(userId: ${id}, type:ANIME) {
        user {
          id
          name
        }
        lists {
          name
          isCustomList
          isSplitCompletedList
          status
          entries {
            media {
              title {
                romaji
                english
                native
                userPreferred
              }
              id
              seasonYear
              episodes
              type
              genres
              meanScore
              tags {
                id
                name
                rank
                category
                isAdult
              }
            }
            progress
            score
          }
        }
      }
    }
    `;
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
        // const name: string = res.data.MediaListCollection.user.name;
        const lists = res.data.MediaListCollection.lists.filter(
          (e: { status: string }) => ["COMPLETED", "DROPPED"].includes(e.status)
        );
        let scores = 0;
        let entryCount = 0;
        for (const list of lists) {
          for (const entry of list.entries) {
            scores += entry.score;
            if (entry.score) entryCount++;
          }
        }
        setAverageScore(scores / entryCount);
        const calcTags = getTags(lists);
        localStorage.setItem("full-list", JSON.stringify(lists));
        localStorage.setItem("full-tags", JSON.stringify(calcTags));
        setAnimeList(lists);
        setTags(calcTags);
      });
  }

  function getTags(lists = animeList) {
    const tags: { [key: string]: any } = {};
    console.log(lists);
    for (const list of lists) {
      for (const entry of list.entries) {
        for (const tag of entry.media.tags) {
          if (tag.isAdult) continue;
          // if(tag.category.startsWith("Theme")) tag.category = "Theme"
          if (!(tag.category in tags)) tags[tag.category] = {};
          if (!(tag.name in tags[tag.category])) {
            tags[tag.category][tag.name] = [];
          }
          tags[tag.category][tag.name].push({
            mediaId: entry.media.id,
            mediaName: entry.media.title.userPreferred,
            tagRank: tag.rank,
            entryScore: entry.score > 0 ? entry.score : averageScore,
            status: list.status,
          });
        }
      }
    }
    return tags;
  }
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  function weightedRandom(min: number, max: number) {
    return Math.ceil(max / (Math.random() * max + min));
  }

  async function randomSearch(tags: { [key: string]: any } = displayTags) {
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
    let results = [];
    let attempts = 0;
    do {
      const tagNames = tags.filter((e) => !currentTags.has(e));
      let str = "";
      tagNames.forEach((e) => {
        str += e.replace(/"/g, "") + ", ";
      });
      str = str.substring(0, str.length - 2);
      if (usedTags.includes(str)) continue;
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
      await fetch("https://graphql.anilist.co", {
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
          results = res.data.Page.media;
          currentTags.add(
            tagNames[Math.floor(Math.random() * (tagNames.length - 1))]
          );
          if (results.length) {
            attempts = 0;
            setRecs([...recommendations, results]);
            setUsedTags((prev) => [...prev, str]);
          } else attempts++;
        });
      // break;
      if (attempts > 0 && attempts % 5 === 0) {
        if (attempts === 25) break;
        currentTags.clear();
      }
    } while (!results.length);
  }

  if (animeList && animeList.length) {
    return (
      <div className="content">
        <TagDisplay
          tags={tagList}
          search={search}
          randomSearch={randomSearch}
          setDisplayTags={setDisplayTags}
          displayTags={displayTags}
          averageScore={averageScore}
        />
        {Object.keys(displayTags).length ? <Airing tags={displayTags} /> : null}
        <div />
        <hr />
        <div className="results-header">
          <h1 className="flex-shrink">Recommended by tags</h1>
        </div>
        <Box className="results w-full m-auto px-16">
          <Accordion w="full" multiple={false}>
            {recommendations.length
              ? recommendations.map((e, i) => {
                  return (
                    <Accordion.Item value={usedTags[i]} w="full" key={i}>
                      <Accordion.Control w="full">
                        {usedTags[i]}
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Carousel recommendations={e} />
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })
              : null}
          </Accordion>
        </Box>
        <Button className="m-2" onClick={() => randomSearch()}>
          Load more...
        </Button>
      </div>
    );
  } else return <p>Loading...</p>;
}
