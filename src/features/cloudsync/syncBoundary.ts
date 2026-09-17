import type { SyncSnapshot } from "./syncSnapshot.ts";

declare global {
  interface Window {
    tiltExportAllData?: () => Promise<SyncSnapshot>;
    tiltImportDataFromObject?: (
      data: unknown,
      callback?: (progressText: string) => void,
    ) => Promise<void>;
  }
}

window.tiltExportAllData = async () => {
  const { exportSyncSnapshot } = await import("./syncSnapshot.ts");
  return exportSyncSnapshot();
};
window.tiltImportDataFromObject = async (data, callback) => {
  const { importSyncSnapshot } = await import("./syncSnapshot.ts");
  return importSyncSnapshot(data, callback);
};
