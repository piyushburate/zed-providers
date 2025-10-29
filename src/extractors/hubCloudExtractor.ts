import * as cheerio from "cheerio";
import { Server, Source } from "@/lib/types";
import { headers } from "@/lib/headers";
import axios from "axios";

const decode = function (value: string) {
  if (value === undefined) {
    return "";
  }
  return atob(value.toString());
};

export async function hubcloudExtracter(
  link: string,
  signal: AbortSignal
): Promise<Source> {
  try {
    console.log("hubcloudExtracter", link);
    const baseUrl = link.split("/").slice(0, 3).join("/");
    const host = new URL(link).host;
    const servers: Server[] = [];
    const vLinkRes = await axios.get(link, {
      headers: {
        ...headers,
        Host: host,
      },
      withCredentials: true,
    });

    const vLinkText = vLinkRes.data;
    // console.log("vLinkText", vLinkText);
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
        servers.push({ name: "cfWorker", link });
      } else if (link?.includes("pixeld")) {
        servers.push({
          name: "pixeldrain",
          link,
        });
      } else if (link?.includes("cloudflarestorage")) {
        servers.push({
          name: "cfstorage",
          link,
        });
      } else if (link?.includes("fastdl") || link?.includes("fastcloud")) {
        servers.push({ name: "fastdl", link });
      } else if (link?.includes("hubcloud") || link?.includes("hubcdn")) {
        try {
          const newLinkRes = await fetch(link, { headers, signal });
          const newLink =
            cheerio
              .load(await newLinkRes.text())(
                'a:contains("Download"),a#vd,a:has(#downloadbtn)'
              )
              .attr("href") || link;
          servers.push({
            name: "hubcloud",
            link: newLink,
          });
        } catch (error) {
          console.log("hubcloudExtracter error in hubcloud link: ", error);
        }
      } else {
        servers.push({ name: "unknown", link });
      }
    }
    console.log("servers", servers);
    return {
      title: "HubCloud",
      size: size || undefined,
      servers,
    };
  } catch (error) {
    console.log("hubcloudExtracter error: ", error);
    return {
      title: "HubCloud",
      servers: [],
    };
  }
}
