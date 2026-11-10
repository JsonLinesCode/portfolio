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
      return;
    }

    var d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
    for (var p = 1; p < points.length; p++) {
      d += " L " + points[p].x.toFixed(1) + " " + points[p].y.toFixed(1);
    }
    path.setAttribute("d", d);
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
