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
  trailer: {
    site: string;
    id: string;
  };
  siteUrl: string;
  isAdult: boolean;
  description: string;
  externalLinks: {
    language: string;
    isDisabled: boolean;
    site: string;
    type: string;
    url: string;
    siteId: number;
    color: string;
    icon: string;
  }[];
  rankings: {
    rank: number;
    context: string;
    type: string;
  }[];
}

export interface AnimeListEntry {
  media: AnimeEntry;
  progress: number;
  score: number;
}

export interface AnimeList {
  name: string;
  status: string;
  entries: AnimeListEntry[];
}
