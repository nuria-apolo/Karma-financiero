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
    /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|mailto:)[^)]+\)|(?:https?:\/\/[^\s]+)|(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}))/g,
  );
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const markdownLink = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/);
    if (markdownLink) {
      return <a key={index} href={markdownLink[2]}>{markdownLink[1]}</a>;
    }
    if (/^https?:\/\//.test(part)) {
      return <a key={index} href={part}>{part}</a>;
    }
    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(part)) {
      return <a key={index} href={`mailto:${part}`}>{part}</a>;
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

    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
      nodes.push(createList(lines, `list-${index}`));
      return;
    }

    nodes.push(<p key={index}>{renderInline(block)}</p>);
  });

  return <>{nodes}</>;
}
