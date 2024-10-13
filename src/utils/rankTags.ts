export function rankTags(tags: any) {
  const tempTags = structuredClone(tags);
  const categories = Object.keys(tags);

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

  return tempTags;
}
function tagMediaSorting(tag: { tagRank: number; entryScore: number }) {
  const rank = tag.tagRank;
  const score = tag.entryScore;
  return Math.round((rank * score * score) / 10000);
}
