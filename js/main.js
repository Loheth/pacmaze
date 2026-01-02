$(function(){
  var el = document.getElementById("pacman");
  var startScreen = document.getElementById("start-screen");
  var gameContainer = document.getElementById("game-container");
  var playButton = document.getElementById("play-button");
  var muteButton = document.getElementById("mute-button");
  var muteIcon = document.getElementById("mute-icon");

  // Function to check if sound is disabled
  function soundDisabled() {
    return localStorage["soundDisabled"] === "true";
  }

  // Function to update mute button appearance
  function updateMuteButton() {
    if (soundDisabled()) {
      muteButton.classList.add("muted");
      muteIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/></svg>';
    } else {
      muteButton.classList.remove("muted");
      muteIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>';
    }
  }

  // Initialize mute button state
  updateMuteButton();

  // Mute button click handler
  muteButton.addEventListener("click", function() {
    // If game is initialized, use its toggle method
    if (typeof PACMAN !== "undefined" && PACMAN.toggleSound) {
      PACMAN.toggleSound();
    } else {
      // Game not initialized yet, just toggle localStorage
      var wasDisabled = soundDisabled();
      localStorage["soundDisabled"] = !wasDisabled;
    }
    updateMuteButton();
  });

  // Listen for 'S' key to sync button state (game.js also handles this key)
  document.addEventListener("keydown", function(e) {
    if (e.keyCode === 83) { // 'S' key
      // Small delay to let game.js handler run first
      setTimeout(function() {
        updateMuteButton();
      }, 10);
    }
  });

  // Show start screen initially, hide game
  startScreen.style.display = "flex";
  gameContainer.style.display = "none";

  // Play button click handler
  playButton.addEventListener("click", function() {
    // Hide start screen
    startScreen.style.display = "none";
    // Show game container
    gameContainer.style.display = "flex";
    
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

// Updated.

