import { useEffect, useState } from "react";
import { AnimeList, AnimeListEntry } from "../../interfaces";
import { Stack } from "@mantine/core";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface ChartsProps {
  animeList: AnimeList[];
  tagList: { [key: string]: any };
}
export default function Charts({ animeList, tagList }: ChartsProps) {
  const [decades, setDecades] = useState<{
    [key: number]: {
      decade: string;
      avg: number;
      totalScore: number;
      entry: AnimeListEntry;
    };
  }>({});
  useEffect(() => {
    console.log(animeList);
    console.log(tagList);
    const tags = {};
    for (const [k, v] of Object.entries(tagList)) {
      // console.log(k, v);
      console.log(k.split("-")[0]);
      const sset = k.split("-")[0];
      if (!tags[sset]) tags[sset] = {};
      const current = tags[sset];
      tags[sset] = { ...current, ...v };
    }
    // console.log("tags", tags);
    getDecadesAvg();
  }, []);

  function getDecadesAvg() {
    const completedCombined = [];
    const decades = {};
    for (const list of animeList.filter((e) => e.status === "COMPLETED")) {
      console.log(list.entries);
      for (const entry of list.entries) {
        if (entry.media.seasonYear) completedCombined.push(entry);
      }
    }
    completedCombined.sort((a, b) => a.media.seasonYear - b.media.seasonYear);
    console.log(completedCombined);
    for (const entry of completedCombined) {
      const decade = 10 * Math.floor(entry.media.seasonYear / 10);
      if (!decades[decade])
        decades[decade] = {
          entries: [],
          totalScore: 0,
          avg: 0,
          length: 0,
          decade: `${decade}s`,
        };
      decades[decade].entries.push(entry);
      decades[decade].totalScore += entry.score;
      if (entry.score) decades[decade].length++;
      decades[decade].avg = decades[decade].totalScore / decades[decade].length;
    }
    console.log(decades);
    setDecades(decades);
  }

  return (
    <Stack>
      <BarChart data={Object.values(decades)} width={400} height={250}>
        <XAxis dataKey="decade" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="avg" />
      </BarChart>
    </Stack>
  );
}
