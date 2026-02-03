"use client";

import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function AdminBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
      <Link href="/admin/sections" className="hover:text-foreground transition-colors flex items-center gap-1">
        <BookOpen className="h-3.5 w-3.5" />
        Предметы
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
