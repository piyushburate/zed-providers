import axios from "axios";
import * as cheerio from "cheerio";
import { Stream } from "@/lib/types";
import { headers } from "@/lib/headers";

const decode = function (value: string) {
  if (value === undefined) {
    return "";
  }
  return atob(value.toString());
};

export async function hubcloudExtracter(link: string, signal: AbortSignal) {
  try {
    console.log("hubcloudExtracter", link);
    const baseUrl = link.split("/").slice(0, 3).join("/");
    const streamLinks: Stream[] = [];
    const vLinkRes = await axios(link, {
      headers: { 
      referer: baseUrl,
      ...headers 
      },
      signal,
    });

    const vLinkText = vLinkRes.data;
    console.log("vLinkText", vLinkText);
    const $vLink = cheerio.load(vLinkText);
    const vLinkRedirect = vLinkText.match(/var\s+url\s*=\s*'([^']+)';/) || [];
    let vcloudLink =
      decode(vLinkRedirect[1]?.split("r=")?.[1]) ||
      vLinkRedirect[1] ||
      $vLink(".fa-file-download.fa-lg").parent().attr("href") ||
      link;
    console.log("vcloudLink", vcloudLink);
    if (vcloudLink?.startsWith("/")) {
      vcloudLink = `${baseUrl}${vcloudLink}`;
      console.log("New vcloudLink", vcloudLink);
    }
    const vcloudRes = await fetch(vcloudLink, {
      headers,
      signal,
      redirect: "follow",
    });
    const $ = cheerio.load(await vcloudRes.text());
    // console.log('vcloudRes', $.text());

    const size = $(".main #size, #size").text().trim();
    const linkClass = $("a.btn-success.btn-lg.h6,a.btn-danger,a.btn-secondary");
    for (const element of linkClass) {
      const itm = $(element);
      const link = itm.attr("href") || "";
      if (link?.includes("workers.dev")) {
        streamLinks.push({ server: "cfWorker", type: "mkv", link, size });
      } else if (link?.includes("pixeld")) {
        streamLinks.push({
          server: "pixeldrain",
          type: "mkv",
          link,
          size,
        });
      } else if (link?.includes("cloudflarestorage")) {
        streamLinks.push({
          server: "cfstorage",
          type: "mkv",
          link,
          size,
        });
      } else if (link?.includes("fastdl") || link?.includes("fastcloud")) {
        streamLinks.push({ server: "fastdl", type: "mkv", link, size });
      } else if (link?.includes("hubcloud") || link?.includes("hubcdn")) {
        try {
          const newLinkRes = await fetch(link, { headers, signal });
          const newLink =
            cheerio
              .load(await newLinkRes.text())(
                'a:contains("Download"),a#vd,a:has(#downloadbtn)'
              )
              .attr("href") || link;
          streamLinks.push({
            server: "hubcloud",
            type: "mkv",
            link: newLink,
            size,
          });
        } catch (error) {
          console.log("hubcloudExtracter error in hubcloud link: ", error);
        }
      } else {
        streamLinks.push({ server: "unknown", type: "mkv", link, size });
      }
    }
    console.log("streamLinks", streamLinks);
    return streamLinks;
  } catch (error) {
    console.log("hubcloudExtracter error: ", error);
    return [];
  }
}
