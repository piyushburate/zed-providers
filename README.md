# Zed Providers

A Next.js-based API service that aggregates and scrapes content from multiple movie/series streaming providers. It provides a unified API interface for fetching catalogs, metadata, episodes, and streaming sources from various providers.

## Table of Contents

- [API Documentation](#api-documentation)
  - [GET /api/get-providers](#1-get-apiget-providers)
  - [GET /api/get-catalog](#2-get-apiget-catalog)
  - [GET /api/get-posts](#3-get-apiget-posts)
  - [GET /api/search](#4-get-apisearch)
  - [GET /api/get-meta](#5-get-apiget-meta)
  - [GET /api/get-episodes](#6-get-apiget-episodes)
  - [GET /api/get-stream](#7-get-apiget-stream)
- [Scraper Architecture](#scraper-architecture)
- [Type System](#type-system)
- [Supported Providers](#supported-providers)

---

## API Documentation

### 1. GET `/api/get-providers`

Returns a list of all available content providers.

**Query Parameters:** None

**Response:**
```json
{
  "data": [
    {
      "name": "vegamovies",
      "title": "Vegamovies",
      "url": "https://vegamovies.menu",
      "icon": "/icons/vegamovies.png",
      "description": "A popular website offering...",
      "scrapper": {
        "default": "vegamovies"
      }
    }
  ]
}
```

**Error Responses:**
- `500`: Failed to fetch providers

---

### 2. GET `/api/get-catalog`

Fetches catalog information including featured content, home sections, and genre filters for a specific provider.

**Query Parameters:**
- `provider` (required): Provider name (e.g., "vegamovies", "rogmovies")

**Response:**
```json
{
  "data": {
    "featured": {
      "title": "Featured",
      "filter": "featured"
    },
    "home": [
      {
        "title": "New",
        "filter": ""
      },
      {
        "title": "Netflix",
        "filter": "web-series/netflix"
      }
    ],
    "genres": [
      {
        "title": "Action",
        "filter": "category/movies-by-genres/action"
      }
    ]
  }
}
```

**Error Responses:**
- `400`: Invalid Provider
- `500`: Failed to fetch catalog

---

### 3. GET `/api/get-posts`

Retrieves paginated posts/content items from a provider based on filters.

**Query Parameters:**
- `provider` (required): Provider name
- `filter` (optional): Content filter/category path
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "data": [
    {
      "title": "Movie Title (2024)",
      "link": "https://provider.com/movie-link",
      "image": "https://provider.com/image.jpg"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid Provider
- `500`: Failed to fetch posts

---

### 4. GET `/api/search`

Searches for content across a provider.

**Query Parameters:**
- `provider` (required): Provider name
- `query` (required): Search query string
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "data": [
    {
      "title": "Movie Title (2024)",
      "link": "https://provider.com/movie-link",
      "image": "https://provider.com/image.jpg"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid Provider or Query is required
- `500`: Failed to fetch posts

---

### 5. GET `/api/get-meta`

Fetches detailed metadata for a specific movie/series.

**Query Parameters:**
- `provider` (required): Provider name
- `link` (required): Content URL

**Response:**
```json
{
  "data": {
    "title": "Movie Title",
    "synopsis": "Movie description...",
    "image": ["screenshot1.jpg", "screenshot2.jpg"],
    "imdbId": "tt1234567",
    "type": "movie",
    "linkList": [
      {
        "title": "1080p {Hindi} 2.5GB",
        "label": "Full Movie",
        "size": "2.5GB",
        "quality": "1080p",
        "language": "Hindi",
        "directLink": "https://...",
        "episodesLink": "https://...",
        "batchLink": "https://..."
      }
    ]
  }
}
```

**Error Responses:**
- `400`: Invalid Provider or Link is required
- `500`: Failed to fetch meta

---

### 6. GET `/api/get-episodes`

Retrieves episode links for a series.

**Query Parameters:**
- `provider` (required): Provider name
- `link` (required): Series/season URL

**Response:**
```json
{
  "data": [
    {
      "title": "S01E01",
      "link": "https://provider.com/episode-link"
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid Provider or Link is required
- `500`: Failed to fetch episodes

---

### 7. GET `/api/get-stream`

Extracts streaming sources/download links from a content URL.

**Query Parameters:**
- `provider` (required): Provider name
- `link` (required): Stream/download URL
- `type` (required): Link type ("direct", "batch", or "episodes")

**Response:**
```json
{
  "data": [
    {
      "title": "HubCloud",
      "size": "2.5GB",
      "servers": [
        {
          "name": "cfWorker",
          "link": "https://worker.cloudflare.com/..."
        },
        {
          "name": "pixeldrain",
          "link": "https://pixeldrain.com/..."
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid Provider, Link is required, or Type is required
- `500`: Failed to fetch stream

---

## Scraper Architecture

### Architecture Overview

The scraper system uses a modular architecture where each provider has its own scraper implementation. The system supports multiple scraper modules per provider:

1. **`catalog.ts`** - Static catalog definitions
2. **`posts.ts`** - Content listing and search
3. **`meta.ts`** - Detailed content information
4. **`episodes.ts`** - Episode link extraction
5. **`stream.ts`** - Stream source extraction

### Provider Configuration

Providers are defined in `src/data/providers.ts` with scraper mappings:

```typescript
{
  name: "vegamovies",
  scrapper: {
    default: "vegamovies",        // Fallback scraper
    catalog: "vegamovies",         // Optional: specific module
    posts: "vegamovies",
    meta: "vegamovies",
    episodes: "vegamovies",
    stream: "vegamovies"
  }
}
```

### Scraper Modules

#### 1. Catalog Module (`catalog.ts`)

**Purpose:** Defines static catalog structure (featured, home sections, genres)

**Exports:**
- `featured`: Featured section configuration
- `home`: Array of home sections
- `genres`: Array of genre filters

**Implementation Pattern:**
```typescript
export const featured: Catalog = {
  title: "Featured",
  filter: "featured"
};

export const home: Catalog[] = [
  { title: "New", filter: "" },
  { title: "Netflix", filter: "web-series/netflix" }
];

export const genres: Catalog[] = [
  { title: "Action", filter: "category/movies-by-genres/action" }
];
```

---

#### 2. Posts Module (`posts.ts`)

**Purpose:** Scrapes content listings and search results

**Functions:**
- `getPosts(params)`: Fetch paginated content by filter
- `getSearchPosts(params)`: Search content by query

**Scraping Strategy:**
1. Constructs URL based on filter/query and page
2. Fetches HTML with custom headers
3. Uses Cheerio to parse article elements
4. Extracts title, link, and image from each post
5. Handles lazy-loaded images

**Key Features:**
- AbortSignal support for request cancellation
- Flexible title parsing with regex
- Image URL normalization

---

#### 3. Meta Module (`meta.ts`)

**Purpose:** Extracts detailed metadata from content pages

**Function:**
- `getMeta(params)`: Fetch comprehensive content information

**Extraction Process:**
1. Fetches content page HTML
2. Parses metadata:
   - Title (via regex patterns)
   - Synopsis from description paragraphs
   - Screenshots/images
   - IMDb ID extraction
   - Content type detection (movie/series)
3. Extracts download links with:
   - Quality (1080p, 720p, etc.)
   - Size (GB/MB)
   - Language information
   - Multiple link types (direct, episodes, batch)

**Regex Patterns Used:**
- Title: `/Name: (.+)/`
- Size: `/[\[\(\{]?\s*(\d+(?:\.\d+)?\s*(?:MB|GB|TB))\s*[\]\)\}]?/i`
- Quality: `/(\d{3,4}p)/`
- IMDb ID: `/tt\d+/`

---

#### 4. Episodes Module (`episodes.ts`)

**Purpose:** Extracts episode download links from series pages

**Function:**
- `getEpisodes(params)`: Parse episode links from series page

**Scraping Strategy:**
1. Fetches series page with authentication cookies
2. Removes unwanted elements (`.unili-content`, `.code-block-1`)
3. Iterates through `h4` headers to find episodes
4. Extracts episode title and specific styled download buttons
5. Returns array of episode objects

**Cookie Management:** Uses hardcoded cookies for Cloudflare bypass

---

#### 5. Stream Module (`stream.ts`)

**Purpose:** Extracts actual streaming/download URLs from link pages

**Function:**
- `getStream(params)`: Extract direct download links

**Extraction Flow:**
1. **Type Handling:**
   - `direct`/`batch`: Extracts intermediate cloud link
   - `episodes`: Direct processing
2. **Link Extraction:**
   - Fetches dotlink/redirect page
   - Extracts cloud storage URL via regex
3. **Extractor Integration:**
   - Calls `hubcloudExtracter` for final URLs
4. **Server Detection:**
   - Identifies various CDN providers (CloudFlare Workers, Pixeldrain, FastDL, HubCloud)

---

### Extractors

#### HubCloud Extractor (`src/extractors/hubCloudExtractor.ts`)

**Purpose:** Universal extractor for HubCloud-based hosting services

**Process:**
1. Resolves redirect chains
2. Extracts file size information
3. Identifies multiple mirror servers:
   - CloudFlare Workers (`workers.dev`)
   - Pixeldrain (`pixeld`)
   - CloudFlare Storage (`cloudflarestorage`)
   - FastDL (`fastdl`, `fastcloud`)
   - HubCloud/HubCDN (`hubcloud`, `hubcdn`)
4. Handles nested redirects for hub servers
5. Returns structured source object with all available mirrors

**Server Detection Logic:**
```typescript
if (link.includes("workers.dev")) → cfWorker
if (link.includes("pixeld")) → pixeldrain
if (link.includes("cloudflarestorage")) → cfstorage
if (link.includes("fastdl")) → fastdl
if (link.includes("hubcloud")) → hubcloud (with nested extraction)
else → unknown
```

---

### Common Patterns Across Scrapers

1. **Headers Management:** Custom headers for bypassing anti-bot protection
2. **Cheerio Parsing:** HTML parsing and element selection
3. **Error Handling:** Try-catch blocks with console logging
4. **AbortSignal Support:** Request cancellation for long operations
5. **URL Normalization:** Protocol and base URL handling
6. **Regex Extraction:** Pattern matching for metadata

### Data Flow

```
API Request → getProvider() → Dynamic Import Scraper
                ↓
        Provider-specific Scraper Module
                ↓
        HTTP Request with Headers
                ↓
        Cheerio HTML Parsing
                ↓
        Data Extraction & Transformation
                ↓
        (Optional) Extractor Processing
                ↓
        Structured JSON Response
```

---

## Type System

The project uses TypeScript interfaces for type safety across all modules (`src/lib/types.ts`).

### Key Types

#### Catalog
```typescript
interface Catalog {
  title: string;
  filter: string;
}
```

#### Provider
```typescript
interface Provider {
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
```

#### Post
```typescript
interface Post {
  title: string;
  link: string;
  image: string;
  provider?: string;
}
```

#### Info (Metadata)
```typescript
interface Info {
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
```

#### Link
```typescript
interface Link {
  title: string;
  label?: string;
  size?: string;
  quality?: string;
  language?: string;
  directLink?: string;
  episodesLink?: string;
  batchLink?: string;
}
```

#### Source & Server
```typescript
interface Source {
  title: string;
  size?: string;
  servers: Server[];
}

interface Server {
  name: string;
  link: string;
}
```

#### Episode Link
```typescript
interface EpisodeLink {
  title: string;
  link: string;
}
```

---

## Supported Providers

| Provider | Status | Scraper Modules |
|----------|--------|-----------------|
| **Vegamovies** | ✅ Full Support | catalog, posts, meta, episodes, stream |
| **Rogmovies** | ✅ Partial Support | Custom catalog, shared vegamovies scrapers |

---

## Project Structure

```
src/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── get-catalog/
│   │   ├── get-episodes/
│   │   ├── get-meta/
│   │   ├── get-posts/
│   │   ├── get-providers/
│   │   ├── get-stream/
│   │   └── search/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── data/
│   └── providers.ts           # Provider configurations
├── extractors/
│   └── hubCloudExtractor.ts   # Stream link extractors
├── lib/
│   ├── getProvider.ts         # Provider lookup utility
│   ├── headers.ts             # HTTP headers config
│   └── types.ts               # TypeScript type definitions
└── scrappers/
    ├── rogmovies/
    │   └── catalog.ts
    └── vegamovies/
        ├── catalog.ts
        ├── episodes.ts
        ├── meta.ts
        ├── posts.ts
        └── stream.ts
```

---

## Technologies Used

- **Next.js** - React framework for API routes
- **TypeScript** - Type-safe development
- **Cheerio** - HTML parsing and scraping
- **Axios** - HTTP client for web scraping

---

## License

This project is for educational purposes only.

---

## Contributing

To add a new provider:

1. Create a new folder in `src/scrappers/[provider-name]/`
2. Implement required scraper modules (catalog, posts, meta, episodes, stream)
3. Add provider configuration to `src/data/providers.ts`
4. Follow the existing type interfaces from `src/lib/types.ts`

---

**Note:** This project is designed for educational and research purposes. Please respect copyright laws and terms of service of the scraped websites.
