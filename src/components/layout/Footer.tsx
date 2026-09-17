import { useEffect, useState } from "preact/hooks";

const FOOTER_MESSAGES = [
  "isaac 2 tuff",
  "brooklyn be good",
  "kevin lock in bro",
  "update at october first !!",
  "i hae jennifer",
  "besto friendo!",
];

export default function Footer() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % FOOTER_MESSAGES.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div class="footer">
      <div id="cute">
        <a class="link" href="https://discord.gg/4GeWaGPh6c" target="_blank">discord</a>
        <a class="link" href="https://github.com/gayq/lyra" target="_blank">upstream</a>
        <span class="revolving-footer-text" aria-live="polite" aria-atomic="true">
          {FOOTER_MESSAGES[messageIndex]}
        </span>
      </div>
    </div>
  );
}
