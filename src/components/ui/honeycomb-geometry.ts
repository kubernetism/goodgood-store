/*
 * Geometry and timing for the honeycomb mark (loader and order celebration).
 * Units are SVG user units in a square box centred on the origin.
 */

/** Cell radius (centre to corner). Smaller than the spacing, so cells keep a gap. */
export const HEX_RADIUS = 28;
/** Centre-to-centre distance between neighbouring cells: √3 · 30. */
export const CELL_SPACING = Math.sqrt(3) * 30;
/** Vertical distance between rows of pointy-top cells: 1.5 · 30. */
const ROW_SPACING = 45;

/** Outline stroke width; half of it sits outside each cell. */
export const OUTLINE_WIDTH = 2.5;
/** Big enough for the whole comb and its outline, so it never spills out of its layout box. */
export const VIEW_BOX_SIZE = 156;
export const VIEW_BOX = `${-VIEW_BOX_SIZE / 2} ${-VIEW_BOX_SIZE / 2} ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`;

type Point = readonly [x: number, y: number];

const round = (value: number) => Number(value.toFixed(2));

/** Fill order: the ring clockwise from the top-right cell, then the centre last. */
const ringAndCentre: ReadonlyArray<Point> = [
  [CELL_SPACING / 2, -ROW_SPACING],
  [CELL_SPACING, 0],
  [CELL_SPACING / 2, ROW_SPACING],
  [-CELL_SPACING / 2, ROW_SPACING],
  [-CELL_SPACING, 0],
  [-CELL_SPACING / 2, -ROW_SPACING],
  [0, 0],
];
export const CELL_CENTRES: ReadonlyArray<Point> = ringAndCentre.map(([x, y]) => [round(x), round(y)] as const);

/** Corners of a pointy-top hexagon around the origin, starting at the top. */
export function hexPoints(radius: number = HEX_RADIUS): string {
  return Array.from({ length: 6 }, (_, corner) => {
    const angle = (Math.PI / 180) * (60 * corner - 90);
    return `${round(radius * Math.cos(angle))},${round(radius * Math.sin(angle))}`;
  }).join(" ");
}

/** One ripple of the honey surface. */
export const WAVE_PERIOD = 28;
/** Translating the strip left by two periods loops the slosh seamlessly. */
export const SLOSH_DISTANCE = WAVE_PERIOD * 2;
/** Empty cell: the honey strip sits this far below the cell, out of the clip. */
export const DRAIN_OFFSET = 62;

const WAVE_START = -60;
const WAVE_BOTTOM = 70;
const WAVE_PERIODS = 7;

/** A wide honey strip with a rippled top edge. Its top rests just above the cell centre. */
export function wavePath(): string {
  const end = WAVE_START + WAVE_PERIODS * WAVE_PERIOD;
  const ripples = " q 7 -5 14 0 t 14 0".repeat(WAVE_PERIODS);
  return `M ${WAVE_START} -2${ripples} L ${end} ${WAVE_BOTTOM} L ${WAVE_START} ${WAVE_BOTTOM} Z`;
}

/** Horizontal extent of the strip, for coverage checks. */
export const WAVE_EXTENT = { left: WAVE_START, right: WAVE_START + WAVE_PERIODS * WAVE_PERIOD } as const;

/** The tick that seals the centre cell. */
export const TICK_PATH = "M -11 1 L -3 9 L 12 -8";

/** A single drop that hangs under the bottom-left cell. */
const dropX = round(-CELL_SPACING / 2);
export const DROP_PATH = `M ${dropX} 76 c 0 0 -5 7 -5 11 a 5 5 0 0 0 10 0 c 0 -4 -5 -11 -5 -11 z`;

/** Loader: every cell starts filling 160 ms after the previous one. */
export const LOADER_STAGGER_MS = 160;
/** Celebration: cells pop in 70 ms apart, then honey fills from 500 ms, 90 ms apart. */
export const POP_STAGGER_MS = 70;
export const FILL_START_MS = 500;
export const FILL_STAGGER_MS = 90;

export function loaderFillDelay(cell: number): string {
  return `${cell * LOADER_STAGGER_MS}ms`;
}
export function popDelay(cell: number): string {
  return `${cell * POP_STAGGER_MS}ms`;
}
export function celebrateFillDelay(cell: number): string {
  return `${FILL_START_MS + cell * FILL_STAGGER_MS}ms`;
}

/** Text and actions rise in after the comb has sealed (seconds). */
export const RISE_DELAYS = [1.7, 1.85, 2, 2.1, 2.25] as const;

export type Spark = { left: number; top: number; delay: number; size: number };

/**
 * Small hexagons that float up behind the celebration. Fixed values, so the
 * server and client render the same markup (no Math.random during render).
 * left/top are percentages of the band; delay in seconds; size in px.
 */
export const SPARKS: ReadonlyArray<Spark> = [
  { left: 9, top: 62, delay: 1.72, size: 8 },
  { left: 16, top: 48, delay: 2.31, size: 12 },
  { left: 22, top: 78, delay: 1.95, size: 7 },
  { left: 29, top: 56, delay: 2.48, size: 10 },
  { left: 35, top: 84, delay: 1.81, size: 13 },
  { left: 41, top: 66, delay: 2.12, size: 7 },
  { left: 47, top: 44, delay: 2.56, size: 9 },
  { left: 54, top: 74, delay: 1.88, size: 11 },
  { left: 60, top: 52, delay: 2.24, size: 8 },
  { left: 66, top: 82, delay: 2.02, size: 12 },
  { left: 72, top: 60, delay: 2.4, size: 7 },
  { left: 79, top: 46, delay: 1.76, size: 10 },
  { left: 85, top: 70, delay: 2.18, size: 13 },
  { left: 91, top: 55, delay: 2.6, size: 8 },
];

/** Spark float duration (seconds). */
export const SPARK_FLOAT_S = 2.4;

/** When every part of the celebration has finished, so the mark can rest (ms). */
export const CELEBRATION_MS = Math.ceil(
  (Math.max(...SPARKS.map((spark) => spark.delay)) + SPARK_FLOAT_S) * 1000 + 100,
);
