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
