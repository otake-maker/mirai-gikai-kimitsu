import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { getAvailableContents } from "@/features/site-contents/server/loaders/get-available-contents";
import { buildNavLinks } from "@/features/site-contents/shared/utils/build-nav-links";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [difficultyLevel, availableContents] = await Promise.all([
    getDifficultyLevel(),
    getAvailableContents(),
  ]);
  return (
    <HeaderClient
      difficultyLevel={difficultyLevel}
      navLinks={buildNavLinks(availableContents)}
    />
  );
}
