$(function(){
  var el = document.getElementById("pacman");
  var startScreen = document.getElementById("start-screen");
  var gameContainer = document.getElementById("game-container");
  var playButton = document.getElementById("play-button");

  // Show start screen initially, hide game
  startScreen.style.display = "flex";
  gameContainer.style.display = "none";

  // Play button click handler
  playButton.addEventListener("click", function() {
    // Hide start screen
    startScreen.style.display = "none";
    // Show game container
    gameContainer.style.display = "block";
    
    // Initialize game
    if (Modernizr.canvas && Modernizr.localstorage && 
        Modernizr.audio && (Modernizr.audio.ogg || Modernizr.audio.mp3)) {
      window.setTimeout(function () { PACMAN.init(el, "https://raw.githubusercontent.com/daleharvey/pacman/master/"); }, 0);
    } else { 
      el.innerHTML = "Sorry, needs a decent browser<br /><small>" + 
        "(firefox 3.6+, Chrome 4+, Opera 10+ and Safari 4+)</small>";
    }
  });
});

