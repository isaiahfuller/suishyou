import { SetStateAction, useEffect, useState } from "react";
import "./index.css";

export default function TagDisplay(props: {
  tags: {
    [key: string]: {
      [key: string]: any;
      keys: string[];
    };
  };
  displayTags: { [key: string]: unknown };
  setDisplayTags: SetStateAction<any>;
  randomSearch: (tags?: { [key: string]: any }) => Promise<void>;
  averageScore: number;
  search: (
    mainCast: string,
    trait: string,
    setting: string,
    scene: string,
    time: string,
    demographic: string
  ) => void;
}) {
  const categories = Object.keys(props.tags);
  const [loading, setLoading] = useState(true);
  const { tags, setDisplayTags, randomSearch } = props;

  useEffect(() => {
    const tempTags = structuredClone(tags);
    console.log(tempTags);
    for (const cat of categories) {
      const catEntries: [string, any][] = Object.entries(tempTags[cat]);
      for (const tag of catEntries) {
        let ranks = 0;
        for (const entry of tag[1]) {
          ranks +=
            tagMediaSorting(entry) * (entry.status === "COMPLETED" ? 1 : -1);
        }
        if (!tempTags[cat][tag[0]].listScore) {
          const score: number = Math.floor(ranks / tag[1].length);
          tempTags[cat][tag[0]].listScore = score;
        }
      }
      const keys = Object.keys(tempTags[cat]);
      keys.sort(
        (a, b) => tempTags[cat][b].listScore - tempTags[cat][a].listScore
      );
      tempTags[cat].keys = keys;
    }
    randomSearch(tempTags);
    setDisplayTags(tempTags);
    setLoading(false);
  }, []);

  function tagMediaSorting(tag: { tagRank: number; entryScore: number }) {
    const rank = tag.tagRank;
    const score = tag.entryScore;
    return Math.round((rank * score * score) / 10000);
  }

  if (loading) return <p>Processing List...</p>;
}
