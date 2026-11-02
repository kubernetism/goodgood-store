"use client";

import Image from "next/image";
import { useState } from "react";
import type { BannerPlacement } from "@/features/banners/model";
import { parseYouTubeUrl, youtubeThumbnailUrl, youtubeWatchUrl } from "@/lib/youtube";
import { Field } from "./ui";

type PlacementOption = { value: BannerPlacement; label: string; hint: string };

/**
 * Placement, display order and (for the video pop-up only) the YouTube link.
 * The link field is rendered, and required, only while "Video pop-up" is
 * chosen, so the browser stops a pop-up without a video before the form is
 * sent. The server schema enforces the same rule.
 */
export function BannerPlacementFields({ placements, defaultPlacement, defaultSortOrder, defaultYoutubeId }: {
  placements: ReadonlyArray<PlacementOption>;
  defaultPlacement: BannerPlacement;
  defaultSortOrder: number;
  defaultYoutubeId: string | null;
}) {
  const [placement, setPlacement] = useState(defaultPlacement);
  const [link, setLink] = useState(defaultYoutubeId ? `https://youtube.com/shorts/${defaultYoutubeId}` : "");
  const hint = placements.find((option) => option.value === placement)?.hint;
  const video = link.trim() ? parseYouTubeUrl(link) : null;

  return <>
    <div className="admin-columns">
      <Field label="Placement" hint={hint}>
        <select
          name="placement"
          value={placement}
          onChange={(event) => setPlacement(placements.find((option) => option.value === event.target.value)?.value ?? placement)}
        >
          {placements.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Field>
      <Field label="Display order" hint="The live banner with the lowest number is shown."><input name="sortOrder" type="number" inputMode="numeric" min="0" max="9999" defaultValue={defaultSortOrder} /></Field>
    </div>
    {placement === "popup" && <div className="admin-popup-video">
      <Field label="YouTube link" hint="Paste a YouTube Shorts or video link. It starts muted; visitors can unmute it.">
        <input name="youtubeId" inputMode="url" autoComplete="off" spellCheck={false} maxLength={300} required placeholder="https://youtube.com/shorts/…" value={link} onChange={(event) => setLink(event.target.value)} />
      </Field>
      <div className="admin-popup-preview" aria-live="polite">
        {video ? <>
          <Image src={youtubeThumbnailUrl(video.id)} alt="" width={480} height={360} sizes="6rem" className="admin-popup-thumb" />
          <p className="admin-hint">Video found. <a href={youtubeWatchUrl(video)} target="_blank" rel="noopener noreferrer">Open it on YouTube</a> to check it is the right one.</p>
        </> : link.trim() ? <p className="admin-field-error">This is not a YouTube link yet.</p> : null}
      </div>
    </div>}
  </>;
}
