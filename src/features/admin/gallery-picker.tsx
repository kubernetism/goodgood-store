"use client";

import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { ImagePickerDialog, PickerThumb } from "./image-picker";
import { useMediaOptions } from "./media-options";
import { moveItem, mergeSelection } from "./gallery-order";

/**
 * Ordered product gallery. Renders one hidden `imageId` input per image, in
 * order, which is exactly what the old repeated selects submitted, so
 * saveProduct (and its duplicate check) is unchanged. Reordering works with
 * buttons only and every change is announced.
 */
export function GalleryPicker({ name, defaultValue }: { name: string; defaultValue: ReadonlyArray<string> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const { options } = useMediaOptions();
  const [ids, setIds] = useState<string[]>([...defaultValue]);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [announcement, setAnnouncement] = useState("");

  function update(next: string[], message: string) {
    setIds(next);
    setAnnouncement(message);
    queueMicrotask(() => rootRef.current?.dispatchEvent(new Event("input", { bubbles: true })));
  }

  const altFor = (id: string) => options.find((option) => option.id === id)?.alt ?? "Image";

  return <div ref={rootRef} className="admin-stack-sm">
    {ids.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
    {ids.length ? <ol className="admin-gallery">{ids.map((id, index) => {
      const image = options.find((option) => option.id === id);
      const alt = image?.alt ?? "Image";
      return <li key={id}>
        <span className="admin-gallery-pos" aria-hidden="true">{index + 1}</span>
        <PickerThumb image={image} />
        <span className="admin-gallery-text"><span className="admin-picker-name">{alt}</span>{index === 0 && <span className="admin-hint">Primary image</span>}</span>
        <span className="admin-gallery-controls">
          <button type="button" className="admin-icon-button" disabled={index === 0} aria-label={`Move ${alt} up`} title="Move up" onClick={() => update(moveItem(ids, index, -1), `${alt} moved to position ${index}.`)}><ArrowUp aria-hidden="true" /></button>
          <button type="button" className="admin-icon-button" disabled={index === ids.length - 1} aria-label={`Move ${alt} down`} title="Move down" onClick={() => update(moveItem(ids, index, 1), `${alt} moved to position ${index + 2}.`)}><ArrowDown aria-hidden="true" /></button>
          <button type="button" className="admin-icon-button" aria-label={`Remove ${alt}`} title="Remove" onClick={() => { update(ids.filter((value) => value !== id), `${alt} removed from the gallery.`); requestAnimationFrame(() => addRef.current?.focus()); }}><X aria-hidden="true" /></button>
        </span>
      </li>;
    })}</ol> : <p className="admin-muted">No images yet. The first image you add becomes the primary image.</p>}
    <div><button ref={addRef} type="button" className="admin-button secondary" onClick={() => setContainer(rootRef.current?.closest<HTMLElement>(".admin-app") ?? document.body)}><ImagePlus aria-hidden="true" />Add images</button></div>
    <p className="sr-only" role="status">{announcement}</p>
    {container && <ImagePickerDialog
      title="Choose product images"
      mode="multiple"
      initial={ids}
      anchor={rootRef}
      container={container}
      onConfirm={(chosen) => {
        const next = mergeSelection(ids, chosen);
        update(next, next.length === ids.length && next.every((value, index) => value === ids[index]) ? "Gallery unchanged." : `Gallery now has ${next.length} ${next.length === 1 ? "image" : "images"}. ${next[0] ? `${altFor(next[0])} is the primary image.` : ""}`);
      }}
      onClose={() => { setContainer(null); requestAnimationFrame(() => addRef.current?.focus()); }}
    />}
  </div>;
}
