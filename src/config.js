(() => {
  "use strict";

  const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    blockShortsPages: true,
    removeShortsContent: true,
    removeShortsNavigation: true,
    forceVideoSearchFilter: true,
    showBlockedNotice: true
  });

  const SETTING_KEYS = Object.freeze(Object.keys(DEFAULT_SETTINGS));
  const STAT_KEYS = Object.freeze([
    "hiddenItems",
    "blockedNavigations",
    "searchFiltersApplied"
  ]);

  const REDIRECT_URL = "https://www.youtube.com/";
  const VIDEO_FILTER_SP = "EgIQAQ==";
  const STATS_STORAGE_KEY = "noShortsStats";
  const DIRECT_RULE_IDS = Object.freeze([1001]);

  function normalizeSettings(input = {}) {
    const normalized = { ...DEFAULT_SETTINGS };

    for (const key of SETTING_KEYS) {
      if (typeof input[key] === "boolean") {
        normalized[key] = input[key];
      }
    }

    return normalized;
  }

  function normalizeStats(input = {}) {
    const normalized = {
      hiddenItems: 0,
      blockedNavigations: 0,
      searchFiltersApplied: 0,
      updatedAt: null
    };

    for (const key of STAT_KEYS) {
      const value = Number(input[key]);
      normalized[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }

    normalized.updatedAt = typeof input.updatedAt === "string" ? input.updatedAt : null;
    return normalized;
  }

  function decodeValue(value) {
    let current = String(value || "").replace(/\s/g, "+");

    for (let index = 0; index < 3; index += 1) {
      try {
        const decoded = decodeURIComponent(current);
        if (decoded === current) {
          break;
        }
        current = decoded;
      } catch {
        break;
      }
    }

    return current;
  }

  function hasVideoSearchFilter(searchParams) {
    if (!searchParams) {
      return false;
    }

    const value = searchParams.get("sp");
    return decodeValue(value) === VIDEO_FILTER_SP;
  }

  function isYouTubeHost(hostname) {
    const host = String(hostname || "").toLowerCase();
    return host === "youtube.com" || host.endsWith(".youtube.com");
  }

  function pathSegments(pathname) {
    return String(pathname || "")
      .split("/")
      .map((segment) => {
        try {
          return decodeURIComponent(segment);
        } catch {
          return segment;
        }
      })
      .filter(Boolean);
  }

  function isShortsPath(pathname) {
    const segments = pathSegments(pathname).map((segment) => segment.toLowerCase());

    if (segments.length === 0) {
      return false;
    }

    if (segments[0] === "shorts") {
      return true;
    }

    return segments.includes("shorts");
  }

  function normalizeLabel(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function isVideosLabel(text) {
    const label = normalizeLabel(text);
    return label === "videos" || label === "video";
  }

  function isShortsLabel(text) {
    return normalizeLabel(text) === "shorts";
  }

  globalThis.NoShortsConfig = Object.freeze({
    DEFAULT_SETTINGS,
    DIRECT_RULE_IDS,
    REDIRECT_URL,
    SETTING_KEYS,
    STAT_KEYS,
    STATS_STORAGE_KEY,
    VIDEO_FILTER_SP,
    decodeValue,
    hasVideoSearchFilter,
    isShortsLabel,
    isShortsPath,
    isVideosLabel,
    isYouTubeHost,
    normalizeLabel,
    normalizeSettings,
    normalizeStats,
    pathSegments
  });
})();
