"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { uploadImageInline } from "./actions";

type ImageOption = { id: string; alt: string };
const UPLOADED_EVENT = "admin-image-uploaded";
const MAX_BYTES = 4 * 1024 * 1024;

/** Upload independently of the surrounding editor form, keeping unsaved fields intact. */
export function ImageSelect({ label, name, images, defaultValue = "", emptyLabel = "Use default or placeholder" }: { label: string; name: string; images: ImageOption[]; defaultValue?: string; emptyLabel?: string }) {
  const selectId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState(images);
  const [selected, setSelected] = useState(defaultValue);
  const [alt, setAlt] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function addImage(event: Event) {
      const image = (event as CustomEvent<ImageOption>).detail;
      if (image?.id && image.alt) setOptions((current) => current.some((item) => item.id === image.id) ? current : [image, ...current]);
    }
    window.addEventListener(UPLOADED_EVENT, addImage);
    return () => window.removeEventListener(UPLOADED_EVENT, addImage);
  }, []);

  useEffect(() => {
    if (!pending) return;
    const parent = rootRef.current?.closest("form");
    const preventSave = (event: Event) => { event.preventDefault(); event.stopPropagation(); setError("Wait for the image upload to finish before saving."); };
    parent?.addEventListener("submit", preventSave, true);
    return () => parent?.removeEventListener("submit", preventSave, true);
  }, [pending]);

  function upload() {
    const file = fileRef.current?.files?.[0];
    setError(""); setMessage("");
    if (!file || !alt.trim()) { setError("Choose an image and enter a short description."); return; }
    if (file.size > MAX_BYTES) { setError("The image must be 4 MB or smaller."); return; }
    const form = new FormData();
    form.set("image", file);
    form.set("alt", alt.trim());
    startTransition(async () => {
      try {
        const result = await uploadImageInline(form);
        if (result.error || !result.image) { setError(result.error ?? "Upload failed. Please try again."); return; }
        const image = result.image;
        setOptions((current) => current.some((item) => item.id === image.id) ? current : [image, ...current]);
        setSelected(image.id);
        window.dispatchEvent(new CustomEvent(UPLOADED_EVENT, { detail: image }));
        setAlt("");
        setError("");
        if (fileRef.current) fileRef.current.value = "";
        setMessage("Image uploaded and selected. Save this form to apply it.");
      } catch {
        setError("Upload failed. Please try again.");
      }
    });
  }

  return <div ref={rootRef} className="admin-image-select">
    <label htmlFor={selectId}>{label}</label>
    <select id={selectId} name={name} value={selected} onChange={(event) => setSelected(event.target.value)}><option value="">{emptyLabel}</option>{options.map((image) => <option key={image.id} value={image.id}>{image.alt}</option>)}</select>
    <details className="admin-image-upload"><summary>Upload new image</summary><div className="admin-image-upload-fields" onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); if (!pending) upload(); } }}>
      <p className="admin-muted">JPEG, PNG, WebP or AVIF, up to 4 MB. Images are also saved in Media.</p>
      <label>Choose image<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={pending} /></label>
      <label>Image description (alt text)<input value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={250} disabled={pending} placeholder="Describe the image" /></label>
      <div><button className="admin-button secondary" type="button" onClick={upload} disabled={pending}>{pending ? "Uploading…" : "Upload and select"}</button></div>
      {error && <p className="admin-visibility-error" role="alert">{error}</p>}
      {message && <p className="admin-muted" role="status">{message}</p>}
    </div></details>
  </div>;
}
