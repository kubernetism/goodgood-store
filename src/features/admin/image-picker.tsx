"use client";

import Image from "next/image";
import { Check, ImagePlus, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition, type RefObject } from "react";
import { createPortal } from "react-dom";
import { uploadImageInline } from "./actions";
import { useMediaOptions, type ImageOption } from "./media-options";

const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Inline upload that never touches the surrounding editor form. While an
 * upload runs, the parent form's submit is blocked so Save cannot race it.
 */
function useInlineUpload(anchor: RefObject<HTMLElement | null>, onUploaded: (image: ImageOption) => void) {
  const { addOption } = useMediaOptions();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pending) return;
    const parent = anchor.current?.closest("form");
    const preventSave = (event: Event) => { event.preventDefault(); event.stopPropagation(); setError("Wait for the image upload to finish before saving."); };
    parent?.addEventListener("submit", preventSave, true);
    return () => parent?.removeEventListener("submit", preventSave, true);
  }, [pending, anchor]);

  function upload(file: File | undefined, alt: string): boolean {
    setError("");
    if (!file || !alt.trim()) { setError("Choose an image and enter a short description."); return false; }
    if (file.size > MAX_BYTES) { setError("The image must be 4 MB or smaller."); return false; }
    const form = new FormData();
    form.set("image", file);
    form.set("alt", alt.trim());
    startTransition(async () => {
      try {
        const result = await uploadImageInline(form);
        if (result.error || !result.image) { setError(result.error ?? "Upload failed. Please try again."); return; }
        const image = { id: result.image.id, alt: result.image.alt, url: result.image.url };
        addOption(image);
        onUploaded(image);
      } catch {
        setError("Upload failed. Please try again.");
      }
    });
    return true;
  }

  return { pending, error, upload };
}

/**
 * Native modal <dialog> for choosing images: focus trap, Esc and an inert
 * page come from the platform. It is portalled to <body> so none of its
 * controls belong to the editor form (the submitted fields stay unchanged).
 */
export function ImagePickerDialog({ title, mode, initial, anchor, container, onConfirm, onClose }: {
  title: string;
  mode: "single" | "multiple";
  initial: ReadonlyArray<string>;
  /** The .admin-app element, so the dialog gets admin tokens but sits outside the form. */
  container: HTMLElement;
  /** An element inside the editor form (for the upload submit guard). */
  anchor: RefObject<HTMLElement | null>;
  onConfirm: (ids: string[], uploaded?: ImageOption) => void;
  onClose: () => void;
}) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { options } = useMediaOptions();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>([...initial]);
  const [alt, setAlt] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const confirm = (ids: string[], uploaded?: ImageOption) => {
    onConfirm(ids, uploaded);
    dialogRef.current?.close();
  };
  const { pending, error, upload } = useInlineUpload(anchor, (image) => {
    if (mode === "single") { confirm([image.id], image); return; }
    setDraft((current) => current.includes(image.id) ? current : [...current, image.id]);
    setAlt(""); setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    setStatus(`Uploaded "${image.alt}" and selected it.`);
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = needle ? options.filter((option) => option.alt.toLowerCase().includes(needle)) : options;
  const toggle = (optionId: string) => setDraft((current) => mode === "single" ? [optionId] : current.includes(optionId) ? current.filter((value) => value !== optionId) : [...current, optionId]);
  const formId = `${id}-detached`; // matches no form: these controls are never submitted

  return createPortal(<dialog ref={dialogRef} className="admin-dialog" aria-labelledby={`${id}-title`} onClose={onClose} onCancel={(event) => { if (pending) event.preventDefault(); }}>
    <div className="admin-dialog-head">
      <h2 id={`${id}-title`}>{title}</h2>
      <button type="button" className="admin-icon-button" aria-label="Close" title="Close" onClick={() => { if (!pending) dialogRef.current?.close(); }}><X aria-hidden="true" /></button>
    </div>
    <div className="admin-dialog-body">
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${id}-search`}>Search images</label>
        <div className="admin-search-input"><Search aria-hidden="true" /><input id={`${id}-search`} form={formId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by description" /></div>
      </div>
      {visible.length ? <fieldset className="admin-picker-grid">
        <legend className="sr-only">{mode === "single" ? "Choose one image" : "Choose images"}</legend>
        {visible.map((option) => <label key={option.id} className="admin-picker-tile" title={option.alt}>
          <input type={mode === "single" ? "radio" : "checkbox"} name={`${id}-choice`} form={formId} checked={draft.includes(option.id)} onChange={() => toggle(option.id)} />
          <span className="admin-picker-tile-image"><Image src={option.url} alt="" fill sizes="96px" loading="lazy" /><span className="admin-picker-check" aria-hidden="true"><Check /></span></span>
          <span className="admin-picker-tile-alt admin-clamp">{option.alt}</span>
        </label>)}
      </fieldset> : <p className="admin-muted">{options.length ? "No images match your search." : "Your media library is empty. Upload the first image below."}</p>}
      <details className="admin-picker-upload" open={!options.length || undefined}>
        <summary><ImagePlus aria-hidden="true" />Upload new image</summary>
        <div className="admin-picker-upload-fields" onKeyDown={(event) => { if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); if (!pending) upload(fileRef.current?.files?.[0], alt); } }}>
          <label className="admin-drop">
            <ImagePlus aria-hidden="true" />
            <strong>Choose an image</strong>
            <span className="admin-hint">JPEG, PNG, WebP or AVIF · up to 4 MB · also saved in Media</span>
            {fileName && <span className="admin-drop-name">{fileName}</span>}
            <input ref={fileRef} form={formId} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={pending} onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
          </label>
          <div className="admin-field">
            <label className="admin-label" htmlFor={`${id}-alt`}>Image description (alt text)</label>
            <p id={`${id}-alt-hint`} className="admin-hint">Describe what is in the photo, e.g. “Sidr honey 500 g jar on a wooden table”.</p>
            <input id={`${id}-alt`} form={formId} aria-describedby={`${id}-alt-hint`} value={alt} onChange={(event) => setAlt(event.target.value)} maxLength={250} readOnly={pending} />
          </div>
          <div><button className="admin-button secondary" type="button" aria-disabled={pending || undefined} onClick={() => { if (!pending) upload(fileRef.current?.files?.[0], alt); }}>{pending ? <><span className="admin-spinner" aria-hidden="true" />Uploading…</> : mode === "single" ? "Upload and use" : "Upload and select"}</button></div>
          {error && <p className="admin-field-error" role="alert">{error}</p>}
        </div>
      </details>
      <p className="sr-only" role="status">{status}</p>
    </div>
    <div className="admin-dialog-foot">
      <button type="button" className="admin-button quiet" onClick={() => { if (!pending) dialogRef.current?.close(); }}>Cancel</button>
      <button type="button" className="admin-button" aria-disabled={pending || undefined} onClick={() => { if (!pending) confirm(draft); }}>{mode === "single" ? "Use this image" : draft.length === 1 ? "Use 1 image" : `Use ${draft.length} images`}</button>
    </div>
  </dialog>, container);
}

/** Small thumbnail with a hexagon placeholder when nothing is chosen. */
export function PickerThumb({ image }: { image?: ImageOption }) {
  return <span className="admin-picker-thumb">{image
    ? <Image src={image.url} alt="" fill sizes="64px" />
    : <svg viewBox="0 0 20 22" aria-hidden="true"><path d="M10 1.5 18.5 6.4v9.2L10 20.5 1.5 15.6V6.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>}
  </span>;
}
