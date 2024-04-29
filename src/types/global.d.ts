import "vite/client";

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "swiper-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        navigation?: string;
        pagination?: boolean;
        "initial-slide"?: number;
        class?: string;
        "css-mode"?: string;
        "space-between"?: string;
      };
      "swiper-slide": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        key: number;
      };
    }
  }
}
