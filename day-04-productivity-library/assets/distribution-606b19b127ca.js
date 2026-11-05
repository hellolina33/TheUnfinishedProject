window.ProductivityDistribution = (() => {
  "use strict";
  function panel(method, lang, esc, url) {
    const t = (k) => window.ProductivityLearning.content[lang][k];
    return `<details class="w-distribution"><summary>${t("distribution")}</summary><p>${t("privacy")}</p><div class="s-btns"><button class="s-btn outline tiny" data-distribute="image">${t("shareImage")}</button></div><h3>${t("embed")}</h3><p>${t("embedCopy")}</p><textarea readonly rows="4" aria-label="${t("embed")}">${esc('<iframe title="' + method.n + '" src="' + url + '?embed=1" loading="lazy" width="100%" height="800" sandbox="allow-scripts allow-same-origin allow-downloads"></iframe>')}</textarea></details>`;
  }
  async function image(method, lang, url) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const c = canvas.getContext("2d");
    c.fillStyle = "#f5f2e9";
    c.fillRect(0, 0, 1080, 1350);
    c.fillStyle = "#161713";
    c.font = "bold 22px Arial";
    c.fillText("THE UNFINISHED 30 · PRODUCTIVITY STUDIO", 60, 70);
    const wrap = (text, y, size, max = 950) => {
      c.font = "bold " + size + "px Arial";
      let line = "",
        yy = y;
      for (const word of text.split(/\s+/)) {
        if (c.measureText(line + " " + word).width > max) {
          c.fillText(line, 60, yy);
          yy += size * 1.15;
          line = word;
        } else line += (line ? " " : "") + word;
      }
      c.fillText(line, 60, yy);
      return yy + size * 1.5;
    };
    let y = wrap(method.n, 170, 64);
    y = wrap(method.why, y + 35, 32);
    const svg = window.ProductivityDeck.svg(
      window.ProductivityDeck.framework(
        method,
        method.sampleCells || method.sample,
        [0.15, 0.15, 8.7, 5.2],
        (key) => window.ProductivityWorkspace.words[lang][key] || key,
      ),
      9,
      5.5,
      (v) =>
        String(v).replace(
          /[&<>"']/g,
          (ch) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[ch],
        ),
      method.n,
    );
    const image = new Image(),
      source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = source;
      });
      c.drawImage(image, 60, Math.min(y + 25, 550), 960, 587);
    } finally {
      URL.revokeObjectURL(source);
    }
    c.fillStyle = "#ff5a32";
    c.fillRect(60, 1190, 960, 4);
    c.fillStyle = "#161713";
    c.font = "18px Arial";
    c.fillText(
      lang === "fr"
        ? "Cas fictif · Essaie la méthode avec tes propres données"
        : "Fictional case · Try the method with your own data",
      60,
      1235,
    );
    c.font = "16px Arial";
    c.fillText(url.replace("https://", ""), 60, 1285);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }
  return { panel, image };
})();
