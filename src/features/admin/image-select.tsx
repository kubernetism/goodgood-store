"use client";

import { useId, useRef, useState } from "react";
import { ImagePickerDialog, PickerThumb } from "./image-picker";
import { useMediaOptions } from "./media-options";

/**
 * Single image picker (v2). Same form contract as before: one hidden input
 * `name` carrying the chosen media id, or "" for none.
 */
export function ImageSelect({ label, name, defaultValue = "", emptyLabel = "Use default or placeholder", hint }: { label: string; name: string; defaultValue?: string; emptyLabel?: string; hint?: string }) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const { options } = useMediaOptions();
  const [selected, setSelected] = useState(defaultValue);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState("");
  const image = options.find((option) => option.id === selected);

  function choose(next: string, uploaded = false) {
    setSelected(next);
    setMessage(uploaded ? "Image uploaded and selected. Save this form to apply it." : next ? "Image selected. Save this form to apply it." : "Image removed. Save this form to apply it.");
    // Hidden inputs fire no events: tell dirty-state trackers that the form changed.
    queueMicrotask(() => rootRef.current?.dispatchEvent(new Event("input", { bubbles: true })));
  }

  function open() {
    setContainer(rootRef.current?.closest<HTMLElement>(".admin-app") ?? document.body);
  }

  return <div ref={rootRef} className="admin-picker" role="group" aria-labelledby={`${id}-label`} aria-describedby={hint ? `${id}-hint` : undefined}>
    <span id={`${id}-label`} className="admin-label">{label}</span>
    {hint && <p id={`${id}-hint`} className="admin-hint">{hint}</p>}
    <input type="hidden" name={name} value={selected} />
    <div className="admin-picker-current">
      <PickerThumb image={image} />
      <span className="admin-picker-name">{image ? image.alt : selected ? "Selected image" : emptyLabel}</span>
      <span className="admin-picker-buttons">
        <button ref={changeRef} type="button" className="admin-button secondary sm" onClick={open} aria-label={`${image ? "Change" : "Choose"} ${label.toLowerCase()}`}>{image ? "Change" : "Choose"}</button>
        {selected && <button type="button" className="admin-button quiet sm" onClick={() => choose("")} aria-label={`Remove ${label.toLowerCase()}`}>Remove</button>}
      </span>
    </div>
    <p className="admin-hint" role="status">{message}</p>
    {container && <ImagePickerDialog
      title={`Choose ${label.toLowerCase()}`}
      mode="single"
      initial={selected ? [selected] : []}
      anchor={rootRef}
      container={container}
      onConfirm={(ids, uploaded) => choose(ids[0] ?? "", Boolean(uploaded))}
      onClose={() => { setContainer(null); requestAnimationFrame(() => changeRef.current?.focus()); }}
    />}
  </div>;
}
