import { hubcloudExtracter } from "@/extractors/hubCloudExtractor";
import { headers } from "@/lib/headers";

// const headers = {
//   Accept:
//     "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//   "Cache-Control": "no-store",
//   "Accept-Language": "en-US,en;q=0.9",
//   DNT: "1",
//   "sec-ch-ua":
//     '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
//   "sec-ch-ua-mobile": "?0",
//   "sec-ch-ua-platform": '"Windows"',
//   "Sec-Fetch-Dest": "document",
//   "Sec-Fetch-Mode": "navigate",
//   "Sec-Fetch-Site": "none",
//   "Sec-Fetch-User": "?1",
//   Cookie:
//     "xla=s4t; _ga=GA1.1.1081149560.1756378968; _ga_BLZGKYN5PF=GS2.1.s1756378968$o1$g1$t1756378984$j44$l0$h0",
//   "Upgrade-Insecure-Requests": "1",
//   "User-Agent":
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
// };

export async function getStream({
  link,
  type,
  signal,
}: {
  link: string;
  type: string;
  signal: AbortSignal;
}) {
  try {
    // const streamLinks: Stream[] = [];
    console.log("dotlink", link);
    if (type == "direct" || type == "batch") {
      // vlink
      const dotlinkRes = await fetch(`${link}`, {
        headers: {
          ...headers,
          cookie:
            "ext_name=ojplmecpdpgccookcobabopnaifgidhf; cf_clearance=Zl2yiOCN3pzGUd0Bgs.VyBXniJooDbG2Tk1g7DEoRnw-1756381111-1.2.1.1-RVPZoWGCAygGNAHavrVR0YaqASWZlJyYff8A.oQfPB5qbcPrAVud42BzsSwcDgiKAP0gw5D92V3o8XWwLwDRNhyg3DuL1P8wh2K4BCVKxWvcy.iCCxczKtJ8QSUAsAQqsIzRWXk29N6X.kjxuOTYlfB2jrlq12TRDld_zTbsskNcTxaA.XQekUcpGLseYqELuvlNOQU568NZD6LiLn3ICyFThMFAx6mIcgXkxVAvnxU; xla=s4t",
        },
      });
      const dotlinkText = await dotlinkRes.text();
      // console.log('dotlinkText', dotlinkText);
      const vlink = dotlinkText.match(/<a\s+href="([^"]*cloud\.[^"]*)"/i) || [];
      // console.log('vLink', vlink[1]);
      link = vlink[1];
    }

    return await hubcloudExtracter(link, signal);
  } catch (error: unknown) {
    console.log("getStream error: ", error);
    return [];
  }
}
