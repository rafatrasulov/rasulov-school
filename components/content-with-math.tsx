"use client";

import { MathInline } from "@/components/ui/math";
import { MathBlock } from "@/components/ui/math";

export function ContentWithMath({ content }: { content: string }) {
  const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g);
  return (
    <span className="contents">
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <MathBlock key={i} math={part.slice(2, -2).trim()} className="my-2" />;
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          return <MathInline key={i} math={part.slice(1, -1).trim()} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
