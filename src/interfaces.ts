

export interface AnimeTag {
  name: string;
  rank: number;
  id: number;
  category: string;
  isAdult: boolean;
}

export interface AnimeEntry {
  episodes: number;
  genres: string[];
  id: number;
  meanScore: number;
  seasonYear: number;
  tags: AnimeTag[];
  title: {
    english: string;
    native: string;
    romaji: string;
    userPreferred: string;
  };
  type: string;
  coverImage: {
    large: string;
  };
  siteUrl: string;
}

export interface AnimeListEntry {
  media: AnimeEntry;
  progress: number;
  score: number;
}