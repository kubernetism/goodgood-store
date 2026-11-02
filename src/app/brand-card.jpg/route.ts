import { brandCardResponse } from "@/features/social-card/card-images";

/** The shared link-preview card, for every page without its own image. */
export function GET() {
  return brandCardResponse();
}
