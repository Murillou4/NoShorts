(() => {
  "use strict";

  const config = globalThis.NoShortsConfig;
  const toggleIds = ["enabled", "forceVideoSearchFilter", "blockShortsPages"];
  const elements = {};
  const extensionApi = globalThis.browser || globalThis.chrome;

  function sendMessage(message) {
    return extensionApi.runtime.sendMessage(message);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR").format(Number(value || 0));
  }

  function collectElements() {
    for (const id of toggleIds) {
      elements[id] = document.getElementById(id);
    }

    elements.statusText = document.getElementById("statusText");
    elements.hiddenItems = document.getElementById("hiddenItems");
    elements.blockedNavigations = document.getElementById("blockedNavigations");
    elements.openOptions = document.getElementById("openOptions");
    elements.resetStats = document.getElementById("resetStats");
  }

  function render(settings, stats) {
    const normalizedSettings = config.normalizeSettings(settings);
    const normalizedStats = config.normalizeStats(stats);

    for (const id of toggleIds) {
      elements[id].checked = Boolean(normalizedSettings[id]);
    }

    elements.statusText.textContent = normalizedSettings.enabled ? "Ativo no YouTube" : "Desativado";
    elements.hiddenItems.textContent = formatNumber(normalizedStats.hiddenItems);
    elements.blockedNavigations.textContent = formatNumber(normalizedStats.blockedNavigations);
  }

  async function refresh() {
    const state = await sendMessage({ type: "noShorts:getState" });
    render(state.settings, state.stats);
  }

  async function saveToggle(id, checked) {
    const state = await sendMessage({
      type: "noShorts:saveSettings",
      settings: { [id]: checked }
    });
    render(state.settings, state.stats);
  }

  function bindEvents() {
    for (const id of toggleIds) {
      elements[id].addEventListener("change", (event) => {
        saveToggle(id, event.currentTarget.checked).catch(showError);
      });
    }

    elements.openOptions.addEventListener("click", () => {
      extensionApi.runtime.openOptionsPage();
    });

    elements.resetStats.addEventListener("click", async () => {
      const state = await sendMessage({ type: "noShorts:resetStats" });
      render(config.DEFAULT_SETTINGS, state.stats);
      await refresh();
    });
  }

  function showError(error) {
    elements.statusText.textContent = `Erro: ${error?.message || error}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    collectElements();
    bindEvents();
    refresh().catch(showError);
  });
})();
