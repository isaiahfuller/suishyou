import { useState, useEffect } from "react";
import Entry from "../Entry";
import { AnimeEntry } from "../../interfaces";
import { motion, useAnimate } from "framer-motion";
import "./index.css";

interface props {
  recommendations: AnimeEntry[];
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

export default function Carousel({ recommendations }: props) {
  const [scope, animate] = useAnimate();
  const [idx, setIdx] = useState(0);
  const [transform, setTransform] = useState(0);

  // 208px per entry
  function paginate(direction: number) {
    console.log(direction, recommendations.length);
    let newDir = idx + direction;
    if (newDir < 0) newDir = 0;
    if (newDir > recommendations.length - 1)
      newDir = recommendations.length - 1;
    setIdx(newDir);
    handleResize(newDir);
  }

  function handleResize(i = idx) {
    let newTransform = transform;
    newTransform = -i * 216;
    if (newTransform > 0) newTransform = 0;
    console.log(scope.current, newTransform);
    if (scope.current) {
      animate(scope.current, { x: newTransform + "px" }, { duration: 0.3 });
    }
    setTransform(newTransform);
  }
  return (
    <motion.div
      className="carousel"
      ref={scope}
      drag="x"
      dragMomentum={false}
      onDragEnd={(event, info) => paginate(-Math.round(info.offset.x / 208))}
    >
      {recommendations.map((e: AnimeEntry) => (
        <Entry key={e.id} entry={e} />
      ))}
    </motion.div>
  );
}
