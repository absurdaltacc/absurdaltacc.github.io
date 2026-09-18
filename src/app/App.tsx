import { lazy, Suspense, useEffect, useState } from "preact/compat";
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
import "../assets/styles/base/absent.css";

const GamesCatalog = lazy(loadGamesCatalog);
const AnimeCatalog = lazy(loadAnimeCatalog);
const NewTabModal = lazy(loadNewTabModal);
const SettingsModal = lazy(loadSettingsModal);

const hubCards = [
  { id: "games", label: "Games", detail: "Aetheris catalog", icon: "G", tone: "cyan" },
  { id: "anime", label: "Anime", detail: "Watch something", icon: "A", tone: "violet" },
  { id: "spotify", label: "Spotify", detail: "Find a track", icon: "S", tone: "green" },
  { id: "browser", label: "Browser", detail: "Open a private tab", icon: "B", tone: "blue" },
  { id: "cheats", label: "Cheats", detail: "Tools and utilities", icon: "C", tone: "orange" },
  { id: "ai", label: "AI", detail: "Ask and explore", icon: "✦", tone: "pink" },
  { id: "movies", label: "Movies", detail: "Watchlist and embeds", icon: "M", tone: "red" },
  { id: "settings", label: "Settings", detail: "Tune Absent", icon: "⚙", tone: "slate" },
];

const sectionLinks = [
  { id: "home", label: "Overview", icon: "⌂" },
  { id: "games", label: "Games", icon: "G" },
  { id: "anime", label: "Anime", icon: "A" },
  { id: "spotify", label: "Spotify", icon: "S" },
  { id: "browser", label: "Browser", icon: "B" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function App() {
  const [gamesMounted, setGamesMounted] = useState(false);
  const [animeMounted, setAnimeMounted] = useState(false);
  const [newTabMounted, setNewTabMounted] = useState(false);
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const showGames = () => {
      setGamesMounted(true);
      setActiveSection("games");
    };
    const showAnime = () => {
      setAnimeMounted(true);
      setActiveSection("anime");
    };
    const showNewTab = () => setNewTabMounted(true);
    const showSettings = () => {
      setSettingsMounted(true);
      setActiveSection("settings");
    };
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

  const openSection = (section: string) => {
    const runtimeWindow = window as typeof window & { showNewTabModal?: () => void };
    setActiveSection(section);
    if (section === "games") return window.showGameMenu?.();
    if (section === "anime") return window.showAnimeMenu?.();
    if (section === "settings") return window.toggleSettingsModal?.();
    if (section === "browser") return runtimeWindow.showNewTabModal?.();
    if (section === "spotify") return window.location.assign("/spotify.html");
    if (section === "search") return document.getElementById("searchInput")?.focus();
    if (["cheats", "ai", "movies", "about"].includes(section)) {
      (window.Tilt as any)?.handleSearch(`https://aetheris.win/#${section}`);
    }
  };

  return (
    <>
      <TopBar />
      <Sidebar />
      <div class="content-area absent-content">
        <NavBar />
        <main class="absent-hub" aria-label="Absent desktop">
          <aside class="absent-rail">
            <div class="absent-rail-brand"><AtomLogo size={28} /><span>ABSENT</span></div>
            <div class="absent-rail-rule" />
            <nav aria-label="Absent sections">
              {sectionLinks.map((link) => (
                <button class={activeSection === link.id ? "is-active" : ""} key={link.id} type="button" onClick={() => openSection(link.id)}>
                  <span>{link.icon}</span>{link.label}
                </button>
              ))}
            </nav>
            <div class="absent-rail-meta"><span class="status-dot" /> runtime ready</div>
          </aside>
          <section class="absent-workspace">
            <header class="absent-workspace-header">
              <div><span class="eyebrow">NEXUS / AETHERIS HYBRID</span><h1>Good evening, Absent.</h1></div>
              <button class="absent-command" type="button" onClick={() => openSection("search")}><span>⌕</span> command search <kbd>/</kbd></button>
            </header>
            <div class="absent-search"><SearchBar /></div>
            <div class="absent-status-line"><span>●</span> all systems nominal <b>·</b> aetheris catalog connected <b>·</b> private session</div>
            <section class="absent-card-grid" aria-label="Absent applications">
              {hubCards.map((card) => (
                <button class={`absent-card absent-card-${card.tone}`} key={card.id} type="button" onClick={() => card.id === "spotify" ? openSection("spotify") : openSection(card.id)}>
                  <span class="absent-card-icon">{card.icon}</span>
                  <span class="absent-card-copy"><strong>{card.label}</strong><small>{card.detail}</small></span>
                  <span class="absent-card-arrow">↗</span>
                </button>
              ))}
            </section>
            <section class="absent-lower-grid">
              <article class="absent-panel absent-panel-wide"><div class="panel-heading"><span>quick launch</span><button type="button" onClick={() => openSection("browser")}>new tab +</button></div><p>Private browsing, extensions, games, and media in one quiet workspace.</p><div class="panel-actions"><button type="button" onClick={() => openSection("browser")}>open browser</button><button type="button" onClick={() => openSection("games")}>browse games</button></div></article>
              <article class="absent-panel"><div class="panel-heading"><span>session</span><span class="panel-label">ABSNT / 01</span></div><div class="session-meter"><span style={{ width: "72%" }} /></div><p>Fast shell · proxy ready · sync idle</p></article>
            </section>
          </section>
        </main>
        <div id="iframe-container"><div id="iframe-resize-divider" /></div>
        <Footer />
      </div>
      {gamesMounted && <Suspense fallback={null}><GamesCatalog openOnMount /></Suspense>}
      {animeMounted && <Suspense fallback={null}><AnimeCatalog openOnMount /></Suspense>}
      {newTabMounted && <Suspense fallback={null}><NewTabModal openOnMount /></Suspense>}
      {settingsMounted && <Suspense fallback={null}><SettingsModal openOnMount /></Suspense>}
      <div id="overlay" class="overlay" />
    </>
  );
}
