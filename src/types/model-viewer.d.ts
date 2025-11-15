import type React from "react";

interface ModelViewerAttributes extends React.HTMLAttributes<HTMLElement> {
  src?: string;
  poster?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "rotation-per-second"?: string;
  exposure?: string | number;
  "environment-image"?: string;
  "shadow-intensity"?: string | number;
  "disable-zoom"?: boolean;
  "field-of-view"?: string;
  "interaction-prompt"?: string;
  "touch-action"?: string;
}

type ModelViewerElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  ModelViewerAttributes;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }

  namespace React.JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElementProps;
    }
  }
}

export {};
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        poster?: string;
        alt?: string;
        ar?: boolean | "auto";
        "ar-modes"?: string;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "rotation-per-second"?: string;
        "shadow-intensity"?: number | string;
        "environment-image"?: string;
        exposure?: number | string;
        "disable-zoom"?: boolean;
        "field-of-view"?: string;
        "interaction-prompt"?: string;
        "touch-action"?: string;
        onLoad?: (event: Event) => void;
        onError?: (event: Event) => void;
      };
    }
  }
}

export {};
