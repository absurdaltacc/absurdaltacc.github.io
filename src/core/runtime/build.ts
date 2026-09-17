declare const __TILT_BUILD_ID__: string;
declare const __TILT_RUNTIME_PATHS__: Record<string, string>;
declare const __TILT_WISP_PATH__: string;

export type RuntimeMount = "bmux" | "epoxy" | "libcurl";

export const clientBuildId =
  typeof __TILT_BUILD_ID__ === "string" ? __TILT_BUILD_ID__ : "";

export const wispPath =
  typeof __TILT_WISP_PATH__ === "string" ? __TILT_WISP_PATH__ : "/w/";

export function runtimeAssetPath(
  mount: RuntimeMount,
  fileName: string,
  buildId = clientBuildId,
): string {
  const relativeFileName = fileName.replace(/^\/+/, "");
  const logicalPath = `${mount}/${relativeFileName}`;
  if (typeof __TILT_RUNTIME_PATHS__ !== "undefined" && __TILT_RUNTIME_PATHS__[logicalPath]) {
    return __TILT_RUNTIME_PATHS__[logicalPath];
  }
  return buildId
    ? `/${mount}/${buildId}/${relativeFileName}`
    : `/${mount}/${relativeFileName}`;
}
