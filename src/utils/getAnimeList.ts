import { AnimeList } from "../interfaces";
import { rankTags } from "./rankTags";

export async function getAnimeList(
  id: number,
  accessToken: string,
  setAverageScore: (avg: number) => void,
  setTags: (tags: any) => void
) {
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
      // const lists = res.data.MediaListCollection.lists.filter(
      //   (e: { status: string }) =>
      //     ["COMPLETED", "DROPPED", "PLANNING"].includes(e.status)
      // );
      const lists = res.data.MediaListCollection.lists;
      let scores = 0;
      let entryCount = 0;
      for (const list of lists) {
        for (const entry of list.entries) {
          scores += entry.score;
          if (entry.score) entryCount++;
        }
      }
      const averageScore = scores / entryCount;
      setAverageScore(averageScore);
      const calcTags = rankTags(getTags(lists, averageScore));
      localStorage.setItem("full-list", JSON.stringify(lists));
      localStorage.setItem("full-tags", JSON.stringify(calcTags));
      setTags(calcTags);
    });
}

function getTags(lists: AnimeList[], averageScore: number) {
  const tags: { [key: string]: any } = {};
  for (const list of lists) {
    for (const entry of list.entries) {
      for (const tag of entry.media.tags) {
        if (tag.isAdult) continue;
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
