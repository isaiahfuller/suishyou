import { useEffect, useState } from "react";
import "./index.css";

export default function TagDisplay(props: {
  tags: { [key: string]: any };
  displayTags: { [key: string]: any };
  setDisplayTags: any;
  randomSearch: any;
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
  const { tags, setDisplayTags, randomSearch, averageScore } = props;
  // const [mainCast, setMainCast] = useState("");
  // const [trait, setTrait] = useState("");
  // const [scene, setScene] = useState("");
  // const [time, setTime] = useState("");
  // const [setting, setSetting] = useState("");
  // const [demographic, setDemographic] = useState("");

  useEffect(() => {
    const tempTags = structuredClone(tags);
    for (const cat of categories) {
      const catEntries: [string, any][] = Object.entries(tempTags[cat]);
      for (const tag of catEntries) {
        // console.log(tag);
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

  // function handleSubmit(e: React.FormEvent<any>) {
  //   e.preventDefault();
  //   console.log(mainCast, trait, setting, scene, time, demographic);
  //   search(
  //     `"${mainCast}"`,
  //     `"${trait}"`,
  //     `"${setting}"`,
  //     `"${scene}"`,
  //     `"${time}"`,
  //     `"${demographic}"`
  //   );
  // }

  // if (loading) return <p>Processing List...</p>;
  if (loading) return <p>Processing List...</p>;
  // return (
  //   <div>
  //     <form onSubmit={handleSubmit}>
  //       <h1>
  //         I want to watch a show with
  //         <select id="main-cast" onChange={(e) => setMainCast(e.target.value)}>
  //           {displayTags["Cast-Main Cast"].keys.map((e: string, i: number) => {
  //             if (!mainCast.length && !i) setMainCast(e);
  //             return <option key={i}>{e}</option>;
  //           })}
  //         </select>
  //         characters, with
  //         <select id="traits" onChange={(e) => setTrait(e.target.value)}>
  //           {displayTags["Cast-Traits"].keys.map((e: string, i: number) => {
  //             if (!trait.length && !i) setTrait(e);
  //             return <option key={i}>{e}</option>;
  //           })}
  //         </select>
  //         in a
  //         <select id="setting" onChange={(e) => setSetting(e.target.value)}>
  //           {displayTags["Setting-Universe"].keys.map(
  //             (e: string, i: number) => {
  //               if (!setting.length && !i) setSetting(e);
  //               return <option key={i}>{e}</option>;
  //             }
  //           )}
  //         </select>
  //         setting with
  //         <select id="scene" onChange={(e) => setScene(e.target.value)}>
  //           {displayTags["Setting-Scene"].keys.map((e: string, i: number) => {
  //             if (!scene.length && !i) setScene(e);
  //             return <option key={i}>{e}</option>;
  //           })}
  //         </select>
  //         , during
  //         <select id="time" onChange={(e) => setTime(e.target.value)}>
  //           {displayTags["Setting-Time"].keys.map((e: string, i: number) => {
  //             if (!time.length && !i) setTime(e);
  //             return <option key={i}>{e}</option>;
  //           })}
  //         </select>
  //         , aimed at
  //         <select
  //           id="demographic"
  //           onChange={(e) => setDemographic(e.target.value)}
  //         >
  //           {displayTags["Demographic"].keys.map((e: string, i: number) => {
  //             if (!demographic.length && !i) setDemographic(e);
  //             return <option key={i}>{e}</option>;
  //           })}
  //         </select>
  //         .
  //       </h1>
  //       <div className="form-submit">
  //         <input
  //           type="submit"
  //           value="Submit"
  //           className="button submit-button"
  //           onClick={(e) => console.log(e)}
  //         />
  //       </div>
  //     </form>
  //   </div>
  // );
}
