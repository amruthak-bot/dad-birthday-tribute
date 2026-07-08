// Core JavaScript Engine for Dad's Birthday Tribute

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let MEMORIES_DATA = null;
  let WISHES_DATA = [];
  let audioContext = null;
  let synthInterval = null;
  let isPlaying = false;
  let activeChapter = "legacy";
  let activePolaroids = [];
  let blownCandles = new Set();
  const totalCandles = 5;
  let animationFrameId = null;
  
  // Canvas particles
  let lanterns = [];
  let confetti = [];
  let balloons = [];
  let currentAudio = null;
  let globalMuted = false;

  // --- SELECTORS ---
  const introLoader = document.getElementById("intro-loader");
  const enterBtn = document.getElementById("enter-btn");
  const appContainer = document.getElementById("app-container");
  const musicToggle = document.getElementById("music-toggle");
  const muteAllBtn = document.getElementById("mute-all-btn");
  
  const booksGrid = document.getElementById("books-grid");
  const scrapbookOverlay = document.getElementById("scrapbook-overlay");
  const closeScrapbook = document.getElementById("close-scrapbook");
  const scrapbookTitle = document.getElementById("scrapbook-title");
  const scrapbookDesc = document.getElementById("scrapbook-desc");
  const masonryGallery = document.getElementById("masonry-gallery");
  
  const deskCanvas = document.getElementById("desk-canvas");
  const chapterSelect = document.getElementById("chapter-select");
  const scatterShuffle = document.getElementById("scatter-shuffle");
  
  const gratitudeDeck = document.getElementById("gratitude-deck");
  
  const celebrationCanvas = document.getElementById("celebration-canvas");
  const candlesContainer = document.getElementById("candles-container");
  const wishesBoard = document.getElementById("wishes-board");
  
  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const closeLightbox = document.getElementById("close-lightbox");
  const backLightbox = document.getElementById("back-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxDate = document.getElementById("lightbox-date");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxStory = document.getElementById("lightbox-story");
  const backScrapbook = document.getElementById("back-scrapbook");

  // --- 1. WEB AUDIO API LOFI SYNTHESIZER ---
  // A gentle arpeggiator that synthesizes a warm music box melody.
  function initAudio() {
    if (audioContext) return;
    
    // Create AudioContext (fallback for safari)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  // Melody frequencies (Music Box/Lofi ambient pluck)
  // Chord progression: Fmaj9 - G6 - Cmaj9 - Am9
  const melodyNotes = [
    // Fmaj9 arpeggio
    { note: "F3", freq: 174.61, time: 0 },
    { note: "A3", freq: 220.00, time: 0.25 },
    { note: "C4", freq: 261.63, time: 0.5 },
    { note: "E4", freq: 329.63, time: 0.75 },
    { note: "G4", freq: 392.00, time: 1.0 },
    { note: "E4", freq: 329.63, time: 1.25 },
    { note: "C4", freq: 261.63, time: 1.5 },
    { note: "A3", freq: 220.00, time: 1.75 },

    // G6 arpeggio
    { note: "G3", freq: 196.00, time: 2.0 },
    { note: "B3", freq: 246.94, time: 2.25 },
    { note: "D4", freq: 293.66, time: 2.5 },
    { note: "G4", freq: 392.00, time: 2.75 },
    { note: "B4", freq: 493.88, time: 3.0 },
    { note: "G4", freq: 392.00, time: 3.25 },
    { note: "D4", freq: 293.66, time: 3.5 },
    { note: "B3", freq: 246.94, time: 3.75 },

    // Cmaj9 arpeggio
    { note: "C3", freq: 130.81, time: 4.0 },
    { note: "G3", freq: 196.00, time: 4.25 },
    { note: "C4", freq: 261.63, time: 4.5 },
    { note: "E4", freq: 329.63, time: 4.75 },
    { note: "G4", freq: 392.00, time: 5.0 },
    { note: "B4", freq: 493.88, time: 5.25 },
    { note: "G4", freq: 392.00, time: 5.5 },
    { note: "E4", freq: 329.63, time: 5.75 },

    // Am9 arpeggio
    { note: "A2", freq: 110.00, time: 6.0 },
    { note: "E3", freq: 164.81, time: 6.25 },
    { note: "A3", freq: 220.00, time: 6.5 },
    { note: "C4", freq: 261.63, time: 6.75 },
    { note: "E4", freq: 329.63, time: 7.0 },
    { note: "G4", freq: 392.00, time: 7.25 },
    { note: "E4", freq: 329.63, time: 7.5 },
    { note: "C4", freq: 261.63, time: 7.75 }
  ];

  function playPluck(frequency, timeOffset) {
    if (!audioContext || audioContext.state === 'suspended') return;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Sound styling (Sine/Triangle mix for music box sound)
    osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime + timeOffset);

    // Warm Low-pass Filter sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime + timeOffset);
    filter.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + timeOffset + 0.8);

    // ADSR Envelope (Attack: fast pluck, Decay: long fading decay)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + timeOffset);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + timeOffset + 0.02); // Pluck peak
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + timeOffset + 1.2); // Smooth decay

    // Connections
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.start(audioContext.currentTime + timeOffset);
    osc.stop(audioContext.currentTime + timeOffset + 1.5);
  }

  function startSynthMelody() {
    initAudio();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    let loopLength = 8.0; // Seconds for arpeggio loop
    let stepCount = 0;

    const playSequence = () => {
      melodyNotes.forEach(note => {
        playPluck(note.freq, note.time);
      });
    };

    // Play initial sequence
    playSequence();

    // Schedule subsequent loops
    synthInterval = setInterval(() => {
      playSequence();
    }, loopLength * 1000);
    
    isPlaying = true;
    musicToggle.classList.add("playing");
    musicToggle.querySelector(".music-text").innerText = "Mute Melody";
  }

  function stopSynthMelody() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
    isPlaying = false;
    musicToggle.classList.remove("playing");
    musicToggle.querySelector(".music-text").innerText = "Play Melody";
  }

  musicToggle.addEventListener("click", () => {
    if (isPlaying) {
      stopSynthMelody();
    } else {
      if (globalMuted) {
        globalMuted = false;
        muteAllBtn.classList.remove("muted");
        muteAllBtn.querySelector(".mute-icon").innerText = "🔊";
        muteAllBtn.querySelector(".mute-text").innerText = "Mute All";
      }
      startSynthMelody();
    }
  });

  // --- 1.5 VOICEOVER CONTROL ---
  let wasMelodyPlaying = false;

  function updateCardPlayButtons(activeUrl, isPlay) {
    const playButtons = document.querySelectorAll(".play-voice-btn");
    playButtons.forEach(btn => {
      const btnUrl = btn.getAttribute("data-audio");
      if (btnUrl === activeUrl) {
        btn.innerHTML = isPlay ? "⏸ Pause" : "🔊 Voiceover";
        if (isPlay) {
          btn.style.background = "rgba(212, 175, 55, 0.3)";
        } else {
          btn.style.background = "rgba(212, 175, 55, 0.15)";
        }
      } else {
        btn.innerHTML = "🔊 Voiceover";
        btn.style.background = "rgba(212, 175, 55, 0.15)";
      }
    });
  }

  function playVoiceover(url, isUserInitiated = false) {
    if (globalMuted) {
      if (!isUserInitiated) return;
      
      // Auto unmute on manual play click
      globalMuted = false;
      muteAllBtn.classList.remove("muted");
      muteAllBtn.querySelector(".mute-icon").innerText = "🔊";
      muteAllBtn.querySelector(".mute-text").innerText = "Mute All";
    }

    if (currentAudio) {
      const isSame = currentAudio.src.endsWith(url);
      currentAudio.pause();
      const prevSrc = currentAudio.src;
      currentAudio = null;
      const cleanPrev = prevSrc.substring(prevSrc.indexOf("audio/"));
      updateCardPlayButtons(cleanPrev, false);
      if (isSame) {
        if (wasMelodyPlaying && !globalMuted) {
          startSynthMelody();
        }
        return;
      }
    }
    if (!url) return;
    
    // Pause lofi background music if playing to clear space for voiceover
    if (isPlaying) {
      wasMelodyPlaying = true;
      stopSynthMelody();
    } else {
      wasMelodyPlaying = false;
    }
    
    currentAudio = new Audio(url);
    updateCardPlayButtons(url, true);

    currentAudio.play().catch(e => {
      console.log("Voiceover audio play failed or not yet uploaded:", e);
      if (wasMelodyPlaying && !globalMuted) {
        startSynthMelody();
      }
      updateCardPlayButtons(url, false);
    });
    
    currentAudio.onended = () => {
      updateCardPlayButtons(url, false);
      currentAudio = null;
      if (wasMelodyPlaying && !globalMuted) {
        startSynthMelody();
      }
    };

    currentAudio.onpause = () => {
      updateCardPlayButtons(url, false);
    };
  }

  function playTopCardAudio() {
    if (globalMuted) return;
    const topCard = gratitudeDeck.firstElementChild;
    if (!topCard) return;
    
    const playBtn = topCard.querySelector(".play-voice-btn");
    if (playBtn) {
      const audioUrl = playBtn.getAttribute("data-audio");
      playVoiceover(audioUrl, false); // pass false because scroll/system event
    }
  }

  // Master Mute All button handler
  muteAllBtn.addEventListener("click", () => {
    globalMuted = !globalMuted;
    
    if (globalMuted) {
      // Mute everything
      if (currentAudio) {
        currentAudio.pause();
      }
      if (isPlaying) {
        wasMelodyPlaying = true;
        stopSynthMelody();
      } else {
        wasMelodyPlaying = false;
      }
      muteAllBtn.classList.add("muted");
      muteAllBtn.querySelector(".mute-icon").innerText = "🔇";
      muteAllBtn.querySelector(".mute-text").innerText = "Unmute All";
    } else {
      // Unmute and resume background melody if it was playing
      muteAllBtn.classList.remove("muted");
      muteAllBtn.querySelector(".mute-icon").innerText = "🔊";
      muteAllBtn.querySelector(".mute-text").innerText = "Mute All";
      
      if (wasMelodyPlaying) {
        startSynthMelody();
      }
    }
  });

  // --- 2. INTRO LOADER HANDLER ---
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      // Fade out screen overlay and transition main site
      introLoader.classList.add("fade-out");
      appContainer.classList.remove("hidden-app");
      
      // Delay minor to let screen shift smoothly
      setTimeout(() => {
        appContainer.classList.add("show-app");
        // Scatter Polaroids initially
        scatterPolaroids(activeChapter);

        // Start welcome voiceover!
        playVoiceover("audio/track1.mp3", true);
        // Override onended to start background music after welcome voiceover ends
        if (currentAudio) {
          currentAudio.onended = () => {
            currentAudio = null;
            startSynthMelody();
          };
        } else {
          startSynthMelody();
        }
      }, 100);
    });
  }

  // --- 3. RENDERING LIFE CHAPTERS (3D BOOKS) ---
  function renderChapters() {
    booksGrid.innerHTML = "";
    
    // Add dropdown select options dynamically
    chapterSelect.innerHTML = "";
    
    MEMORIES_DATA.chapters.forEach((chapter, index) => {
      const bookWrapper = document.createElement("div");
      bookWrapper.className = "book-wrapper";
      bookWrapper.setAttribute("data-id", chapter.id);

      // Book interior structure
      bookWrapper.innerHTML = `
        <div class="book book-${index + 1}">
          <div class="book-spine"></div>
          <div class="book-cover">
            <div class="book-chapter-tag">Chapter ${index + 1}</div>
            <h3 class="book-title">${chapter.title}</h3>
            <span class="book-photo-count">${chapter.photos.length} Memories</span>
            <div class="book-cover-vintage-border"></div>
          </div>
          <div class="book-pages"></div>
        </div>
      `;

      bookWrapper.addEventListener("click", () => {
        openScrapbookAlbum(chapter);
      });

      booksGrid.appendChild(bookWrapper);

      // Populate dropdown for Polaroids section
      const option = document.createElement("option");
      option.value = chapter.id;
      option.text = chapter.title;
      chapterSelect.appendChild(option);
    });

    // Make chapters grid dynamic selector state sync
    chapterSelect.value = activeChapter;
  }

  // Open album details overlay
  function openScrapbookAlbum(chapter) {
    scrapbookTitle.innerText = chapter.title;
    scrapbookDesc.innerText = chapter.description;
    
    // Clear & populate masonry gallery
    masonryGallery.innerHTML = "";
    
    chapter.photos.forEach((photo) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML = `
        <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
        <div class="gallery-item-info">
          <span class="gallery-item-date">${photo.date}</span>
          <p class="gallery-item-caption">${photo.caption}</p>
        </div>
      `;
      
      // Click details -> open photo lightbox
      item.addEventListener("click", () => {
        openPhotoLightbox(photo);
      });

      masonryGallery.appendChild(item);
    });

    scrapbookOverlay.classList.add("show-overlay");
    document.body.style.overflow = "hidden"; // Lock background scroll
  }

  closeScrapbook.addEventListener("click", () => {
    scrapbookOverlay.classList.remove("show-overlay");
    document.body.style.overflow = ""; // Restore background scroll
  });

  backScrapbook.addEventListener("click", () => {
    scrapbookOverlay.classList.remove("show-overlay");
    document.body.style.overflow = ""; // Restore background scroll
  });

  // --- 4. PHOTO LIGHTBOX NARRATIVE STORY ---
  const localStories = {
    "legacy": [
      "Here is a reflection of early days. Looking back at this photo, I am filled with immense gratitude. Thank you, Dad, for setting standard life goals, demonstrating resilience, and always ensuring we had food, care, and a safe roof over our heads.",
      "The quiet moments of the past shaped our future. Looking at your smile here, I realize how much of your own youth and dreams you dedicated to building ours. I cherish these roots forever.",
      "A photograph from an era where simplicity reigned. You taught me to value character over wealth, a lesson that anchors me in everything I do today."
    ],
    "family": [
      "Everyday laughs and little moments that made up our home. Thank you for making our childhood full of small family parties, tea breaks, and jokes. Your laughter is the happiest sound in our family.",
      "The anchor of our home. Whenever challenges came, you stood tall and smiled, shielding us from the storm. This picture captures that peaceful assurance you always give us.",
      "Growing up with your guidance was the greatest privilege. The conversations we had around the dining table are my life's compass."
    ],
    "adventures": [
      "Adventures, scenic routes, and special journeys. You always encouraged us to explore the world, to see new places, and to open our minds. Thank you for showing me that life is an endless path of discovery.",
      "Capturing your vibrant spirit! You taught me that curiosity doesn't fade with age. I hope to possess your enthusiasm for learning and traveling when I grow up.",
      "A day of travel and celebrations. Every trip with you is an education in joy, planning, and appreciating the beauty around us."
    ],
    "golden": [
      "A recent snapshot of your smiling face. Even as years pass, your eyes hold the same spark of love and kindness. Happy Birthday, Dad, I love you more than words can say.",
      "Our modern celebrations! Thank you for remaining our constant companion, mentor, and best friend. Seeing you proud is my ultimate motivation.",
      "A beautiful recent memory. We cherish every second we get to spend learning from your wisdom, sharing stories, and laughing together."
    ]
  };

  function getRandomStory(chapterId) {
    const list = localStories[chapterId] || localStories["family"];
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  function openPhotoLightbox(photo) {
    lightboxImg.src = photo.src;
    lightboxDate.innerText = photo.date;
    lightboxCaption.innerText = photo.caption;
    
    // Determine which chapter this photo belongs to for story relevance
    let currentChapterId = "family";
    for (let ch of MEMORIES_DATA.chapters) {
      if (ch.photos.some(p => p.src === photo.src)) {
        currentChapterId = ch.id;
        break;
      }
    }

    // Set interactive emotional message
    lightboxStory.innerHTML = `
      <p style="margin-bottom:15px;">${getRandomStory(currentChapterId)}</p>
      <p style="font-family: var(--font-handwritten); font-size: 2.2rem; text-align: right; color: var(--gold); margin-top:20px;">Thank you, Dad.</p>
    `;

    lightboxOverlay.classList.add("show-overlay");
    document.body.style.overflow = "hidden";
  }

  closeLightbox.addEventListener("click", () => {
    lightboxOverlay.classList.remove("show-overlay");
    // Only restore scroll if the scrapbook overlay isn't also open
    if (!scrapbookOverlay.classList.contains("show-overlay")) {
      document.body.style.overflow = "";
    }
  });

  backLightbox.addEventListener("click", () => {
    lightboxOverlay.classList.remove("show-overlay");
    // Only restore scroll if the scrapbook overlay isn't also open
    if (!scrapbookOverlay.classList.contains("show-overlay")) {
      document.body.style.overflow = "";
    }
  });

  // --- 5. TACTILE DRAGGABLE POLAROIDS ON DESK ---
  function scatterPolaroids(chapterId) {
    // Clear canvas
    const oldPolaroids = deskCanvas.querySelectorAll(".polaroid");
    oldPolaroids.forEach(p => p.remove());
    activePolaroids = [];

    // Find the chapter
    const chapter = MEMORIES_DATA.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    // Scatter a representative sample of up to 15-20 photos to keep performance fluid
    const photosToScatter = chapter.photos.slice(0, 18);
    const canvasWidth = deskCanvas.clientWidth;
    const canvasHeight = deskCanvas.clientHeight;

    photosToScatter.forEach((photo, idx) => {
      const polaroid = document.createElement("div");
      polaroid.className = "polaroid";
      polaroid.setAttribute("data-index", idx);
      
      // Random starting coordinates and rotation angle
      const randomX = Math.random() * (canvasWidth - 200) + 10;
      const randomY = Math.random() * (canvasHeight - 240) + 15;
      const randomRotation = (Math.random() - 0.5) * 30; // -15deg to +15deg

      polaroid.style.left = `${randomX}px`;
      polaroid.style.top = `${randomY}px`;
      polaroid.style.transform = `rotate(${randomRotation}deg)`;
      polaroid.style.zIndex = idx + 1;

      const polaroidTags = ["Dad", "Hero", "Smiles", "Love", "Forever", "Joy", "Anchor", "Guide", "Warmth", "Family", "❤"];
      const randomTag = polaroidTags[idx % polaroidTags.length];

      polaroid.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${photo.src}" alt="${photo.caption}">
        </div>
        <div class="polaroid-caption">${randomTag}</div>
      `;

      // Set up Drag interactions
      setupPolaroidDrag(polaroid);

      // Double click or double tap to view details
      polaroid.addEventListener("dblclick", () => {
        openPhotoLightbox(photo);
      });

      // Touch friendly double tap
      let lastTap = 0;
      polaroid.addEventListener("touchend", (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
          openPhotoLightbox(photo);
        }
        lastTap = currentTime;
      });

      deskCanvas.appendChild(polaroid);
      activePolaroids.push({
        element: polaroid,
        x: randomX,
        y: randomY,
        rot: randomRotation,
        zIndex: idx + 1
      });
    });
  }

  // Draggable physics using PointerEvents (unified mouse & touch)
  let highestZ = 20;

  function setupPolaroidDrag(element) {
    let isDragging = false;
    let startX, startY;
    let currentX = parseFloat(element.style.left);
    let currentY = parseFloat(element.style.top);
    let rotation = parseFloat(element.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;

    element.addEventListener("pointerdown", (e) => {
      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      
      // Bring to front
      highestZ += 1;
      element.style.zIndex = highestZ;
      element.style.transform = `rotate(${rotation}deg) scale(1.05)`;
      element.setPointerCapture(e.pointerId);
    });

    element.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      
      const canvasRect = deskCanvas.getBoundingClientRect();
      let x = e.clientX - startX;
      let y = e.clientY - startY;

      // Bound within canvas desk borders
      x = Math.max(-50, Math.min(canvasRect.width - 130, x));
      y = Math.max(-50, Math.min(canvasRect.height - 180, y));

      currentX = x;
      currentY = y;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    });

    element.addEventListener("pointerup", (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      // Random subtle rotation drop
      rotation = (Math.random() - 0.5) * 20;
      element.style.transform = `rotate(${rotation}deg) scale(1)`;
      element.releasePointerCapture(e.pointerId);
    });
  }

  // Handle Desk Controls
  chapterSelect.addEventListener("change", (e) => {
    activeChapter = e.target.value;
    scatterPolaroids(activeChapter);
  });

  scatterShuffle.addEventListener("click", () => {
    scatterPolaroids(activeChapter);
  });

  // --- 6. GRATITUDE DECK (SWIPE LOVING CARDS) ---
  function renderGratitudeDeck() {
    gratitudeDeck.innerHTML = "";
    
    MEMORIES_DATA.gratitudes.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "gratitude-card";
      card.style.zIndex = MEMORIES_DATA.gratitudes.length - index;

      card.innerHTML = `
        <div class="gratitude-card-inner">
          <div class="gratitude-card-header">
            <h3>${item.title}</h3>
          </div>
          <p class="gratitude-text">"${item.text}"</p>
          <div class="card-audio-controls" style="margin-top: auto; text-align: center; position: relative; z-index: 10; padding: 10px 0;">
            <button class="play-voice-btn" data-audio="${item.audio || ''}" style="background: rgba(64, 16, 29, 0.06); border: 1px solid var(--burgundy-light); color: var(--burgundy-light); padding: 8px 20px; border-radius: 20px; font-family: var(--font-body); font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px;">
              🔊 Voiceover
            </button>
          </div>
          <span class="gratitude-signature">- Forever Your Child</span>
        </div>
      `;

      // Swipe card out on clicking card body
      card.addEventListener("click", (e) => {
        // If clicking the play button, do not swipe!
        if (e.target.closest(".play-voice-btn")) return;
        swipeCardOut(card);
      });

      // Wire play button
      const playBtn = card.querySelector(".play-voice-btn");
      if (playBtn) {
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const audioUrl = playBtn.getAttribute("data-audio");
          if (currentAudio && currentAudio.src.endsWith(audioUrl) && !currentAudio.paused) {
            currentAudio.pause();
          } else {
            playVoiceover(audioUrl, true); // true = user initiated
          }
        });
      }

      gratitudeDeck.appendChild(card);
    });
  }

  function swipeCardOut(card) {
    card.classList.add("swipe-out");
    
    // Once transition finished, move card to bottom of the stack
    setTimeout(() => {
      card.classList.remove("swipe-out");
      gratitudeDeck.appendChild(card);
      
      // Re-assign z-indices (first child gets highest z-index)
      const cards = gratitudeDeck.querySelectorAll(".gratitude-card");
      cards.forEach((c, idx) => {
        c.style.zIndex = cards.length - idx;
      });

      // Automatically play audio of the new top card!
      playTopCardAudio();
    }, 600);
  }

  // --- 7. CAKE CANDLE CEREMONY & LANTERN CANVAS ---
  function initCelebrationRoom() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const candles = candlesContainer.querySelectorAll(".candle");
    candles.forEach((candle) => {
      candle.addEventListener("click", () => {
        const id = candle.getAttribute("data-id");
        if (blownCandles.has(id)) return;

        // Blow out candle
        blownCandles.add(id);
        candle.classList.add("blown");
        
        // Play a high pluck note when a candle is extinguished
        if (audioContext && audioContext.state !== 'suspended') {
          playPluck(523.25 + (id * 100), 0); // E5, F5, G5, etc.
        }

        // Check if all candles blown out
        if (blownCandles.size === totalCandles) {
          triggerGrandCelebration();
        }
      });
    });

    // Setup dynamic wish form submit listener
    const wishForm = document.getElementById("wish-form");
    wishForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("wish-name");
      const textInput = document.getElementById("wish-text");

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      try {
        const response = await fetch('/api/wishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, text })
        });

        if (response.ok) {
          const newWish = await response.json();
          WISHES_DATA.push(newWish);
          
          // Render new wish at top of scroller list
          appendWishToScroller(newWish);

          // Clear inputs
          nameInput.value = "";
          textInput.value = "";

          // Launch a new floating wishing lantern containing this new message immediately!
          const newMsg = `${newWish.text} - ${newWish.name}`;
          lanterns.push(new Lantern(celebrationCanvas.width, celebrationCanvas.height, newMsg));
          
          // Sound effect
          if (audioContext && audioContext.state !== 'suspended') {
            playPluck(659.25, 0); // E5 pluck
          }
        }
      } catch (err) {
        console.error("Failed to post wish to backend API:", err);
      }
    });
  }

  function resizeCanvas() {
    celebrationCanvas.width = celebrationCanvas.parentElement.clientWidth;
    celebrationCanvas.height = celebrationCanvas.parentElement.clientHeight;
  }

  function triggerGrandCelebration() {
    // Reveal wishes box board
    wishesBoard.classList.remove("hidden");
    
    // Play celebratory chord chime
    if (audioContext) {
      playPluck(261.63, 0); // C4
      playPluck(329.63, 0.1); // E4
      playPluck(392.00, 0.2); // G4
      playPluck(523.25, 0.3); // C5
    }

    // Play final birthday wishes voiceover!
    setTimeout(() => {
      playVoiceover("audio/track8.mp3");
    }, 1000);

    // Launch lanterns, confetti, and balloons
    spawnLanterns(20);
    spawnConfetti(100);
    spawnBalloons(15);
    
    // Start animation loop
    if (!animationFrameId) {
      animationLoop();
    }
  }

  // --- 8. PARTICLE ENGINE (LANTERNS, CONFETTI, BALLOONS) ---
  class Lantern {
    constructor(canvasWidth, canvasHeight, message) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.x = Math.random() * canvasWidth;
      this.y = canvasHeight + Math.random() * 200;
      this.width = Math.random() * 25 + 20;
      this.height = this.width * 1.3;
      this.speed = Math.random() * 0.8 + 0.4;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
      this.wobbleRange = Math.random() * 1.5 + 0.5;
      this.time = Math.random() * 100;
      this.message = message || "Happy Birthday Dad!";
      this.opacity = Math.random() * 0.3 + 0.7;
    }

    update() {
      this.y -= this.speed;
      this.time += this.wobbleSpeed;
      this.x += Math.sin(this.time) * this.wobbleRange * 0.5;

      // Reset when floating completely off screen
      if (this.y < -this.height) {
        this.y = this.canvasHeight + this.height;
        this.x = Math.random() * this.canvasWidth;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(253, 150, 68, 0.8)";

      // Lantern body (gradient warm paper orange)
      const grad = ctx.createLinearGradient(0, 0, 0, this.height);
      grad.addColorStop(0, "#ffe066");
      grad.addColorStop(0.6, "#ff9233");
      grad.addColorStop(1, "#d35400");
      ctx.fillStyle = grad;

      // Draw paper trapezoid lantern shape
      ctx.beginPath();
      ctx.moveTo(this.width * 0.1, 0);
      ctx.lineTo(this.width * 0.9, 0);
      ctx.lineTo(this.width, this.height * 0.95);
      ctx.lineTo(this.width * 0.9, this.height);
      ctx.lineTo(this.width * 0.1, this.height);
      ctx.lineTo(0, this.height * 0.95);
      ctx.closePath();
      ctx.fill();

      // Bottom rim black band
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(this.width * 0.05, this.height - 4, this.width * 0.9, 4);

      // Inner flame glow
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(this.width * 0.5, this.height * 0.8, this.width * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Checking if click landed inside this lantern bounding box
    isClicked(mouseX, mouseY) {
      return (
        mouseX >= this.x &&
        mouseX <= this.x + this.width &&
        mouseY >= this.y &&
        mouseY <= this.y + this.height
      );
    }
  }

  class ConfettiParticle {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * -canvasHeight;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 2 + 2;
      this.speedX = (Math.random() - 0.5) * 2;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 10;
      
      const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45aaf2", "#a55eea", "#fd9644"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y > this.canvasHeight) {
        this.y = -20;
        this.x = Math.random() * this.canvasWidth;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      ctx.restore();
    }
  }

  class Balloon {
    constructor(canvasWidth, canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.x = Math.random() * canvasWidth;
      this.y = canvasHeight + Math.random() * 300;
      this.radius = Math.random() * 20 + 25;
      this.speed = Math.random() * 1.5 + 1;
      this.wobble = Math.random() * 0.01;
      this.wobbleRange = Math.random() * 2;
      this.time = Math.random() * 100;
      
      const colors = ["#ff5e57", "#ffc048", "#1dd1a1", "#00d2d3", "#5758bb", "#ef5777"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speed;
      this.time += this.wobble;
      this.x += Math.sin(this.time) * this.wobbleRange;

      if (this.y < -this.radius * 2) {
        this.y = this.canvasHeight + this.radius * 2;
        this.x = Math.random() * this.canvasWidth;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Balloon body (oval)
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 0.8, this.radius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight sheen
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(-this.radius * 0.3, -this.radius * 0.4, this.radius * 0.25, this.radius * 0.4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Bottom triangle knot
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, this.radius);
      ctx.lineTo(-6, this.radius + 8);
      ctx.lineTo(6, this.radius + 8);
      ctx.closePath();
      ctx.fill();

      // String line
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, this.radius + 8);
      ctx.bezierCurveTo(5, this.radius + 20, -5, this.radius + 35, 0, this.radius + 50);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Wishing Lantern Messages
  const lanternWishes = [
    "Wishing you lifetime peace, Dad!",
    "Thank you for everything you sacrificed.",
    "May this year bring you glowing health!",
    "I am the luckiest student, learning from you daily.",
    "Your happiness is my goal. Happy Birthday!",
    "To the rock of our family - we love you!",
    "Wishing you infinite laughter and smiles.",
    "May your eyes always shine with pride.",
    "To the man who taught me strength and kindness.",
    "I love you to the moon and back, Dad!"
  ];

  function spawnLanterns(count) {
    lanterns = [];
    const wishesToUse = WISHES_DATA.length > 0 
      ? WISHES_DATA.map(w => `${w.text} - ${w.name}`) 
      : lanternWishes;

    for (let i = 0; i < count; i++) {
      const msg = wishesToUse[i % wishesToUse.length];
      lanterns.push(new Lantern(celebrationCanvas.width, celebrationCanvas.height, msg));
    }
  }

  function spawnConfetti(count) {
    confetti = [];
    for (let i = 0; i < count; i++) {
      confetti.push(new ConfettiParticle(celebrationCanvas.width, celebrationCanvas.height));
    }
  }

  function spawnBalloons(count) {
    balloons = [];
    for (let i = 0; i < count; i++) {
      balloons.push(new Balloon(celebrationCanvas.width, celebrationCanvas.height));
    }
  }

  // Combined animation cycle
  function animationLoop() {
    const ctx = celebrationCanvas.getContext("2d");
    ctx.clearRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

    // Draw sky background light overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, celebrationCanvas.height);
    gradient.addColorStop(0, "rgba(16, 15, 28, 0)");
    gradient.addColorStop(0.8, "rgba(253, 150, 68, 0.05)");
    gradient.addColorStop(1, "rgba(253, 150, 68, 0.15)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, celebrationCanvas.width, celebrationCanvas.height);

    // Update & Draw Confetti
    confetti.forEach(c => {
      c.update();
      c.draw(ctx);
    });

    // Update & Draw Balloons
    balloons.forEach(b => {
      b.update();
      b.draw(ctx);
    });

    // Update & Draw Lanterns
    lanterns.forEach(l => {
      l.update();
      l.draw(ctx);
    });

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  // Interactive clicking of floating lanterns to pop open a message card
  celebrationCanvas.addEventListener("click", (e) => {
    // Get local coordinates inside canvas bounding box
    const rect = celebrationCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked any lantern
    for (let lantern of lanterns) {
      if (lantern.isClicked(mouseX, mouseY)) {
        // Pop open the wish lightbox!
        openLanternWishLightbox(lantern.message);
        break;
      }
    }
  });

  function openLanternWishLightbox(wishText) {
    // Show a beautiful popup with a golden borders containing the handwritten wish
    lightboxImg.src = ""; // Empty to keep simple letter style
    lightboxDate.innerText = "A Wish For You";
    lightboxCaption.innerText = "Floating Message of Love";
    
    // Set interactive handwritten note
    lightboxStory.innerHTML = `
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 3rem; display:block; margin-bottom: 20px;">🏮</span>
        <p style="font-family: var(--font-handwritten); font-size: 2.8rem; line-height:1.4; color: var(--cream); font-style:italic;">
          "${wishText}"
        </p>
      </div>
    `;

    // Temporarily hide the photo side inside lightbox structure for clean reading
    lightboxImg.parentElement.style.display = "none";
    lightboxOverlay.classList.add("show-overlay");
    document.body.style.overflow = "hidden";
  }

  // Restore photo side visibility when closing lightbox
  closeLightbox.addEventListener("click", () => {
    lightboxImg.parentElement.style.display = "";
  });

  function renderWishesList() {
    const wishesScroller = document.getElementById("wishes-scroller");
    if (!wishesScroller) return;
    wishesScroller.innerHTML = "";
    
    // Sort wishes descending by ID so newest is at the top of the guestbook board
    const reversedWishes = [...WISHES_DATA].reverse();
    reversedWishes.forEach(wish => {
      appendWishToScroller(wish, false);
    });
  }

  function appendWishToScroller(wish, atTop = true) {
    const wishesScroller = document.getElementById("wishes-scroller");
    if (!wishesScroller) return;
    
    const wishItem = document.createElement("div");
    wishItem.className = "wish-item";
    wishItem.innerHTML = `
      <div class="wish-item-name">${wish.name}</div>
      <div class="wish-item-text">"${wish.text}"</div>
    `;
    if (atTop && wishesScroller.firstChild) {
      wishesScroller.insertBefore(wishItem, wishesScroller.firstChild);
    } else {
      wishesScroller.appendChild(wishItem);
    }
  }

  // --- 8. THE A TO Z OF APPA DATA & INITIALIZATION ---
  const ATOZ_DATA = {
    "A": { "title": "Awesome (ಅದ್ಭುತ)", "text": "ಯಾವಾಗಲೂ ನಮ್ಮ ಸಂತೋಷಕ್ಕೆ ದಾರಿದೀಪವಾದ ಅದ್ಭುತ ವ್ಯಕ್ತಿ ನೀನು." },
    "B": { "title": "Brave (ಬಲಶಾಲಿ)", "text": "ಬಾಳಿನ ಯಾವುದೇ ಬಿರುಗಾಳಿಗೂ ಅಂಜದ ಧೀರ ಗುಣ ನಿನ್ನದು." },
    "C": { "title": "Caring (ಕಾಳಜಿ)", "text": "ನಮ್ಮ ಪ್ರತಿಯೊಂದು ಚಿಕ್ಕ ಅಗತ್ಯವನ್ನೂ ಅರಿತು ಸಲಹುವ ಕಾಳಜಿಯ ತಾಯಿ ನೀನು." },
    "D": { "title": "Dedicated (ಸಮರ್ಪಣೆ)", "text": "ನಮ್ಮ ಭವಿಷ್ಯಕ್ಕಾಗಿ ನಿನ್ನ ಇಡೀ ಜೀವನವನ್ನೇ ಸಮರ್ಪಿಸಿದ ತ್ಯಾಗಮಯಿ." },
    "E": { "title": "Encouraging (ಪ್ರೋತ್ಸಾಹ)", "text": "ಪ್ರತಿ ಹೆಜ್ಜೆಯಲ್ಲೂ 'ನಾನಿದ್ದೇನೆ' ಎಂದು ಬೆನ್ನು ತಟ್ಟುವ ಪ್ರೋತ್ಸಾಹಕ." },
    "F": { "title": "Friendly (ಸ್ನೇಹಿತ)", "text": "ತಂದೆಯಾಗಿ ಮಾತ್ರವಲ್ಲದೆ ಬದುಕಿನ ಸುಖ-ದುಃಖ ಹಂಚಿಕೊಳ್ಳುವ ಜೀವದ ಗೆಳೆಯ." },
    "G": { "title": "Guide (ಮಾರ್ಗದರ್ಶಕ)", "text": "ಸರಿ-ತಪ್ಪುಗಳ ದಾರಿಯಲ್ಲಿ ನಮಗೆ ದಾರಿದೀಪವಾದ ಗುರು ನೀನು." },
    "H": { "title": "Hero (ನಾಯಕ)", "text": "ನನ್ನ ಪಾಲಿನ ಏಕೈಕ ಮತ್ತು ಶಾಶ್ವತ ಕಲ್ಪನಾ ನಾಯಕ." },
    "I": { "title": "Inspirational (ಸ್ಪೂರ್ತಿ)", "text": "ನಿನ್ನ ತ್ಯಾಗ ಮತ್ತು ಕಷ್ಟ ಸಹಿಷ್ಣುತೆ ನಮಗೆ ನಿರಂತರ... ಭರವಸೆಯ ಸ್ಪೂರ್ತಿ." },
    "J": { "title": "Joyful (ಸಂತೋಷ)", "text": "ಮನೆಯಲ್ಲಿ ಸದಾ ನಗು ಉಕ್ಕಿಸುವ ಹರ್ಷದ ಒರತೆ." },
    "K": { "title": "Kind (ದಯಾಳು)", "text": "ಎಲ್ಲರ ನೋವಿಗೂ ಮಿಡಿಯುವ ಕೋಮಲ ದಯೆಯ ಹೃದಯ ನಿನ್ನದು." },
    "L": { "title": "Loving (ಪ್ರೀತಿ)", "text": "ಯಾವುದೇ ಷರತ್ತುಗಳಿಲ್ಲದ ನಿಸ್ವಾರ್ಥ ಪ್ರೀತಿಯ ಸಾಗರ." },
    "M": { "title": "Mentor (ಗುರು)", "text": "ಬದುಕನ್ನು ಹೇಗೆ ಎದುರಿಸಬೇಕೆಂದು ಕಲಿಸಿದ ಶ್ರೇಷ್ಠ ಗುರು." },
    "N": { "title": "Noble (ಉದಾತ್ತ)", "text": "ನಿನ್ನ ಸರಳತೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆ ನಮ್ಮ ಬದುಕಿನ ಆದರ್ಶ." },
    "O": { "title": "Optimistic (ಆಶಾವಾದಿ)", "text": "ಕತ್ತಲೆಯಲ್ಲೂ ಬೆಳಕಿನ ಕಿರಣವನ್ನು ಕಾಣುವ ಆಶಾವಾದಿ." },
    "P": { "title": "Patient (ಸಹನೆ)", "text": "ನಮ್ಮ ನೂರಾರು ಹಠಗಳನ್ನು ಮುಗುಳ್ನಗೆಯಿಂದಲೇ ಸಹಿಸಿದ ಮಹಾ ತಾಳ್ಮೆ." },
    "Q": { "title": "Quiet Strength (ಮೌನ ಶಕ್ತಿ)", "text": "ಮಾತಿಗಿಂತ ಹೆಚ್ಚಾಗಿ ಕೃತಿಯಲ್ಲೇ ನಿನ್ನ ಶಕ್ತಿಯನ್ನು ತೋರಿಸಿದ ಮೌನಿ." },
    "R": { "title": "Role Model (ಆದರ್ಶ)", "text": "ನಾನು ಎಂದಿಗೂ ನಿನ್ನಂತೆಯೇ ಆಗಬೇಕೆಂದು ಬಯಸುವ ಆದರ್ಶ ವ್ಯಕ್ತಿ." },
    "S": { "title": "Supportive (ಆಧಾರ)", "text": "ನಮ್ಮ ಇಡೀ ಸಂಸಾರಕ್ಕೆ ನೀನೇ ಭದ್ರವಾದ ದೊಡ್ಡ ಆಧಾರಸ್ತಂಭ." },
    "T": { "title": "Trustworthy (ನಂಬಿಕಸ್ಥ)", "text": "ನಮ್ಮ ಬದುಕಿನ ಅತ್ಯಂತ ನಂಬಿಕಸ್ಥ ಮತ್ತು ಸುರಕ್ಷಿತ ಆಸರೆ." },
    "U": { "title": "Understanding (ತಿಳುವಳಿಕೆ)", "text": "ಹೇಳದ ಮಾತುಗಳನ್ನೂ ಸಹ ಕಣ್ಣಲ್ಲೇ ಅರಿಯುವ ಸಹೃದಯಿ." },
    "V": { "title": "Valuable (ಅಮೂಲ್ಯ)", "text": "ನನ್ನ ಬದುಕಿನ ಅತ್ಯಂತ ಅಮೂಲ್ಯ ಮತ್ತು ಶ್ರೇಷ್ಠ ಆಸ್ತಿ ನೀನು." },
    "W": { "title": "Warm (ಆತ್ಮೀಯ)", "text": "ನಿನ್ನ ಅಪ್ಪುಗೆಯಲ್ಲಿ ನಮಗೆ ಸಿಗುವ ಆ ಆತ್ಮೀಯತೆಯೇ ಸ್ವರ್ಗ." },
    "X": { "title": "eXtraordinary (ಅಸಾಧಾರಣ)", "text": "ನಮ್ಮ ಪಾಲಿಗೆ ದೇವರೇ ಕೊಟ್ಟ ಅಸಾಧಾರಣ ಗಿಫ್ಟ್ ಅಪ್ಪ." },
    "Y": { "title": "Youthful (ಉತ್ಸಾಹಿ)", "text": "ನಮ್ಮ ಸಂತೋಷಕ್ಕಾಗಿ ನಮ್ಮೊಂದಿಗೆ ಮಗುವಾಗುವ ಯುವ ಮನಸ್ಸು." },
    "Z": { "title": "Zealous (ಆಸ್ಥೆ)", "text": "ನಮ್ಮ ಏಳಿಗೆಯಲ್ಲೇ ತನ್ನ ಇಡೀ ಆಸ್ಥೆಯನ್ನು ಇಟ್ಟ ತಂದೆ." }
  };

  function initAtoZBoard() {
    const atozGrid = document.getElementById("atoz-grid");
    const atozModal = document.getElementById("atoz-modal");
    const modalLetter = document.getElementById("modal-letter");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");
    const closeAtozModal = document.getElementById("close-atoz-modal");

    if (!atozGrid || !atozModal) return;

    atozGrid.innerHTML = "";
    Object.keys(ATOZ_DATA).forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "letter-btn";
      btn.innerText = letter;

      btn.addEventListener("click", () => {
        modalLetter.innerText = letter;
        modalTitle.innerText = ATOZ_DATA[letter].title;
        modalText.innerText = ATOZ_DATA[letter].text;

        atozModal.classList.remove("hidden");

        if (audioContext && audioContext.state !== 'suspended') {
          playPluck(523.25, 0); // C5
          playPluck(659.25, 0.08); // E5
          playPluck(783.99, 0.16); // G5
        }
      });

      atozGrid.appendChild(btn);
    });

    closeAtozModal.addEventListener("click", () => {
      atozModal.classList.add("hidden");
    });

    atozModal.addEventListener("click", (e) => {
      if (e.target === atozModal) {
        atozModal.classList.add("hidden");
      }
    });
  }

  // --- FETCH DYNAMIC DATABASE ---
  async function loadDatabase() {
    try {
      const memoriesRes = await fetch('/api/memories');
      MEMORIES_DATA = await memoriesRes.json();
      
      const wishesRes = await fetch('/api/wishes');
      WISHES_DATA = await wishesRes.json();

      // Once data is ready:
      renderChapters();
      renderGratitudeDeck();
      initAtoZBoard();
      renderWishesList();
      initCelebrationRoom();

      // Setup scroll observer for automated voiceovers on scroll (crawling)
      const gratitudeSection = document.getElementById("gratitude");
      if (gratitudeSection) {
        let hasPlayedInitially = false;
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Scroll in: play top card's audio
              if (!hasPlayedInitially) {
                // Short timeout to let scroll settle
                setTimeout(() => {
                  playTopCardAudio();
                }, 800);
                hasPlayedInitially = true;
              } else {
                playTopCardAudio();
              }
            } else {
              // Scroll out: pause voiceover if it is playing a card voiceover
              if (currentAudio) {
                const src = currentAudio.src;
                if (src.includes("track2.mp3") || src.includes("track3.mp3") || src.includes("track4.mp3") || 
                    src.includes("track5.mp3") || src.includes("track6.mp3") || src.includes("track7.mp3")) {
                  currentAudio.pause();
                }
              }
            }
          });
        }, {
          threshold: 0.35 // 35% of the section must be visible to trigger
        });
        
        observer.observe(gratitudeSection);
      }
    } catch (e) {
      console.error("Failed to load backend databases:", e);
    }
  }

  // --- INITIALIZE APPLICATION MODULES ---
  loadDatabase();
});
