import type { ComponentPropsWithRef, CSSProperties, ElementType, ReactNode } from "react";

type StarBorderOwnProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  color?: string;
  trailColor?: string;
  duration?: number;
  direction?: "clockwise" | "counterclockwise";
  stars?: number;
  trailLength?: number;
  thickness?: number;
  radius?: number;
  glow?: number;
  hover?: "lap" | "brighten" | "reveal" | "none";
  sparkle?: boolean;
  clickPulse?: boolean;
  theme?: "dark" | "light";
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  unstyled?: boolean;
  autoRadius?: boolean;
};

export type StarBorderProps<T extends ElementType = "button"> = StarBorderOwnProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof StarBorderOwnProps<T>>;

export default function StarBorder<T extends ElementType = "button">(props: StarBorderProps<T>): ReactNode;
