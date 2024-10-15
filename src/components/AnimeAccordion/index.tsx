import {
  Accordion,
  Button,
  Divider,
  Flex,
  Group,
  Space,
  Stack,
  Text,
  Image,
} from "@mantine/core";
import classes from "./index.module.css";
import { AnimeEntry } from "../../interfaces";
import {
  faFireFlameCurved,
  faMedal,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";

export default function AnimeAccordion(props: { list: AnimeEntry[] }) {
  const { list } = props;
  const [descriptionLines, setDescriptionLines] = useState(5);
  const [activeItem, setActiveItem] = useState("");

  const items = list.map((e) => {
    let rated = false;
    let popular = false;
    for (const r of e.rankings) {
      if (r.type === "RATED") rated = true;
      if (r.type === "POPULAR") popular = true;
    }
    const description = DOMPurify.sanitize(e.description);
    return (
      <Accordion.Item key={e.id} value={e.id + ""}>
        <Accordion.Control
          onClick={() => {
            setDescriptionLines(5);
            setActiveItem(e.id + "");
          }}
        >
          <Flex justify="space-between">
            <Group>
              <Image src={e.coverImage.large} w={64} px={8} />
              <Stack maw="80%">
                <Text>{e.title.userPreferred}</Text>
              </Stack>
            </Group>
            <Space />
            <Flex>
              {popular ? (
                <Text span p={1}>
                  <FontAwesomeIcon icon={faFireFlameCurved} color="#ed333b" />
                </Text>
              ) : null}
              {rated ? (
                <Text span p={1}>
                  <FontAwesomeIcon icon={faMedal} color="#f5c211" />
                </Text>
              ) : null}
            </Flex>
          </Flex>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex>
            <Text
              dangerouslySetInnerHTML={{ __html: description }}
              lineClamp={descriptionLines}
            />
          </Flex>
          <Divider
            label={descriptionLines === 0 ? "Show less" : "Show more"}
            onClick={() =>
              descriptionLines === 0
                ? setDescriptionLines(5)
                : setDescriptionLines(0)
            }
          />
          <Flex w="100%" justify="center" align="center">
            {e.trailer ? (
              <>
                <a target="_blank" href={`https://youtu.be/${e.trailer.id}`}>
                  <Button>Watch trailer</Button>{" "}
                </a>
                <Divider orientation="vertical" px={4} />
              </>
            ) : null}
            <Text span>Links: </Text>
            {e.externalLinks.map((e) => {
              return (
                <a href={e.url} target="_blank" key={e.url}>
                  <Image
                    src={e.icon || faGlobe}
                    w={24}
                    bg={e.color || "black"}
                    p={4}
                    m={4}
                    radius="md"
                  />
                </a>
              );
            })}
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  useEffect(() => {
    console.log(list);
    if (list.length > 0) setActiveItem(list[0].id + "");
  }, [list]);

  return (
    <Accordion
      variant="separated"
      defaultValue={list[0].id + ""}
      value={activeItem}
      classNames={{ chevron: classes.chevron, item: classes.item }}
      chevronPosition="left"
      radius="md"
    >
      {items}
    </Accordion>
  );
}
