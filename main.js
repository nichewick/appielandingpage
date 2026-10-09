(function () {
  var WHATSAPP_CHANNEL_URL =
    "https://www.whatsapp.com/channel/0029Vb8LJRF2ER6mYdQjRT1P";

  document.querySelectorAll(".js-whatsapp-cta").forEach(function (link) {
    link.href = WHATSAPP_CHANNEL_URL;
  });

  var channelAnchor = document.getElementById("whatsapp-channel");
  if (channelAnchor) {
    channelAnchor.href = WHATSAPP_CHANNEL_URL;
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A cumulus silhouette is a row of lobes sitting on one flat base line, so the
  // cloud has a billowing top and a flat underside, like the real thing. Each
  // lobe is [cx, rx, ry] in the cloud viewBox; the last, widest lobe gives the
  // mass its solid core.
  var CLOUD_VIEW_W = 200;
  var CLOUD_VIEW_H = 80;
  var CLOUD_BASE_Y = 68;

  var CUMULUS_SHAPES = [
    [
      [34, 20, 15],
      [60, 29, 25],
      [94, 27, 22],
      [126, 22, 17],
      [152, 16, 11],
      [96, 64, 13],
    ],
    [
      [30, 18, 13],
      [58, 27, 24],
      [92, 30, 21],
      [124, 24, 18],
      [150, 15, 10],
      [92, 60, 12],
    ],
    [
      [40, 21, 16],
      [70, 30, 26],
      [106, 28, 22],
      [140, 23, 18],
      [166, 14, 10],
      [104, 66, 13],
    ],
  ];

  var HERO_CLOUDS = [
    { baseY: 5, baseXRatio: 0.52, scale: 1.35, shape: 2, driftSpeed: 5 },
    { baseY: 10, baseXRatio: 0.08, scale: 1.05, shape: 0, driftSpeed: 4 },
    { baseY: 3, baseXRatio: 0.72, scale: 0.95, shape: 1, driftSpeed: 6 },
    { baseY: 14, baseXRatio: 0.38, scale: 1.15, shape: 2, driftSpeed: 4.5 },
    { baseY: 8, baseXRatio: 0.88, scale: 0.75, shape: 1, driftSpeed: 5.5 },
    { baseY: 18, baseXRatio: 0.62, scale: 1.25, shape: 0, driftSpeed: 3.5 },
  ];

  var WISP_SHAPES = [
    [
      [100, 40, 90, 14],
      [160, 38, 70, 12],
      [220, 42, 55, 10],
    ],
    [
      [80, 36, 110, 12],
      [150, 34, 85, 11],
    ],
  ];

  function lobesMarkup(lobes, fill) {
    return lobes
      .map(function (lobe) {
        var rx = lobe[1];
        var ry = lobe[2];
        return (
          '<ellipse cx="' +
          lobe[0] +
          '" cy="' +
          (CLOUD_BASE_Y - ry) +
          '" rx="' +
          rx +
          '" ry="' +
          ry +
          '" fill="' +
          fill +
          '"/>'
        );
      })
      .join("");
  }

  // Soft caps of light on the tallest lobes, where the sun would strike them.
  function rimMarkup(lobes) {
    return lobes
      .filter(function (lobe) {
        return lobe[2] >= 20;
      })
      .map(function (lobe) {
        var cx = lobe[0] - lobe[1] * 0.16;
        var cy = CLOUD_BASE_Y - lobe[2] + lobe[2] * 0.4;
        return (
          '<ellipse cx="' +
          cx +
          '" cy="' +
          cy +
          '" rx="' +
          lobe[1] * 0.6 +
          '" ry="' +
          lobe[2] * 0.46 +
          '" fill="url(#puff-rim)"/>'
        );
      })
      .join("");
  }

  function buildCloudSvg(options) {
    var width = options.width;
    var lobes = options.lobes;
    var filterId = options.filterId;
    var withShadow = options.withShadow;

    var ground = withShadow
      ? '<ellipse cx="' +
        CLOUD_VIEW_W / 2 +
        '" cy="' +
        (CLOUD_VIEW_H - 4) +
        '" rx="' +
        CLOUD_VIEW_W * 0.36 +
        '" ry="6" fill="rgba(120,160,185,0.16)"/>'
      : "";

    return (
      '<svg class="cloud-svg" viewBox="0 0 ' +
      CLOUD_VIEW_W +
      " " +
      CLOUD_VIEW_H +
      '" width="' +
      width +
      '" aria-hidden="true">' +
      ground +
      // The same silhouette nudged downwards, blurred, peeking out beneath the
      // body as the shaded underside of the cloud.
      '<g filter="url(#cloud-haze)" transform="translate(0,7)">' +
      lobesMarkup(lobes, "url(#puff-shade)") +
      "</g>" +
      // Main mass, lit from the upper left.
      '<g filter="url(#' +
      filterId +
      ')">' +
      lobesMarkup(lobes, "url(#puff-lit)") +
      "</g>" +
      '<g filter="url(#cloud-rim)">' +
      rimMarkup(lobes) +
      "</g>" +
      "</svg>"
    );
  }

  function buildWispSvg(shape, width) {
    var parts = shape
      .map(function (e) {
        return (
          '<ellipse cx="' +
          e[0] +
          '" cy="' +
          e[1] +
          '" rx="' +
          e[2] +
          '" ry="' +
          e[3] +
          '" fill="url(#wisp-grad)"/>'
        );
      })
      .join("");

    return (
      '<svg class="cloud-svg" viewBox="0 0 280 56" width="' +
      width +
      '" aria-hidden="true">' +
      '<g filter="url(#cloud-wisp)">' +
      parts +
      "</g></svg>"
    );
  }

  function createCloudEl(config) {
    var el = document.createElement("div");
    el.className = config.className;
    el.dataset.depth = String(config.depth);
    el.dataset.driftSpeed = String(config.driftSpeed);
    el.dataset.driftOffset = String(config.driftOffset);
    el.style.setProperty("--base-y", config.baseY + "vh");
    el.style.setProperty("--lift", config.lift + "vh");
    el.style.setProperty("--fade", String(config.fade));
    el.style.setProperty("--cloud-opacity", String(config.cloudOpacity));
    el.style.setProperty("--base-x", config.baseX);
    if (config.wisp) {
      el.style.setProperty("--wisp-opacity", String(config.cloudOpacity));
    }
    el.innerHTML = config.svg;
    return el;
  }

  function mountHeroClouds(layer) {
    if (!layer) {
      return [];
    }

    var vw = window.innerWidth;
    var list = [];

    HERO_CLOUDS.forEach(function (cfg, i) {
      var shape = CUMULUS_SHAPES[cfg.shape % CUMULUS_SHAPES.length];
      var width = Math.round(220 * cfg.scale);
      var height = Math.round(88 * cfg.scale);
      var baseX = Math.round(vw * cfg.baseXRatio - width * 0.35);

      list.push(
        createCloudEl({
          className: "cloud cloud--hero",
          depth: 0.2 + (i % 3) * 0.05,
          driftSpeed: cfg.driftSpeed,
          driftOffset: i * 210 + 40,
          baseY: cfg.baseY,
          lift: 28 + (i % 4) * 5,
          fade: 0.5,
          cloudOpacity: 0.72 + (i % 3) * 0.06,
          baseX: baseX + "px",
          svg: buildCloudSvg({
            width: width,
            height: height,
            lobes: shape,
            filterId: "cloud-hero",
            withShadow: true,
          }),
        })
      );
    });

    HERO_CLOUDS.slice(0, 2).forEach(function (cfg, i) {
      var width = Math.round(320 * (1.1 + i * 0.2));
      list.push(
        createCloudEl({
          className: "cloud cloud--hero cloud--wisp",
          depth: 0.15,
          driftSpeed: 3 + i,
          driftOffset: 500 + i * 300,
          baseY: 2 + i * 4,
          lift: 22,
          fade: 0.45,
          cloudOpacity: 0.28,
          wisp: true,
          baseX: Math.round(vw * (0.2 + i * 0.45)) + "px",
          svg: buildWispSvg(WISP_SHAPES[i], width),
        })
      );
    });

    list.forEach(function (el) {
      layer.appendChild(el);
    });
    return list;
  }

  function mountAmbientClouds(layer) {
    if (!layer) {
      return [];
    }

    var count = window.innerWidth < 640 ? 8 : 12;
    var list = [];
    var i;

    for (i = 0; i < count; i++) {
      var isWisp = i % 4 === 3;
      var shapeSet = isWisp ? WISP_SHAPES : CUMULUS_SHAPES;
      var shape = shapeSet[i % shapeSet.length];
      var scale = isWisp ? 1.3 + (i % 3) * 0.3 : 0.8 + (i % 5) * 0.2;
      var width = Math.round((isWisp ? 260 : 200) * scale);
      var height = Math.round((isWisp ? 70 : 80) * scale);
      var baseY = 24 + ((i * 11) % 42);
      var cloudOpacity = isWisp ? 0.28 + (i % 3) * 0.05 : 0.48 + (i % 4) * 0.07;

      var svg = isWisp
        ? buildWispSvg(shape, width)
        : buildCloudSvg({
            width: width,
            height: height,
            lobes: shape,
            filterId: "cloud-soft",
            withShadow: true,
          });

      list.push(
        createCloudEl({
          className: "cloud" + (isWisp ? " cloud--wisp" : ""),
          depth: 0.3 + (i % 6) * 0.07,
          driftSpeed: isWisp ? 7 + (i % 3) : 10 + (i % 5),
          driftOffset: i * 163 + (i % 4) * 240,
          baseY: baseY,
          lift: 36 + (i % 5) * 7,
          fade: 0.8 + (i % 4) * 0.07,
          cloudOpacity: cloudOpacity,
          baseX: "0px",
          wisp: isWisp,
          svg: svg,
        })
      );
    }

    list.forEach(function (el) {
      layer.appendChild(el);
    });
    return list;
  }

  var skyScene = document.querySelector(".sky-scene");
  var clouds = mountHeroClouds(document.getElementById("hero-cloud-layer")).concat(
    mountAmbientClouds(document.getElementById("cloud-layer"))
  );

  if (skyScene && clouds.length && !reducedMotion) {
    var driftStart = Date.now();

    function setEvaporate() {
      var vh = window.innerHeight || 800;
      var evaporate = Math.min(1, window.scrollY / (vh * 0.9));
      skyScene.style.setProperty("--evaporate", evaporate.toFixed(4));

      clouds.forEach(function (cloud) {
        cloud.classList.toggle("is-gone", evaporate >= 0.98);
      });
    }

    function setDrift() {
      var width = window.innerWidth + 520;
      var elapsed = (Date.now() - driftStart) / 1000;

      clouds.forEach(function (cloud) {
        var speed = parseFloat(cloud.dataset.driftSpeed) || 10;
        var offset = parseFloat(cloud.dataset.driftOffset) || 0;
        var depth = parseFloat(cloud.dataset.depth) || 0.4;
        var scrollBoost = window.scrollY * 0.1 * depth;
        var sway = Math.sin(elapsed * 0.15 + offset) * 12;
        var x = ((elapsed * speed + offset + scrollBoost) % width) - 280 + sway;
        cloud.style.setProperty("--drift-x", x + "px");
      });
    }

    function tick() {
      if (document.visibilityState === "visible") {
        setEvaporate();
        setDrift();
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", setEvaporate, { passive: true });
    window.addEventListener("resize", function () {
      setEvaporate();
      setDrift();
    });
    setEvaporate();
    setDrift();
    requestAnimationFrame(tick);
  }
})();
