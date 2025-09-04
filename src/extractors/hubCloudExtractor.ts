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
    const vLinkRes = await fetch(link, {
      headers: {
        ...headers,
        cookie:
          "ext_name=ojplmecpdpgccookcobabopnaifgidhf; cf_clearance=Zl2yiOCN3pzGUd0Bgs.VyBXniJooDbG2Tk1g7DEoRnw-1756381111-1.2.1.1-RVPZoWGCAygGNAHavrVR0YaqASWZlJyYff8A.oQfPB5qbcPrAVud42BzsSwcDgiKAP0gw5D92V3o8XWwLwDRNhyg3DuL1P8wh2K4BCVKxWvcy.iCCxczKtJ8QSUAsAQqsIzRWXk29N6X.kjxuOTYlfB2jrlq12TRDld_zTbsskNcTxaA.XQekUcpGLseYqELuvlNOQU568NZD6LiLn3ICyFThMFAx6mIcgXkxVAvnxU; xla=s4t",
      },
      signal,
    });

    const vLinkText = await vLinkRes.text();
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
