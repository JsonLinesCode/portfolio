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
      });
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    runWordleSequence();
    initFilters();

    var replayBtn = document.getElementById("replay-wordle");
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

    if (replayBtn) {
      replayBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        triggerReplay();
      });
    }
    if (wordleBoard) {
      wordleBoard.addEventListener("click", triggerReplay);
    }
  });
})(window, document);
