import { lazy, Suspense, useEffect, useState } from "preact/compat";
import Sidebar from "../components/browser/Sidebar.tsx";
import NavBar from "../components/browser/NavBar.tsx";
import SearchBar from "../components/browser/SearchBar.tsx";
import Footer from "../components/layout/Footer.tsx";
import TopBar from "../components/browser/TopBar.tsx";
import AtomLogo from "../components/icons/AtomLogo.tsx";
import { loadAnimeCatalog, loadGamesCatalog, loadNewTabModal, loadSettingsModal } from "./loaders.ts";
import "../assets/styles/base/absent.css";

const GamesCatalog = lazy(loadGamesCatalog);
const AnimeCatalog = lazy(loadAnimeCatalog);
const NewTabModal = lazy(loadNewTabModal);
const SettingsModal = lazy(loadSettingsModal);

const apps = [
  ["games", "G", "games"],
  ["anime", "A", "anime"],
  ["spotify", "S", "spotify"],
  ["new tab", "+", "browser"],
  ["settings", "⚙", "settings"],
  ["guide", "?", "guide"],
  ["arcade", "Ω", "arcade"],
] as const;

export default function App() {
  const [gamesMounted, setGamesMounted] = useState(false);
  const [animeMounted, setAnimeMounted] = useState(false);
  const [newTabMounted, setNewTabMounted] = useState(false);
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(() => localStorage.getItem("absent-toolbar-open") !== "false");
  const [guideOpen, setGuideOpen] = useState(false);
  const [accent, setAccent] = useState(() => localStorage.getItem("absent-accent") || "silver");

  useEffect(() => {
    const showGames = () => setGamesMounted(true);
    const showAnime = () => setAnimeMounted(true);
    const showNewTab = () => setNewTabMounted(true);
    const showSettings = () => setSettingsMounted(true);
    const runtimeWindow = window as typeof window & { showNewTabModal?: () => void };
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
      if (runtimeWindow.showNewTabModal === showNewTab) delete runtimeWindow.showNewTabModal;
      if (window.toggleSettingsModal === showSettings) delete window.toggleSettingsModal;
    };
  }, []);

  const launch = (id: string) => {
    if (id === "games") return window.showGameMenu?.();
    if (id === "anime") return window.showAnimeMenu?.();
    if (id === "settings") return window.toggleSettingsModal?.();
    if (id === "browser") return (window as typeof window & { showNewTabModal?: () => void }).showNewTabModal?.();
    if (id === "spotify") return window.location.assign("/spotify.html");
    if (id === "guide") return setGuideOpen(true);
    if (id === "arcade") return window.location.assign("/arcade.html");
  };

  const changeAccent = (value: string) => {
    setAccent(value);
    localStorage.setItem("absent-accent", value);
  };

  return (
    <>
      <TopBar />
      <Sidebar />
      <div class="content-area absent-content">
        <NavBar />
        <main class={`absent-home accent-${accent}`}>
          <div class="absent-home-mark"><AtomLogo size={74} /></div>
          <div class="absent-wordmark">ABSENT <span>PRIVATE BROWSER</span></div>
          <SearchBar />
          <div class="absent-home-hint">search the web or enter a URL</div>
          <Footer />
          <div class="absent-toolbar-wrap">
            <button class="absent-hamburger" type="button" aria-expanded={toolbarOpen} onClick={() => { const next = !toolbarOpen; setToolbarOpen(next); localStorage.setItem("absent-toolbar-open", String(next)); }}>
              <span /><span /><span />
            </button>
            {toolbarOpen && <nav class="absent-apps" aria-label="apps">
              {apps.map(([label, icon, id]) => (
                <button type="button" class="absent-app" key={id} onClick={() => launch(id)}>
                  <span class="absent-app-icon">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>}
          </div>
          {guideOpen && <section class="absent-guide" aria-label="Absent customization guide">
            <div class="absent-guide-heading"><strong>Absent starter guide</strong><button type="button" onClick={() => setGuideOpen(false)}>close</button></div>
            <p>Keep the browser fast: use the search bar for URLs, open Games for the Aetheris catalog, and use Settings for transport, themes, cloaking, and extensions.</p>
            <div class="absent-accent-picker"><span>accent</span>{["silver", "cyan", "violet", "green"].map((option) => <button class={accent === option ? "active" : ""} type="button" key={option} onClick={() => changeAccent(option)}>{option}</button>)}</div>
          </section>}
        </main>
        <div id="iframe-container"><div id="iframe-resize-divider" /></div>
      </div>
      {gamesMounted && <Suspense fallback={null}><GamesCatalog openOnMount /></Suspense>}
      {animeMounted && <Suspense fallback={null}><AnimeCatalog openOnMount /></Suspense>}
      {newTabMounted && <Suspense fallback={null}><NewTabModal openOnMount /></Suspense>}
      {settingsMounted && <Suspense fallback={null}><SettingsModal openOnMount /></Suspense>}
      <div id="overlay" class="overlay" />
    </>
  );
}
