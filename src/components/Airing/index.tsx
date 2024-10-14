import { useState, useEffect } from "react";
import { AnimeEntry } from "../../interfaces";
import Carousel from "../ListScroll";
import { rankTags } from "../../utils/rankTags";
import { getAiringAnime } from "../../utils/getAiringAnime";
import { Accordion, AccordionControlProps, Center, Text } from "@mantine/core";
import classes from "./index.module.css";

function AccordionControl(props: AccordionControlProps) {
  return (
    <Center>
      <Accordion.Control {...props} />
    </Center>
  );
}

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

  const items = list.map((e) => (
    <Accordion.Item key={e.id} value={e.id + ""}>
      <AccordionControl>
        <Text span>{e.title.userPreferred}</Text>
        <Text span></Text>
      </AccordionControl>
    </Accordion.Item>
  ));

  if (list.length)
    return (
      <div className="results">
        <h1 className="py-2">Recommended Currently Airing</h1>
        <Carousel recommendations={list} />
        <Accordion
          defaultValue={list[0].id + ""}
          classNames={{ chevron: classes.chevron }}
          chevronPosition="left"
        >
          {items}
        </Accordion>
      </div>
    );
}
