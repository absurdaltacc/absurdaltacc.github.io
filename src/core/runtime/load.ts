import { attachSearchLight } from "../ui/searchLight.ts";
import { scheduleIdleTask } from "./scheduler.ts";
import { svgIcon } from "../ui/svgIcon.ts";
import { negativeMessage, positiveMessage } from "./messages.ts";
import {
  addUpdateMarker,
  buildStamp,
  clientBuildId,
  hasUpdateMarker,
  isUpdateApplied,
  isUpdateNeeded,
  parseStuffResponse,
  removeUpdateMarker,
} from "./updater.ts";

declare global {
  interface Window {
    tiltUpdater: {
      successEl: HTMLElement | null;
      overlay: HTMLElement | null;
      closeBtn: HTMLElement | null;
      init(): void;
      showSuccess(): void;
      hideSuccess(calledByOther: boolean): void;
      performUpdate(target?: string): Promise<void>;
      checkVersion(): Promise<void>;
      updating: boolean;
    };
    toggleSettingsModal?: () => void;
    hideBookmarkModal?: (calledByOther: boolean) => void;
    __tiltUpdatePollerStarted?: boolean;
    __tiltStuffData?: Promise<Record<string, unknown> | null>;
    __TILT_WEBRTC_TURN__?: unknown;
  }
}

try {
  (window as unknown as Record<string, unknown>)["folioReady"] =
    Promise.resolve();
} catch (e) {
  (window as unknown as Record<string, unknown>)["folioReady"] =
    Promise.resolve();
}

let _loadInitialized = false;
let _initialStuffDataUsed = false;

