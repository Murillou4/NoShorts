if (!globalThis.NoShortsConfig && typeof importScripts === "function") {
  importScripts("config.js");
}

const config = globalThis.NoShortsConfig;
const extensionApi = globalThis.browser || globalThis.chrome;

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function storageGet(area, keys) {
  return extensionApi.storage[area].get(keys);
}

function storageSet(area, values) {
  return extensionApi.storage[area].set(values);
}

async function getSettings() {
  const data = await storageGet("sync", config.DEFAULT_SETTINGS);
  return config.normalizeSettings(data);
}

async function getStats() {
  const data = await storageGet("local", config.STATS_STORAGE_KEY);
  return config.normalizeStats(data[config.STATS_STORAGE_KEY]);
}

function buildShortsRules(settings) {
  if (!settings.enabled || !settings.blockShortsPages) {
    return [];
  }

  return [
    {
      id: config.DIRECT_RULE_IDS[0],
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          url: config.REDIRECT_URL
        }
      },
      condition: {
        regexFilter: "^https?://([^/]+\\.)?youtube\\.com/([^?#]*/)?shorts([/?#]|$)",
        resourceTypes: ["main_frame"]
      }
    }
  ];
}

async function refreshNetworkRules() {
  const settings = await getSettings();
  const addRules = buildShortsRules(settings);

  await extensionApi.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [...config.DIRECT_RULE_IDS],
    addRules
  });

  await updateBadge(settings);
}

async function updateBadge(settings) {
  const badgeText = settings.enabled ? "ON" : "";
  const badgeColor = settings.enabled ? "#2f6f4e" : "#6b7280";

  await extensionApi.action.setBadgeText({ text: badgeText });
  await extensionApi.action.setBadgeBackgroundColor({ color: badgeColor });
}

async function initializeExtension() {
  const storedSettings = await storageGet("sync", null);
  const normalizedSettings = config.normalizeSettings(storedSettings || {});
  await storageSet("sync", normalizedSettings);

  const currentStats = await getStats();
  await storageSet("local", { [config.STATS_STORAGE_KEY]: currentStats });

  await refreshNetworkRules();
}

async function saveSettings(patch) {
  const current = await getSettings();
  const next = config.normalizeSettings({ ...current, ...(patch || {}) });
  await storageSet("sync", next);
  await refreshNetworkRules();
  return next;
}

async function incrementStats(increments) {
  const current = await getStats();

  for (const key of config.STAT_KEYS) {
    const increment = Number(increments?.[key] || 0);
    if (Number.isFinite(increment) && increment > 0) {
      current[key] += Math.floor(increment);
    }
  }

  current.updatedAt = new Date().toISOString();
  await storageSet("local", { [config.STATS_STORAGE_KEY]: current });
  return current;
}

async function resetStats() {
  const stats = config.normalizeStats();
  stats.updatedAt = new Date().toISOString();
  await storageSet("local", { [config.STATS_STORAGE_KEY]: stats });
  return stats;
}

async function handleMessage(message) {
  switch (message?.type) {
    case "noShorts:getState":
      return {
        settings: await getSettings(),
        stats: await getStats()
      };

    case "noShorts:saveSettings":
      return {
        settings: await saveSettings(message.settings || {}),
        stats: await getStats()
      };

    case "noShorts:incrementStats":
      return {
        stats: await incrementStats(message.increments || {})
      };

    case "noShorts:resetStats":
      return {
        stats: await resetStats()
      };

    default:
      return { ok: false };
  }
}

extensionApi.runtime.onInstalled.addListener(() => {
  initializeExtension().catch((error) => {
    console.warn("NoShorts initialization failed", error);
  });
});

extensionApi.runtime.onStartup.addListener(() => {
  refreshNetworkRules().catch((error) => {
    console.warn("NoShorts rule refresh failed", error);
  });
});

extensionApi.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  const settingChanged = config.SETTING_KEYS.some((key) => hasOwn(changes, key));
  if (!settingChanged) {
    return;
  }

  refreshNetworkRules().catch((error) => {
    console.warn("NoShorts rule refresh failed", error);
  });
});

extensionApi.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (globalThis.browser) {
    return handleMessage(message).catch((error) => {
      console.warn("NoShorts message failed", error);
      return { ok: false, error: String(error?.message || error) };
    });
  }

  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.warn("NoShorts message failed", error);
      sendResponse({ ok: false, error: String(error?.message || error) });
    });

  return true;
});
