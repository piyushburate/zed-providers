// Catalog
export interface Catalog {
  title: string;
  filter: string;
}
// GetPosts
export interface GetPostsParams {
  filter: string;
  page: number;
  provider: Provider;
  signal: AbortSignal;
}
// GetSearchPosts
export interface GetSearchPostsParams {
  query: string;
  page: number;
  provider: Provider;
  signal: AbortSignal;
}
// GetEpisodesParams
export interface GetEpisodesParams {
  link: string;
}
// GetMetaParams
export interface GetMetaParams {
  link: string;
}
// GetStreamParams
export interface GetStreamParams {
  link: string;
  type: string;
  signal: AbortSignal;
}

// Provider
export interface Provider {
  name: string;
  title: string;
  url: string;
  icon: string;
  description: string;
  scrapper: {
    default: string;
    catalog?: string;
    posts?: string;
    meta?: string;
    episodes?: string;
    stream?: string;
  };
}

// getPosts
export interface Post {
  title: string;
  link: string;
  image: string;
  provider?: string;
}

// getStream
export interface Server {
  name: string;
  link: string;
}

export interface Source {
  title: string;
  size?: string;
  servers: Server[];
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
