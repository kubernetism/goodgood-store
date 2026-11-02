import { describe, expect, it } from "vitest";
import {
  CELEBRATION_MS,
  CELL_CENTRES,
  CELL_SPACING,
  HEX_RADIUS,
  OUTLINE_WIDTH,
  RISE_DELAYS,
  SLOSH_DISTANCE,
  SPARKS,
  SPARK_FLOAT_S,
  VIEW_BOX,
  VIEW_BOX_SIZE,
  WAVE_EXTENT,
  WAVE_PERIOD,
  celebrateFillDelay,
  hexPoints,
  loaderFillDelay,
  popDelay,
  wavePath,
} from "./honeycomb-geometry";

const distance = ([ax, ay]: readonly [number, number], [bx, by]: readonly [number, number]) => Math.hypot(ax - bx, ay - by);

describe("honeycomb geometry", () => {
  it("lays out seven cells: a ring of six around the centre, filled clockwise from the top-right", () => {
    expect(CELL_CENTRES).toHaveLength(7);
    expect(CELL_CENTRES[6]).toEqual([0, 0]);
    const ring = CELL_CENTRES.slice(0, 6);
    for (const centre of ring) expect(distance(centre, [0, 0])).toBeCloseTo(CELL_SPACING, 1);
    // Clockwise in screen coordinates (y down): each step turns +60°, starting top-right.
    const angles = ring.map(([x, y]) => (Math.atan2(y, x) * 180) / Math.PI);
    expect(angles[0]).toBeCloseTo(-60, 0);
    for (let i = 1; i < angles.length; i++) {
      const step = (((angles[i]! - angles[i - 1]!) % 360) + 360) % 360;
      expect(step).toBeCloseTo(60, 0);
    }
  });

  it("keeps a gap between neighbouring cells and fits the comb in the view box", () => {
    // Pointy-top hexagons touch when spacing = √3 · radius; ours are smaller.
    expect(CELL_SPACING).toBeGreaterThan(Math.sqrt(3) * HEX_RADIUS);
    const half = VIEW_BOX_SIZE / 2;
    const stroke = OUTLINE_WIDTH / 2;
    for (const [x, y] of CELL_CENTRES) {
      expect(Math.abs(x) + (Math.sqrt(3) / 2) * HEX_RADIUS + stroke).toBeLessThanOrEqual(half);
      expect(Math.abs(y) + HEX_RADIUS + stroke).toBeLessThanOrEqual(half);
    }
    expect(VIEW_BOX).toBe(`${-half} ${-half} ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`);
  });

  it("draws a pointy-top hexagon with six corners on the radius", () => {
    const corners = hexPoints().split(" ").map((pair) => pair.split(",").map(Number) as [number, number]);
    expect(corners).toHaveLength(6);
    expect(corners[0]).toEqual([0, -HEX_RADIUS]);
    for (const corner of corners) expect(distance(corner, [0, 0])).toBeCloseTo(HEX_RADIUS, 1);
  });

  it("builds a wave strip that still covers the cell after the slosh, so the loop is seamless", () => {
    expect(SLOSH_DISTANCE % WAVE_PERIOD).toBe(0);
    const cellHalfWidth = (Math.sqrt(3) / 2) * HEX_RADIUS;
    expect(WAVE_EXTENT.left).toBeLessThanOrEqual(-cellHalfWidth);
    expect(WAVE_EXTENT.right - SLOSH_DISTANCE).toBeGreaterThanOrEqual(cellHalfWidth);
    const path = wavePath();
    expect(path.startsWith(`M ${WAVE_EXTENT.left} -2`)).toBe(true);
    expect(path).toContain(`L ${WAVE_EXTENT.right} 70`);
    expect(path.endsWith("Z")).toBe(true);
  });

  it("staggers the loader 160 ms and the celebration 70 ms (pop) / 500 + 90 ms (fill) per cell", () => {
    expect(loaderFillDelay(0)).toBe("0ms");
    expect(loaderFillDelay(6)).toBe("960ms");
    expect(popDelay(3)).toBe("210ms");
    expect(celebrateFillDelay(0)).toBe("500ms");
    expect(celebrateFillDelay(6)).toBe("1040ms");
  });

  it("raises the copy between 1.7 s and 2.25 s and rests only after the last spark", () => {
    expect(RISE_DELAYS[0]).toBe(1.7);
    expect(RISE_DELAYS.at(-1)).toBe(2.25);
    const lastSparkEnd = Math.max(...SPARKS.map((spark) => spark.delay)) + SPARK_FLOAT_S;
    expect(CELEBRATION_MS).toBeGreaterThan(lastSparkEnd * 1000);
    expect(CELEBRATION_MS).toBeLessThan(6000);
  });

  it("places every spark inside the band", () => {
    for (const spark of SPARKS) {
      expect(spark.left).toBeGreaterThanOrEqual(0);
      expect(spark.left).toBeLessThanOrEqual(100);
      expect(spark.top).toBeGreaterThanOrEqual(0);
      expect(spark.top).toBeLessThanOrEqual(100);
    }
  });
});
