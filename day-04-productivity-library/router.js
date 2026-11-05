window.ProductivityRouter = (() => {
  "use strict";
  const root = "/day-04-productivity-library/";
  function lang() {
    const match = location.pathname?.match(/\/(en|fr)\//);
    return (
      match?.[1] ||
      new URLSearchParams(location.search || "").get("lang") ||
      (document.documentElement.lang === "fr" ? "fr" : "en")
    );
  }
  function viewParams(params) {
    return {
      view: ["learn", "practice", "slides"].includes(params.get("view"))
        ? params.get("view")
        : null,
      slide: Math.max(0, Math.min(7, Number(params.get("slide")) || 0)),
      ratio: ["16:9", "9:10", "9:16"].includes(params.get("ratio"))
        ? params.get("ratio")
        : null,
    };
  }
  function route() {
    if (/^#\/?$/.test(location.hash || "")) return { v: "home" };
    const hash = (location.hash || "").replace(/^#\/?/, "");
    if (hash) {
      const [path, query] = hash.split("?"),
        params = new URLSearchParams(query || "");
      if (path.startsWith("tool/"))
        return {
          v: "tool",
          id: decodeURIComponent(path.slice(5)),
          ...viewParams(params),
        };
      if (["find", "sources", "help", "pilot"].includes(path))
        return { v: "home", section: path };
      if (["all", "results"].includes(path)) return { v: path };
      if (path === "") return { v: "home" };
    }
    const path = location.pathname || "",
      embedded = path.match(/\/embed\/(?:en|fr)\/([^/]+)\/$/);
    if (embedded)
      return {
        v: "tool",
        id: decodeURIComponent(embedded[1]),
        view: "practice",
      };
    const match = path.match(/\/(?:tools|outils)\/([^/]+)\/?$/);
    if (match)
      return {
        v: "tool",
        id: decodeURIComponent(match[1]),
        ...viewParams(new URLSearchParams(location.search || "")),
      };
    const kit = path.match(/\/kits\/([^/]+)\/$/);
    if (kit) return { v: "kit", id: kit[1] };
    if (/\/(?:library|bibliotheque)\/$/.test(path)) return { v: "all" };
    if (/\/(?:results|resultats)\/$/.test(path)) return { v: "results" };
    if (/^file:/.test(location.protocol || "")) return { v: "home" };
    return {
      v: "home",
      section:
        new URLSearchParams(location.search || "").get("section") || undefined,
    };
  }
  function url(state, language) {
    if (/^file:/.test(location.protocol || ""))
      return (
        "#/" +
        (state.v === "tool"
          ? "tool/" + state.id + (state.view ? "?view=" + state.view : "")
          : state.v === "home"
            ? state.section || ""
            : state.v)
      );
    let path = root + language + "/";
    if (state.v === "tool")
      path +=
        (language === "fr" ? "outils/" : "tools/") +
        encodeURIComponent(state.id) +
        "/";
    if (state.v === "kit") path += "kits/" + encodeURIComponent(state.id) + "/";
    if (state.v === "all")
      path += language === "fr" ? "bibliotheque/" : "library/";
    if (state.v === "results")
      path += language === "fr" ? "resultats/" : "results/";
    const params = new URLSearchParams();
    if (state.section) params.set("section", state.section);
    if (state.view) params.set("view", state.view);
    if (state.slide) params.set("slide", String(state.slide));
    if (state.ratio) params.set("ratio", state.ratio);
    return path + (params.size ? "?" + params : "");
  }
  function sync(state, language) {
    if (
      !/^https?:$/.test(location.protocol || "") ||
      document.body.dataset.embed
    )
      return;
    const dest = new URL(url(state, language), location.href),
      current = new URL(location.href);
    // Preserve public catalogue filters. Worksheet answers are never added to the URL.
    for (const key of [
      "q",
      "family",
      "audience",
      "duration",
      "difficulty",
      "deliverable",
    ])
      if (current.searchParams.has(key))
        dest.searchParams.set(key, current.searchParams.get(key));
    if (dest.href !== current.href) history.replaceState(null, "", dest);
    document.documentElement.lang = language;
    const canonical = document.querySelector("[rel=canonical]");
    if (canonical) canonical.href = dest.origin + dest.pathname;
  }
  return { root, lang, route, url, sync };
})();
