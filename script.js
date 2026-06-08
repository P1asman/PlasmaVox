document.addEventListener('DOMContentLoaded', () => {

  /* ==================================
     CINEMATIC INTRO SEQUENCE
     ================================== */

  const introStatus = document.getElementById('intro-status');

  if (introStatus) {

    const messages = [
      "INITIALISING...",
      "CALIBRATING FREQUENCIES...",
      "VOICE PROFILE LOADED",
      "BROADCAST READY"
    ];

    let current = 0;

    const changeMessage = () => {

      introStatus.style.opacity = '0';

      setTimeout(() => {

        introStatus.textContent = messages[current];
        introStatus.style.opacity = '1';

        current++;

        if (current < messages.length) {
          setTimeout(changeMessage, 700);
        }

      }, 250);
    };

    changeMessage();
  }

  const buttons = document.querySelectorAll('.play-btn');
  let currentAudio = null;
  let currentButton = null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  buttons.forEach(button => {
    const playerRow = button.closest('.player-row');
    const timeEl = playerRow.querySelector('time');
    const progressContainer = playerRow.querySelector('.progress-container');
    const progressBar = playerRow.querySelector('.progress');
    const audioSrc = button.dataset.audio;

    if (!audioSrc) return;

    // Preload duration
    const tempAudio = new Audio(audioSrc);
    tempAudio.addEventListener('loadedmetadata', () => {
      if (timeEl) timeEl.textContent = formatTime(tempAudio.duration);
    });

    button.addEventListener('click', () => {
      // Toggle same track
      if (currentAudio && currentButton === button) {
        if (!currentAudio.paused) {
          currentAudio.pause();
          button.textContent = '▶';
        } else {
          currentAudio.play();
          button.textContent = '❚❚';
        }
        return;
      }

      // Stop previous
      if (currentAudio) {
        currentAudio.pause();
        if (currentButton) currentButton.textContent = '▶';
      }

      currentAudio = new Audio(audioSrc);
      currentButton = button;

      currentAudio.play().catch(err => console.error("Audio play failed:", err));
      button.textContent = '❚❚';

      currentAudio.addEventListener('timeupdate', () => {
        if (!currentAudio.duration) return;
        const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        if (timeEl) timeEl.textContent = formatTime(currentAudio.currentTime);
      });

      currentAudio.addEventListener('ended', () => {
        button.textContent = '▶';
        progressBar.style.width = '0%';
        if (timeEl) timeEl.textContent = formatTime(currentAudio.duration);
        currentAudio = null;
        currentButton = null;
      });
    });

    // Seek functionality
    progressContainer?.addEventListener('click', (e) => {
      if (!currentAudio || currentButton !== button) return;
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      currentAudio.currentTime = pos * currentAudio.duration;
    });
  });

  // Pause audio when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentAudio) {
      currentAudio.pause();
      if (currentButton) currentButton.textContent = '▶';
    }
  });
});