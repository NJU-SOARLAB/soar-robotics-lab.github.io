(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const createMascot = () => {
    if (document.querySelector(".soar-mascot")) return;

    const isZh = document.documentElement.lang.startsWith("zh") || window.location.pathname.startsWith("/zh/");
    const mascot = document.createElement("button");
    mascot.className = "soar-mascot";
    mascot.type = "button";
    mascot.dataset.soarPlay = "";
    mascot.setAttribute("aria-label", isZh ? "开始 SOARLAB 3D 小游戏" : "Play the SOARLAB 3D mini game");
    mascot.innerHTML = `<img src="/assets/img/soarlab-128.png" alt=""><span class="soar-mascot__label">${isZh ? "玩一局" : "Play"}</span>`;
    document.body.appendChild(mascot);
  };

  const setupHeroTilt = () => {
    if (reducedMotion) return;

    document.querySelectorAll(".soar-open-hero").forEach((hero) => {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        hero.style.setProperty("--soar-glow-x", `${x * 100}%`);
        hero.style.setProperty("--soar-glow-y", `${y * 100}%`);
        hero.style.setProperty("--soar-tilt-x", `${(0.5 - y) * 3.5}deg`);
        hero.style.setProperty("--soar-tilt-y", `${(x - 0.5) * 4.5}deg`);
      });

      hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--soar-tilt-x", "0deg");
        hero.style.setProperty("--soar-tilt-y", "0deg");
      });
    });
  };

  const setupCardGlow = () => {
    if (reducedMotion) return;

    document.querySelectorAll(".soar-open-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
      });
    });
  };

  const setupGitHubStars = () => {
    document.querySelectorAll("[data-github-repo]").forEach(async (element) => {
      const repo = element.dataset.githubRepo;
      if (!repo) return;

      try {
        const response = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);

        const data = await response.json();
        const stars = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count || 0);
        const label = element.dataset.starLabel || "stars";
        element.textContent = `★ ${stars} ${label}`;
        element.setAttribute("aria-label", `${data.stargazers_count || 0} GitHub stars`);
      } catch (_error) {
        element.textContent = element.dataset.starFallback || "★ stars unavailable";
      }
    });
  };

  const setupQRCodeShare = () => {
    const triggers = document.querySelectorAll(".soar-share-button");
    if (!triggers.length) return;

    const isZh = document.documentElement.lang === "zh" || window.location.pathname.startsWith("/zh/");
    const text = isZh
      ? {
          label: "SOARLAB 主页二维码",
          intro: "扫码访问 SOARLAB 课题组主页，也可以下载此二维码放入 PPT。",
          copy: "复制链接",
          copied: "已复制",
          download: "下载 PNG",
          close: "关闭",
        }
      : {
          label: "SOARLAB homepage QR code",
          intro: "Scan to open the SOARLAB homepage, or download this QR code for slides.",
          copy: "Copy link",
          copied: "Copied",
          download: "Download PNG",
          close: "Close",
        };
    const shareUrl = "https://www.soar-lab.org/";
    let dialog;
    let previousFocus;

    const closeDialog = () => {
      if (!dialog) return;
      dialog.classList.remove("soar-qr-share--active");
      document.body.classList.remove("soar-qr-share-active");
      previousFocus?.focus?.({ preventScroll: true });
    };

    const createDialog = () => {
      if (dialog) return;
      dialog = document.createElement("div");
      dialog.className = "soar-qr-share";
      dialog.innerHTML = `
        <div class="soar-qr-share__backdrop" data-soar-qr-close></div>
        <section class="soar-qr-share__card" role="dialog" aria-modal="true" aria-labelledby="soar-qr-share-title">
          <button class="soar-qr-share__close" type="button" aria-label="${text.close}" data-soar-qr-close>×</button>
          <p class="soar-qr-share__kicker">SOARLAB</p>
          <h2 id="soar-qr-share-title">${text.label}</h2>
          <p>${text.intro}</p>
          <div class="soar-qr-share__image">
            <img src="/assets/img/soarlab-home-qr.png" alt="${text.label}">
          </div>
          <code>${shareUrl}</code>
          <div class="soar-qr-share__actions">
            <button class="btn btn-primary soar-qr-share__copy" type="button">${text.copy}</button>
            <a class="btn btn-outline-primary" href="/assets/img/soarlab-home-qr.png" download="soarlab-home-qr.png">${text.download}</a>
          </div>
        </section>
      `;
      document.body.appendChild(dialog);
      dialog.addEventListener("click", (event) => {
        if (event.target.closest("[data-soar-qr-close]")) closeDialog();
      });
      dialog.querySelector(".soar-qr-share__copy").addEventListener("click", async (event) => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          event.currentTarget.textContent = text.copied;
          window.setTimeout(() => {
            event.currentTarget.textContent = text.copy;
          }, 1500);
        } catch (_error) {
          window.prompt(text.copy, shareUrl);
        }
      });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        createDialog();
        previousFocus = document.activeElement;
        dialog.classList.add("soar-qr-share--active");
        document.body.classList.add("soar-qr-share-active");
        dialog.querySelector(".soar-qr-share__copy")?.focus({ preventScroll: true });
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog?.classList.contains("soar-qr-share--active")) {
        closeDialog();
      }
    });
  };

  const boot = () => {
    createMascot();
    setupHeroTilt();
    setupCardGlow();
    setupGitHubStars();
    setupQRCodeShare();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
