"use client";

import { useEffect } from "react";
import { activeElapsedMs } from "../tracking-math";

const MAX_SECONDS = 1800;
const IDLE_MS = 60_000;
const SESSION_MS = 30 * 60_000;
const STORAGE_PREFIX = "abdulsami.blog-visit.";
type Visit = { id: string; startedAt: number; seconds: number };

/** Counts an anonymous visit after two seconds in view and measures active, visible time. */
export function BlogVisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (navigator.webdriver || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    const article = document.getElementById("blog-article");
    if (!article || !window.crypto?.randomUUID || !("IntersectionObserver" in window)) return;
    const key = `${STORAGE_PREFIX}${slug}`;
    let visit: Visit | null = null;
    try {
      const raw = sessionStorage.getItem(key);
      const saved = raw ? JSON.parse(raw) as Visit : null;
      if (saved && typeof saved.id === "string" && typeof saved.startedAt === "number" && typeof saved.seconds === "number" && Date.now() - saved.startedAt < SESSION_MS && saved.seconds >= 0 && saved.seconds <= MAX_SECONDS) visit = saved;
    } catch { /* Storage is optional; use an in-memory visit. */ }
    let inView = false;
    let lastTick = performance.now();
    let lastActivity = lastTick;
    let qualifiedMs = 0;
    let totalMs = (visit?.seconds ?? 0) * 1000;
    let lastSent = lastTick;

    function save() {
      if (!visit) return;
      visit.seconds = Math.min(MAX_SECONDS, Math.floor(totalMs / 1000));
      try { sessionStorage.setItem(key, JSON.stringify(visit)); } catch { /* Continue without persistent storage. */ }
    }
    function send(final = false) {
      if (!visit) return;
      save();
      const payload = JSON.stringify({ slug, visitId: visit.id, seconds: visit.seconds });
      const sent = final && navigator.sendBeacon?.("/api/blog/metrics", new Blob([payload], { type: "application/json" }));
      if (!sent) {
        void fetch("/api/blog/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true })
          .then((response) => { if (response.ok) window.dispatchEvent(new Event("blog-metrics-update")); }).catch(() => {});
      }
      lastSent = performance.now();
    }
    function tick() {
      const now = performance.now();
      const elapsed = activeElapsedMs(lastTick, now, lastActivity, document.visibilityState === "visible", inView, IDLE_MS);
      lastTick = now;
      if (!visit) {
        qualifiedMs += elapsed;
        if (qualifiedMs >= 2000) {
          visit = { id: crypto.randomUUID(), startedAt: Date.now(), seconds: 0 };
          totalMs = 0;
          send();
        }
      } else {
        totalMs = Math.min(MAX_SECONDS * 1000, totalMs + elapsed);
        if (elapsed > 0 && now - lastSent >= 15_000) send();
      }
    }
    const observer = new IntersectionObserver(([entry]) => { tick(); if (inView && !entry.isIntersecting) send(); inView = entry.isIntersecting; });
    observer.observe(article);
    const activity = () => { tick(); lastActivity = performance.now(); };
    const visibility = () => { tick(); if (document.visibilityState === "hidden") send(true); };
    const finish = () => { tick(); send(true); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, activity, { passive: true }));
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", finish);
    const timer = window.setInterval(tick, 1000);
    return () => {
      finish();
      window.clearInterval(timer);
      observer.disconnect();
      events.forEach((event) => window.removeEventListener(event, activity));
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", finish);
    };
  }, [slug]);
  return null;
}
