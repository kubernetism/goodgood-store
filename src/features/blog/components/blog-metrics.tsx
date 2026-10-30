"use client";

import { useEffect, useState } from "react";
import { Clock3, Eye } from "lucide-react";
import { formatReadingTime, type BlogMetrics } from "../metrics";

export function BlogMetricsDisplay({ slug }: { slug: string }) {
  const [metrics, setMetrics] = useState<BlogMetrics | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let active = true;
    const read = () => { fetch(`/api/blog/metrics?slug=${encodeURIComponent(slug)}`, { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then((data: BlogMetrics) => { if (active) { setMetrics(data); setUnavailable(false); } }).catch(() => { if (active) setUnavailable(true); }); };
    read();
    window.addEventListener("blog-metrics-update", read);
    return () => { active = false; window.removeEventListener("blog-metrics-update", read); };
  }, [slug]);
  return <>
    <li className="flex items-center gap-2"><Eye className="size-4 text-primary-ink" aria-hidden="true" />{metrics ? `${metrics.views} ${metrics.views === 1 ? "view" : "views"}` : unavailable ? "Views unavailable" : "Loading views…"}</li>
    <li className="flex items-center gap-2"><Clock3 className="size-4 text-primary-ink" aria-hidden="true" />{metrics ? `${formatReadingTime(metrics.averageSeconds)} avg. active time` : unavailable ? "Reading time unavailable" : "Loading reading time…"}</li>
  </>;
}
