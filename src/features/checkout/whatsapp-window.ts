/** Open during the submit gesture so popup blockers are less likely to prevent it. */
export function openOrderWhatsappWindow(): Window | null {
  let popup: Window | null = null;
  try {
    popup = window.open("", "_blank");
    if (popup) {
      popup.document.title = "Preparing your order";
      popup.document.body.textContent = "Preparing your WhatsApp message. Please wait for your order to be placed.";
    }
    return popup;
  } catch {
    try { popup?.close(); } catch { /* The popup may already be unavailable. */ }
    return null;
  }
}

/** Only navigate our own waiting tab; never take over a tab the user has moved elsewhere. */
export function finishOrderWhatsappWindow(popup: Window | null, url?: string): void {
  if (!popup || popup.closed) return;
  try {
    if (popup.location.href !== "about:blank") return;
    if (url) {
      popup.opener = null;
      popup.location.replace(url);
    } else popup.close();
  } catch { /* The confirmation page provides a link if navigation is unavailable. */ }
}
