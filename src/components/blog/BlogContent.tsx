import type { ReactNode } from "react";

export type BlogHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

function headingText(value: string) {
  return value
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function headingSlug(value: string) {
  return headingText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const ALLOWED_HTML_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "figcaption",
  "figure",
  "h2",
  "h3",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "ul",
]);

const ALLOWED_HTML_ATTRS = new Set([
  "alt",
  "aria-label",
  "class",
  "height",
  "href",
  "loading",
  "rel",
  "src",
  "target",
  "title",
  "width",
]);

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeUrl(value: string) {
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value.trim());
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta|base|svg|math)[\s\S]*?<\/\1>/gi,
      "",
    )
    .replace(
      /<\/?(script|style|iframe|object|embed|form|input|button|textarea|select|link|meta|base|svg|math)[^>]*>/gi,
      "",
    )
    .replace(/<\/?([a-z][a-z0-9-]*)(\s[^<>]*)?>/gi, (fullMatch, rawTag, rawAttrs = "") => {
      const tag = String(rawTag).toLowerCase();
      const isClosing = fullMatch.startsWith("</");

      if (!ALLOWED_HTML_TAGS.has(tag)) return "";
      if (isClosing) return `</${tag}>`;

      const attrs: string[] = [];
      String(rawAttrs).replace(
        /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>`=]+))/g,
        (_attrMatch, rawName, _rawValue, doubleQuoted, singleQuoted, unquoted) => {
          const name = String(rawName).toLowerCase();
          const value = String(doubleQuoted ?? singleQuoted ?? unquoted ?? "").trim();

          if (!ALLOWED_HTML_ATTRS.has(name)) return "";
          if (name.startsWith("on") || name === "style" || name === "srcdoc") return "";
          if ((name === "href" || name === "src") && !isSafeUrl(value)) return "";
          if (name === "target" && value !== "_blank") return "";
          if (name === "loading" && !["lazy", "eager"].includes(value)) return "";

          attrs.push(`${name}="${escapeHtmlAttribute(value)}"`);
          return "";
        },
      );

      if (tag === "a" && attrs.some((attr) => attr.startsWith('target="_blank"'))) {
        const hasRel = attrs.some((attr) => attr.startsWith("rel="));
        if (!hasRel) attrs.push('rel="noopener noreferrer"');
      }

      const suffix =
        fullMatch.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img" ? " /" : "";
      return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}${suffix}>`;
    });
}

function looksLikeHtml(block: string) {
  return /^<\/?[a-z][a-z0-9-]*(\s|>|\/>)/i.test(block.trim());
}

export function getBlogHeadings(content: string): BlogHeading[] {
  const counts = new Map<string, number>();

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => /^##{1,2} /.test(block))
    .map((block) => {
      const level = block.startsWith("### ") ? 3 : 2;
      const rawText = block.replace(/^##{1,2} /, "");
      const text = headingText(rawText);
      const baseId = headingSlug(text) || "apartado";
      const count = counts.get(baseId) ?? 0;
      counts.set(baseId, count + 1);

      return {
        id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        level,
        text,
      };
    });
}

function renderInline(text: string) {
  const parts = text.split(
    /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|(?:https?:\/\/[^\s]+)|(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}))/g,
  );
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    const markdownLink = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/);
    if (markdownLink) {
      return (
        <a key={index} href={markdownLink[2]}>
          {markdownLink[1]}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={index} href={part}>
          {part}
        </a>
      );
    }
    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(part)) {
      return (
        <a key={index} href={`mailto:${part}`}>
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function createList(items: string[], key: string) {
  return (
    <ul key={key}>
      {items.map((item, index) => (
        <li key={`${key}-${index}`}>{renderInline(item.replace(/^- /, ""))}</li>
      ))}
    </ul>
  );
}

function createOrderedList(items: string[], key: string) {
  return (
    <ol key={key}>
      {items.map((item, index) => (
        <li key={`${key}-${index}`}>{renderInline(item.replace(/^\d+\. /, ""))}</li>
      ))}
    </ol>
  );
}

export function BlogContent({ content }: { content: string }) {
  const headings = getBlogHeadings(content);
  let headingIndex = 0;
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const nodes: ReactNode[] = [];

  blocks.forEach((block, index) => {
    if (block.startsWith("### ")) {
      const heading = headings[headingIndex++];
      nodes.push(
        <h3 id={heading.id} key={index}>
          {renderInline(block.replace(/^### /, ""))}
        </h3>,
      );
      return;
    }

    if (block.startsWith("## ")) {
      const heading = headings[headingIndex++];
      nodes.push(
        <h2 id={heading.id} key={index}>
          {renderInline(block.replace(/^## /, ""))}
        </h2>,
      );
      return;
    }

    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const image = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+|\/[^)]+)\)$/);
    if (image) {
      nodes.push(
        <figure className="blog-content-image" key={index}>
          <img src={image[2]} alt={image[1]} loading="lazy" />
          {image[1] ? <figcaption>{image[1]}</figcaption> : null}
        </figure>,
      );
      return;
    }

    if (block.startsWith("> ")) {
      nodes.push(<blockquote key={index}>{renderInline(block.replace(/^> /, ""))}</blockquote>);
      return;
    }

    if (block.startsWith("```") && block.endsWith("```")) {
      nodes.push(
        <pre key={index}>
          <code>{block.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/\n?```$/, "")}</code>
        </pre>,
      );
      return;
    }

    if (looksLikeHtml(block)) {
      nodes.push(
        <div
          className="blog-html-block"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block) }}
          key={index}
        />,
      );
      return;
    }

    if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
      nodes.push(createList(lines, `list-${index}`));
      return;
    }

    if (lines.length > 0 && lines.every((line) => /^\d+\. /.test(line))) {
      nodes.push(createOrderedList(lines, `ordered-list-${index}`));
      return;
    }

    nodes.push(<p key={index}>{renderInline(block)}</p>);
  });

  return <>{nodes}</>;
}
