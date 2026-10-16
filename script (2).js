
(() => {
  const stars = document.getElementById("stars");
  const hearts = document.getElementById("hearts");
  const musicBtn = document.getElementById("musicBtn");
  const musicText = document.getElementById("musicText");
  const musicIcon = document.getElementById("musicIcon");
  const modal = document.getElementById("surpriseModal");
  const surpriseBtn = document.getElementById("surpriseBtn");
  const closeModal = document.getElementById("closeModal");
  const moreHearts = document.getElementById("moreHearts");

  // Twinkling stars
  for (let i = 0; i < 145; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.setProperty("--duration", (2 + Math.random() * 4) + "s");
    star.style.animationDelay = (-Math.random() * 5) + "s";

    const size = Math.random() > 0.9 ? 3 : 1 + Math.random();
    star.style.width = size + "px";
    star.style.height = size + "px";

    stars.appendChild(star);
  }

  // Floating hearts
  function createHeart(x, y, fromButton = false) {
    const heart = document.createElement("span");
    heart.className = "heart-float";
    heart.textContent = ["♡", "♥", "✧", "❤"][Math.floor(Math.random() * 4)];

    heart.style.left = (x ?? Math.random() * 100) + (x === undefined ? "vw" : "px");
    heart.style.bottom = y === undefined ? "-35px" : "auto";

    if (y !== undefined) {
      heart.style.top = y + "px";
    }

    heart.style.fontSize = (12 + Math.random() * 23) + "px";
    heart.style.setProperty("--rise", (3.5 + Math.random() * 3) + "s");
    heart.style.opacity = String(0.45 + Math.random() * 0.55);

    hearts.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }

  // A few hearts drift through the background now and then
  setInterval(() => {
    if (document.hidden) return;
    if (Math.random() > 0.35) createHeart();
  }, 1100);

  function heartBurst(count = 24) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const spread = 150;
        createHeart(
          Math.max(0, Math.min(window.innerWidth - 20,
            centerX + (Math.random() - 0.5) * spread * 2)),
          Math.max(0, Math.min(window.innerHeight - 20,
            centerY + (Math.random() - 0.5) * spread * 2))
        );
      }, i * 45);
    }
  }

  // A soft original melody made with Web Audio — no music file needed
  let audioContext = null;
  let masterGain = null;
  let melodyTimer = null;
  let noteIndex = 0;
  let musicPlaying = false;

  const melody = [
    [392.00, 0.45], [493.88, 0.45], [587.33, 0.8],
    [493.88, 0.45], [440.00, 0.45], [392.00, 0.9],
    [349.23, 0.45], [392.00, 0.45], [440.00, 0.8],
    [392.00, 0.45], [329.63, 0.45], [392.00, 1.0],
    [293.66, 0.45], [349.23, 0.45], [392.00, 0.9],
    [440.00, 0.45], [392.00, 0.45], [329.63, 1.0]
  ];

  function playNote(frequency, duration) {
    if (!audioContext || !masterGain || !musicPlaying) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const noteGain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.055, now + 0.06);
    noteGain.gain.setTargetAtTime(0.0001, now + Math.max(0.1, duration * 0.65), 0.15);

    oscillator.connect(noteGain);
    noteGain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.5);

    // A quiet lower note adds a warm, dreamy layer
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();

    bass.type = "sine";
    bass.frequency.setValueAtTime(frequency / 2, now);
    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.012, now + 0.08);
    bassGain.gain.setTargetAtTime(0.0001, now + 0.25, 0.18);

    bass.connect(bassGain);
    bassGain.connect(masterGain);
    bass.start(now);
    bass.stop(now + 0.8);
  }

  function scheduleMelody() {
    if (!musicPlaying) return;

    const [frequency, duration] = melody[noteIndex];
    playNote(frequency, duration);

    noteIndex = (noteIndex + 1) % melody.length;
    melodyTimer = setTimeout(scheduleMelody, duration * 650);
  }

  async function startMusic() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      musicText.textContent = "Audio isn't supported";
      return;
    }

    try {
      if (!audioContext) {
        audioContext = new AudioContextClass();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.65;
        masterGain.connect(audioContext.destination);
      }

      await audioContext.resume();
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-pressed", "true");
      musicText.textContent = "Pause our melody";
      musicIcon.textContent = "♫";

      clearTimeout(melodyTimer);
      scheduleMelody();
    } catch (error) {
      musicText.textContent = "Tap to try again";
      musicPlaying = false;
    }
  }

  function stopMusic() {
    musicPlaying = false;
    clearTimeout(melodyTimer);
    musicBtn.classList.remove("playing");
    musicBtn.setAttribute("aria-pressed", "false");
    musicText.textContent = "Play our melody";
    musicIcon.textContent = "♫";
  }

  musicBtn.addEventListener("click", () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });

  // Surprise modal
  function openSurprise() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    heartBurst(30);
  }

  function hideSurprise() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  surpriseBtn.addEventListener("click", openSurprise);
  closeModal.addEventListener("click", hideSurprise);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) hideSurprise();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideSurprise();
  });

  moreHearts.addEventListener("click", () => {
    heartBurst(45);
    moreHearts.textContent = "Sending you all my love ♥";
    setTimeout(() => {
      moreHearts.textContent = "Send more love ♥";
    }, 2200);
  });
})();
