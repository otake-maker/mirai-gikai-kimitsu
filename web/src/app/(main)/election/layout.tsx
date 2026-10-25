import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site.config";

/**
 * 選挙特設ページを無効にしている場合は、配下のページをすべて 404 にする。
 */
export default function ElectionLayout({ children }: { children: ReactNode }) {
  if (!siteConfig.features.election) {
    notFound();
  }
  return children;
}
