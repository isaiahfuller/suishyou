import { AnimeEntry } from "../interfaces";

export async function getAiringAnime(
  page = 1,
  tempList: AnimeEntry[],
  tags: any
): Promise<AnimeEntry[]> {
  const currentDate = new Date();
  const query = `
    {
      Page(page: ${page}) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        media(status:RELEASING, seasonYear:${currentDate.getFullYear()}, format_in:[TV,OVA,ONA]) {
          id
          title {
            romaji
            english
            native
            userPreferred
          }
          coverImage {
            extraLarge
            large
            medium
            color
          }
          siteUrl
          episodes
          type
          genres
          meanScore
          isAdult
          description
          tags {
            name
            category
            id
            rank
          }
          trailer {
            site
            id
          }
          externalLinks {
            url
            site
            siteId
            type
            language
            color
            notes
            isDisabled
            icon
          }
          averageScore
          airingSchedule {
            nodes {
              airingAt
              episode
              timeUntilAiring
            }
          }
          rankings {
            id
            rank
            type
            format
            year
            season
            allTime
            context
          }
        }
      }
    }
    `;
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
    }),
  });
  const res = await response.json();
  const media: AnimeEntry[] = res.data.Page.media;
  const pageInfo = res.data.Page.pageInfo;
  const newList = [...tempList, ...media];
  if (pageInfo.total === newList.length) {
    return airingSort(
      newList.filter((e) => !e.isAdult),
      tags
    );
  } else return getAiringAnime(page + 1, newList, tags);
}
function airingSort(entries: AnimeEntry[], tags: any): AnimeEntry[] {
  const scores = new Map();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!tags[tag.category] || !tags[tag.category][tag.name]) continue;
      const score = tags[tag.category][tag.name].listScore * (tag.rank / 100);
      scores.set(
        entry.id,
        scores.has(entry.id) ? scores.get(entry.id) + score : score
      );
    }
  }
  const newEntries: AnimeEntry[] = entries.sort(
    (a: AnimeEntry, b: AnimeEntry) => {
      return scores.get(b.id) - scores.get(a.id);
    }
  );
  return newEntries;
}
