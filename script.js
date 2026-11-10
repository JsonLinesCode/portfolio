(function (window, document) {
  var isAnimating = false;

  function runWordleSequence() {
    if (isAnimating) return;
    isAnimating = true;

    var rows = document.getElementsByClassName("lettersrow");
    for (var r = 0; r < rows.length; r++) {
      rows[r].classList.remove("animateCenter");
    }
    for (var k = 1; k <= 10; k++) {
      var el = document.getElementById("l" + k);
      if (el) el.classList.remove("flipCard");
    }

    var i = 1;
    function myLoop() {
      setTimeout(function () {
        var card = document.getElementById("l" + i.toString());
        if (card) {
          card.classList.add("flipCard");
        }
        i++;
        if (i < 11) {
          myLoop();
        } else {
          for (var j = 0; j < rows.length; ++j) {
            rows[j].classList.add("animateCenter");
          }
          setTimeout(function () {
            isAnimating = false;
          }, 800);
        }
      }, 250);
    }

    myLoop();
  }

  function updateZigzagPath() {
    var container = document.getElementById("projects-zigzag");
    var svg = document.getElementById("zigzag-svg");
    var path = document.getElementById("zigzag-path");
    var arrowsPath = document.getElementById("zigzag-arrows");
    if (!container || !svg || !path) return;

    var visibleCards = container.querySelectorAll(".project-card:not(.hidden)");
    visibleCards.forEach(function (card, idx) {
      card.classList.remove("zigzag-left", "zigzag-right");
      card.classList.add(idx % 2 === 0 ? "zigzag-left" : "zigzag-right");
    });

    var containerRect = container.getBoundingClientRect();
    svg.setAttribute("width", containerRect.width);
    svg.setAttribute("height", containerRect.height);

    var points = [];
    visibleCards.forEach(function (card) {
      var dot = card.querySelector(".timeline-dot");
      if (!dot) return;
      var dotRect = dot.getBoundingClientRect();
      var x = dotRect.left - containerRect.left + dotRect.width / 2;
      var y = dotRect.top - containerRect.top + dotRect.height / 2;
      points.push({ x: x, y: y });
    });

    if (points.length < 2) {
      path.setAttribute("d", "");
      if (arrowsPath) arrowsPath.setAttribute("d", "");
      return;
    }

    var d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
    var arrowD = "";
    var arrowLen = 5.5;
    var arrowSpread = Math.PI / 6;

    function bezierPoint(p0, c1, c2, p1, t) {
      var u = 1 - t;
      var tt = t * t;
      var uu = u * u;
      var uuu = uu * u;
      var ttt = tt * t;
      return {
        x: uuu * p0.x + 3 * uu * t * c1.x + 3 * u * tt * c2.x + ttt * p1.x,
        y: uuu * p0.y + 3 * uu * t * c1.y + 3 * u * tt * c2.y + ttt * p1.y
      };
    }

    function bezierTangent(p0, c1, c2, p1, t) {
      var u = 1 - t;
      return {
        dx: 3 * u * u * (c1.x - p0.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (p1.x - c2.x),
        dy: 3 * u * u * (c1.y - p0.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (p1.y - c2.y)
      };
    }

    for (var p = 1; p < points.length; p++) {
      var p0 = points[p - 1];
      var p1 = points[p];
      var dy = p1.y - p0.y;
      var c1 = { x: p0.x, y: p0.y + dy * 0.55 };
      var c2 = { x: p1.x, y: p1.y - dy * 0.55 };

      d +=
        " C " +
        c1.x.toFixed(1) +
        " " +
        c1.y.toFixed(1) +
        ", " +
        c2.x.toFixed(1) +
        " " +
        c2.y.toFixed(1) +
        ", " +
        p1.x.toFixed(1) +
        " " +
        p1.y.toFixed(1);

      var dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      var fractions = dist > 110 ? [0.35, 0.68] : [0.5];
      for (var f = 0; f < fractions.length; f++) {
        var t = fractions[f];
        var pt = bezierPoint(p0, c1, c2, p1, t);
        var tan = bezierTangent(p0, c1, c2, p1, t);
        var angle = Math.atan2(tan.dy, tan.dx);
        var lx = pt.x - arrowLen * Math.cos(angle - arrowSpread);
        var ly = pt.y - arrowLen * Math.sin(angle - arrowSpread);
        var rx = pt.x - arrowLen * Math.cos(angle + arrowSpread);
        var ry = pt.y - arrowLen * Math.sin(angle + arrowSpread);
        arrowD +=
          " M " +
          lx.toFixed(1) +
          " " +
          ly.toFixed(1) +
          " L " +
          pt.x.toFixed(1) +
          " " +
          pt.y.toFixed(1) +
          " L " +
          rx.toFixed(1) +
          " " +
          ry.toFixed(1);
      }
    }

    path.setAttribute("d", d);
    if (arrowsPath) {
      arrowsPath.setAttribute("d", arrowD);
    }
  }

  function initFilters() {
    var filterBtns = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".project-card");

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var category = btn.getAttribute("data-filter");

        filterBtns.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        cards.forEach(function (card) {
          var cardCats = card.getAttribute("data-category") || "";
          if (category === "all" || cardCats.indexOf(category) !== -1) {
            card.classList.remove("hidden");
          } else {
            card.classList.add("hidden");
          }
        });

        requestAnimationFrame(updateZigzagPath);
      });
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    runWordleSequence();
    initFilters();
    updateZigzagPath();
    setTimeout(updateZigzagPath, 150);

    var wordleBoard = document.getElementById("wordle-board");

    function triggerReplay() {
      if (isAnimating) return;
      var rows = document.getElementsByClassName("lettersrow");
      for (var r = 0; r < rows.length; r++) {
        rows[r].classList.remove("animateCenter");
      }
      for (var k = 1; k <= 10; k++) {
        var el = document.getElementById("l" + k);
        if (el) el.classList.remove("flipCard");
      }
      setTimeout(function () {
        runWordleSequence();
      }, 450);
    }

    if (wordleBoard) {
      wordleBoard.addEventListener("click", triggerReplay);
    }
  });

  window.addEventListener("load", updateZigzagPath);
  window.addEventListener("resize", function () {
    requestAnimationFrame(updateZigzagPath);
  });
})(window, document);
