import { useState, useEffect } from "react";
import { AnimeEntry } from "../../interfaces";
import Carousel from "../Carousel";

export default function Airing(props: { tags: { [key: string]: any } }) {
  const { tags } = props;
  const [list, setList] = useState<AnimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAiringAnime(1, []);
  }, []);

  function getAiringAnime(page = 1, tempList: AnimeEntry[]) {
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
        media(status:RELEASING, seasonYear:${currentDate.getFullYear()}, isAdult:false, format_in:[TV,OVA,ONA]) {
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
          tags {
            name
            category
            id
            rank
            isAdult
          }
        }
      }
    }
    `;
    fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        // console.log(res.data.Page.media)
        const media: AnimeEntry[] = res.data.Page.media;
        const pageInfo = res.data.Page.pageInfo;
        const newList = [...tempList, ...media];
        if (pageInfo.total === newList.length) {
          setList(newList);
          airingSort(newList);
        } else getAiringAnime(page + 1, newList);
      });
  }

  function airingSort(entries = list) {
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
    const newEntries = entries.sort((a, b) => {
      return scores.get(b.id) - scores.get(a.id);
    });
    setList(newEntries);
    setLoading(false);
  }
  if (loading) return <p>Airing</p>;
  else
    return (
      <div className="results">
        <h1 className="py-2">Recommended Currently Airing</h1>
        <Carousel recommendations={list} />
      </div>
    );
}
