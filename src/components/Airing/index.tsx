import { useState, useEffect } from "react";
import { AnimeEntry } from "../../interfaces";
import Carousel from "../ListScroll";
import { rankTags } from "../../utils/rankTags";
import { getAiringAnime } from "../../utils/getAiringAnime";
import { Accordion } from "@mantine/core";

export default function Airing(props: { tags: { [key: string]: any } }) {
  const tags = rankTags(props.tags);
  const [list, setList] = useState<AnimeEntry[]>([]);
  useEffect(() => {
    getAiringAnime(1, [], tags).then((entries) => setList(entries));
    console.log(list);
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  if (list.length)
    return (
      <div className="results">
        <h1 className="py-2">Recommended Currently Airing</h1>
        <Carousel recommendations={list} />
        <Accordion>
          {list.map((e) => (
            <Accordion.Item key={e.id} value={e.id + ""}>
              <Accordion.Control>{e.title.userPreferred}</Accordion.Control>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    );
}
