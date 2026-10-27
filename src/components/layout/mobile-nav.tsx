"use client";

import Link from "next/link";
import { useRef } from "react";
import { Mail, Menu, Phone, X } from "lucide-react";
import { mainNav, siteConfig } from "@/lib/site";
import { Logo } from "@/components/ui/logo";

/**
 * Hamburger + slide-in drawer for < 1024px. A native modal <dialog> gives us
 * the focus trap, Escape-to-close and inert background for free.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="flex size-11 items-center justify-center rounded-full bg-surface text-strong shadow-card lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        // Clicking the backdrop (the dialog element itself) closes the drawer.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="on-light m-0 ml-auto h-dvh max-h-none w-80 max-w-full bg-surface p-0 text-strong shadow-card-hover"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-border px-5">
            <Logo />
            <button
              type="button"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-sm text-strong hover:bg-tile"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-1">
              {mainNav.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex min-h-11 items-center rounded-sm font-display text-base font-semibold hover:text-primary-ink"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <p className="flex min-h-11 items-center font-display text-base font-semibold">{item.label}</p>
                  )}
                  {item.children && (
                    <ul className="mb-2 border-l-2 border-primary pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            className="flex min-h-11 items-center text-sm text-body hover:text-primary-ink"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-2 border-t border-border bg-ivory px-5 py-4 text-meta">
            <a href={siteConfig.contact.phoneHref} className="flex min-h-11 items-center gap-2 hover:text-primary-ink">
              <Phone className="size-4 text-primary-ink" aria-hidden="true" />
              {siteConfig.contact.phoneDisplay}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex min-h-11 items-center gap-2 hover:text-primary-ink"
            >
              <Mail className="size-4 text-primary-ink" aria-hidden="true" />
              {siteConfig.contact.email}
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
