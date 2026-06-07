(() => {
  "use strict";

  const browserDefinitions = [
    { key: "firefox", name: "Firefox", test: /Firefox\//i },
    { key: "safari", name: "Safari", test: /^((?!Chrome|Chromium|CriOS|Edg|OPR|Firefox).)*Safari/i },
    { key: "edge", name: "Microsoft Edge", test: /Edg\//i },
    { key: "opera", name: "Opera", tab: "other", test: /OPR\//i },
    { key: "vivaldi", name: "Vivaldi", tab: "other", test: /Vivaldi/i },
    { key: "arc", name: "Arc", tab: "other", test: /Arc/i },
    { key: "chrome", name: "Google Chrome", test: /Chrome\//i },
    { key: "chromium", name: "Chromium", tab: "other", test: /Chromium/i }
  ];

  const fallbackBrowser = {
    key: "chrome",
    name: "navegador baseado em Chromium"
  };

  const tabs = Array.from(document.querySelectorAll("[data-browser-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-browser-panel]"));
  const toast = document.querySelector(".toast");
  const detectedBrowser = document.querySelector("#detectedBrowser");
  let detected = fallbackBrowser;

  function detectBrowser() {
    const agent = navigator.userAgent || "";
    return browserDefinitions.find((browser) => browser.test.test(agent)) || fallbackBrowser;
  }

  async function resolveBrowser() {
    const initial = detectBrowser();
    const braveRuntime = navigator.brave && typeof navigator.brave.isBrave === "function";

    if (!braveRuntime) {
      return initial;
    }

    try {
      if (await navigator.brave.isBrave()) {
        return { key: "brave", name: "Brave" };
      }
    } catch {
      return initial;
    }

    return initial;
  }

  function selectedTabFor(browser) {
    return browser.tab || browser.key || "chrome";
  }

  function updateUrl(tabKey) {
    if (!window.history?.replaceState) {
      return;
    }

    const url = new URL(window.location.href);
    url.hash = tabKey;
    window.history.replaceState(null, "", url);
  }

  function activateTab(tabKey, options = {}) {
    const targetTab = tabs.find((tab) => tab.dataset.browserTab === tabKey) || tabs[0];
    if (!targetTab) {
      return;
    }

    for (const tab of tabs) {
      const active = tab === targetTab;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("is-active", active);
    }

    for (const panel of panels) {
      const active = panel.dataset.browserPanel === targetTab.dataset.browserTab;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    }

    if (options.focus) {
      targetTab.focus();
    }

    if (options.updateUrl) {
      updateUrl(targetTab.dataset.browserTab);
    }
  }

  function bindTabs() {
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(tab.dataset.browserTab, { updateUrl: true });
      });

      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          return;
        }

        event.preventDefault();
        let nextIndex = index;

        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        activateTab(tabs[nextIndex].dataset.browserTab, {
          focus: true,
          updateUrl: true
        });
      });
    });
  }

  function showToast(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copiado: ${text}`);
    } catch {
      showToast(`Copie manualmente: ${text}`);
    }
  }

  function bindCopyButtons() {
    for (const button of document.querySelectorAll("[data-copy-url]")) {
      button.addEventListener("click", () => {
        copyText(button.dataset.copyUrl);
      });
    }
  }

  function requestedTab() {
    const requested = window.location.hash.replace("#", "");
    return tabs.some((tab) => tab.dataset.browserTab === requested) ? requested : null;
  }

  async function initialize() {
    detected = await resolveBrowser();
    const detectedTab = selectedTabFor(detected);
    const initialTab = requestedTab() || detectedTab;

    if (detectedBrowser) {
      detectedBrowser.innerHTML = `<span>Detectamos</span><strong>${detected.name}</strong><small>Você pode trocar de aba se precisar.</small>`;
    }

    const detectedTabButton = tabs.find((tab) => tab.dataset.browserTab === detectedTab);
    detectedTabButton?.classList.add("is-detected");
    detectedTabButton?.setAttribute("data-detected-label", "Detectado");

    activateTab(initialTab);
  }

  bindTabs();
  bindCopyButtons();
  initialize();
})();
