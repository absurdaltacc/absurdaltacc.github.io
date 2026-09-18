import { useCallback, useEffect } from "preact/hooks";
import { gamesViewSignal, animeViewSignal } from "../../core/ui/uiSignals.ts";
import { IconCloud, IconSettingsGear4 } from "../icons";
import { svgIcon } from "../../core/ui/svgIcon";
import { invokeWindowAction } from "../../core/browser/windowActions.ts";
import AtomLogo from "../icons/AtomLogo.tsx";
import { loadCloudSync, loadSettingsModal } from "../../app/loaders.ts";

export default function TopBar() {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    if (user.username) {
      const statusEl = document.getElementById("auth-status");
      if (statusEl) statusEl.textContent = user.username;
    }
    const choiIcon = document.getElementById("games-icon");
    if (choiIcon && !choiIcon.innerHTML) {
      choiIcon.innerHTML = svgIcon("IconGamecontroller", { solid: true });
    }
    const animeIcon = document.getElementById("anime-icon");
    if (animeIcon && !animeIcon.innerHTML) {
      animeIcon.innerHTML = svgIcon("IconSushi", { size: 22, solid: true });
    }
  }, []);

  const handleBrandClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    window.hideGameMenu?.();
    window.hideAnimeMenu?.();
  }, []);

  const handleGamesClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    invokeWindowAction("toggleGameMenu");
  }, []);

  const handleAnimeClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    invokeWindowAction("toggleAnimeMenu");
  }, []);

  const handleSettingsClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    invokeWindowAction("toggleSettingsModal");
  }, []);

  return (
    <>
      <div id="top-left-stuff">
        <div
          id="branding-container"
          class="icon-btn"
          onClick={handleBrandClick}
        >
          <AtomLogo size={26} />
          <span id="brand">Absent</span>
        </div>
        <button
          type="button"
          id="choi"
          class="icon-btn"
          data-tooltip={gamesViewSignal.value ? "search" : "games"}
          onClick={handleGamesClick}
        >
          <span id="games-icon" />
        </button>
        <button
          type="button"
          id="media-catalog"
          class="icon-btn"
          data-tooltip={animeViewSignal.value ? "search" : "anime"}
          onClick={handleAnimeClick}
        >
          <span id="anime-icon" />
        </button>
      </div>
      <div id="top-right-stuff">
        <div
          id="auth-container"
          class="text-icon-btn"
          onPointerEnter={() => void loadCloudSync()}
          onFocus={() => void loadCloudSync()}
          onClick={() =>
            document.dispatchEvent(new CustomEvent("toggleCloudSyncModal"))
          }
        >
          <IconCloud solid />
          <span id="auth-status">cloud sync</span>
        </div>
        <button
          type="button"
          id="settings"
          class="icon-btn"
          data-tooltip="settings"
          onPointerEnter={() => void loadSettingsModal()}
          onFocus={() => void loadSettingsModal()}
          onClick={handleSettingsClick}
        >
          <IconSettingsGear4 solid class="settings" />
        </button>
      </div>
    </>
  );
}
