(() => {
  "use strict";

  const config = globalThis.NoShortsConfig;
  if (!config) {
    return;
  }

  const CONTENT_SELECTORS = [
    "ytd-shorts",
    "ytd-reel-video-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-shorts-shelf-renderer",
    "yt-reel-player-overlay-view-model",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2",
    "grid-shelf-view-model:has(a[href*=\"/shorts\"])",
    "ytd-rich-section-renderer:has(a[href*=\"/shorts\"])",
    "ytd-rich-item-renderer:has(a[href*=\"/shorts\"])",
    "ytd-rich-grid-media:has(a[href*=\"/shorts\"])",
    "ytd-video-renderer:has(a[href*=\"/shorts\"])",
    "ytd-grid-video-renderer:has(a[href*=\"/shorts\"])",
    "ytd-compact-video-renderer:has(a[href*=\"/shorts\"])",
    "ytd-playlist-video-renderer:has(a[href*=\"/shorts\"])",
    "ytd-shelf-renderer:has(a[href*=\"/shorts\"])",
    "yt-horizontal-list-renderer:has(a[href*=\"/shorts\"])",
    "yt-lockup-view-model:has(a[href*=\"/shorts\"])",
    "ytm-video-with-context-renderer:has(a[href*=\"/shorts\"])",
    "ytm-rich-item-renderer:has(a[href*=\"/shorts\"])",
    "ytm-reel-item-renderer"
  ];

  const NAVIGATION_SELECTORS = [
    "ytd-mini-guide-entry-renderer:has(a[href^=\"/shorts\"])",
    "ytd-guide-entry-renderer:has(a[href^=\"/shorts\"])",
    "tp-yt-paper-item:has(a[href^=\"/shorts\"])",
    "ytm-pivot-bar-item-renderer:has(a[href^=\"/shorts\"])",
    "a[title=\"Shorts\"][href^=\"/shorts\"]",
    "a[aria-label=\"Shorts\"][href^=\"/shorts\"]"
  ];

  const CONTENT_TARGET_SELECTOR = [
    "grid-shelf-view-model",
    "ytm-shorts-lockup-view-model-v2",
    "ytm-shorts-lockup-view-model",
    "ytd-rich-section-renderer",
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-playlist-video-renderer",
    "ytd-shelf-renderer",
    "yt-horizontal-list-renderer",
    "yt-lockup-view-model",
    "ytm-video-with-context-renderer",
    "ytm-rich-item-renderer",
    "ytm-reel-item-renderer"
  ].join(",");

  const NAVIGATION_TARGET_SELECTOR = [
    "ytd-mini-guide-entry-renderer",
    "ytd-guide-entry-renderer",
    "tp-yt-paper-item",
    "ytm-pivot-bar-item-renderer",
    "yt-tab-shape",
    "tp-yt-paper-tab",
    "yt-chip-cloud-chip-renderer"
  ].join(",");

  const STYLE_TEXT = `
html.no-shorts-hide-content ytd-shorts,
html.no-shorts-hide-content ytd-reel-video-renderer,
html.no-shorts-hide-content ytd-reel-shelf-renderer,
html.no-shorts-hide-content ytd-shorts-shelf-renderer,
html.no-shorts-hide-content ytm-shorts-lockup-view-model,
html.no-shorts-hide-content ytm-shorts-lockup-view-model-v2,
html.no-shorts-hide-content grid-shelf-view-model:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-rich-section-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-rich-item-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-rich-grid-media:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-video-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-grid-video-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-compact-video-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-playlist-video-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content ytd-shelf-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content yt-horizontal-list-renderer:has(a[href*="/shorts"]),
html.no-shorts-hide-content yt-lockup-view-model:has(a[href*="/shorts"]),
html.no-shorts-hide-nav ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]),
html.no-shorts-hide-nav ytd-guide-entry-renderer:has(a[href^="/shorts"]),
html.no-shorts-hide-nav tp-yt-paper-item:has(a[href^="/shorts"]),
html.no-shorts-hide-nav ytm-pivot-bar-item-renderer:has(a[href^="/shorts"]),
html.no-shorts-hide-nav a[title="Shorts"][href^="/shorts"],
html.no-shorts-hide-nav a[aria-label="Shorts"][href^="/shorts"] {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.no-shorts-blocked-toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483647;
  max-width: min(320px, calc(100vw - 36px));
  padding: 12px 14px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 8px;
  background: #ffffff;
  color: #18202f;
  box-shadow: 0 16px 40px rgba(17, 24, 39, 0.16);
  font: 500 13px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 160ms ease, transform 160ms ease;
}

.no-shorts-blocked-toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .no-shorts-blocked-toast {
    transition: none;
  }
}`;

  const state = {
    settings: config.normalizeSettings(),
    observer: null,
    styleElement: null,
    cleanupTimer: 0,
    filterFallbackTimer: 0,
    lastUrl: location.href,
    lastFilterAttemptKey: "",
    lastFilterAttemptAt: 0,
    statBuffer: Object.create(null),
    statTimer: 0
  };

  function getExtensionApi() {
    return globalThis.browser || globalThis.chrome || null;
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function storageGet(area, keys) {
    const api = getExtensionApi();
    if (!api?.storage?.[area]) {
      return Promise.resolve(null);
    }

    if (globalThis.browser) {
      return api.storage[area].get(keys);
    }

    return new Promise((resolve) => {
      api.storage[area].get(keys, resolve);
    });
  }

  function sendRuntimeMessage(message) {
    const api = getExtensionApi();
    if (!api?.runtime?.sendMessage) {
      return Promise.resolve(null);
    }

    return api.runtime.sendMessage(message);
  }

  function ensureStyle() {
    if (state.styleElement || !document.documentElement) {
      return;
    }

    state.styleElement = document.createElement("style");
    state.styleElement.id = "no-shorts-style";
    state.styleElement.textContent = STYLE_TEXT;
    document.documentElement.appendChild(state.styleElement);
  }

  function applySettings(settings) {
    state.settings = config.normalizeSettings(settings);
    ensureStyle();

    const root = document.documentElement;
    if (!root) {
      return;
    }

    const active = state.settings.enabled;
    root.classList.toggle("no-shorts-active", active);
    root.classList.toggle("no-shorts-hide-content", active && state.settings.removeShortsContent);
    root.classList.toggle("no-shorts-hide-nav", active && state.settings.removeShortsNavigation);

    reconcileHiddenElements();
  }

  function readSettings() {
    return storageGet("sync", config.DEFAULT_SETTINGS).then((data) => {
      return config.normalizeSettings(data || {});
    });
  }

  function setupStorageListener() {
    const api = getExtensionApi();
    if (!api?.storage?.onChanged) {
      return;
    }

    api.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "sync") {
        return;
      }

      const changed = config.SETTING_KEYS.some((key) => hasOwn(changes, key));
      if (!changed) {
        return;
      }

      readSettings().then((settings) => {
        applySettings(settings);
        scheduleCleanup("settings");
      });
    });
  }

  function queueStat(key, amount) {
    if (!config.STAT_KEYS.includes(key) || amount <= 0) {
      return;
    }

    state.statBuffer[key] = (state.statBuffer[key] || 0) + amount;

    if (state.statTimer) {
      return;
    }

    state.statTimer = window.setTimeout(() => {
      const increments = { ...state.statBuffer };
      state.statBuffer = Object.create(null);
      state.statTimer = 0;

      sendRuntimeMessage({
        type: "noShorts:incrementStats",
        increments
      }).catch(() => {});
    }, 600);
  }

  function isActive() {
    return state.settings.enabled;
  }

  function toUrl(href) {
    try {
      return new URL(href, location.origin);
    } catch {
      return null;
    }
  }

  function isShortsUrl(url) {
    return Boolean(url && config.isYouTubeHost(url.hostname) && config.isShortsPath(url.pathname));
  }

  function getRedirectUrl(url) {
    const segments = config.pathSegments(url.pathname);
    const lowerSegments = segments.map((segment) => segment.toLowerCase());
    const last = lowerSegments.at(-1);

    if (last === "shorts") {
      if (segments[0]?.startsWith("@") && segments.length === 2) {
        return `${url.origin}/${segments[0]}/videos`;
      }

      if (["channel", "c", "user"].includes(lowerSegments[0]) && segments.length >= 3) {
        return `${url.origin}/${segments.slice(0, -1).join("/")}/videos`;
      }
    }

    return config.REDIRECT_URL;
  }

  function redirectIfBlockedPage() {
    if (!isActive() || !state.settings.blockShortsPages) {
      return false;
    }

    const current = toUrl(location.href);
    if (!isShortsUrl(current)) {
      return false;
    }

    queueStat("blockedNavigations", 1);
    showBlockedNotice("Shorts bloqueado pelo NoShorts.");
    location.replace(getRedirectUrl(current));
    return true;
  }

  function enforceVideoSearchFilter() {
    if (!isActive() || !state.settings.forceVideoSearchFilter) {
      return;
    }

    const current = toUrl(location.href);
    if (!current || !config.isYouTubeHost(current.hostname) || current.pathname !== "/results") {
      return;
    }

    if (!current.searchParams.has("search_query")) {
      return;
    }

    if (config.hasVideoSearchFilter(current.searchParams)) {
      syncVideoChipVisualState();
      return;
    }

    const chip = findVideosChip();
    if (chip) {
      if (isChipSelected(chip)) {
        return;
      }

      const attemptKey = `${current.pathname}?search_query=${current.searchParams.get("search_query") || ""}`;
      const canRetry = Date.now() - state.lastFilterAttemptAt > 4000;
      if (state.lastFilterAttemptKey !== attemptKey || canRetry) {
        state.lastFilterAttemptKey = attemptKey;
        state.lastFilterAttemptAt = Date.now();
        clickChip(chip);
        queueStat("searchFiltersApplied", 1);

        window.clearTimeout(state.filterFallbackTimer);
        state.filterFallbackTimer = window.setTimeout(() => {
          const updatedChip = findVideosChip();
          if (!updatedChip || !isChipSelected(updatedChip)) {
            applySpFallback();
          }
        }, 1800);
      }
      return;
    }

    applySpFallback();
  }

  function applySpFallback() {
    const current = toUrl(location.href);
    if (!current || current.pathname !== "/results" || !current.searchParams.has("search_query")) {
      return;
    }

    if (config.hasVideoSearchFilter(current.searchParams)) {
      return;
    }

    current.searchParams.set("sp", config.VIDEO_FILTER_SP);
    queueStat("searchFiltersApplied", 1);
    location.replace(current.toString());
  }

  function syncVideoChipVisualState() {
    const current = toUrl(location.href);
    if (!current || current.pathname !== "/results" || !config.hasVideoSearchFilter(current.searchParams)) {
      return;
    }

    const chips = [...document.querySelectorAll("yt-chip-cloud-chip-renderer")];
    const videosChip = chips.find((chip) => config.isVideosLabel(getElementText(chip)));
    if (!videosChip) {
      return;
    }

    for (const chip of chips) {
      const isVideos = config.isVideosLabel(getElementText(chip));
      setChipSelected(chip, isVideos);
    }
  }

  function findVideosChip() {
    const chips = document.querySelectorAll("yt-chip-cloud-chip-renderer");
    for (const chip of chips) {
      const label = getElementText(chip);
      if (config.isVideosLabel(label)) {
        return chip;
      }
    }
    return null;
  }

  function isChipSelected(chip) {
    return (
      chip.hasAttribute("selected") ||
      chip.classList.contains("iron-selected") ||
      chip.getAttribute("aria-selected") === "true" ||
      Boolean(chip.querySelector('[aria-selected="true"], [selected]'))
    );
  }

  function clickChip(chip) {
    const target = chip.querySelector("button, a, chip-shape, #chip-shape-container") || chip;
    target.click();
  }

  function setChipSelected(chip, selected) {
    const button = chip.querySelector('button[role="tab"], button');
    const shape = chip.querySelector(".ytChipShapeChip");

    chip.classList.toggle("iron-selected", selected);
    if (selected) {
      chip.setAttribute("selected", "");
    } else {
      chip.removeAttribute("selected");
    }

    if (button) {
      button.setAttribute("aria-selected", selected ? "true" : "false");
    }

    if (shape) {
      shape.classList.toggle("ytChipShapeActive", selected);
      shape.classList.toggle("ytChipShapeInactive", !selected);
    }
  }

  function getElementText(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function cleanShortsDom() {
    if (!isActive() || !document.documentElement) {
      return;
    }

    let hidden = 0;

    if (state.settings.removeShortsContent) {
      hidden += hideBySelectors(CONTENT_SELECTORS, "content");
      hidden += hideShortsAnchors();
    }

    if (state.settings.removeShortsNavigation) {
      hidden += hideBySelectors(NAVIGATION_SELECTORS, "navigation");
      hidden += hideShortsNavigationByText();
      hidden += hideShortsSearchChips();
    }

    if (hidden > 0) {
      queueStat("hiddenItems", hidden);
    }
  }

  function hideBySelectors(selectors, reason) {
    let hidden = 0;

    for (const selector of selectors) {
      let nodes = [];
      try {
        nodes = document.querySelectorAll(selector);
      } catch {
        continue;
      }

      for (const node of nodes) {
        hidden += hideElement(node, reason);
      }
    }

    return hidden;
  }

  function hideShortsAnchors() {
    let hidden = 0;
    const anchors = document.querySelectorAll('a[href*="/shorts"]');

    for (const anchor of anchors) {
      const url = toUrl(anchor.getAttribute("href") || anchor.href);
      if (!isShortsUrl(url)) {
        continue;
      }

      const navTarget = anchor.closest(NAVIGATION_TARGET_SELECTOR);
      if (navTarget && state.settings.removeShortsNavigation) {
        hidden += hideElement(navTarget, "navigation");
        continue;
      }

      const target = anchor.closest(CONTENT_TARGET_SELECTOR);
      if (target) {
        hidden += hideElement(target, "content");
      }
    }

    return hidden;
  }

  function hideShortsNavigationByText() {
    let hidden = 0;
    const candidates = document.querySelectorAll(NAVIGATION_TARGET_SELECTOR);

    for (const node of candidates) {
      if (config.isShortsLabel(getElementText(node))) {
        hidden += hideElement(node, "navigation");
      }
    }

    return hidden;
  }

  function hideShortsSearchChips() {
    let hidden = 0;
    const chips = document.querySelectorAll("yt-chip-cloud-chip-renderer");

    for (const chip of chips) {
      if (config.isShortsLabel(getElementText(chip))) {
        hidden += hideElement(chip, "navigation");
      }
    }

    return hidden;
  }

  function hideElement(element, reason) {
    if (!(element instanceof Element)) {
      return 0;
    }

    if (element.dataset.noShortsHidden === "true") {
      return 0;
    }

    element.dataset.noShortsHidden = "true";
    element.dataset.noShortsReason = reason;
    element.setAttribute("aria-hidden", "true");
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("pointer-events", "none", "important");
    return 1;
  }

  function reconcileHiddenElements() {
    const nodes = document.querySelectorAll('[data-no-shorts-hidden="true"]');
    const contentActive = state.settings.enabled && state.settings.removeShortsContent;
    const navigationActive = state.settings.enabled && state.settings.removeShortsNavigation;

    for (const node of nodes) {
      const reason = node.dataset.noShortsReason;
      const shouldRemainHidden =
        (reason === "content" && contentActive) ||
        (reason === "navigation" && navigationActive);

      if (!shouldRemainHidden) {
        restoreElement(node);
      }
    }
  }

  function restoreElement(element) {
    element.style.removeProperty("display");
    element.style.removeProperty("visibility");
    element.style.removeProperty("pointer-events");
    element.removeAttribute("aria-hidden");
    delete element.dataset.noShortsHidden;
    delete element.dataset.noShortsReason;
  }

  function interceptShortsClicks(event) {
    if (!isActive() || !state.settings.blockShortsPages) {
      return;
    }

    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const anchor = target?.closest?.("a[href]");
    if (!anchor) {
      return;
    }

    const url = toUrl(anchor.getAttribute("href") || anchor.href);
    if (!isShortsUrl(url)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    queueStat("blockedNavigations", 1);
    showBlockedNotice("Shorts bloqueado pelo NoShorts.");
    location.assign(getRedirectUrl(url));
  }

  function showBlockedNotice(message) {
    if (!state.settings.showBlockedNotice || !document.documentElement) {
      return;
    }

    const oldNotice = document.querySelector(".no-shorts-blocked-toast");
    oldNotice?.remove();

    const notice = document.createElement("div");
    notice.className = "no-shorts-blocked-toast";
    notice.textContent = message;
    document.documentElement.appendChild(notice);

    requestAnimationFrame(() => {
      notice.classList.add("is-visible");
    });

    window.setTimeout(() => {
      notice.classList.remove("is-visible");
      window.setTimeout(() => notice.remove(), 180);
    }, 1800);
  }

  function runGuards() {
    if (redirectIfBlockedPage()) {
      return;
    }

    enforceVideoSearchFilter();
    cleanShortsDom();
  }

  function scheduleCleanup(_reason) {
    window.clearTimeout(state.cleanupTimer);
    state.cleanupTimer = window.setTimeout(runGuards, 80);
  }

  function setupMutationObserver() {
    if (state.observer || !document.documentElement) {
      return;
    }

    state.observer = new MutationObserver(() => {
      scheduleCleanup("mutation");
    });

    state.observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function onNavigation() {
    if (state.lastUrl !== location.href) {
      state.lastUrl = location.href;
      state.lastFilterAttemptKey = "";
    }
    scheduleCleanup("navigation");
  }

  function setupNavigationListeners() {
    window.addEventListener("yt-navigate-start", onNavigation, true);
    window.addEventListener("yt-navigate-finish", onNavigation, true);
    window.addEventListener("yt-page-data-updated", onNavigation, true);
    window.addEventListener("popstate", onNavigation, true);

    window.setInterval(() => {
      if (state.lastUrl !== location.href) {
        onNavigation();
      }
    }, 1000);
  }

  function start() {
    ensureStyle();
    applySettings(state.settings);
    document.addEventListener("click", interceptShortsClicks, true);
    setupMutationObserver();
    setupNavigationListeners();
    setupStorageListener();

    readSettings().then((settings) => {
      applySettings(settings);
      scheduleCleanup("initial");
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => scheduleCleanup("dom-ready"), { once: true });
    } else {
      scheduleCleanup("ready");
    }
  }

  start();
})();