function fetchStuffData(): Promise<Record<string, unknown> | null> {
  return fetch("/api/stuff", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
}

function clearUpdateMarker(): void {
  const cleanHref = removeUpdateMarker(window.location.href);
  if (cleanHref !== window.location.href) {
    history.replaceState(history.state, "", cleanHref);
  }
}

export function initializeLoad(): void {
  if (_loadInitialized) return;
  _loadInitialized = true;

  {
    const search = window.location.search;
    if (search.startsWith("?=") && window.location.pathname === "/s") {
      const url = decodeURIComponent(search.slice(2));
      history.replaceState(null, "", "/");
      setTimeout(() => {
        (window as any).Tilt?.handleSearch(url);
      }, 100);
    }
  }

  scheduleIdleTask(() => {
    import("../../features/games/games.ts").then(
      async ({ fetchGameData, getGameDisplayLabel }) => {
        ((window as any).Tilt ??= {}).getGameDisplayLabel =
          getGameDisplayLabel;
        try {
          await fetchGameData();
        } catch {
          
          
        }
        const tab = (window as any).Tilt?.getActiveTab?.();
        if (tab?.iframe) {
          const { updateHistoryUI } = await import("../browser/iframe.ts");
          const { decodeUrl } = await import("./utils.ts");
          const decoded = decodeUrl(tab.iframe.dataset.manualUrl || tab.iframe.src);
          updateHistoryUI(tab as any, {
            currentUrl: decoded,
            canGoBack: tab.historyManager?.canGoBack?.() ?? false,
            canGoForward: tab.historyManager?.canGoForward?.() ?? false,
          });
        }
      },
    ).catch(() => {
      
    });
  }, 2000);

  document
    .querySelectorAll<HTMLElement>(".search-bar")
    .forEach(attachSearchLight);

  window.tiltUpdater = {
    successEl: null,
    overlay: document.getElementById("overlay"),
    closeBtn: null,
    updating: false,
    init() {
      this.successEl = document.getElementById("updateSuccess");
      if (!this.successEl) {
        this.successEl = document.createElement("div");
        this.successEl.id = "updateSuccess";
        document.body.appendChild(this.successEl);
        this.successEl.innerHTML = `
            ${svgIcon("IconCheckCircle2", { size: 44, style: "margin-bottom:15px" })}
            <label>${positiveMessage("update applied")}</label>
            <p>the current build is now running.</p>
            <button class="prompt-close-btn" id="updateSuccessClose">okay!!</button>
          `;
      }
      this.closeBtn = document.getElementById("updateSuccessClose");

      this.closeBtn?.addEventListener("click", () => this.hideSuccess(false));

      document.addEventListener("keydown", (e: KeyboardEvent) => {
        if (
          e.key === "Escape" &&
          this.successEl &&
          this.successEl.style.display === "block" &&
          !this.successEl.classList.contains("fade-out")
        ) {
          this.hideSuccess(false);
        }
      });
    },
    showSuccess() {
      this.overlay = document.getElementById("overlay");
      if (!this.successEl || !this.overlay) return;

      if (!this.overlay.dataset["tiltUpdateOverlayBound"]) {
        this.overlay.addEventListener("click", (e: MouseEvent) => {
          const activeOverlay = document.getElementById("overlay");
          if (!activeOverlay || e.target !== activeOverlay) return;
          if (document.getElementById("updateSuccess")?.style.display === "block") {
            window.tiltUpdater.hideSuccess(false);
          }
        });
        this.overlay.dataset["tiltUpdateOverlayBound"] = "true";
      }

      if (
        window.toggleSettingsModal &&
        document.getElementById("settings-modal")?.classList.contains("open")
      ) {
        window.toggleSettingsModal();
      }
      if (
        window.hideBookmarkModal &&
        (document.getElementById("bookmark-modal")?.classList.contains("modal-visible") ||
          document.getElementById("bookmark-modal")?.classList.contains("modal-closing"))
      ) {
        window.hideBookmarkModal(true);
      }

      this.overlay.classList.add("show");
      this.successEl.style.display = "block";
      this.successEl.classList.remove("fade-out");
    },
    hideSuccess(calledByOther: boolean) {
      if (!this.successEl || this.successEl.style.display === "none") return;

      this.successEl.classList.add("fade-out");
      this.successEl.addEventListener(
        "animationend",
        () => {
          this.successEl!.style.display = "none";
          this.successEl!.classList.remove("fade-out");

          if (calledByOther) return;

          this.overlay?.classList.remove("show");
        },
        { once: true },
      );
    },
    async performUpdate(target = localStorage.getItem("tiltVersionStamp") || "") {
      if (this.updating) return;
      this.updating = true;
      if (target) {
        localStorage.setItem("tiltUpdateTarget", target);
        localStorage.setItem("tiltUpdateAttempt", target);
      }

      try {
        if ("serviceWorker" in navigator) {
          const results = await Promise.all(
            (await navigator.serviceWorker.getRegistrations()).map((e) =>
              e.unregister(),
            ),
          );
          if (results.some((removed) => !removed)) {
            console.warn(
              negativeMessage(
                "automatic update could not unregister every service worker",
              ),
            );
          }
        }
      } catch (error) {
        console.error(
          negativeMessage("automatic update service-worker cleanup failed"),
          error,
        );
      }

      try {
        if ("caches" in window) {
          const results = await Promise.all(
            (await caches.keys()).map((key) => caches.delete(key)),
          );
          if (results.some((removed) => !removed)) {
            console.warn(
              negativeMessage("automatic update could not clear every cache"),
            );
          }
        }
      } catch (error) {
        console.error(
          negativeMessage("automatic update cache cleanup failed"),
          error,
        );
      }

      const navigationTarget = target || String(Date.now());
      location.replace(addUpdateMarker(location.href, navigationTarget));
    },
    async checkVersion() {
      try {
        const initialStuffData = !_initialStuffDataUsed
          ? window.__tiltStuffData
          : null;
        _initialStuffDataUsed = true;
        window.__tiltStuffData = initialStuffData || fetchStuffData();
        let serviceMetadata = await window.__tiltStuffData;
        if (!serviceMetadata && initialStuffData) {
          window.__tiltStuffData = fetchStuffData();
          serviceMetadata = await window.__tiltStuffData;
        }
        if (!serviceMetadata) return;
        if (serviceMetadata.turn) window.__TILT_WEBRTC_TURN__ = serviceMetadata.turn;
        const metadata = parseStuffResponse(serviceMetadata);
        const currentStamp = buildStamp(metadata);
        const prevStamp = localStorage.getItem("tiltVersionStamp");
        const prev = localStorage.getItem("tiltVersion");
        const pendingTarget = localStorage.getItem("tiltUpdateTarget");
        const attemptedTarget = localStorage.getItem("tiltUpdateAttempt");
        const legacyUpdate = localStorage.getItem("justUpdated") === "true";
        const applied = isUpdateApplied(
          metadata,
          clientBuildId,
          pendingTarget,
        );

        localStorage.setItem("tiltVersion", metadata.version);
        localStorage.setItem("tiltVersionStamp", currentStamp);

        if (
          applied ||
          (legacyUpdate &&
            Boolean(metadata.build && clientBuildId === metadata.build))
        ) {
          localStorage.removeItem("tiltUpdateTarget");
          localStorage.removeItem("tiltUpdateAttempt");
          localStorage.removeItem("justUpdated");
          clearUpdateMarker();
          this.showSuccess();
          return;
        }

        if (!isUpdateNeeded(metadata, clientBuildId, prevStamp, prev)) {
          localStorage.removeItem("tiltUpdateTarget");
          localStorage.removeItem("tiltUpdateAttempt");
          localStorage.removeItem("justUpdated");
          clearUpdateMarker();
          return;
        }

        if (attemptedTarget === currentStamp) {
          if (hasUpdateMarker(location.href, currentStamp)) {
            clearUpdateMarker();
            console.warn(
              negativeMessage("automatic update could not load the current build"),
            );
          }
          return;
        }

        await this.performUpdate(currentStamp);
      } catch (error) {
        console.warn(negativeMessage("version check failed"), error);
      }
    },
  };
  window.tiltUpdater.init();
  window.tiltUpdater.checkVersion();
  if (!window.__tiltUpdatePollerStarted) {
    window.__tiltUpdatePollerStarted = true;
    window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void window.tiltUpdater.checkVersion();
      }
    }, 5 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void window.tiltUpdater.checkVersion();
      }
    });
  }

}
