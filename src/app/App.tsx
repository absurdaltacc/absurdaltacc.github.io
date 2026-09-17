import {
  useEffect,
  lazy,
  Suspense,
  useState,
} from "preact/compat";
import Sidebar from "../components/browser/Sidebar.tsx";
import NavBar from "../components/browser/NavBar.tsx";
import SearchBar from "../components/browser/SearchBar.tsx";
import Footer from "../components/layout/Footer.tsx";
import TopBar from "../components/browser/TopBar.tsx";
import AtomLogo from "../components/icons/AtomLogo.tsx";
import {
  loadAnimeCatalog,
  loadGamesCatalog,
  loadNewTabModal,
  loadSettingsModal,
} from "./loaders.ts";

const GamesCatalog = lazy(loadGamesCatalog);
const AnimeCatalog = lazy(loadAnimeCatalog);
const NewTabModal = lazy(loadNewTabModal);
const SettingsModal = lazy(loadSettingsModal);

const desktopApps = [
  { name: "spotify", href: "/spotify.html", icon: "♪" },
  { name: "games", href: "#", icon: "▣" },
  { name: "anime", href: "#", icon: "◌" },
  { name: "ps5", href: "/ps5.html", icon: "△" },
  { name: "roblox", href: "https://www.roblox.com/", icon: "R" },
];

const aetherisSections = [
  { name: "games", icon: "▦" },
  { name: "cheats", icon: "⌘" },
  { name: "search", icon: "⌕" },
  { name: "chat", icon: "☷" },
  { name: "ai", icon: "✦" },
  { name: "movies", icon: "▶" },
  { name: "settings", icon: "⚙" },
  { name: "about", icon: "ⓘ" },
];

export default function App() {
  const [gamesMounted, setGamesMounted] = useState(false);
  const [animeMounted, setAnimeMounted] = useState(false);
  const [newTabMounted, setNewTabMounted] = useState(false);
  const [settingsMounted, setSettingsMounted] = useState(false);
  useEffect(() => {
    const showGames = () => setGamesMounted(true);
    const showAnime = () => setAnimeMounted(true);
    const showNewTab = () => {
      setNewTabMounted(true);
    };
    const showSettings = () => {
      setSettingsMounted(true);
    };
    const runtimeWindow = window as typeof window & {
      showNewTabModal?: () => void;
    };

    window.showGameMenu = showGames;
    window.toggleGameMenu = showGames;
    window.showAnimeMenu = showAnime;
    window.toggleAnimeMenu = showAnime;
    runtimeWindow.showNewTabModal = showNewTab;
    window.toggleSettingsModal = showSettings;

    return () => {
      if (window.showGameMenu === showGames) delete window.showGameMenu;
      if (window.toggleGameMenu === showGames) delete window.toggleGameMenu;
      if (window.showAnimeMenu === showAnime) delete window.showAnimeMenu;
      if (window.toggleAnimeMenu === showAnime) delete window.toggleAnimeMenu;
      if (runtimeWindow.showNewTabModal === showNewTab) {
        delete runtimeWindow.showNewTabModal;
      }
      if (window.toggleSettingsModal === showSettings) {
        delete window.toggleSettingsModal;
      }
    };
  }, []);

  const handleSectionClick = (name: string) => {
    if (name === "games") {
      window.showGameMenu?.();
      return;
    }
    if (name === "settings") {
      window.toggleSettingsModal?.();
      return;
    }
    if (name === "search") {
      document.getElementById("searchInput")?.focus();
      return;
    }
    const target = `https://aetheris.win/#${name}`;
    (window.Tilt as any)?.handleSearch(target);
  };

  return (
    <>
      <TopBar />
      <Sidebar />
      <div class="content-area">
        <NavBar />
        <div class="main-container">
          <div class="title tilt-title">
            <AtomLogo size={88} />
          </div>
          <SearchBar />
          <div class="desktop-launch-row" aria-label="desktop app shortcuts">
            {desktopApps.map((app) => (
              <a
                key={app.name}
                class="desktop-app-tile"
                href={app.href}
                target={app.href.startsWith("http") ? "_blank" : undefined}
                rel={app.href.startsWith("http") ? "noreferrer noopener" : undefined}
                onClick={(event) => {
                  if (app.name === "games") {
                    event.preventDefault();
                    window.showGameMenu?.();
                  }
                  if (app.name === "anime") {
                    event.preventDefault();
                    window.showAnimeMenu?.();
                  }
                }}
              >
                <span class="desktop-app-icon">{app.icon}</span>
                <span>{app.name}</span>
              </a>
            ))}
          </div>
          <nav class="aetheris-section-rail" aria-label="Aetheris sections">
            {aetherisSections.map((section) => (
              <button
                key={section.name}
                type="button"
                class="aetheris-section-tile"
                onClick={() => handleSectionClick(section.name)}
              >
                <span class="aetheris-section-icon" aria-hidden="true">
                  {section.icon}
                </span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>
        {gamesMounted && (
          <Suspense fallback={null}>
            <GamesCatalog openOnMount />
          </Suspense>
        )}
        {animeMounted && (
          <Suspense fallback={null}>
            <AnimeCatalog openOnMount />
          </Suspense>
        )}
        <div id="iframe-container">
          <div id="iframe-resize-divider"></div>
        </div>
        <Footer />
      </div>
      {newTabMounted && (
        <Suspense fallback={null}>
          <NewTabModal openOnMount />
        </Suspense>
      )}
      {settingsMounted && (
        <Suspense fallback={null}>
          <SettingsModal openOnMount />
        </Suspense>
      )}
      <div id="overlay" class="overlay" />
    </>
  );
}
