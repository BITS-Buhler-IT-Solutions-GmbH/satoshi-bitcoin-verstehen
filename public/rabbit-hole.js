/*  Satoshi PWA — Rabbit Hole: Guided Journey + Hidden Rabbits
 *  "Follow the White Rabbit" — geführte Reise durch den Bitcoin-Kaninchenbau
 *  Separate Datei, selbstinitialisierend, nutzt Globals aus index.html
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
   *  JOURNEY PATH — alle Lernmodule in logischer Reihenfolge
   *  Neue Module nur als NEUES Kapitel am Ende anhängen: der Fortschritt
   *  wird als Schritt-Index gespeichert, Einfügen verschiebt Spielstände.
   * ══════════════════════════════════════════════════════════════ */

  var CHAPTERS = [
    {
      id: 'down',
      title: 'Down the Rabbit Hole',
      subtitle: 'Du betrittst den Kaninchenbau. Alles beginnt mit einer einfachen Frage: Was ist Geld?',
      emoji: '🕳️',
      color: 'var(--green)',
      keys: [
        'geld', 'inflation', 'analogien', 'kaufen', 'dos',
        'relai', 'alltag', 'rechner', 'lexikon', 'literatur',
        'medien', 'kultur'
      ]
    },
    {
      id: 'looking-glass',
      title: 'Through the Looking Glass',
      subtitle: 'Die Welt sieht anders aus, wenn man versteht, wie Bitcoin wirklich funktioniert.',
      emoji: '🪞',
      color: 'var(--gold)',
      keys: [
        'oekonomie', 'psychologie', 'blockchain', 'mining', 'nodes',
        'lightning', 'satoshi', 'chronologie', 'schweiz', 'weltweit',
        'sicherheit', 'regulierung', 'institutionen', 'zyklen',
        'feargreed', 'stacking'
      ]
    },
    {
      id: 'mad-hatter',
      title: 'The Mad Hatter\'s Tea Party',
      subtitle: 'Willkommen bei den Experten. Hier wird nichts mehr einfach geglaubt — hier wird verifiziert.',
      emoji: '🎩',
      color: '#8b5cf6',
      keys: [
        'whitepaper', 'krypto', 'energie', 'netzwerk', 'layer2',
        'onchain', 'entwicklung', 'cbdc', 'vergleich', 'news', 'social'
      ]
    },
    {
      id: 'wonderland',
      title: 'Back in Wonderland',
      subtitle: 'Zurück an der Oberfläche — mit Praxis, Privatsphäre und einem kritischen Blick.',
      emoji: '🌷',
      color: '#22c55e',
      keys: [
        'bitcoin-schweiz', 'privacy', 'kritik', 'funfacts'
      ]
    }
  ];

  /* Flat ordered list of all module keys */
  var JOURNEY_KEYS = [];
  CHAPTERS.forEach(function (ch) {
    ch.keys.forEach(function (k) { JOURNEY_KEYS.push(k); });
  });

  /* Reward per module completion in the journey */
  var STEP_REWARD = 1500000; // pro Station

  /* Map module key → short teaser */
  var MODULE_TEASERS = {
    geld: 'Was ist Geld — und warum verliert es an Wert?',
    inflation: 'Warum dein Geld jedes Jahr weniger wert wird',
    analogien: 'Bitcoin erklärt mit Alltagsvergleichen',
    kaufen: 'Deine ersten Satoshis — so geht\'s',
    dos: 'Die goldenen Regeln für Bitcoin-Besitzer',
    relai: 'Bitcoin kaufen in der Schweiz — einfach erklärt',
    alltag: 'Bitcoin im täglichen Leben nutzen',
    rechner: 'Was wäre wenn? Rechner & Simulationen',
    lexikon: 'Die wichtigsten Bitcoin-Begriffe auf einen Blick',
    literatur: 'Die besten Bücher, Podcasts & Filme',
    medien: 'Podcasts, Videos & Kanäle für Bitcoin-Wissen',
    kultur: 'Memes, Musik & die Bitcoin-Community',
    oekonomie: 'Österreichische Schule, hartes Geld & Spieltheorie',
    psychologie: 'Warum die meisten zu spät kaufen',
    blockchain: 'Blöcke, Hashes, Merkle Trees — die Technik',
    mining: 'Wie neue Bitcoins entstehen',
    nodes: 'Das Rückgrat des Netzwerks',
    lightning: 'Sofortige Zahlungen für Centbeträge',
    satoshi: 'Wer hat Bitcoin erfunden?',
    chronologie: 'Die Geschichte von 2008 bis heute',
    schweiz: 'Bitcoin in der Schweiz & DACH-Region',
    weltweit: 'Bitcoin rund um den Globus',
    sicherheit: 'Deine Coins richtig schützen',
    regulierung: 'Steuern, Gesetze & Vorschriften',
    institutionen: 'ETFs, MicroStrategy & Wall Street',
    zyklen: 'Halvings, Stock-to-Flow & Preismodelle',
    feargreed: 'Marktstimmung in Echtzeit',
    stacking: 'Gamification — sammle Satoshis',
    whitepaper: 'Satoshis Meisterwerk — 9 Seiten, die alles veränderten',
    krypto: 'Von Caesar bis Elliptic Curves',
    energie: 'Verbraucht Bitcoin wirklich zu viel Strom?',
    netzwerk: 'Live-Daten: Hashrate, Nodes, Mempool',
    layer2: 'Lightning, Liquid, Sidechains & mehr',
    onchain: 'UTXO-Analyse, Whale-Watching & Metriken',
    entwicklung: 'BIPs, Forks & die Zukunft von Bitcoin',
    cbdc: 'Digitaler Euro vs. Bitcoin',
    vergleich: 'Bitcoin vs. Altcoins — Fakten statt Hype',
    news: 'Die neuesten Bitcoin-Nachrichten',
    social: 'Bitcoin auf X / Twitter'
  };

  /* ══════════════════════════════════════════════════════════════
   *  HIDDEN WHITE RABBITS — derived from JOURNEY_KEYS so the two
   *  lists can never drift apart. 500,000 sats each.
   * ══════════════════════════════════════════════════════════════ */

  var RABBIT_REWARD = 500000;
  var HIDDEN_RABBITS = JOURNEY_KEYS.map(function (key) {
    return { id: 'rb_' + key, screen: key, reward: RABBIT_REWARD };
  });

  /* ══════════════════════════════════════════════════════════════
   *  STATE MANAGEMENT — localStorage
   * ══════════════════════════════════════════════════════════════ */

  var STATE_KEY = 'rabbitHole';
  var RABBITS_KEY = 'foundRabbits';
  var state;
  var foundRabbits = [];

  /* Safe localStorage helpers — survive QuotaExceededError, private mode */
  function storageGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('[rabbit-hole] read failed for', key, e);
      return fallback;
    }
  }
  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[rabbit-hole] write failed for', key, e);
    }
  }
  function storageRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  /* Normalize any persisted state to the current shape. Returns null if
   * the input cannot be salvaged into a valid state object. */
  function migrateState(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!Array.isArray(raw.completedSteps)) return null;
    return {
      active: raw.active !== false,
      currentStep: typeof raw.currentStep === 'number' ? raw.currentStep : 0,
      completedSteps: raw.completedSteps.filter(function (n) { return typeof n === 'number'; }),
      rewardedSteps: Array.isArray(raw.rewardedSteps) ? raw.rewardedSteps : [],
      startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : Date.now(),
      lastVisitedAt: typeof raw.lastVisitedAt === 'number' ? raw.lastVisitedAt : Date.now()
    };
  }

  function loadState() {
    state = migrateState(storageGet(STATE_KEY, null));
    var rabbits = storageGet(RABBITS_KEY, []);
    foundRabbits = Array.isArray(rabbits) ? rabbits : [];
  }

  function defaultState() {
    return {
      active: true,
      currentStep: 0,
      completedSteps: [],
      rewardedSteps: [],
      startedAt: Date.now(),
      lastVisitedAt: Date.now()
    };
  }

  function saveState() {
    if (!state) return;
    state.lastVisitedAt = Date.now();
    storageSet(STATE_KEY, state);
  }

  function saveRabbits() {
    storageSet(RABBITS_KEY, foundRabbits);
  }

  function isActive() { return state && state.active; }

  /* ══════════════════════════════════════════════════════════════
   *  HELPERS
   * ══════════════════════════════════════════════════════════════ */

  function getModuleByKey(key) {
    if (typeof MODULES === 'undefined') return null;
    return MODULES.find(function (m) { return m.key === key; }) || null;
  }

  function getChapterForStep(stepIndex) {
    var count = 0;
    for (var i = 0; i < CHAPTERS.length; i++) {
      count += CHAPTERS[i].keys.length;
      if (stepIndex < count) return { chapter: CHAPTERS[i], index: i };
    }
    return { chapter: CHAPTERS[CHAPTERS.length - 1], index: CHAPTERS.length - 1 };
  }

  function getStepGlobalIndex(key) {
    return JOURNEY_KEYS.indexOf(key);
  }

  function isStepCompleted(stepIndex) {
    return state && state.completedSteps.includes(stepIndex);
  }

  function getProgress() {
    if (!state) return { done: 0, total: JOURNEY_KEYS.length, pct: 0 };
    var done = state.completedSteps.length;
    var total = JOURNEY_KEYS.length;
    return { done: done, total: total, pct: Math.round((done / total) * 100) };
  }

  function getRabbitProgress() {
    return { done: foundRabbits.length, total: HIDDEN_RABBITS.length, pct: Math.round((foundRabbits.length / HIDDEN_RABBITS.length) * 100) };
  }

  function escHtml(s) {
    return typeof escapeHtml === 'function' ? escapeHtml(s) : s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtNum(n) {
    return typeof formatNumber === 'function' ? formatNumber(n) : n.toLocaleString('de-CH');
  }

  /* ══════════════════════════════════════════════════════════════
   *  EVENT DELEGATION — single click+keydown handler per root,
   *  routed by data-action. Replaces inline onclick="…" attributes,
   *  decouples markup from globals, and gives keyboard support to
   *  non-button elements (role="button" tabindex="0") for free.
   * ══════════════════════════════════════════════════════════════ */

  function dispatchAction(target) {
    var btn = target.closest && target.closest('[data-action]');
    if (!btn) return false;
    var action = btn.dataset.action;
    var idx = btn.dataset.stepIdx ? parseInt(btn.dataset.stepIdx, 10) : -1;
    switch (action) {
      case 'start': start(); return true;
      case 'reset': reset(); return true;
      case 'nav-home':
        if (typeof navigateTo === 'function') navigateTo('home');
        return true;
      case 'nav-rabbithole':
        if (typeof navigateTo === 'function') navigateTo('rabbithole');
        return true;
      case 'goto-step':
        if (idx >= 0) goToStep(idx);
        return true;
      case 'toggle-chapter':
        var steps = btn.parentElement.querySelector('.rabbit-chapter-steps');
        if (steps) {
          var open = steps.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        return true;
    }
    return false;
  }

  function attachDelegatedHandlers(root) {
    if (!root || root._rabbitHandlersAttached) return;
    root._rabbitHandlersAttached = true;
    root.addEventListener('click', function (e) { dispatchAction(e.target); });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var btn = e.target.closest && e.target.closest('[data-action]');
      if (!btn) return;
      e.preventDefault();
      dispatchAction(e.target);
    });
  }

  /* ESC-close + backdrop-click + initial focus for overlays.
   * Returns a close() function the caller invokes when its own
   * confirm-button is clicked. */
  function setupOverlay(overlay, onClose) {
    function close() {
      document.removeEventListener('keydown', onKey);
      overlay.classList.remove('visible');
      setTimeout(function () {
        overlay.remove();
        if (onClose) onClose();
      }, 350);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    /* Move focus into the overlay for screen-reader / keyboard users */
    requestAnimationFrame(function () {
      var btn = overlay.querySelector('.rabbit-btn');
      if (btn) btn.focus();
    });
    return close;
  }

  /* ══════════════════════════════════════════════════════════════
   *  CSS INJECTION
   * ══════════════════════════════════════════════════════════════ */

  function injectCSS() {
    /* Die Styles liegen seit v3.4.0 im Haupt-Stylesheet von index.html
     * (<style id="rabbit-css">). Ein nachträglich angehängtes <style>
     * erzwang eine komplette Style-Neuberechnung (~340 ms Long Task). */
    if (document.getElementById('rabbit-css')) return;
    console.warn('RabbitHole: #rabbit-css fehlt in index.html — Styles nicht geladen');
  }

  /* ══════════════════════════════════════════════════════════════
   *  DOM — FLOATING ACTION BUTTON
   * ══════════════════════════════════════════════════════════════ */

  var fabEl = null;

  function createFAB() {
    if (fabEl) return;
    fabEl = document.createElement('div');
    fabEl.className = 'rabbit-fab has-next';
    fabEl.setAttribute('role', 'button');
    fabEl.setAttribute('tabindex', '0');
    fabEl.setAttribute('aria-label', 'Rabbit Hole — Deine Bitcoin-Reise');
    fabEl.innerHTML = '<svg class="rabbit-fab-ring" viewBox="0 0 52 52">' +
      '<circle r="23" cx="26" cy="26" stroke="rgba(255,255,255,0.06)" />' +
      '<circle class="rabbit-ring-progress" r="23" cx="26" cy="26" stroke="var(--gold)" stroke-dasharray="144.5" stroke-dashoffset="144.5" />' +
      '</svg>' +
      '<span class="rabbit-emoji">🐇</span>' +
      '<span class="rabbit-step-badge">0</span>';

    /* Click / Enter / Space: jump to current step or last completed */
    function activate() {
      if (!state) {
        if (typeof navigateTo === 'function') navigateTo('rabbithole');
        return;
      }
      var progress = getProgress();
      if (progress.done >= progress.total) {
        if (typeof navigateTo === 'function') navigateTo('rabbithole');
        return;
      }
      var key = JOURNEY_KEYS[state.currentStep];
      if (key && typeof navigateTo === 'function') navigateTo(key);
    }
    fabEl.addEventListener('click', activate);
    fabEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });

    /* Long press: go to overview */
    var longTimer = null;
    fabEl.addEventListener('pointerdown', function () {
      longTimer = setTimeout(function () {
        longTimer = null;
        if (typeof navigateTo === 'function') navigateTo('rabbithole');
      }, 600);
    });
    function cancelLongPress() { if (longTimer) { clearTimeout(longTimer); longTimer = null; } }
    fabEl.addEventListener('pointerup', cancelLongPress);
    fabEl.addEventListener('pointercancel', cancelLongPress);
    fabEl.addEventListener('pointerleave', cancelLongPress);

    document.body.appendChild(fabEl);
  }

  function updateFAB() {
    if (!fabEl || !state) return;
    var progress = getProgress();
    var ring = fabEl.querySelector('.rabbit-ring-progress');
    if (ring) {
      var circumference = 144.5;
      var offset = circumference - (progress.pct / 100) * circumference;
      ring.setAttribute('stroke-dashoffset', offset.toString());
    }
    var badge = fabEl.querySelector('.rabbit-step-badge');
    if (badge) badge.textContent = progress.done + '/' + progress.total;
    fabEl.classList.toggle('has-next', progress.done < progress.total);
  }

  function showFAB() {
    if (!fabEl) createFAB();
    fabEl.style.display = 'flex';
    updateFAB();
  }

  function hideFAB() {
    if (fabEl) fabEl.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════════
   *  DOM — NEXT MODULE BANNER
   * ══════════════════════════════════════════════════════════════ */

  var nextBanner = null;

  function createNextBanner() {
    if (nextBanner) return;
    nextBanner = document.createElement('div');
    nextBanner.className = 'rabbit-next-banner';
    nextBanner.innerHTML = '<div class="rabbit-next-inner">' +
      '<span style="font-size:1.3rem">🐇</span>' +
      '<div class="rabbit-next-text">' +
      '<div class="rabbit-next-label">Nächste Station</div>' +
      '<div class="rabbit-next-module" id="rabbitNextModuleName"></div>' +
      '</div>' +
      '<span class="rabbit-next-arrow">›</span>' +
      '</div>';
    nextBanner.addEventListener('click', function () {
      goToNextStep();
    });
    document.body.appendChild(nextBanner);
  }

  function showNextBanner(nextKey) {
    if (!nextBanner) createNextBanner();
    var mod = getModuleByKey(nextKey);
    var nameEl = nextBanner.querySelector('#rabbitNextModuleName');
    if (nameEl && mod) nameEl.textContent = mod.icon + ' ' + mod.name;
    nextBanner.style.display = 'block';
  }

  function hideNextBanner() {
    if (nextBanner) nextBanner.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════════
   *  DOM — JOURNEY OVERVIEW SCREEN
   * ══════════════════════════════════════════════════════════════ */

  function ensureScreen() {
    if (document.getElementById('screen-rabbithole')) return;
    var div = document.createElement('div');
    div.className = 'screen';
    div.id = 'screen-rabbithole';
    var firstScreen = document.querySelector('.screen');
    if (firstScreen && firstScreen.parentElement) {
      firstScreen.parentElement.appendChild(div);
    }
    /* Invalidate cached screen list in navigateTo */
    if (typeof _cachedScreens !== 'undefined') _cachedScreens = null;
  }

  function renderOverview() {
    var screen = document.getElementById('screen-rabbithole');
    if (!screen) return;

    var progress = getProgress();
    var rabbitProg = getRabbitProgress();
    var isStarted = state !== null;
    var isComplete = isStarted && progress.done >= progress.total;

    var html = '<div class="rabbit-hero">' +
      '<span class="rabbit-hero-emoji">🐇</span>' +
      '<h1>Follow the <span class="gold">White Rabbit</span></h1>' +
      '<p class="rabbit-hero-sub">' + (
        !isStarted
          ? 'Eine geführte Reise durch den Bitcoin-Kaninchenbau. ' + JOURNEY_KEYS.length + ' Module, ' + CHAPTERS.length + ' Kapitel — vom Einsteiger zum Experten.'
          : isComplete
            ? 'Du hast den gesamten Kaninchenbau erforscht. Respekt!'
            : 'Kapitel ' + (getChapterForStep(state.currentStep).index + 1) + ' von ' + CHAPTERS.length + ' — ' + progress.done + ' von ' + progress.total + ' Stationen erkundet'
      ) + '</p>' +
      '</div>';

    /* Progress bar */
    html += '<div class="rabbit-progress-bar"><div class="rabbit-progress-fill" style="width:' + progress.pct + '%"></div></div>';
    html += '<div class="rabbit-progress-label">' + progress.pct + '% erkundet · ' + progress.done + '/' + progress.total + ' Module</div>';

    /* Stats */
    var earnedJourney = state ? state.rewardedSteps.length * STEP_REWARD : 0;
    html += '<div class="rabbit-stats">' +
      '<div class="rabbit-stat"><div class="rabbit-stat-val">' + progress.done + '/' + progress.total + '</div><div class="rabbit-stat-label">Module</div></div>' +
      '<div class="rabbit-stat"><div class="rabbit-stat-val">' + fmtNum(earnedJourney) + '</div><div class="rabbit-stat-label">Sats verdient</div></div>' +
      '<div class="rabbit-stat"><div class="rabbit-stat-val">' + rabbitProg.done + '/' + rabbitProg.total + '</div><div class="rabbit-stat-label">🐇 gefunden</div></div>' +
      '</div>';

    /* Chapters */
    var globalIdx = 0;
    CHAPTERS.forEach(function (ch, ci) {
      var chapterDone = 0;
      ch.keys.forEach(function (k) {
        if (isStepCompleted(getStepGlobalIndex(k))) chapterDone++;
      });
      var chapterComplete = chapterDone >= ch.keys.length;
      var chapterActive = !chapterComplete && isStarted && ci === getChapterForStep(state.currentStep).index;

      html += '<div class="rabbit-chapter ' + (chapterComplete ? 'done' : chapterActive ? 'active' : '') + '" style="border-left-color:' + ch.color + '">';
      html += '<div class="rabbit-chapter-head" role="button" tabindex="0" aria-expanded="' + (chapterActive || chapterComplete || !isStarted ? 'true' : 'false') + '" data-action="toggle-chapter">';
      html += '<span class="rabbit-chapter-emoji">' + ch.emoji + '</span>';
      html += '<span class="rabbit-chapter-title" style="color:' + ch.color + '">' + escHtml(ch.title) + '</span>';
      html += '<span class="rabbit-chapter-count">' + chapterDone + '/' + ch.keys.length + (chapterComplete ? ' ✓' : '') + '</span>';
      html += '</div>';
      html += '<div class="rabbit-chapter-sub">' + escHtml(ch.subtitle) + '</div>';

      html += '<div class="rabbit-chapter-steps' + (chapterActive || chapterComplete || !isStarted ? ' is-open' : '') + '">';

      ch.keys.forEach(function (key) {
        var stepIdx = globalIdx++;
        var completed = isStepCompleted(stepIdx);
        var current = isStarted && state.currentStep === stepIdx;
        var future = isStarted && !completed && !current;
        var mod = getModuleByKey(key);
        var icon = mod ? mod.icon : '📄';
        var name = mod ? mod.name : key;
        var teaser = MODULE_TEASERS[key] || '';
        var rewarded = state && state.rewardedSteps.includes(stepIdx);

        html += '<div class="rabbit-step ' + (completed ? 'completed' : current ? 'current' : future ? 'future' : '') + '" role="button" tabindex="0" data-action="goto-step" data-step-idx="' + stepIdx + '">';
        html += '<span class="rabbit-step-icon">' + icon + '</span>';
        html += '<div class="rabbit-step-info">';
        html += '<div class="rabbit-step-name">' + escHtml(name) + '</div>';
        if (teaser) html += '<div class="rabbit-step-teaser">' + escHtml(teaser) + '</div>';
        html += '</div>';
        html += '<span class="rabbit-step-status">' + (completed ? (rewarded ? '✅' : '✅') : current ? '🐇' : '·') + '</span>';
        if (completed && rewarded) {
          html += '<span class="rabbit-step-reward">+' + fmtNum(STEP_REWARD) + '</span>';
        }
        html += '</div>';
      });

      html += '</div></div>';
    });

    /* Hidden rabbits section */
    html += '<div style="margin:20px 16px 8px"><div style="font-weight:700;font-size:var(--text-sm);color:var(--text);margin-bottom:8px">🐇 Versteckte weisse Kaninchen</div>';
    html += '<div style="color:var(--muted);font-size:var(--text-xs);line-height:1.5;margin-bottom:12px">In jedem der ' + HIDDEN_RABBITS.length + ' Module versteckt sich ein weisses Kaninchen. Finde sie alle!</div>';
    html += '<div class="rabbit-progress-bar" style="margin:0 0 8px"><div class="rabbit-progress-fill" style="width:' + rabbitProg.pct + '%"></div></div>';
    html += '<div style="text-align:center;font-size:var(--text-xs);color:var(--muted);font-family:var(--font-mono)">' + rabbitProg.done + '/' + rabbitProg.total + ' Kaninchen gefunden</div>';
    html += '</div>';

    /* Actions */
    html += '<div class="rabbit-actions">';
    if (!isStarted) {
      html += '<button class="rabbit-btn rabbit-btn-primary" data-action="start">🐇 Reise starten</button>';
    } else if (isComplete) {
      html += '<button class="rabbit-btn rabbit-btn-primary" data-action="nav-home">🏠 Zurück zur Startseite</button>';
      html += '<button class="rabbit-btn rabbit-btn-danger" data-action="reset">Reise zurücksetzen</button>';
    } else {
      var nextMod = getModuleByKey(JOURNEY_KEYS[state.currentStep]);
      html += '<button class="rabbit-btn rabbit-btn-primary" data-action="goto-step" data-step-idx="' + state.currentStep + '">🐇 Weiter: ' + escHtml(nextMod ? nextMod.name : '') + '</button>';
      html += '<button class="rabbit-btn rabbit-btn-secondary" data-action="nav-home">🏠 Startseite</button>';
      html += '<button class="rabbit-btn rabbit-btn-danger" data-action="reset">Reise zurücksetzen</button>';
    }
    html += '</div>';

    screen.innerHTML = html;
    attachDelegatedHandlers(screen);
  }

  /* ══════════════════════════════════════════════════════════════
   *  DOM — HOME SCREEN CARD
   * ══════════════════════════════════════════════════════════════ */

  function injectHomeCard() {
    if (document.getElementById('rabbitHomeCard')) return;
    var grid = document.querySelector('#moduleGrid');
    if (!grid) return;
    var parent = grid.closest('.section');
    if (!parent) return;

    var card = document.createElement('div');
    card.id = 'rabbitHomeCard';
    card.style.cssText = 'padding:0 16px;margin-bottom:8px';
    parent.parentElement.insertBefore(card, parent);
    updateHomeCard();
  }

  function updateHomeCard() {
    var el = document.getElementById('rabbitHomeCard');
    if (!el) return;

    var isStarted = state !== null;
    var progress = getProgress();
    var rabbitProg = getRabbitProgress();

    if (!isStarted) {
      el.innerHTML = '<div class="card rabbit-home-card animate-in" role="button" tabindex="0" data-action="nav-rabbithole" style="padding:16px;text-align:center">' +
        '<div style="font-size:1.8rem;margin-bottom:6px">🐇</div>' +
        '<div style="font-weight:700;color:var(--gold);font-size:var(--text-sm)">Follow the White Rabbit</div>' +
        '<div style="color:var(--muted);font-size:var(--text-xs);margin-top:4px;line-height:1.4">Lass dich durch ' + JOURNEY_KEYS.length + ' Module führen — vom Einsteiger zum Experten</div>' +
        '</div>';
    } else if (progress.done >= progress.total) {
      el.innerHTML = '<div class="card rabbit-home-card animate-in" role="button" tabindex="0" data-action="nav-rabbithole" style="padding:14px;text-align:center">' +
        '<span style="color:var(--green);font-weight:700;font-size:var(--text-sm)">🎉 Rabbit Hole komplett!</span>' +
        '<span style="color:var(--muted);font-size:var(--text-xs);margin-left:8px">' + progress.total + '/' + progress.total + ' · 🐇 ' + rabbitProg.done + '/' + rabbitProg.total + '</span>' +
        '</div>';
    } else {
      var nextKey = JOURNEY_KEYS[state.currentStep];
      var mod = getModuleByKey(nextKey);
      var chInfo = getChapterForStep(state.currentStep);
      el.innerHTML = '<div class="card rabbit-home-card animate-in" role="button" tabindex="0" data-action="goto-step" data-step-idx="' + state.currentStep + '" style="padding:14px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
        '<span style="font-size:1.5rem">🐇</span>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:var(--text-xs);color:var(--gold);font-weight:600">' + escHtml(chInfo.chapter.title) + ' · ' + progress.done + '/' + progress.total + '</div>' +
        '<div style="font-size:var(--text-sm);color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Nächstes Ziel: ' + (mod ? mod.icon + ' ' + escHtml(mod.name) : '') + '</div>' +
        '</div>' +
        '<span style="color:var(--gold);font-size:1.1rem">›</span>' +
        '</div>' +
        '<div class="rabbit-progress-bar" style="margin:8px 0 0;height:4px"><div class="rabbit-progress-fill" style="width:' + progress.pct + '%"></div></div>' +
        '</div>';
    }
    var journeyCard = el.querySelector('.rabbit-home-card');
    if (journeyCard) {
      var trail = document.createElement('div');
      trail.className = 'rabbit-home-trail';
      trail.innerHTML = CHAPTERS.map(function(ch, index) {
        var done = ch.keys.filter(function(key) { return isStepCompleted(getStepGlobalIndex(key)); }).length;
        var active = isStarted && progress.done < progress.total && index === getChapterForStep(state.currentStep).index;
        return '<div class="rabbit-trail-stop' + (done === ch.keys.length ? ' done' : active ? ' current' : '') + '">' +
          '<span class="rabbit-trail-number">' + (done === ch.keys.length ? '✓' : '0' + (index + 1)) + '</span>' +
          '<span class="rabbit-trail-label">' + escHtml(ch.title) + '</span>' +
          '<span class="rabbit-trail-count">' + done + '/' + ch.keys.length + '</span></div>';
      }).join('');
      journeyCard.appendChild(trail);
    }
    attachDelegatedHandlers(el);
  }

  /* ══════════════════════════════════════════════════════════════
   *  HIDDEN RABBITS — Collection system
   * ══════════════════════════════════════════════════════════════ */

  function collectRabbit(el) {
    var id = el.dataset.rabbitId;
    if (!id) return;
    if (foundRabbits.includes(id)) return;
    var rabbit = HIDDEN_RABBITS.find(function (r) { return r.id === id; });
    if (!rabbit) return;

    foundRabbits.push(id);
    saveRabbits();
    el.classList.add('found');
    el.innerHTML = '🐇';

    /* Reward sats */
    if (typeof addSats === 'function') {
      addSats(rabbit.reward, 'Weisses Kaninchen gefunden!');
    }

    /* Check if all found */
    if (foundRabbits.length >= HIDDEN_RABBITS.length) {
      setTimeout(showAllRabbitsFound, 1200);
    }
  }

  function initRabbits() {
    document.querySelectorAll('.hidden-rabbit').forEach(function (el) {
      var id = el.dataset.rabbitId;
      if (!id) return;
      if (foundRabbits.includes(id)) {
        el.classList.add('found');
        el.innerHTML = '🐇';
        el.style.cursor = 'default';
      }
    });
  }

  function showAllRabbitsFound() {
    /* Unlock a secret if function exists */
    if (typeof unlockSecret === 'function') {
      unlockSecret('all_rabbits');
    }
    var overlay = document.createElement('div');
    overlay.className = 'rabbit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="rabbit-overlay-card">' +
      '<div style="font-size:3rem">🐇🐇🐇</div>' +
      '<h2>Alle Kaninchen gefunden!</h2>' +
      '<p>Du hast alle ' + HIDDEN_RABBITS.length + ' versteckten weissen Kaninchen im Kaninchenbau entdeckt. Alice wäre stolz auf dich.</p>' +
      '<p style="color:var(--gold);margin-top:12px;font-weight:600;font-family:var(--font-mono)">+' + fmtNum(HIDDEN_RABBITS.length * RABBIT_REWARD) + ' Sats</p>' +
      '<button class="rabbit-btn rabbit-btn-primary" style="margin-top:20px;width:100%">Weiter</button>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('visible'); });
    var close = setupOverlay(overlay);
    overlay.querySelector('.rabbit-btn').addEventListener('click', close);
  }

  /* Expose globally for onclick */
  window.collectRabbit = collectRabbit;

  /* ══════════════════════════════════════════════════════════════
   *  CHAPTER INTRO OVERLAY
   * ══════════════════════════════════════════════════════════════ */

  function showChapterIntro(chapterIndex, callback) {
    var ch = CHAPTERS[chapterIndex];
    if (!ch) { if (callback) callback(); return; }

    var overlay = document.createElement('div');
    overlay.className = 'rabbit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="rabbit-overlay-card" style="border-color:' + ch.color + '">' +
      '<div style="font-size:3rem">' + ch.emoji + '</div>' +
      '<h2 style="color:' + ch.color + '">Kapitel ' + (chapterIndex + 1) + '</h2>' +
      '<h2 style="font-size:1.1rem;color:var(--text);margin-top:2px">' + escHtml(ch.title) + '</h2>' +
      '<p>' + escHtml(ch.subtitle) + '</p>' +
      '<button class="rabbit-btn rabbit-btn-primary" style="width:100%;margin-top:16px">Weiter</button>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('visible'); });

    var close = setupOverlay(overlay, callback);
    overlay.querySelector('.rabbit-btn').addEventListener('click', close);
  }

  /* ══════════════════════════════════════════════════════════════
   *  COMPLETION CELEBRATION
   * ══════════════════════════════════════════════════════════════ */

  function showCompletion() {
    var totalEarned = state ? state.rewardedSteps.length * STEP_REWARD : 0;
    var overlay = document.createElement('div');
    overlay.className = 'rabbit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="rabbit-overlay-card">' +
      '<div style="font-size:3rem">🎩🐇✨</div>' +
      '<h2>Der Kaninchenbau ist erforscht!</h2>' +
      '<p>Du hast alle ' + JOURNEY_KEYS.length + ' Module durchlaufen — von den Grundlagen bis zur Kryptographie. Du verstehst jetzt mehr über Bitcoin als 99% der Bevölkerung.</p>' +
      '<p style="color:var(--gold);margin-top:12px;font-weight:600;font-family:var(--font-mono)">Total: +' + fmtNum(totalEarned) + ' Sats</p>' +
      '<p style="color:var(--muted);margin-top:8px;font-size:var(--text-xs)">«We\'re all mad here.» — Cheshire Cat</p>' +
      '<button class="rabbit-btn rabbit-btn-primary" style="margin-top:20px;width:100%">🏠 Zur Übersicht</button>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('visible'); });

    /* Unlock journey secret */
    if (typeof unlockSecret === 'function') {
      unlockSecret('rabbit_hole_complete');
    }

    var close = setupOverlay(overlay, function () {
      if (typeof navigateTo === 'function') navigateTo('rabbithole');
    });
    overlay.querySelector('.rabbit-btn').addEventListener('click', close);
  }

  /* ══════════════════════════════════════════════════════════════
   *  CORE LOGIC
   * ══════════════════════════════════════════════════════════════ */

  function start() {
    state = defaultState();

    /* Nur bewusst abgeschlossene Module übernehmen. */
    if (typeof completedModules !== 'undefined' && Array.isArray(completedModules)) {
      JOURNEY_KEYS.forEach(function (key, idx) {
        if (completedModules.includes(key) && !state.completedSteps.includes(idx)) {
          state.completedSteps.push(idx);
          /* Don't reward pre-existing visits */
        }
      });
      advanceCurrent();
    }

    saveState();
    showFAB();

    var chInfo = getChapterForStep(state.currentStep);
    showChapterIntro(chInfo.index, function () {
      goToStep(state.currentStep);
    });
  }

  function reset() {
    var overlay = document.createElement('div');
    overlay.className = 'rabbit-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="rabbit-overlay-card">' +
      '<div style="font-size:2.4rem">⚠️</div>' +
      '<h2>Reise zurücksetzen?</h2>' +
      '<p>Dein Fortschritt geht verloren — bereits verdiente Sats bleiben aber erhalten.</p>' +
      '<div style="display:flex;gap:8px;margin-top:20px">' +
        '<button class="rabbit-btn rabbit-btn-secondary" data-act="cancel" style="flex:1">Abbrechen</button>' +
        '<button class="rabbit-btn rabbit-btn-primary" data-act="confirm" style="flex:1">Zurücksetzen</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('visible'); });
    var close = setupOverlay(overlay);
    overlay.querySelector('[data-act="cancel"]').addEventListener('click', close);
    overlay.querySelector('[data-act="confirm"]').addEventListener('click', function () {
      state = null;
      storageRemove(STATE_KEY);
      hideFAB();
      hideNextBanner();
      updateHomeCard();
      renderOverview();
      close();
    });
  }

  function advanceCurrent() {
    if (!state) return;
    for (var i = 0; i < JOURNEY_KEYS.length; i++) {
      if (!state.completedSteps.includes(i)) {
        state.currentStep = i;
        return;
      }
    }
    state.currentStep = JOURNEY_KEYS.length;
  }

  function markComplete(stepIndex) {
    if (!state) return;
    if (state.completedSteps.includes(stepIndex)) return;
    state.completedSteps.push(stepIndex);
    if (typeof markModuleComplete === 'function') markModuleComplete(JOURNEY_KEYS[stepIndex]);

    /* Reward sats for journey completion */
    if (!state.rewardedSteps.includes(stepIndex)) {
      state.rewardedSteps.push(stepIndex);
      if (typeof addSats === 'function') {
        addSats(STEP_REWARD, '🐇 Rabbit Hole: Station ' + (stepIndex + 1) + '/' + JOURNEY_KEYS.length);
      }
    }

    advanceCurrent();
    saveState();
    updateFAB();
    updateHomeCard();
  }

  function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= JOURNEY_KEYS.length) return;
    var key = JOURNEY_KEYS[stepIndex];

    /* Check if entering a new chapter */
    if (state) {
      var prevChapter = -1;
      /* Find highest completed step's chapter */
      if (state.completedSteps.length > 0) {
        var maxCompleted = Math.max(...state.completedSteps);
        prevChapter = getChapterForStep(maxCompleted).index;
      }
      var targetChapter = getChapterForStep(stepIndex).index;
      if (targetChapter > prevChapter && !isStepCompleted(stepIndex)) {
        showChapterIntro(targetChapter, function () {
          if (typeof navigateTo === 'function') navigateTo(key);
        });
        return;
      }
    }

    if (typeof navigateTo === 'function') navigateTo(key);
  }

  function goToNextStep() {
    if (!state) return;
    if (state.currentStep >= JOURNEY_KEYS.length) return;
    goToStep(state.currentStep);
  }

  /* ══════════════════════════════════════════════════════════════
   *  NAVIGATION HOOK
   * ══════════════════════════════════════════════════════════════ */

  function hookNavigation() {
    /* Listen for the app:navigate CustomEvent dispatched by index.html's
     * navigateTo. Decoupled — no global function override, no recursion
     * guard needed. */
    window.addEventListener('app:navigate', function (e) {
      var key = e.detail && e.detail.key;
      if (!key) return;

      if (key === 'rabbithole') {
        renderOverview();
        hideNextBanner();
        removeCompleteButton();
        return;
      }

      /* Init rabbits on every screen change */
      setTimeout(initRabbits, 100);

      if (!isActive()) {
        removeCompleteButton();
        return;
      }

      var idx = getStepGlobalIndex(key);
      if (idx === -1) {
        hideNextBanner();
        removeCompleteButton();
        return;
      }

      if (!isStepCompleted(idx)) {
        setTimeout(function () { injectCompleteButton(key, idx); }, 150);
        hideNextBanner();
      } else {
        removeCompleteButton();
        showNextBannerIfNeeded(key);
      }
    });
  }

  /* Show "Nächste Station" banner only when current module differs from next step */
  function showNextBannerIfNeeded(currentKey) {
    if (!state || state.currentStep >= JOURNEY_KEYS.length) {
      hideNextBanner();
      return;
    }
    var nextKey = JOURNEY_KEYS[state.currentStep];
    if (nextKey !== currentKey) {
      showNextBanner(nextKey);
    } else {
      hideNextBanner();
    }
  }

  /* ══════════════════════════════════════════════════════════════
   *  DOM — COMPLETE BUTTON (injected at bottom of each module)
   * ══════════════════════════════════════════════════════════════ */

  var completeBtn = null;

  function removeCompleteButton() {
    if (completeBtn && completeBtn.parentNode) {
      completeBtn.remove();
    }
    completeBtn = null;
  }

  function injectCompleteButton(key, stepIndex) {
    removeCompleteButton();
    var screen = document.getElementById('screen-' + key);
    if (!screen) return;

    var chInfo = getChapterForStep(stepIndex);

    completeBtn = document.createElement('div');
    completeBtn.className = 'rabbit-complete-wrap';
    completeBtn.innerHTML =
      '<div class="rabbit-complete-card">' +
        '<div style="font-size:1.5rem;margin-bottom:6px">🐇</div>' +
        '<div style="font-size:var(--text-xs);color:var(--muted);margin-bottom:8px">' +
          escHtml(chInfo.chapter.title) + ' · Station ' + (stepIndex + 1) + '/' + JOURNEY_KEYS.length +
        '</div>' +
        '<button class="rabbit-btn rabbit-btn-primary rabbit-complete-btn" style="width:100%">' +
          '✅ Modul abschliessen · +' + fmtNum(STEP_REWARD) + ' Sats' +
        '</button>' +
      '</div>';

    completeBtn.querySelector('.rabbit-complete-btn').addEventListener('click', function () {
      markComplete(stepIndex);
      removeCompleteButton();
      /* Show next banner or completion */
      if (state.currentStep < JOURNEY_KEYS.length) {
        showNextBannerIfNeeded(key);
      } else {
        hideNextBanner();
        setTimeout(showCompletion, 600);
      }
    });

    screen.appendChild(completeBtn);
    /* Scroll into view after a brief delay */
    setTimeout(function () {
      completeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  /* ══════════════════════════════════════════════════════════════
   *  INIT
   * ══════════════════════════════════════════════════════════════ */

  function init() {
    injectCSS();
    loadState();
    ensureScreen();
    hookNavigation();
    createNextBanner();

    if (isActive()) {
      showFAB();
    }

    /* Init already-visible rabbits */
    setTimeout(initRabbits, 300);

    /* Home-Karte sofort einfügen: so landet sie im ersten Layout statt
     * 500 ms später ein zweites Layout der Startseite zu erzwingen. */
    injectHomeCard();
  }

  /* ══════════════════════════════════════════════════════════════
   *  PUBLIC API
   * ══════════════════════════════════════════════════════════════ */

  window.RabbitHole = {
    start: start,
    reset: reset,
    goToStep: goToStep,
    goToNextStep: goToNextStep,
    isActive: isActive,
    getProgress: getProgress,
    getRabbitProgress: getRabbitProgress,
    HIDDEN_RABBITS: HIDDEN_RABBITS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
