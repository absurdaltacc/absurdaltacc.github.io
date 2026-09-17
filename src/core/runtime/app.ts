interface TiltAppSurface {
  handleSearch?: (
    query: string,
    gameName?: string | number,
    gameIcon?: string | null,
  ) => Promise<void> | void;
  getGameDisplayLabel?: (realUrl: string) => string | null;
}

export function app(): TiltAppSurface {
  return (window.Tilt ??= {}) as TiltAppSurface;
}
