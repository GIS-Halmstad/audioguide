import type { ReactNode } from "react";
import Markdown from "react-markdown";

interface AudioguideMarkdownProps {
  children?: ReactNode;
}

const AudioguideMarkdown = ({ children }: AudioguideMarkdownProps) => (
  <Markdown
    components={{
      // We must add two CSS classes and a target="_system" to the links,
      // otherwise F7's router thinks that these MD links are routes inside
      // the app.
      a(p) {
        return (
          <a href={p.href} className="external link" target="_system">
            {p.children}
          </a>
        );
      },
    }}
  >
    {children}
  </Markdown>
);

export default AudioguideMarkdown;
