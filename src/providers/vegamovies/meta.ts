import { Info, Link } from "@/lib/types";
import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Cache-Control": "no-store",
  "Accept-Language": "en-US,en;q=0.9",
  DNT: "1",
  "sec-ch-ua":
    '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  Cookie:
    "xla=s4t; _ga=GA1.1.1081149560.1756378968; _ga_BLZGKYN5PF=GS2.1.s1756378968$o1$g1$t1756378984$j44$l0$h0",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
};

export const getMeta = async ({ link }: { link: string }): Promise<Info> => {
  try {
    const url = link;
    // console.log("url", url);
    const baseUrl = url.split("/").slice(0, 3).join("/");
    const response = await axios.get(url, {
      headers: {
        ...headers,
        Referer: baseUrl,
      },
    });
    const $ = cheerio.load(response.data);
    const infoContainer = $(".entry-content,.post-inner");
    const heading = infoContainer?.find("h3");
    const imdbId =
      heading?.next("p")?.find("a")?.[0]?.attribs?.href?.match(/tt\d+/g)?.[0] ||
      infoContainer.text().match(/tt\d+/g)?.[0] ||
      "";
    // console.log(imdbId)

    const type = heading?.next("p")?.text()?.includes("Series Name")
      ? "series"
      : "movie";
    //   console.log(type);
    // title
    const titleRegex = /Name: (.+)/;
    const title = heading?.next("p")?.text()?.match(titleRegex)?.[1] || "";
    //   console.log(title);

    // synopsis
    const synopsisNode = infoContainer?.find("p")?.next("h3,h4")?.next("p")?.[0]
      ?.children?.[0];
    const synopsis =
      synopsisNode && "data" in synopsisNode ? synopsisNode.data : "";
    //   console.log(synopsis);

    // image
    const image = infoContainer
      ?.find('*:contains("Screenshots")')
      .next()
      .children("img")
      .toArray()
      .map((img) => img.attribs.src);
    // console.log(image);

    // console.log({ title, synopsis, image, imdbId, type });
    const list = infoContainer?.find(
      "p:has(a[href*=nexdrive]),p:has(a .btn-outline)"
    );

    const links: Link[] = [];
    list.each((_, element) => {
      const sizeRegex =
        /[\[\(\{]?\s*(\d+(?:\.\d+)?\s*(?:MB|GB|TB))\s*[\]\)\}]?/i;
      const qualityRegex = /(\d{3,4}p)/;

      const title = $(element).prev().text().trim();
      const quality = title.match(qualityRegex)?.[1];
      const size = title.match(sizeRegex)?.[1];
      const label = title
        .match(
          /^(.*?)\s*(?:\{.*?\}|\[.*?\]|\(.*?\))?\s*\d{3,4}p.*?(?:\{.*?\}|\[.*?\]|\(.*?\))?/
        )?.[1]
        .trim();
      const language =
        title.match(/\{(.*?)\}/)?.[1] ||
        title.match(/\[(.*?)\]/)?.[1] ||
        title.match(/\((.*?)\)/)?.[1];

      const directLinkElements = $(element)
        .find('a:not(:contains("Resumable"),:contains("Batch"))')
        .toArray();
      const directLinks = [];
      for (const el of directLinkElements) {
        const directLink = el.attribs.href;
        const directLinkTitle = $(el).text().trim();
        if (directLink && directLinkTitle) {
          directLinks.push({
            title: directLinkTitle,
            link: directLink,
            size: directLinkTitle.match(sizeRegex)?.[1],
            quality: directLinkTitle.match(qualityRegex)?.[1],
          });
        }
      }
      const episodesLink = $(element)
        .find('a:contains("Resumable")')
        .attr("href");

      const batchElement = $(element).find('a:contains("Batch")');

      const batchLink = batchElement.attr("href");
      const batchSize = batchElement.text().match(sizeRegex)?.[1];

      links.push({
        title,
        label,
        size,
        quality,
        language,
        directLinks,
        episodesLink,
        batch: batchLink
          ? {
              link: batchLink,
              size: batchSize,
            }
          : undefined,
      });
    });
    // console.log(links);
    return {
      title,
      synopsis,
      image,
      imdbId,
      type,
      linkList: links,
    };
  } catch (error) {
    console.log("getInfo error");
    console.error(error);
    return {
      title: "",
      synopsis: "",
      image: [],
      imdbId: "",
      type: "",
      linkList: [],
    };
  }
};
