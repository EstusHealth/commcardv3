/* CommCard V3 - Main Application */

(() => {
  'use strict';

  // =============================================
  // State
  // =============================================
  const state = {
    activeCategoryId: CATEGORIES[0].id,
    view: 'phrases', // 'phrases' | 'builder'
    theme: 'light',
    builderColor: CATEGORIES[0].color,
    builderColorLight: CATEGORIES[0].colorLight
  };

  // =============================================
  // URL Params (stateless settings persistence)
  // =============================================
  const Params = {
    get() {
      return new URLSearchParams(window.location.search);
    },
    set(key, value) {
      const params = this.get();
      params.set(key, value);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    },
    read() {
      const params = this.get();
      return {
        voice: params.get('voice') || null,
        rate: params.get('rate') ? parseFloat(params.get('rate')) : 0.85,
        vol: params.get('vol') ? parseFloat(params.get('vol')) : 1.0,
        theme: params.get('theme') || 'light',
        cat: params.get('cat') || CATEGORIES[0].id
      };
    }
  };

  // =============================================
  // Theme
  // =============================================
  const applyTheme = (theme) => {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const isActive = btn.dataset.theme === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    Params.set('theme', theme);
  };

  // =============================================
  // Copy to Clipboard
  // =============================================
  const copyToClipboard = async (text, btn) => {
    const origHTML = btn.innerHTML;
    const origLabel = btn.getAttribute('aria-label');
    const showConfirm = () => {
      btn.innerHTML = '<span aria-hidden="true">✓</span>';
      btn.setAttribute('aria-label', 'Copied!');
      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.setAttribute('aria-label', origLabel);
      }, 1500);
    };
    try {
      await navigator.clipboard.writeText(text);
      showConfirm();
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      showConfirm();
    }
  };

  // =============================================
  // Render: Phrase Cards
  // =============================================
  const createPhraseCard = (phrase, category) => {
    const card = document.createElement('article');
    card.className = 'phrase-card';
    card.setAttribute('role', 'listitem');

    const accent = document.createElement('div');
    accent.className = 'phrase-card__accent';
    accent.style.backgroundColor = category.color;

    const text = document.createElement('div');
    text.className = 'phrase-card__text';
    text.textContent = phrase;

    const actions = document.createElement('div');
    actions.className = 'phrase-card__actions';

    // Speak button
    if (Voice.isAvailable) {
      const speakBtn = document.createElement('button');
      speakBtn.className = 'btn btn-speak';
      speakBtn.setAttribute('aria-label', `Speak: ${phrase}`);
      speakBtn.innerHTML = '<span aria-hidden="true">🔊</span> Speak';
      speakBtn.addEventListener('click', () => Voice.speak(phrase));
      actions.appendChild(speakBtn);
    }

    // Show button
    const showBtn = document.createElement('button');
    showBtn.className = 'btn btn-show';
    showBtn.setAttribute('aria-label', `Show fullscreen: ${phrase}`);
    showBtn.innerHTML = '<span aria-hidden="true">📱</span> Show';
    showBtn.addEventListener('click', () => showFullscreen(phrase, category));

    const spacer = document.createElement('span');
    spacer.className = 'spacer';
    spacer.setAttribute('aria-hidden', 'true');

    // Download button
    const dlBtn = document.createElement('button');
    dlBtn.className = 'btn-download';
    dlBtn.setAttribute('aria-label', `Download card: ${phrase}`);
    dlBtn.setAttribute('title', 'Download as image');
    dlBtn.innerHTML = '<span aria-hidden="true">💾</span>';
    dlBtn.addEventListener('click', async () => {
      dlBtn.disabled = true;
      dlBtn.innerHTML = '<span aria-hidden="true">⏳</span>';
      try {
        await Export.download(phrase, category);
      } finally {
        dlBtn.disabled = false;
        dlBtn.innerHTML = '<span aria-hidden="true">💾</span>';
      }
    });

    // Keyboard: Enter = Speak, Shift+Enter = Show
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && Voice.isAvailable) {
        e.preventDefault();
        Voice.speak(phrase);
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        showFullscreen(phrase, category);
      }
    });

    // Copy button (icon-only)
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.setAttribute('aria-label', `Copy text: ${phrase}`);
    copyBtn.setAttribute('title', 'Copy text to clipboard');
    copyBtn.innerHTML = '<span aria-hidden="true">📋</span>';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(phrase, copyBtn);
    });

    actions.appendChild(showBtn);
    actions.appendChild(spacer);
    actions.appendChild(copyBtn);
    actions.appendChild(dlBtn);
    card.appendChild(accent);
    card.appendChild(text);
    card.appendChild(actions);

    return card;
  };

  const renderPhraseGrid = (categoryId) => {
    const gridEl = document.getElementById('phrase-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const category = CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    // Section header
    const header = document.getElementById('section-header');
    if (header) {
      const emojiEl = header.querySelector('.section-header__emoji');
      const titleEl = header.querySelector('.section-header__title');
      const barEl = header.querySelector('.section-header__bar');
      if (emojiEl) emojiEl.textContent = category.emoji;
      if (titleEl) titleEl.textContent = category.label;
      if (barEl) barEl.style.backgroundColor = category.color;
    }

    category.phrases.forEach(phrase => {
      gridEl.appendChild(createPhraseCard(phrase, category));
    });
  };

  // =============================================
  // Category Selection
  // =============================================
  const selectCategory = (categoryId) => {
    state.activeCategoryId = categoryId;
    Params.set('cat', categoryId);

    // Update tabs
    document.querySelectorAll('.cat-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.cat === categoryId);
      tab.setAttribute('aria-selected', tab.dataset.cat === categoryId ? 'true' : 'false');
    });

    // Update sidebar
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.cat === categoryId);
    });

    renderPhraseGrid(categoryId);

    // Scroll active tab into view
    const activeTab = document.querySelector(`.cat-tab[data-cat="${categoryId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  };

  // =============================================
  // Fullscreen Display Mode
  // =============================================
  const showFullscreen = (phrase, category) => {
    const overlay = document.getElementById('fullscreen-overlay');
    const textEl = document.getElementById('fullscreen-overlay__text');
    if (!overlay || !textEl) return;

    overlay.style.backgroundColor = category.colorLight;
    overlay.style.color = category.colorDark || category.color;
    textEl.textContent = phrase;

    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Speak automatically
    Voice.speak(phrase);

    // Focus for accessibility
    overlay.focus();
  };

  const dismissFullscreen = () => {
    const overlay = document.getElementById('fullscreen-overlay');
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    Voice.cancel();
  };

  // =============================================
  // Settings Panel
  // =============================================
  const openSettings = () => {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first interactive element
    const firstInput = panel.querySelector('select, button, input');
    if (firstInput) firstInput.focus();
  };

  const closeSettings = () => {
    const panel = document.getElementById('settings-panel');
    if (!panel) return;
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Return focus to settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.focus();
  };

  // =============================================
  // Voice Settings
  // =============================================
  const populateVoiceSelect = () => {
    const select = document.getElementById('voice-select');
    if (!select) return;

    const voices = Voice.getVoices();
    const currentURI = Voice.getSelectedVoiceURI();
    select.innerHTML = '<option value="">Default voice</option>';

    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      option.selected = voice.voiceURI === currentURI;
      select.appendChild(option);
    });
  };

  // =============================================
  // Card Builder
  // =============================================
  const BUILDER_COLORS = [
    { color: '#C0583A', light: '#F7EAE5' },
    { color: '#B07C1A', light: '#F7EDD8' },
    { color: '#4E7240', light: '#E7F0E3' },
    { color: '#5A7080', light: '#E5EDF1' },
    { color: '#7A5088', light: '#F0E8F3' },
    { color: '#3A7270', light: '#E3EDEC' },
    { color: '#76543E', light: '#F0E8E0' },
    { color: '#555555', light: '#EEEEEE' }
  ];

  const renderBuilder = () => {
    const container = document.getElementById('builder-colors');
    if (!container) return;
    container.innerHTML = '';

    BUILDER_COLORS.forEach(({ color, light }, i) => {
      const btn = document.createElement('button');
      btn.className = 'color-swatch' + (i === 0 ? ' selected' : '');
      btn.style.backgroundColor = color;
      btn.setAttribute('aria-label', `Select colour ${color}`);
      btn.dataset.color = color;
      btn.dataset.light = light;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
        state.builderColor = color;
        state.builderColorLight = light;
        updateBuilderPreview();
      });
      container.appendChild(btn);
    });
  };

  const updateBuilderPreview = () => {
    const input = document.getElementById('builder-text');
    const preview = document.getElementById('builder-preview-text');
    if (!input || !preview) return;
    const text = input.value.trim();
    preview.textContent = text || 'Your phrase will appear here...';

    const previewArea = document.getElementById('builder-preview');
    if (previewArea) {
      previewArea.style.backgroundColor = state.builderColorLight;
      previewArea.style.borderLeft = `4px solid ${state.builderColor}`;
    }
  };

  // =============================================
  // Text to Speech Keyboard
  // =============================================
  const ttsState = {
    text: '',
    shiftActive: false
  };

  const updateTTSDisplay = () => {
    const displayText = document.getElementById('tts-display-text');
    if (displayText) {
      displayText.textContent = ttsState.text;
    }
  };

  const ttsAddChar = (char) => {
    if (ttsState.text.length >= 500) return;
    if (ttsState.shiftActive) {
      char = char.toUpperCase();
      ttsState.shiftActive = false;
      const shiftBtn = document.querySelector('.tts-key--shift');
      if (shiftBtn) shiftBtn.classList.remove('active');
    }
    ttsState.text += char;
    updateTTSDisplay();
  };

  const ttsBackspace = () => {
    ttsState.text = ttsState.text.slice(0, -1);
    updateTTSDisplay();
  };

  const ttsSpace = () => {
    if (ttsState.text.length >= 500) return;
    ttsState.text += ' ';
    updateTTSDisplay();
  };

  const ttsToggleShift = () => {
    ttsState.shiftActive = !ttsState.shiftActive;
    const shiftBtn = document.querySelector('.tts-key--shift');
    if (shiftBtn) shiftBtn.classList.toggle('active', ttsState.shiftActive);

    // Update key labels
    document.querySelectorAll('.tts-key[data-key]').forEach(key => {
      const char = key.dataset.key;
      if (char.length === 1 && char.match(/[a-z]/)) {
        key.textContent = ttsState.shiftActive ? char.toUpperCase() : char;
      }
    });
  };

  const ttsClear = () => {
    ttsState.text = '';
    ttsState.shiftActive = false;
    const shiftBtn = document.querySelector('.tts-key--shift');
    if (shiftBtn) shiftBtn.classList.remove('active');
    document.querySelectorAll('.tts-key[data-key]').forEach(key => {
      const char = key.dataset.key;
      if (char.length === 1 && char.match(/[a-z]/)) {
        key.textContent = char;
      }
    });
    updateTTSDisplay();
  };

  const ttsSetPhrase = (phrase) => {
    ttsState.text = phrase;
    updateTTSDisplay();
    Voice.speak(phrase);
  };

  // =============================================
  // View switching
  // =============================================
  const setView = (view) => {
    state.view = view;
    document.body.classList.remove('view-builder', 'view-tts');
    if (view === 'builder') {
      document.body.classList.add('view-builder');
    } else if (view === 'tts') {
      document.body.classList.add('view-tts');
    }
  };

  // =============================================
  // Settings persistence via URL
  // =============================================
  const saveSettings = () => {
    const voiceSelect = document.getElementById('voice-select');
    const rateSlider = document.getElementById('rate-slider');
    const volSlider = document.getElementById('vol-slider');

    if (voiceSelect) {
      Voice.setVoiceByURI(voiceSelect.value);
      Params.set('voice', voiceSelect.value);
    }
    if (rateSlider) {
      Voice.setRate(rateSlider.value);
      Params.set('rate', rateSlider.value);
    }
    if (volSlider) {
      Voice.setVolume(volSlider.value);
      Params.set('vol', volSlider.value);
    }
  };

  // =============================================
  // Trap focus in modals
  // =============================================
  const trapFocus = (element, event) => {
    const focusableEls = element.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    }
    if (event.key === 'Escape') {
      closeSettings();
      dismissFullscreen();
    }
  };

  // =============================================
  // Register Service Worker
  // =============================================
  const registerSW = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  };

  // =============================================
  // Init
  // =============================================
  const init = () => {
    const params = Params.read();

    // Apply saved theme
    applyTheme(params.theme);

    // Init voice module
    Voice.init();

    // Apply saved voice settings after loading
    const applyVoiceSettings = () => {
      if (params.voice) Voice.setVoiceByURI(params.voice);
      Voice.setRate(params.rate);
      Voice.setVolume(params.vol);

      const rateSlider = document.getElementById('rate-slider');
      const rateValue = document.getElementById('rate-value');
      const volSlider = document.getElementById('vol-slider');
      const volValue = document.getElementById('vol-value');

      if (rateSlider) { rateSlider.value = params.rate; }
      if (rateValue) { rateValue.textContent = params.rate + 'x'; }
      if (volSlider) { volSlider.value = params.vol; }
      if (volValue) { volValue.textContent = Math.round(params.vol * 100) + '%'; }

      populateVoiceSelect();
    };

    applyVoiceSettings();
    Voice.onVoicesChanged(populateVoiceSelect);

    // Set initial category
    const initialCat = CATEGORIES.find(c => c.id === params.cat) ? params.cat : CATEGORIES[0].id;
    selectCategory(initialCat);

    // Render builder colors
    renderBuilder();
    updateBuilderPreview();

    // ---- Event Listeners ----

    // Category tabs (mobile)
    document.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => selectCategory(tab.dataset.cat));
    });

    // Sidebar nav (desktop)
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      if (item.dataset.cat) {
        item.addEventListener('click', () => {
          setView('phrases');
          selectCategory(item.dataset.cat);
        });
      }
    });

    // Type to Speak button
    document.querySelectorAll('[data-action="open-tts"]').forEach(btn => {
      btn.addEventListener('click', () => setView('tts'));
    });

    // Make Your Own button
    document.querySelectorAll('[data-action="open-builder"]').forEach(btn => {
      btn.addEventListener('click', () => setView('builder'));
    });

    // Back from builder
    const backBtn = document.getElementById('builder-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => setView('phrases'));
    }

    // Settings open
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', openSettings);
    }

    // Settings close
    const settingsClose = document.getElementById('settings-close');
    if (settingsClose) {
      settingsClose.addEventListener('click', closeSettings);
    }

    // Settings backdrop
    const settingsBackdrop = document.querySelector('.settings-backdrop');
    if (settingsBackdrop) {
      settingsBackdrop.addEventListener('click', closeSettings);
    }

    // Settings panel keyboard
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
      settingsPanel.addEventListener('keydown', (e) => trapFocus(settingsPanel, e));
    }

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
    });

    // Voice select
    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
      voiceSelect.addEventListener('change', () => {
        Voice.setVoiceByURI(voiceSelect.value);
        Params.set('voice', voiceSelect.value);
      });
    }

    // Rate slider
    const rateSlider = document.getElementById('rate-slider');
    const rateValue = document.getElementById('rate-value');
    if (rateSlider) {
      rateSlider.addEventListener('input', () => {
        const v = parseFloat(rateSlider.value).toFixed(2);
        Voice.setRate(v);
        Params.set('rate', v);
        if (rateValue) rateValue.textContent = v + 'x';
      });
    }

    // Volume slider
    const volSlider = document.getElementById('vol-slider');
    const volValue = document.getElementById('vol-value');
    if (volSlider) {
      volSlider.addEventListener('input', () => {
        const v = parseFloat(volSlider.value).toFixed(2);
        Voice.setVolume(v);
        Params.set('vol', v);
        if (volValue) volValue.textContent = Math.round(v * 100) + '%';
      });
    }

    // Fullscreen overlay dismiss
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    if (fullscreenOverlay) {
      fullscreenOverlay.addEventListener('click', dismissFullscreen);
      fullscreenOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          dismissFullscreen();
        }
      });
    }

    // Fullscreen copy button
    const fullscreenCopyBtn = document.getElementById('fullscreen-overlay__copy');
    if (fullscreenCopyBtn) {
      fullscreenCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = document.getElementById('fullscreen-overlay__text')?.textContent?.trim();
        if (text) copyToClipboard(text, fullscreenCopyBtn);
      });
    }

    // Builder text input
    const builderText = document.getElementById('builder-text');
    if (builderText) {
      builderText.addEventListener('input', updateBuilderPreview);
    }

    // Builder copy
    const builderCopy = document.getElementById('builder-copy');
    if (builderCopy) {
      builderCopy.addEventListener('click', () => {
        const text = document.getElementById('builder-text')?.value?.trim();
        if (text) copyToClipboard(text, builderCopy);
      });
    }

    // Builder speak
    const builderSpeak = document.getElementById('builder-speak');
    if (builderSpeak) {
      builderSpeak.addEventListener('click', () => {
        const text = document.getElementById('builder-text')?.value?.trim();
        if (text) Voice.speak(text);
      });
    }

    // Builder download
    const builderDownload = document.getElementById('builder-download');
    if (builderDownload) {
      builderDownload.addEventListener('click', async () => {
        const text = document.getElementById('builder-text')?.value?.trim();
        if (!text) {
          alert('Please enter a phrase first.');
          return;
        }
        builderDownload.disabled = true;
        const origText = builderDownload.textContent;
        builderDownload.textContent = 'Creating...';
        try {
          const canvas = await Export.buildCustomCanvas(text, state.builderColor, state.builderColorLight);
          const link = document.createElement('a');
          const slug = text.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 30);
          link.download = `commcard-custom-${slug}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          console.error('Builder export failed:', e);
          alert('Sorry, the download could not be created.');
        } finally {
          builderDownload.disabled = false;
          builderDownload.textContent = origText;
        }
      });
    }

    // ---- TTS Event Listeners ----

    // TTS back button
    const ttsBack = document.getElementById('tts-back');
    if (ttsBack) {
      ttsBack.addEventListener('click', () => setView('phrases'));
    }

    // TTS keyboard keys
    const ttsKeyboard = document.getElementById('tts-keyboard');
    if (ttsKeyboard) {
      ttsKeyboard.addEventListener('click', (e) => {
        const key = e.target.closest('.tts-key');
        if (!key) return;

        const action = key.dataset.action;
        if (action === 'backspace') {
          ttsBackspace();
        } else if (action === 'space') {
          ttsSpace();
        } else if (action === 'shift') {
          ttsToggleShift();
        } else if (key.dataset.key) {
          ttsAddChar(key.dataset.key);
        }
      });
    }

    // TTS speak button
    const ttsSpeakBtn = document.getElementById('tts-speak');
    if (ttsSpeakBtn) {
      ttsSpeakBtn.addEventListener('click', () => {
        const text = ttsState.text.trim();
        if (text) Voice.speak(text);
      });
    }

    // TTS show fullscreen button
    const ttsShowBtn = document.getElementById('tts-show');
    if (ttsShowBtn) {
      ttsShowBtn.addEventListener('click', () => {
        const text = ttsState.text.trim();
        if (text) {
          showFullscreen(text, { colorLight: '#F0E8E0', color: '#76543E', colorDark: '#76543E' });
        }
      });
    }

    // TTS copy button
    const ttsCopyBtn = document.getElementById('tts-copy');
    if (ttsCopyBtn) {
      ttsCopyBtn.addEventListener('click', () => {
        const text = ttsState.text.trim();
        if (text) copyToClipboard(text, ttsCopyBtn);
      });
    }

    // TTS clear button
    const ttsClearBtn = document.getElementById('tts-clear');
    if (ttsClearBtn) {
      ttsClearBtn.addEventListener('click', ttsClear);
    }

    // TTS quick phrases
    const ttsQuickPhrases = document.getElementById('tts-quick-phrases');
    if (ttsQuickPhrases) {
      ttsQuickPhrases.addEventListener('click', (e) => {
        const btn = e.target.closest('.tts-quick__btn');
        if (!btn) return;
        ttsSetPhrase(btn.dataset.phrase);
      });
    }

    // TTS display: allow physical keyboard input when focused
    const ttsDisplay = document.getElementById('tts-display');
    if (ttsDisplay) {
      ttsDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          e.preventDefault();
          ttsBackspace();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const text = ttsState.text.trim();
          if (text) Voice.speak(text);
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          ttsAddChar(e.key);
        }
      });
    }

    // Dark mode auto-detect
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches && params.theme === 'light') {
      applyTheme('dark');
    }
    prefersDark.addEventListener('change', (e) => {
      if (state.theme !== 'high-contrast') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Register PWA service worker
    registerSW();
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
