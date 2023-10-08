import { useState } from "react";
import Entry from "../Entry";
import { AnimeEntry } from "../../interfaces";
import { motion, useAnimate } from "framer-motion";
import "./index.css";

interface props {
  recommendations: AnimeEntry[];
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
    <div className="carousel-container">
      <div className="carousel-box">
        <motion.div
          className="carousel"
          ref={scope}
          drag="x"
          dragMomentum={false}
          onDragEnd={(event, info) =>
            paginate(-Math.round(info.offset.x / 208))
          }
        >
          {recommendations.map((e: AnimeEntry) => (
            <Entry key={e.id} entry={e} />
          ))}
        </motion.div>
      </div>
      <div className="carousel-nav">
        <button onClick={()=> paginate(-1)}>{"<"}</button>{" "}
        <motion.div className="progress-bar" style={{ scaleX: (idx)/recommendations.length }} />
        <button onClick={()=> paginate(1)}>{">"}</button>
      </div>
    </div>
  );
}
