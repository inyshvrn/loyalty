"use client";

import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const FORMATS = [
  { format: "csv", label: "CSV" },
  { format: "xlsx", label: "Excel (XLSX)" },
  { format: "pdf", label: "PDF" },
];

export function ExportCustomersMenu({ q }: { q: string }) {
  const params = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" size="sm" variant="outline" />}>
        <Download className="size-4" />
        Export
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {FORMATS.map((f) => (
          <DropdownMenuItem
            key={f.format}
            render={
              <a
                href={`/api/admin/customers/export?format=${f.format}${params}`}
                download
              />
            }
          >
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
