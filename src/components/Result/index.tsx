import { AnimeEntry } from "../../interfaces";
import "./index.css";

export default function Result(props: { entry: AnimeEntry }) {
  const { entry } = props;
  return (
    <a href={entry.siteUrl} target="_blank">
      <div className="result">
        <img src={entry.coverImage.large} className="result-cover" />
        <span className="result-title">
          <div />
          <p>{entry.title.userPreferred}</p>
          <div />
        </span>
      </div>
    </a>
  );
}
