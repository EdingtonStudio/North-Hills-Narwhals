/* =================================================================
   Founding Card maker — draws a shareable Narwhals card to <canvas>.
   Vanilla JS, no dependencies.
   ================================================================= */
(function () {
  "use strict";

  var W = 720, H = 1008, SCALE = 2;
  var C = {
    navy: "#132A52", deep: "#09213A", navyTop: "#16305C",
    gold: "#B5933F", goldLt: "#DDB060",
    ice: "#CFE7F4", iceBlue: "#B2D5E4", plateInk: "#0C2038"
  };

  var canvas = document.getElementById("cardCanvas");
  var ctx = canvas.getContext("2d");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  ctx.scale(SCALE, SCALE);

  var fName = document.getElementById("f-name");
  var fNumber = document.getElementById("f-number");
  var fPosition = document.getElementById("f-position");
  var fLast = document.getElementById("f-last");

  var imgs = {};
  var SCOUT = {
    "Still playing somewhere": "Scouting report: still has it. Annoyingly.",
    "Beer league recently": "Scouting report: gamer. Knows most of the rules.",
    "College": "Scouting report: peaked in '09. Still counts.",
    "High school": "Scouting report: muscle memory, fingers crossed.",
    "The Clinton administration": "Scouting report: veteran presence. Heavy on veteran.",
    "": "Scouting report: TBD. Range optional, heart isn't."
  };

  // --- Load an SVG asset at a known intrinsic size (so canvas can crop/scale) ---
  function loadSVG(url, w, h) {
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        txt = txt.replace(/<svg([^>]*?)>/, function (m, attrs) {
          attrs = attrs.replace(/\swidth="[^"]*"/, "").replace(/\sheight="[^"]*"/, "");
          return "<svg" + attrs + ' width="' + w + '" height="' + h + '">';
        });
        var blob = new Blob([txt], { type: "image/svg+xml" });
        var u = URL.createObjectURL(blob);
        return new Promise(function (res) {
          var im = new Image();
          im.onload = function () { res(im); };
          im.onerror = function () { res(null); };
          im.src = u;
        });
      })
      .catch(function () { return null; });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitFont(text, weight, maxWidth, startPx, minPx) {
    var px = startPx;
    do {
      ctx.font = weight + " " + px + 'px "Oswald", sans-serif';
      if (ctx.measureText(text).width <= maxWidth) break;
      px -= 2;
    } while (px > minPx);
    return px;
  }

  function draw() {
    var name = (fName.value || "Your Name").trim().toUpperCase();
    var num = (fNumber.value || "").replace(/[^0-9]/g, "").slice(0, 2);
    if (num === "") num = "00";
    var pos = fPosition.value || "Wherever you need me";
    var scout = SCOUT[fLast.value] || SCOUT[""];

    ctx.clearRect(0, 0, W, H);

    // Background
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, C.navyTop); g.addColorStop(1, C.deep);
    ctx.fillStyle = g;
    roundRect(0, 0, W, H, 26); ctx.fill();

    // Faint pinstripes
    ctx.save();
    ctx.globalAlpha = 0.06; ctx.strokeStyle = C.iceBlue; ctx.lineWidth = 2;
    for (var x = 60; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, H - 24); ctx.stroke(); }
    ctx.restore();

    // Gold frame
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4;
    roundRect(18, 18, W - 36, H - 36, 18); ctx.stroke();
    ctx.strokeStyle = "rgba(178,213,228,0.18)"; ctx.lineWidth = 1;
    roundRect(30, 30, W - 60, H - 60, 12); ctx.stroke();

    // Wordmark (source-crop the tight content out of the 1024 square)
    if (imgs.wordmark) {
      var wmW = 360, wmH = wmW * (398 / 953); // content ratio
      ctx.drawImage(imgs.wordmark, 30, 321, 953, 398, (W - wmW) / 2, 60, wmW, wmH);
    }

    // Mascot
    if (imgs.mascot) {
      var mW = 320, mH = 320;
      ctx.drawImage(imgs.mascot, (W - mW) / 2, 188, mW, mH);
    }

    // Big number
    ctx.textAlign = "center";
    ctx.font = '700 128px "Oswald", sans-serif';
    ctx.fillStyle = C.goldLt;
    ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    ctx.fillText(num, W / 2, 600);
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Name plate (gold bar, navy text)
    var plateX = 70, plateY = 636, plateW = W - 140, plateH = 84;
    ctx.fillStyle = C.gold;
    roundRect(plateX, plateY, plateW, plateH, 12); ctx.fill();
    var npx = fitFont(name, "700", plateW - 56, 52, 22);
    ctx.font = "700 " + npx + 'px "Oswald", sans-serif';
    ctx.fillStyle = C.plateInk;
    ctx.textBaseline = "middle";
    ctx.fillText(name, W / 2, plateY + plateH / 2 + 3);
    ctx.textBaseline = "alphabetic";

    // Position
    ctx.font = '600 26px "Oswald", sans-serif';
    ctx.fillStyle = C.iceBlue;
    ctx.fillText(pos.toUpperCase(), W / 2, 770);

    // Scouting line
    ctx.font = 'italic 19px "Inter", sans-serif';
    ctx.fillStyle = "rgba(207,231,244,0.85)";
    wrapText(scout, W / 2, 806, W - 150, 26);

    // Footer: monogram + tagline
    if (imgs.monogram) {
      ctx.drawImage(imgs.monogram, (W - 70) / 2, 872, 70, 70);
    }
    ctx.font = '600 16px "Oswald", sans-serif';
    ctx.fillStyle = C.gold;
    ctx.fillText("FOUNDING ROSTER · SEASON 0 · NORTH HILLS", W / 2, 968);
    ctx.textAlign = "left";
  }

  function wrapText(text, cx, y, maxW, lh) {
    var words = text.split(" "), line = "", lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line + words[i] + " ";
      if (ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = words[i] + " "; }
      else line = test;
    }
    lines.push(line.trim());
    for (var j = 0; j < lines.length; j++) ctx.fillText(lines[j], cx, y + j * lh);
  }

  function download() {
    var name = (fName.value || "narwhal").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "narwhal";
    canvas.toBlob(function (blob) {
      var u = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = u; a.download = "narwhals-card-" + name + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
    }, "image/png");
  }

  async function share() {
    var btn = document.getElementById("shareBtn");
    var name = (fName.value || "I").trim();
    var text = name + " just claimed a founding spot on the North Hills Narwhals (Season 0). Make your card and grab one too:";
    var url = location.origin + "/card";
    try {
      if (navigator.share) { await navigator.share({ title: "North Hills Narwhals", text: text, url: url }); }
      else { await navigator.clipboard.writeText(text + " " + url); btn.textContent = "Copied!"; setTimeout(function () { btn.textContent = "Copy share line"; }, 1800); }
    } catch (e) {}
  }

  // Init
  [fName, fNumber, fPosition, fLast].forEach(function (el) { el.addEventListener("input", draw); });
  document.getElementById("downloadBtn").addEventListener("click", download);
  document.getElementById("shareBtn").addEventListener("click", share);

  Promise.all([
    loadSVG("assets/Narwhals-Wordmark-Light.svg", 1024, 1024).then(function (im) { imgs.wordmark = im; }),
    loadSVG("assets/Narwhals-Primary.svg", 1024, 1024).then(function (im) { imgs.mascot = im; }),
    loadSVG("assets/Narwhals-Monogram.svg", 1024, 1024).then(function (im) { imgs.monogram = im; })
  ]).then(function () {
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load('700 128px "Oswald"'),
        document.fonts.load('600 26px "Oswald"'),
        document.fonts.load('italic 19px "Inter"')
      ]).then(draw).catch(draw);
      document.fonts.ready.then(draw);
    }
    draw();
  });

  draw(); // first paint (placeholder) before assets/fonts land
})();
