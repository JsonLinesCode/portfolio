(function (window, document, undefined) {
  // code that should be taken care of right away

  window.onload = init;

  function init() {
    var i = 1;
    myLoop();
    function myLoop() {
      //  create a loop function
      setTimeout(function () {
        //  call a 3s setTimeout when the loop is called
        flipCard(i.toString());
        i++; //  increment the counter
        if (i < 11) {  //  if the counter < 10, call the loop function
          myLoop(); //  ..  again which will trigger another
        } 
        else {
            var cusid_ele = document.getElementsByClassName("lettersrow");

            for (var j = 0; j < cusid_ele.length; ++j) {
              var item = cusid_ele[j];
              item.classList.toggle("animateCenter");;
            }
        }
      }, 250);
    }

   

    function flipCard(id) {
      console.log(id);
      const card = document.getElementById("l" + id);
      card.classList.toggle("flipCard");
    }
  }
})(window, document, undefined);
