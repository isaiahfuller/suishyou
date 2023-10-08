import { useEffect, useState } from "react";
import "./index.css";
import TagDisplay from "../TagDisplay";
import Carousel from "../Carousel";
import { AnimeEntry, AnimeListEntry } from "../../interfaces";

export default function List(props: { accessToken: string }) {
  const { accessToken } = props;
  const [animeList, setAnimeList] = useState<AnimeListEntry[]>([]);
  const [tagList, setTags] = useState({});
  const [recommendations, setRecs] = useState<AnimeEntry[] | Array<any>>([]);
  const [usedTags, setUsedTags] = useState<string[]>([]);
  const [displayTags, setDisplayTags] = useState(structuredClone(tagList));

  useEffect(() => {
    const query = `
    {
      Viewer{
        id
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
        console.log(res.data.Viewer.id);
        const id = parseInt(res.data.Viewer.id);
        getList(id);
      });
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
        const combinedList: AnimeListEntry[] = [];
        // const name: string = res.data.MediaListCollection.user.name;
        const lists = res.data.MediaListCollection.lists.filter(
          (e: { status: string }) => e.status === "COMPLETED"
        );
        for (const list of lists) {
          combinedList.push(...list.entries);
        }
        setAnimeList(
          combinedList
            .sort((a, b) =>
              a.media.title.userPreferred.toLowerCase() >
              b.media.title.userPreferred.toLowerCase()
                ? 1
                : -1
            )
            .filter((e) => e.score > 0)
        );
        getTags(combinedList.filter((e) => e.score > 0));
      });
  }

  function getTags(list: AnimeListEntry[] = animeList) {
    const tags: { [key: string]: any } = {};
    for (const entry of list) {
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
          entryScore: entry.score,
        });
      }
    }
    setTags(tags);
  }
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  function weightedRandom(min: number, max: number) {
    return Math.ceil(max / (Math.random() * max + min));
  }

  async function randomSearch(tags: { [key: string]: any } = displayTags) {
    console.log(tags);
    console.log(tags["Cast-Main Cast"].keys);
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
    console.log(mainCast, trait, setting, scene, time, demographic);
    const i = new Array(3);
    for await (const n of i) {
      const idxs = [
        weightedRandom(1, mainCast.length - 1) - 1,
        weightedRandom(1, trait.length - 1) - 1,
        weightedRandom(1, setting.length - 1) - 1,
        weightedRandom(1, scene.length - 1) - 1,
        weightedRandom(1, time.length - 1) - 1,
        weightedRandom(1, demographic.length - 1) - 1,
      ];
      console.log(idxs);
      search(
        `"${mainCast[idxs[0]]}"`,
        `"${trait[idxs[1]]}"`,
        `"${setting[idxs[2]]}"`,
        `"${scene[idxs[3]]}"`,
        `"${time[idxs[4]]}"`,
        `"${demographic[idxs[5]]}"`
      );
    }
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
    console.log(tags);
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
      console.log(usedTags, str);
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
            console.log(results);
            console.log(tagNames);
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
    console.log(usedTags);
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
        />
        <div />
        <div className="results">
          {recommendations.length
            ? recommendations.map((e, i) => {
                return (
                  <div key={i}>
                    <div>
                      <h1>{[...usedTags[i]]}</h1>
                      <div>
                        <Carousel recommendations={e} />
                      </div>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </div>
    );
  } else return <p>Loading...</p>;
}
