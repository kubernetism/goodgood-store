"use client";

import { ImageUp } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

/**
 * The upload area: a styled <label> wrapping the native file input, so the
 * click and keyboard path always works (WCAG 2.5.7). Dropping a file onto it
 * is only an enhancement.
 */
export function DropUpload({ name, accept, id, describedBy }: { name: string; accept: string; id: string; describedBy?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [fileName, setFileName] = useState("");

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setOver(false);
    const file = event.dataTransfer.files[0];
    const input = inputRef.current;
    if (!file || !input) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    setFileName(file.name);
  }

  return <label className="admin-drop" htmlFor={id} data-over={over || undefined}
    onDragOver={(event) => { event.preventDefault(); setOver(true); }}
    onDragLeave={() => setOver(false)}
    onDrop={drop}>
    <ImageUp aria-hidden="true" />
    <strong>Choose an image or drop it here</strong>
    <span className="admin-hint">JPEG, PNG, WebP or AVIF · up to 4 MB</span>
    {fileName && <span className="admin-drop-name">{fileName}</span>}
    <input ref={inputRef} id={id} type="file" name={name} accept={accept} required aria-describedby={describedBy} onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
  </label>;
}
