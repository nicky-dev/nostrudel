import { AspectRatio, list } from "@chakra-ui/react";
import appSettings from "../../services/settings/app-settings";
import { renderOpenGraphUrl } from "./common";
import { replaceDomain } from "../../helpers/url";

// copied from https://github.com/SimonBrazell/privacy-redirect/blob/master/src/assets/javascripts/helpers/youtube.js
export const YOUTUBE_DOMAINS = [
  "m.youtube.com",
  "youtube.com",
  "img.youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "s.ytimg.com",
  "music.youtube.com",
];

// nostr:nevent1qqszwj6mk665ga4r25w5vzxmy9rsvqj42kk4gnkq2t2utljr6as948qpp4mhxue69uhkummn9ekx7mqprdmhxue69uhkvet9v3ejumn0wd68ytnzv9hxgtmdv4kk245xvyn
export function renderYoutubeUrl(match: URL) {
  if (!YOUTUBE_DOMAINS.includes(match.hostname)) return null;
  if (match.pathname.startsWith("/live")) return null;

  const { youtubeRedirect } = appSettings.value;

  // render opengraph card for performance
  // return renderOpenGraphUrl(youtubeRedirect ? replaceDomain(match, youtubeRedirect) : match);

  if (match.pathname.startsWith("/playlist")) {
    const listId = match.searchParams.get("list");
    if (!listId) throw new Error("missing list id");

    const embedUrl = new URL(`embed/videoseries`, youtubeRedirect || "https://www.youtube-nocookie.com");
    embedUrl.searchParams.set("list", listId);

    return (
      <AspectRatio ratio={560 / 315} maxWidth="40rem">
        <iframe
          src={embedUrl.toString()}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          width="100%"
        ></iframe>
      </AspectRatio>
    );
  } else {
    var videoId = match.searchParams.get("v");
    if (match.hostname === "youtu.be") videoId = match.pathname.split("/")[1];
    if (!videoId) throw new Error("cant find video id");
    const embedUrl = new URL(`/embed/${videoId}`, youtubeRedirect || "https://www.youtube-nocookie.com");

    return (
      <AspectRatio ratio={16 / 10} maxWidth="40rem">
        <iframe
          src={embedUrl.toString()}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          width="100%"
        ></iframe>
      </AspectRatio>
    );
  }
}
