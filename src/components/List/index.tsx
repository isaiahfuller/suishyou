import { useEffect, useState } from "react";
import "./index.css";
import TagDisplay from "../TagDisplay";
import Result from "../Result";
import { AnimeEntry, AnimeListEntry } from "../../interfaces";

export default function List(props: { accessToken: string }) {
  const { accessToken } = props;
  const [animeList, setAnimeList] = useState<AnimeListEntry[]>([]);
  const [tagList, setTags] = useState({});
  const [recommendations, setRecs] = useState([]);
  const [usedTags, setUsedTags] = useState<string[]>([]);

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

  async function search(
    mainCast: string,
    trait: string,
    setting: string,
    scene: string,
    time: string,
    demographic: string
  ) {
    const tags = [mainCast, trait, setting, scene, time, demographic];
    const usedTags = new Set();
    let results = [];
    do {
      const tagNames = tags.filter((e) => !usedTags.has(e));
      const query = `
      {
        Page(page:1, perPage:10){
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
          usedTags.add(
            tagNames[Math.floor(Math.random() * (tagNames.length - 1))]
          );
          if (results.length) {
            console.log(results);
            console.log(tagNames);
            setRecs(results);
            setUsedTags(tagNames);
          }
        });
      // break;
    } while (!results.length);
  }

  if (animeList && animeList.length) {
    return (
      <div className="content">
        <TagDisplay tags={tagList} search={search} />
        <div />
        {recommendations.length ? <h1>{usedTags.slice(0,usedTags.length-1).join(", ")} and {usedTags.at(-1)}</h1> : null}
        <div className="results">
          {recommendations.length
            ? recommendations.map((e: AnimeEntry) => (
                <div key={e.id}>
                  <Result entry={e} />
                </div>
              ))
            : null}
        </div>
      </div>
    );
  } else return <p>Loading...</p>;
}
