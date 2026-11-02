"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { WhatsAppIcon } from "@/components/icons/social-icons";
import { isProductPath, whatsappMessage, withWhatsappText } from "./whatsapp-message";

/**
 * The button itself. The server renders the general greeting; on a product
 * page the click swaps in the product's name and link (read from the page's
 * H1 and URL at click time, so nothing depends on the route while rendering).
 * It steps aside once the footer scrolls into view: the footer carries the
 * same contact details, and its links and sign-up sit in the bottom corner.
 */
export function WhatsAppFabLink({ baseHref }: { baseHref: string }) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wrapper.current;
    // The layouts render the button right after the site footer; articles may have <footer>s of their own.
    let footer = node?.previousElementSibling ?? null;
    while (footer && footer.tagName !== "FOOTER") footer = footer.previousElementSibling;
    if (!footer || !node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        node.toggleAttribute("data-tucked", Boolean(entry?.isIntersecting));
      },
      // Only once the footer is a few rows into view, not at its first pixel.
      { rootMargin: "0px 0px -96px 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  function addProduct(event: MouseEvent<HTMLAnchorElement>) {
    const { origin, pathname } = window.location;
    // The layout (and this link) survives client navigation, so rebuild the text on every click.
    const product = isProductPath(pathname)
      ? { name: document.querySelector("main h1")?.textContent ?? "", url: `${origin}${pathname}` }
      : null;
    // Runs before the browser follows the link, so the new href is the one opened.
    event.currentTarget.href = withWhatsappText(baseHref, whatsappMessage(product));
  }

  return (
    <div ref={wrapper} className="site-wa">
      <a
        href={withWhatsappText(baseHref, whatsappMessage())}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        onClick={addProduct}
        className="site-wa__button"
      >
        <WhatsAppIcon className="site-wa__icon" strokeWidth={1.9} />
        <span aria-hidden="true" className="site-wa__label">
          Chat with us
        </span>
      </a>
    </div>
  );
}
