export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "swiper-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        navigation: string;
        pagination: boolean;
        class: string;
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
