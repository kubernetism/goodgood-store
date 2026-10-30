import type { BlogBlock } from "./data";

/** A small, safe plain-text format: ## heading, - list item, > quote. */
export function parseBlogBody(input: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  for (const chunk of input.replace(/\r\n?/g, "\n").trim().split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((line) => line.startsWith("- "))) {
      blocks.push({ type: "list", items: lines.map((line) => line.slice(2).trim()).filter(Boolean) });
    } else if (lines[0].startsWith("## ") && lines.length === 1) {
      blocks.push({ type: "heading", text: lines[0].slice(3).trim() });
    } else if (lines.every((line) => line.startsWith("> "))) {
      const quoteLines = lines.map((line) => line.slice(2).trim());
      const cite = quoteLines.at(-1)?.startsWith("— ") ? quoteLines.pop()!.slice(2).trim() : undefined;
      blocks.push({ type: "quote", text: quoteLines.join(" "), ...(cite ? { cite } : {}) });
    } else {
      blocks.push({ type: "paragraph", text: lines.join(" ") });
    }
  }
  return blocks;
}

export function formatBlogBody(blocks: ReadonlyArray<BlogBlock>): string {
  return blocks.map((block) => {
    switch (block.type) {
      case "heading": return `## ${block.text}`;
      case "paragraph": return block.text;
      case "list": return block.items.map((item) => `- ${item}`).join("\n");
      case "quote": return `> ${block.text}${block.cite ? `\n> — ${block.cite}` : ""}`;
    }
  }).join("\n\n");
}
