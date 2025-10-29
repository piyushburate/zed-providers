// getPosts
export interface Post {
  title: string;
  link: string;
  image: string;
  provider?: string;
}

export type TextTracks = {
  title: string;
  language: string;
  type: "application/x-subrip" | "application/ttml+xml" | "text/vtt";
  uri: string;
}[];

// getStream
export interface Stream {
  server: string;
  link: string;
  type: string;
  quality?: "360" | "480" | "720" | "1080" | "2160";
  size?: string;
  subtitles?: TextTracks;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  headers?: any;
}

// getInfo
export interface Info {
  title: string;
  image: string[];
  synopsis: string;
  imdbId: string;
  type: string;
  tags?: string[];
  cast?: string[];
  rating?: string;
  linkList: Link[];
}
// getEpisodeLinks
export interface EpisodeLink {
  title: string;
  link: string;
}

export interface Link {
  title: string;
  label?: string;
  size?: string;
  quality?: string;
  language?: string;
  directLink?: string;
  episodesLink?: string;
  batchLink?: string;
}

// catalog
export interface Catalog {
  title: string;
  filter: string;
}
