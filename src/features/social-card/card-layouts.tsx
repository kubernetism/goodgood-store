/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- Satori draws these to an image; they never reach a browser. */
/**
 * The two link-preview cards, as Satori JSX: inline styles, flexbox only, and
 * every element with more than one child needs display: flex.
 *
 * Name, price and the order cue start inside the centre square (x 285 to 915),
 * because some apps crop the 1200x630 card to a square thumbnail.
 */
import type { ReactNode } from "react";
import { CARD_SIZE, PANEL_TEXT_WIDTH, type ProductCardModel } from "./card-model";

const BROWN = "#2b1d0e";
const IVORY = "#fff8ec";
const TINT = "#fff3d6";
const HONEY_SURFACE = "linear-gradient(165deg, #ffd35c 0%, #ffb800 55%, #f5a800 100%)";
const FONT = "Sansation";

const PHOTO_WIDTH = 600;
const PANEL_TEXT_LEFT = 34;
export const CARD_PHOTO_SIZE = { width: PHOTO_WIDTH, height: CARD_SIZE.height } as const;

type Tongue = { at: number; width: number; depth: number };

/** The brown under a honey edge: traces each drip, then closes along the bottom. */
function dripPath(width: number, height: number, base: number, tongues: ReadonlyArray<Tongue>): string {
  const corner = 10;
  const steps = tongues.map(({ at, width: w, depth }) => {
    const bottom = base + depth - w / 2;
    return (
      `H${at - corner} Q${at} ${base} ${at} ${base + corner} V${bottom} ` +
      `A${w / 2} ${w / 2} 0 0 0 ${at + w} ${bottom} V${base + corner} Q${at + w} ${base} ${at + w + corner} ${base}`
    );
  });
  return `M0 ${height} V${base} ${steps.join(" ")} H${width} V${height} Z`;
}

function HoneyDrip({ width, height, tongues }: { width: number; height: number; tongues: ReadonlyArray<Tongue> }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", left: 0, bottom: 0 }}
    >
      <path d={dripPath(width, height, 14, tongues)} fill={BROWN} />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={IVORY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/** Stands in for the photo when a product has none or it cannot be loaded. */
function PhotoPlaceholder({ logo }: { logo: string }) {
  return (
    <div
      style={{
        ...CARD_PHOTO_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 50% 45%, ${IVORY} 0%, ${TINT} 70%, #fbe2a8 100%)`,
      }}
    >
      <img src={logo} width={320} height={308} />
    </div>
  );
}

export function ProductCardLayout({ model, photo, logo }: { model: ProductCardModel; photo: string | null; logo: string }) {
  return (
    <div style={{ ...CARD_SIZE, display: "flex", fontFamily: FONT, color: BROWN, backgroundColor: TINT }}>
      {photo ? <img src={photo} {...CARD_PHOTO_SIZE} /> : <PhotoPlaceholder logo={logo} />}

      <div
        style={{
          position: "relative",
          width: CARD_SIZE.width - PHOTO_WIDTH,
          height: CARD_SIZE.height,
          display: "flex",
          flexDirection: "column",
          padding: `28px ${CARD_SIZE.width - PHOTO_WIDTH - PANEL_TEXT_LEFT - PANEL_TEXT_WIDTH}px 0 ${PANEL_TEXT_LEFT}px`,
          background: HONEY_SURFACE,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={logo} width={72} height={69} />
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: "0.01em" }}>Abdul Sami Enterprises</div>
        </div>

        <div
          style={{
            display: "block",
            marginTop: 18,
            maxHeight: model.nameSize * 1.12 * 3,
            overflow: "hidden",
            fontSize: model.nameSize,
            fontWeight: 700,
            lineHeight: 1.12,
          }}
        >
          {model.name}
        </div>

        {model.line && (
          <div
            style={{
              display: "block",
              marginTop: 10,
              maxHeight: 72,
              overflow: "hidden",
              fontSize: 30,
              lineHeight: 1.2,
            }}
          >
            {model.line}
          </div>
        )}

        <div style={{ display: "flex", flexGrow: 1 }} />

        {model.oldPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}>
            <div style={{ display: "flex", fontSize: 34, textDecoration: "line-through" }}>{model.oldPrice}</div>
            <div
              style={{
                display: "flex",
                padding: "4px 14px",
                borderRadius: 999,
                backgroundColor: BROWN,
                color: "#ffb800",
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {`${model.percentOff}% off`}
            </div>
          </div>
        )}

        <div style={{ display: "flex", fontSize: model.priceSize, fontWeight: 700, lineHeight: 1.1 }}>{model.price}</div>

        <div style={{ display: "flex", marginTop: 12, marginBottom: 72 }}>
          {model.soldOut ? (
            <CardPill background={IVORY} color={BROWN}>Sold out</CardPill>
          ) : (
            <CardPill background={BROWN} color={IVORY}>
              Order now
              <ArrowIcon />
            </CardPill>
          )}
        </div>

        <HoneyDrip
          width={CARD_SIZE.width - PHOTO_WIDTH}
          height={64}
          tongues={[
            { at: 60, width: 34, depth: 34 },
            { at: 230, width: 26, depth: 22 },
            { at: 400, width: 38, depth: 42 },
            { at: 520, width: 24, depth: 18 },
          ]}
        />
      </div>
    </div>
  );
}

function CardPill({ background, color, children }: { background: string; color: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 28px",
        borderRadius: 999,
        backgroundColor: background,
        color,
        fontSize: 32,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

export function BrandCardLayout({ logo, tagline }: { logo: string; tagline: string }) {
  return (
    <div
      style={{
        position: "relative",
        ...CARD_SIZE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "44px 0 0",
        fontFamily: FONT,
        color: BROWN,
        background: HONEY_SURFACE,
      }}
    >
      <img src={logo} width={208} height={200} />
      <div style={{ display: "flex", marginTop: 16, fontSize: 34 }}>Honey by</div>
      <div style={{ display: "flex", fontSize: 58, fontWeight: 700, lineHeight: 1.1 }}>Abdul Sami Enterprises</div>
      <div style={{ display: "flex", maxWidth: 620, marginTop: 12, fontSize: 28, lineHeight: 1.25, textAlign: "center" }}>{tagline}</div>
      <HoneyDrip
        width={CARD_SIZE.width}
        height={84}
        tongues={[
          { at: 90, width: 40, depth: 46 },
          { at: 270, width: 28, depth: 26 },
          { at: 460, width: 34, depth: 38 },
          { at: 700, width: 26, depth: 24 },
          { at: 900, width: 44, depth: 54 },
          { at: 1090, width: 30, depth: 30 },
        ]}
      />
    </div>
  );
}
