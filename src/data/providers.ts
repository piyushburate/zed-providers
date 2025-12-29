import { Provider } from "@/lib/types";

export const providers: Provider[] = [
  {
    name: "vegamovies",
    title: "Vegamovies",
    url: "https://m.vegamovies.cricket",
    icon: "/icons/vegamovies.png",
    description:
      "A popular website offering a wide range of Hollywood, Bollywood and regional movies for free streaming and download.",
    scrapper: {
      default: "vegamovies",
    },
  },
  {
    name: "rogmovies",
    title: "Rogmovies",
    url: "https://rogmovies.world",
    icon: "/icons/rogmovies.png",
    description:
    "A popular website offering a wide range of Hollywood, Bollywood and regional movies for free streaming and download.",
    scrapper: {
      default: "vegamovies",
      catalog: "rogmovies",
    },
  },
];
