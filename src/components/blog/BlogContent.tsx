import type { ReactNode } from "react";

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
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const nodes: ReactNode[] = [];

  blocks.forEach((block, index) => {
    if (block.startsWith("### ")) {
      nodes.push(<h3 key={index}>{renderInline(block.replace(/^### /, ""))}</h3>);
      return;
    }

    if (block.startsWith("## ")) {
      nodes.push(<h2 key={index}>{renderInline(block.replace(/^## /, ""))}</h2>);
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
