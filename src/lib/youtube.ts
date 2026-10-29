/*
 * YouTube links pasted by the admin. Only the 11-character video id (and an
 * optional start time) is stored; the site always embeds through the
 * privacy-enhanced youtube-nocookie.com domain, and only after a click.
 */

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
]);

export type YouTubeVideo = { id: string; start: number | null };

export function isYouTubeId(value: string): boolean {
  return VIDEO_ID.test(value);
}

/** "90", "1m30s", "1h2m3s" -> seconds. */
function parseStart(value: string | null): number | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value) || null;
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!match || !match[0]) return null;
  const [, h = "0", m = "0", s = "0"] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s) || null;
}

/**
 * Accepts watch, short (youtu.be), embed, shorts and live URLs, with or
 * without a scheme, or a bare video id. Returns null for anything else.
 */
export function parseYouTubeUrl(input: string): YouTubeVideo | null {
  const value = input.trim();
  if (!value || value.length > 300) return null;
  if (isYouTubeId(value)) return { id: value, start: null };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!HOSTS.has(url.hostname.toLowerCase())) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  if (url.hostname.toLowerCase() === "youtu.be") id = segments[0];
  else if (segments[0] === "watch") id = url.searchParams.get("v") ?? undefined;
  else if (segments[0] && ["embed", "shorts", "live", "v"].includes(segments[0])) id = segments[1];

  if (!id || !isYouTubeId(id)) return null;
  return { id, start: parseStart(url.searchParams.get("t") ?? url.searchParams.get("start")) };
}

export function youtubeEmbedUrl(video: YouTubeVideo, { autoplay = true }: { autoplay?: boolean } = {}): string {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (autoplay) params.set("autoplay", "1");
  if (video.start) params.set("start", String(video.start));
  return `https://www.youtube-nocookie.com/embed/${video.id}?${params}`;
}

/** Standard 480x360 still YouTube generates for every video. */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeWatchUrl(video: YouTubeVideo): string {
  return `https://www.youtube.com/watch?v=${video.id}${video.start ? `&t=${video.start}s` : ""}`;
}
