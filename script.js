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

  function makeArrow(x, y, angle) {
    var arrowLen = 6.5;
    var arrowSpread = Math.PI / 5.5;
    var lx = x - arrowLen * Math.cos(angle - arrowSpread);
    var ly = y - arrowLen * Math.sin(angle - arrowSpread);
    var rx = x - arrowLen * Math.cos(angle + arrowSpread);
    var ry = y - arrowLen * Math.sin(angle + arrowSpread);
    return (
      " M " +
      lx.toFixed(1) +
      " " +
      ly.toFixed(1) +
      " L " +
      x.toFixed(1) +
      " " +
      y.toFixed(1) +
      " L " +
      rx.toFixed(1) +
      " " +
      ry.toFixed(1)
    );
  }

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

  function updateZigzagPath() {
    var container = document.getElementById("projects-zigzag");
    var svg = document.getElementById("zigzag-svg");
    var path = document.getElementById("zigzag-path");
    var arrowsPath = document.getElementById("zigzag-arrows");
    if (!container || !svg || !path) return;

    var visibleCards = Array.prototype.slice.call(
      container.querySelectorAll(".project-card:not(.hidden)")
    );
    var isMobile = window.innerWidth <= 780;

    // Assign snake (boustrophedon) grid coordinates on desktop
    var placement = [];
    visibleCards.forEach(function (card, idx) {
      if (isMobile) {
        card.style.gridRow = "";
        card.style.gridColumn = "";
        placement.push({ card: card, row: idx + 1, col: 1 });
      } else {
        var r0 = Math.floor(idx / 2);
        var isEvenRow = r0 % 2 === 0;
        var col = isEvenRow ? (idx % 2 === 0 ? 1 : 2) : (idx % 2 === 0 ? 2 : 1);
        var row = r0 + 1;
        card.style.gridRow = String(row);
        card.style.gridColumn = String(col);
        placement.push({ card: card, row: row, col: col });
      }
    });

    var containerRect = container.getBoundingClientRect();
    svg.setAttribute("width", containerRect.width);
    svg.setAttribute("height", containerRect.height);

    if (visibleCards.length === 0) {
      path.setAttribute("d", "");
      if (arrowsPath) arrowsPath.setAttribute("d", "");
      return;
    }

    var d = "";
    var arrowD = "";

    if (isMobile) {
      var points = [];
      visibleCards.forEach(function (card) {
        var dot = card.querySelector(".timeline-dot");
        if (!dot) return;
        var dotRect = dot.getBoundingClientRect();
        points.push({
          x: dotRect.left - containerRect.left + dotRect.width / 2,
          y: dotRect.top - containerRect.top + dotRect.height / 2
        });
      });

      if (points.length >= 2) {
        d = "M " + points[points.length - 1].x.toFixed(1) + " " + points[points.length - 1].y.toFixed(1);
        for (var m = points.length - 1; m >= 1; m--) {
          var mp0 = points[m];
          var mp1 = points[m - 1];
          d += " L " + mp1.x.toFixed(1) + " " + mp1.y.toFixed(1);
          var midX = (mp0.x + mp1.x) / 2;
          var midY = (mp0.y + mp1.y) / 2;
          var mAngle = Math.atan2(mp1.y - mp0.y, mp1.x - mp0.x);
          arrowD += makeArrow(midX, midY, mAngle);
        }
      }
      path.setAttribute("d", d);
      if (arrowsPath) arrowsPath.setAttribute("d", arrowD);
      return;
    }

    // Desktop: compute card rectangles relative to container
    var rects = placement.map(function (item) {
      var r = item.card.getBoundingClientRect();
      return {
        row: item.row,
        col: item.col,
        left: r.left - containerRect.left,
        right: r.right - containerRect.left,
        top: r.top - containerRect.top,
        bottom: r.bottom - containerRect.top,
        midY: r.top - containerRect.top + r.height / 2
      };
    });

    // Entry tail into the oldest card (last item)
    var last = rects[rects.length - 1];
    if (last) {
      var tailSide = last.col === 2 ? 1 : -1;
      var tx1 = last.col === 2 ? last.right : last.left;
      var ty1 = last.midY;
      var tx0 = tx1 + tailSide * 10;
      var ty0 = last.bottom + 18;
      var tc1 = { x: tx1 + tailSide * 44, y: ty0 - 4 };
      var tc2 = { x: tx1 + tailSide * 44, y: ty1 };
      d +=
        " M " +
        tx0.toFixed(1) +
        " " +
        ty0.toFixed(1) +
        " C " +
        tc1.x.toFixed(1) +
        " " +
        tc1.y.toFixed(1) +
        ", " +
        tc2.x.toFixed(1) +
        " " +
        tc2.y.toFixed(1) +
        ", " +
        tx1.toFixed(1) +
        " " +
        ty1.toFixed(1);
    }

    // Connect from oldest (k) up to newest (k - 1)
    for (var k = rects.length - 1; k >= 1; k--) {
      var cur = rects[k];
      var prev = rects[k - 1];

      if (cur.row === prev.row) {
        // Horizontal segment across the center gap between the two columns
        var hx0 = cur.col === 2 ? cur.left : cur.right;
        var hx1 = prev.col === 1 ? prev.right : prev.left;
        var hy = (cur.midY + prev.midY) / 2;
        d += " M " + hx0.toFixed(1) + " " + hy.toFixed(1) + " L " + hx1.toFixed(1) + " " + hy.toFixed(1);
        var hMidX = (hx0 + hx1) / 2;
        var hAngle = Math.atan2(0, hx1 - hx0);
        arrowD += makeArrow(hMidX, hy, hAngle);
      } else {
        // Outer U-turn arc on the right (col 2) or left (col 1) connecting row r up to row r - 1
        var isRightOuter = cur.col === 2;
        var ux0 = isRightOuter ? cur.right : cur.left;
        var uy0 = cur.midY;
        var ux1 = isRightOuter ? prev.right : prev.left;
        var uy1 = prev.midY;
        var bulge = isRightOuter ? 54 : -54;
        var uc1 = { x: ux0 + bulge, y: uy0 };
        var uc2 = { x: ux1 + bulge, y: uy1 };

        d +=
          " M " +
          ux0.toFixed(1) +
          " " +
          uy0.toFixed(1) +
          " C " +
          uc1.x.toFixed(1) +
          " " +
          uc1.y.toFixed(1) +
          ", " +
          uc2.x.toFixed(1) +
          " " +
          uc2.y.toFixed(1) +
          ", " +
          ux1.toFixed(1) +
          " " +
          uy1.toFixed(1);

        var p0 = { x: ux0, y: uy0 };
        var p1 = { x: ux1, y: uy1 };
        var midPt = bezierPoint(p0, uc1, uc2, p1, 0.5);
        var midTan = bezierTangent(p0, uc1, uc2, p1, 0.5);
        var uAngle = Math.atan2(midTan.dy, midTan.dx);
        arrowD += makeArrow(midPt.x, midPt.y, uAngle);
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
