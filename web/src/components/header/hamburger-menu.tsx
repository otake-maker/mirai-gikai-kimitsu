"use client";

import { ExternalLink, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/site.config";
import type { NavLink } from "@/features/site-contents/shared/types";
import { RubyToggle } from "@/lib/rubyful";
import { TextSizeToggle } from "@/lib/text-size";

interface HamburgerMenuProps {
  links: NavLink[];
}

export function HamburgerMenu({ links }: HamburgerMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52" align="end">
        <nav className="flex flex-col">
          <ul className="flex flex-col divide-y divide-mirai-border">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block px-2 py-2.5 text-sm font-medium text-mirai-text hover:text-primary-accent transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="pt-3 mt-3 border-t border-mirai-border flex flex-col gap-3">
            <RubyToggle />
            <TextSizeToggle />
          </div>
          {siteConfig.externalLinks.taxMap && (
            <div className="pt-3 mt-3 border-t border-mirai-border">
              <a
                href={siteConfig.externalLinks.taxMap}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-2 text-sm text-mirai-text-secondary hover:text-primary-accent transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                税金の使い道マップ（外部サイト）
              </a>
            </div>
          )}
        </nav>
      </PopoverContent>
    </Popover>
  );
}
