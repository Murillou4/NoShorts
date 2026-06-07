(() => {
  "use strict";

  const browsers = [
    { key: "firefox", name: "Firefox", url: "about:debugging#/runtime/this-firefox", test: /Firefox\//i },
    { key: "safari", name: "Safari", url: "xcrun safari-web-extension-packager", test: /^((?!Chrome|Chromium|Edg|OPR|Firefox).)*Safari/i },
    { key: "edge", name: "Microsoft Edge", url: "edge://extensions", test: /Edg\//i },
    { key: "opera", name: "Opera", url: "opera://extensions", test: /OPR\//i },
    { key: "brave", name: "Brave", url: "brave://extensions", test: /Brave/i },
    { key: "vivaldi", name: "Vivaldi", url: "vivaldi://extensions", test: /Vivaldi/i },
    { key: "arc", name: "Arc", url: "chrome://extensions", test: /Arc/i },
    { key: "chrome", name: "Google Chrome", url: "chrome://extensions", test: /Chrome\//i },
    { key: "chromium", name: "Chromium", url: "chrome://extensions", test: /Chromium/i }
  ];

  const fallbackBrowser = {
    key: "chrome",
    name: "navegador Chromium",
    url: "chrome://extensions"
  };

  const toast = document.querySelector(".toast");
  const detectedBrowser = document.querySelector("#detectedBrowser");

  function detectBrowser() {
    const agent = navigator.userAgent || "";
    const braveRuntime = navigator.brave && typeof navigator.brave.isBrave === "function";

    if (braveRuntime) {
      return browsers.find((browser) => browser.key === "brave") || fallbackBrowser;
    }

    return browsers.find((browser) => browser.test.test(agent)) || fallbackBrowser;
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

  function markCurrentBrowser(browser) {
    const cards = document.querySelectorAll("[data-browser]");
    for (const card of cards) {
      card.classList.toggle("is-current", card.dataset.browser === browser.key);
    }

    if (detectedBrowser) {
      detectedBrowser.textContent = `Detectei ${browser.name}. Use ${browser.url}.`;
    }
  }

  function bindCopyButtons(browser) {
    document.querySelector('[data-copy="auto"]')?.addEventListener("click", () => {
      copyText(browser.url);
    });

    const buttons = document.querySelectorAll("[data-copy-url]");
    for (const button of buttons) {
      button.addEventListener("click", () => {
        copyText(button.dataset.copyUrl);
      });
    }
  }

  const currentBrowser = detectBrowser();
  markCurrentBrowser(currentBrowser);
  bindCopyButtons(currentBrowser);
})();
