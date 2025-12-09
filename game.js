// ================== ZMIENNE STANU GRY ==================
let gameState = {
    wallet: 0,
    bestScore: 0,
    lastPlayTime: null,
    ownedThemes: ['default'],
    activeTheme: 'default',
    codesHistory: [],
    inventory: { fifty: 0, timefreeze: 0, secondchance: 0, insurance: 0, goldenshot: 0, reroll: 0 },
    stats: { 
        games:0, earned:0, spent:0, correct:0, wrong:0, streak:0, streakDate: null, 
        videosWatched: 0, adminFound: 0, totalPlayTime: 0 
    },
    lastSurvivalTime: 0, 
    claimedAchievements: [] 
};

let currentSession = {
    questions: [], index: 0, money: 0, correct: 0, aiUsed: false, finished: false,
    isSurvival: false,
    activeFlags: { frozen: false, secondChance: false, insurance: false, goldenShot: false }
};

let timerId = null;
let timeLeft = QUESTION_TIME || 30;
let globalVolume = 0.5; // Domyślnie 50%
let lastWinSoundTime = 0;
let canAnswer = false;
let cheatWarningsTotal = 0;

// ================== ZAPIS I ODCZYT ==================
function loadData() {
    const raw = localStorage.getItem("tomekQuiz_data_v2");
    if(raw) {
        try {
            let loaded = JSON.parse(raw);
            gameState = Object.assign(gameState, loaded);
            if(!gameState.inventory) gameState.inventory = { fifty: 0, timefreeze: 0, secondchance: 0, insurance: 0, goldenshot: 0, reroll: 0 };
            if(!gameState.claimedAchievements) gameState.claimedAchievements = [];
            if(!gameState.stats.videosWatched) gameState.stats.videosWatched = 0;
            if(!gameState.stats.adminFound) gameState.stats.adminFound = 0;
            if(!gameState.stats.totalPlayTime) gameState.stats.totalPlayTime = 0;
            if(!gameState.lastSurvivalTime) gameState.lastSurvivalTime = 0;
        } catch(e) { console.error("Błąd odczytu zapisu", e); }
    }
    if(typeof applyTheme === "function") applyTheme(gameState.activeTheme);
    checkAchievements(); 
    updateUI();
}

function saveData() {
    localStorage.setItem("tomekQuiz_data_v2", JSON.stringify(gameState));
    updateUI();
}

function updateUI() {
    const walletEl = document.getElementById("wallet-display");
    if(walletEl) walletEl.innerText = "Portfel: " + gameState.wallet.toFixed(2) + " zł";
    const bestEl = document.getElementById("best-display");
    if(bestEl) bestEl.innerText = "Najlepszy wynik: " + gameState.bestScore.toFixed(2) + " zł";
    
    let nextBonus = 0;
    const nextStreak = gameState.stats.streak + 1;
    if (nextStreak > 1) nextBonus = nextStreak <= 9 ? 0.10 : 0.20;
    const streakEl = document.getElementById("day-streak-display");
    if(streakEl) streakEl.innerText = `Passa dni: ${gameState.stats.streak} 🔥 (jutro: +${nextBonus.toFixed(2)} zł)`;
    
    const pct = Math.min(100, (gameState.wallet / 20) * 100);
    const bar = document.getElementById("money-progress-bar");
    if(bar) bar.style.width = pct + "%";
    const progText = document.getElementById("money-progress-text");
    if(progText) progText.innerText = `${gameState.wallet.toFixed(2)} / 20.00 zł`;
    
    // Status przycisku Survival
    const survBtn = document.getElementById("survival-btn");
    if(survBtn) {
        const isFan = gameState.claimedAchievements.includes('fan');
        if(isFan) {
            survBtn.style.opacity = "1";
            survBtn.innerText = "💀 TRYB PRZETRWANIA";
            checkSurvivalLimit(); // Sprawdź tylko cooldown
        } else {
            survBtn.style.opacity = "0.6";
            survBtn.innerText = "🔒 ZABLOKOWANE";
        }
    }

    checkTimeLimit();
}

function checkTimeLimit(isClick = false) {
    const now = Date.now();
    const last = gameState.lastPlayTime || 0;
    const diff = now - last;
    const day = 24 * 60 * 60 * 1000;
    const btn = document.getElementById("start-btn");
    const cd = document.getElementById("countdown");

    if(diff < day) {
        if(btn) { btn.disabled = true; btn.style.opacity = "0.5"; }
        if(cd) {
            const left = day - diff;
            const h = Math.floor(left/3600000);
            const m = Math.floor((left%3600000)/60000);
            cd.innerText = `Limit 24h: ${h}h ${m}m`;
        }
        if(isClick) showToast("Musisz poczekać 24h!", "error");
        return false;
    } else {
        if(btn) { btn.disabled = false; btn.style.opacity = "1"; }
        if(cd) cd.innerText = "";
        return true;
    }
}

// Sprawdzanie dostępności Survivalu (Blokada + Cooldown)
function checkSurvivalLimit(isClick = false) {
    const btn = document.getElementById("survival-btn");
    const timer = document.getElementById("survival-timer");

    // 1. Sprawdź czy odblokowane (Osiągnięcie 'Fan')
    if(!gameState.claimedAchievements.includes('fan')) {
        if(isClick) {
            showToast("Musisz zdobyć osiągnięcie 'Fan' (1h gry)!", "error");
            playSound('wrong');
            // Efekt trzęsienia
            if(btn) {
                btn.classList.remove('btn-shake');
                void btn.offsetWidth; // Trigger reflow
                btn.classList.add('btn-shake');
            }
        }
        return false;
    }

    // 2. Sprawdź Cooldown
    const now = Date.now();
    const last = gameState.lastSurvivalTime || 0;
    const diff = now - last;
    
    // Cooldown: 1h (lub 15min dla Superfan)
    let cooldown = 60 * 60 * 1000;
    if(gameState.claimedAchievements.includes('superfan')) cooldown = 15 * 60 * 1000;

    if(diff < cooldown) {
        if(btn) { btn.disabled = true; btn.style.opacity = "0.5"; }
        if(timer) {
            const left = cooldown - diff;
            const m = Math.floor(left/60000);
            const s = Math.floor((left%60000)/1000);
            timer.innerText = `Odnawia się za: ${m}m ${s}s`;
        }
        if(isClick) {
            showToast("Tryb się odnawia!", "error");
            playSound('wrong');
            if(btn) {
                btn.classList.remove('btn-shake');
                void btn.offsetWidth;
                btn.classList.add('btn-shake');
            }
        }
        return false;
    } else {
        if(btn) { btn.disabled = false; btn.style.opacity = "1"; }
        if(timer) timer.innerText = "";
        return true;
    }
}

// ================== SYSTEM OSIĄGNIĘĆ (POPRAWIONY) ==================
function checkAchievements() {
    if (typeof ACHIEVEMENTS === 'undefined') return;

    let somethingUnlocked = false;

    ACHIEVEMENTS.forEach(ach => {
        if (gameState.claimedAchievements.includes(ach.id)) return;

        let currentVal = 0;
        let targetVal = ach.target;
        let completed = false;

        switch(ach.type) {
            case 'earned': currentVal = gameState.stats.earned; break;
            case 'wrong': currentVal = gameState.stats.wrong; break;
            case 'correct': currentVal = gameState.stats.correct; break;
            case 'videosWatched': currentVal = gameState.stats.videosWatched; break;
            case 'themeOwned': 
                if (gameState.ownedThemes.includes(ach.target)) completed = true; 
                break;
            case 'allThemes':
                currentVal = gameState.ownedThemes.length;
                targetVal = THEMES.length;
                break;
            case 'secretAdmin': 
                currentVal = gameState.stats.adminFound;
                break;
            case 'codesBought':
                currentVal = gameState.codesHistory.length;
                break;
            case 'playtime':
                currentVal = gameState.stats.totalPlayTime;
                break;
            case 'hoarder':
                const allTypes = ['fifty', 'timefreeze', 'secondchance', 'insurance', 'goldenshot', 'reroll'];
                const owned = allTypes.filter(t => (gameState.inventory[t] || 0) > 0).length;
                currentVal = owned;
                targetVal = allTypes.length;
                break;
        }

        if (currentVal >= targetVal) completed = true;

        if (completed) {
            unlockAchievement(ach);
            somethingUnlocked = true;
        }
    });

    if(somethingUnlocked) saveData();
}

function unlockAchievement(ach) {
    gameState.claimedAchievements.push(ach.id);
    
    // 1. Pieniądze
    if(ach.reward.money) gameState.wallet += ach.reward.money;
    
    // 2. Power-upy
    if(ach.reward.powerups) {
        for (const [key, value] of Object.entries(ach.reward.powerups)) {
            gameState.inventory[key] += value;
        }
    }
    
    // 3. MOTYWY (Tu jest zmiana!)
    if(ach.reward.theme) {
        if(!gameState.ownedThemes.includes(ach.reward.theme)) {
            gameState.ownedThemes.push(ach.reward.theme);
            // ZAMIAST TOASTA -> DUŻY POPUP
            showThemeUnlockPopup(ach.reward.theme);
        }
    }
    
    // 4. Survival / Cooldown
    if(ach.reward.unlockSurvival) {
        showToast("ODBLOKOWANO TRYB PRZETRWANIA! 💀", "success");
        updateUI(); 
    }
    if(ach.reward.reduceCooldown) showToast("Survival Cooldown zmniejszony! ⚡", "success");

    playSound('win');
    
    // Pokazujemy toast tylko jeśli nagrodą NIE był motyw (bo motyw ma swój popup)
    if (!ach.reward.theme) {
        showToast(`🏆 Osiągnięcie: ${ach.name}!`, "success");
    }
}

function openAchievements() {
    const list = document.getElementById("achievements-list");
    list.innerHTML = "";

    if (typeof ACHIEVEMENTS === 'undefined') return;

    ACHIEVEMENTS.forEach(ach => {
        let currentVal = 0; let targetVal = ach.target;
        let isCompleted = gameState.claimedAchievements.includes(ach.id);

        if(!isCompleted) {
            switch(ach.type) {
                case 'earned': currentVal = gameState.stats.earned; break;
                case 'wrong': currentVal = gameState.stats.wrong; break;
                case 'correct': currentVal = gameState.stats.correct; break;
                case 'videosWatched': currentVal = gameState.stats.videosWatched; break;
                case 'themeOwned': currentVal = gameState.ownedThemes.includes(ach.target) ? 1 : 0; targetVal = 1; break;
                case 'allThemes': currentVal = gameState.ownedThemes.length; targetVal = THEMES.length; break;
                case 'secretAdmin': currentVal = gameState.stats.adminFound; break;
                case 'codesBought': currentVal = gameState.codesHistory.length; break;
                case 'playtime': currentVal = gameState.stats.totalPlayTime; break;
                case 'hoarder': 
                    const allTypes = ['fifty', 'timefreeze', 'secondchance', 'insurance', 'goldenshot', 'reroll'];
                    currentVal = allTypes.filter(t => (gameState.inventory[t] || 0) > 0).length;
                    targetVal = allTypes.length;
                    break;
            }
        } else { currentVal = targetVal = 1; }

        const pct = Math.min(100, (currentVal / targetVal) * 100);

        // === NAPRAWIONE GENEROWANIE NAGRÓD ===
        let rewardTextParts = [];
        
        // Pieniądze
        if (ach.reward.money) rewardTextParts.push(`<span style="color:#27ae60;">+${ach.reward.money} zł</span>`);
        
        // PowerUpy
        if (ach.reward.powerups) {
            for (const [pid, count] of Object.entries(ach.reward.powerups)) {
                const pObj = typeof POWERUPS !== 'undefined' ? POWERUPS.find(p => p.id === pid) : null;
                const icon = pObj ? pObj.icon : '⚡';
                rewardTextParts.push(`${count}x ${icon}`);
            }
        }
        
        // Motywy
        if (ach.reward.theme) {
            const tObj = typeof THEMES !== 'undefined' ? THEMES.find(t => t.id === ach.reward.theme) : null;
            const tName = tObj ? tObj.name : ach.reward.theme;
            rewardTextParts.push(`<div style="color:#8e44ad; font-weight:bold; margin-top:2px;">✨ Motyw: ${tName}</div>`);
        }
        
        // Nagrody specjalne (Fan, Superfan)
        if (ach.reward.unlockSurvival) {
            rewardTextParts.push(`<div style="color:#c0392b; font-weight:bold; margin-top:2px;">🔓 ODBLOKOWUJE SURVIVAL</div>`);
        }
        if (ach.reward.reduceCooldown) {
            rewardTextParts.push(`<div style="color:#e67e22; font-weight:bold; margin-top:2px;">⚡ SZYBSZY SURVIVAL (15min)</div>`);
        }
        
        let rewardDisplay = rewardTextParts.join("  ");
        // ======================================

        const item = document.createElement("div");
        item.className = `achie-item ${isCompleted ? 'completed' : ''}`;
        item.innerHTML = `
            <div class="achie-header">
                <span>${ach.name}</span>
                <span>${isCompleted ? '✅' : '🔒'}</span>
            </div>
            <div class="achie-desc">${ach.desc}</div>
            
            <div style="background:rgba(0,0,0,0.05); padding:5px; border-radius:5px; margin-bottom:8px;">
                <div style="font-size:10px; text-transform:uppercase; opacity:0.6; margin-bottom:2px;">Nagroda:</div>
                <div style="font-size:12px;">${rewardDisplay}</div>
            </div>

            <div class="achie-progress-bg">
                <div class="achie-progress-fill" style="width: ${pct}%"></div>
            </div>
            <div style="font-size:10px; text-align:right; margin-top:2px;">${isCompleted ? 'Odebrano' : `${Math.floor(currentVal)} / ${targetVal}`}</div>
        `;
        list.appendChild(item);
    });

    document.getElementById("achievements-popup").style.display = "flex";
    playSound('click');
}

// ================== LOGIKA STARTU ==================

function startGame() {
    if(!checkTimeLimit(true)) return;
    startSession(false);
}

function startSurvival() {
    if(!checkSurvivalLimit(true)) return;
    startSession(true);
}

function startSession(isSurvivalMode) {
    if (typeof QUESTIONS === 'undefined' || !QUESTIONS.length) { showToast("Błąd danych!", "error"); return; }

    let qList = isSurvivalMode ? shuffle([...QUESTIONS]) : shuffle([...QUESTIONS]).slice(0, 5);

    currentSession = { 
        questions: qList, 
        index: 0, money: 0, correct: 0, aiUsed: false, finished: false,
        isSurvival: isSurvivalMode, 
        activeFlags: { frozen: false, secondChance: false, insurance: false, goldenShot: false }
    };
    cheatWarningsTotal = 0;
    
    if(isSurvivalMode) {
        gameState.lastSurvivalTime = Date.now();
        showToast("💀 PRZETRWANIE ROZPOCZĘTE!", "warning");
    } else {
        gameState.stats.games++;
        gameState.lastPlayTime = Date.now();
    }
    
    saveData();
    showScreen('quiz-screen');
    loadQuestion();
    playSound('click');

    if(!isSurvivalMode) {
        const today = new Date().toDateString();
        if (!gameState.stats.streakDate) { gameState.stats.streakDate = today; gameState.stats.streak = 1; saveData(); } 
        else if (gameState.stats.streakDate !== today) {
            const lastPlay = new Date(gameState.stats.streakDate);
            const now = new Date(today);
            const diffDays = Math.ceil(Math.abs(now - lastPlay) / (1000 * 60 * 60 * 24)); 
            if (diffDays === 1) {
                gameState.stats.streak++;
                let bonus = gameState.stats.streak <= 9 ? 0.10 : 0.20;
                if (bonus > 0) { gameState.wallet += bonus; gameState.stats.earned += bonus; showToast(`Streak Bonus: +${bonus.toFixed(2)} zł`, "success"); }
            } else { gameState.stats.streak = 0; }
            gameState.stats.streakDate = today; saveData(); updateUI();
        }
    }
}

// ================== PYTANIA ==================

function loadQuestion() {
    clearInterval(timerId);
    canAnswer = false;
    
    // RESET FLAG (Dodano fiftyUsed: false)
    currentSession.activeFlags = { frozen: false, secondChance: false, insurance: false, goldenShot: false, fiftyUsed: false };
    
    const q = currentSession.questions[currentSession.index];
    if(!q || (!currentSession.isSurvival && currentSession.index >= 5)) { 
        endGame(); return; 
    }

    const counter = document.getElementById("question-counter");
    const moneyDisp = document.getElementById("money-display");
    
    if(currentSession.isSurvival) {
        counter.innerText = `💀 Runda ${currentSession.index + 1}`;
        counter.style.color = "#c0392b";
        moneyDisp.innerText = `Seria: ${currentSession.correct}`;
    } else {
        counter.innerText = `Pytanie ${currentSession.index + 1}/5`;
        counter.style.color = "";
        moneyDisp.innerText = "Zarobione: " + currentSession.money.toFixed(2) + " zł";
    }

    document.getElementById("question-text").innerText = q.q;
    document.getElementById("message").innerText = "";
    document.getElementById("timer-bar").style.width = "100%";
    
    const aiBtn = document.getElementById("ask-ai-btn");
    if(aiBtn) {
        aiBtn.innerText = currentSession.aiUsed ? "✨ Wykorzystano" : "✨ Zapytaj AI";
        aiBtn.disabled = currentSession.aiUsed;
        aiBtn.onclick = handleAI;
    }
    const invBtn = document.getElementById("open-inventory-btn");
    if(invBtn) invBtn.onclick = openInventoryPopup;

    try { renderPowerUpBar(); } catch(e) {} 

    const btns = [1,2,3,4].map(i => document.getElementById("answer"+i));
    btns.forEach((b, i) => {
        if(q.a[i]) {
            b.innerText = q.a[i];
            b.setAttribute('data-text', q.a[i]); 
            b.className = "big-btn answer-btn";
            b.style.display = "block"; 
            b.style.opacity = "1";
            b.onclick = () => handleAnswer(i);
            b.disabled = false;
            b.style.backgroundColor = ""; 
            b.classList.remove("answer-correct-anim", "answer-wrong-anim");
        } else {
            b.style.display = "none";
        }
    });

    const mediaDiv = document.getElementById("media");
    mediaDiv.innerHTML = "";
    const confirmBtn = document.getElementById("video-confirm-btn");
    if(confirmBtn) confirmBtn.style.display = "none";

    if(q.mediaType === 'image') {
        mediaDiv.innerHTML = `<img src="${q.mediaUrl}">`;
        startTimer();
    } else if(q.mediaType === 'audio') {
        mediaDiv.innerHTML = `<audio controls src="${q.mediaUrl}"></audio>`;
        startTimer();
    } else if(q.mediaType === 'video' || q.mediaType === 'videoCut') {
        btns.forEach(b => b.style.display = "none");
        const v = document.createElement("video");
        v.src = (q.mediaType === 'videoCut') ? q.mediaUrlShort : q.mediaUrl;
        v.controls = true; v.style.maxWidth = "100%"; v.style.borderRadius = "10px";
        mediaDiv.appendChild(v);
        
        const markWatched = () => {
            if(!currentSession.videoWatchedTriggered) {
                gameState.stats.videosWatched++; 
                currentSession.videoWatchedTriggered = true;
                saveData();
                checkAchievements();
            }
            v.pause(); confirmBtn.style.display = "none";
            btns.forEach((b, i) => { if(q.a[i]) b.style.display = "block"; });
            startTimer();
        };

        if(confirmBtn) {
            currentSession.videoWatchedTriggered = false;
            confirmBtn.style.display = "block";
            confirmBtn.onclick = markWatched;
        }
    } else { startTimer(); }
}
function startTimer() {
    let baseTime = QUESTION_TIME || 30;
    
    // SURVIVAL: Skracanie czasu (min 3s)
    if(currentSession.isSurvival) {
        // ZMIANA: Tu wpisujesz 33, żeby startowało od 33 sekund
        baseTime = Math.max(3, 33 - currentSession.index); 
        
        const td = document.getElementById("timer-display");
        if(td) td.style.color = "#c0392b";
    } else {
        const td = document.getElementById("timer-display");
        if(td) td.style.color = "";
    }
    
    timeLeft = baseTime; 
    canAnswer = true;
    
    const timerDisplay = document.getElementById("timer-display");
    if(timerDisplay) timerDisplay.innerText = timeLeft + "s";
    
    timerId = setInterval(() => {
        if(currentSession.activeFlags.frozen) return; 
        timeLeft--;
        if(timerDisplay) timerDisplay.innerText = timeLeft + "s";
        const tb = document.getElementById("timer-bar");
        if(tb) tb.style.width = (timeLeft/baseTime*100) + "%";
        
        if(timeLeft <= 0) { 
            clearInterval(timerId); 
            processAnswer(false, "Czas minął!"); 
        }
    }, 1000);
}

function handleAnswer(idx) {
    if(!canAnswer) return;
    const q = currentSession.questions[currentSession.index];
    const isCorrect = idx === q.correct;
    
    if (!isCorrect && currentSession.activeFlags.secondChance) {
        const btn = document.getElementById("answer"+(idx+1));
        btn.style.backgroundColor = "#e74c3c"; 
        btn.disabled = true;
        currentSession.activeFlags.secondChance = false; 
        showToast("❤️ Uratowany! Wybierz jeszcze raz.", "warning");
        playSound('wrong');
        return; 
    }

    const btn = document.getElementById("answer"+(idx+1));
    btn.classList.add(isCorrect ? "answer-correct-anim" : "answer-wrong-anim");
    processAnswer(isCorrect);
}

function processAnswer(isCorrect, msgOverride) {
    canAnswer = false; clearInterval(timerId);
    const msgEl = document.getElementById("message");
    
// --- SURVIVAL (POPRAWIONA OBSŁUGA WIDEO) ---
    if(currentSession.isSurvival) {
        if(isCorrect) {
            playSound('correct');
            currentSession.correct++;
            msgEl.style.color = "#2ecc71"; 
            msgEl.innerText = `Dobrze! Seria: ${currentSession.correct}`;
            showFloatingMoney(0); 
            if(typeof triggerThemeWinEffect === "function") triggerThemeWinEffect();
            
            // SPRAWDZAMY CZY TO PYTANIE Z FILMEM (VIDEOCUT)
            const q = currentSession.questions[currentSession.index];
            
            if(q.mediaType === 'videoCut') {
                // Jeśli tak: Ładujemy pełną wersję filmu zamiast od razu iść dalej
                const mDiv = document.getElementById("media"); mDiv.innerHTML = "";
                const v = document.createElement("video");
                v.src = q.mediaUrlFull; v.controls = true; v.autoplay = true; v.playsInline = true;
                v.style.maxWidth = "100%"; v.style.borderRadius = "10px"; v.style.marginTop = "10px";
                
                const nextBtn = document.createElement("button");
                nextBtn.innerText = "⏭️ DALEJ"; nextBtn.className = "big-btn"; 
                nextBtn.style.background = "#333"; nextBtn.style.marginTop = "10px";
                
                let transitionDone = false;
                const doTransition = () => { if(transitionDone) return; transitionDone = true; nextQ(); };
                nextBtn.onclick = doTransition; v.onended = doTransition;
                mDiv.appendChild(v); mDiv.appendChild(nextBtn);
                
                v.addEventListener('loadedmetadata', function() {
                    this.currentTime = (q.mediaStart !== undefined) ? q.mediaStart : 0;
                    var pp = this.play(); if(pp !== undefined) pp.catch(()=>{});
                });
                setTimeout(() => { nextBtn.style.background = "#e74c3c"; }, 3000);
            } else {
                // Jeśli zwykłe pytanie: Czekamy chwilę i idziemy dalej
                setTimeout(nextQ, 1500);
            }

        } else {
            // Przegrana (bez zmian)
            playSound('wrong');
            msgEl.style.color = "#e74c3c"; 
            msgEl.innerText = msgOverride || "ZGON! Koniec gry.";
            if(typeof triggerThemeLoseEffect === "function") triggerThemeLoseEffect();
            setTimeout(endGame, 1500);
        }
        return; 
    }

    // --- ZWYKŁA GRA ---
    if(isCorrect) {
        playSound('correct');
        let reward = getRewardAmount();
        if(currentSession.activeFlags.goldenShot) { reward *= 2; msgEl.innerText = `Złoty Strzał! +${reward.toFixed(2)} zł`; } 
        else { msgEl.innerText = `Dobrze! +${reward.toFixed(2)} zł`; }

        currentSession.money += reward; 
        currentSession.correct++; gameState.stats.correct++;
        msgEl.style.color = "#2ecc71"; 
        showFloatingMoney(reward);
        if(typeof triggerThemeWinEffect === "function") triggerThemeWinEffect();
    } else {
        playSound('wrong');
        let penalty = 0.5;
        if(currentSession.activeFlags.goldenShot) penalty = 1.0;
        if(currentSession.activeFlags.insurance) { penalty = 0; msgEl.innerText = "Uff! Polisa (0 zł)."; } 
        else { msgEl.innerText = msgOverride || `Źle! -${penalty.toFixed(2)} zł`; }

        currentSession.money = Math.max(0, currentSession.money - penalty); 
        gameState.stats.wrong++;
        msgEl.style.color = "#e74c3c"; 
        if(typeof triggerThemeLoseEffect === "function") triggerThemeLoseEffect();
    }
    document.getElementById("money-display").innerText = "Zarobione: " + currentSession.money.toFixed(2) + " zł";
    
    checkAchievements();

    const q = currentSession.questions[currentSession.index];
    if(q.mediaType === 'videoCut') {
        const mDiv = document.getElementById("media"); mDiv.innerHTML = "";
        const v = document.createElement("video");
        v.src = q.mediaUrlFull; v.controls = true; v.autoplay = true; v.playsInline = true;
        v.style.maxWidth = "100%"; v.style.borderRadius = "10px"; v.style.marginTop = "10px";
        
        const nextBtn = document.createElement("button");
        nextBtn.innerText = "⏭️ DALEJ"; nextBtn.className = "big-btn"; 
        nextBtn.style.background = "#333"; nextBtn.style.marginTop = "10px";
        
        let transitionDone = false;
        const doTransition = () => { if(transitionDone) return; transitionDone = true; nextQ(); };
        nextBtn.onclick = doTransition; v.onended = doTransition;
        mDiv.appendChild(v); mDiv.appendChild(nextBtn);
        
        v.addEventListener('loadedmetadata', function() {
            this.currentTime = (q.mediaStart !== undefined) ? q.mediaStart : 0;
            var pp = this.play(); if(pp !== undefined) pp.catch(()=>{});
        });
        setTimeout(() => { nextBtn.style.background = "#e74c3c"; }, 3000);
    } else { setTimeout(nextQ, 1500); }
}

function nextQ() { currentSession.index++; loadQuestion(); }

function endGame() {
    if(currentSession.finished) return; 
    currentSession.finished = true;
    
    // 1. Zapisywanie wyników
    if(currentSession.isSurvival) {
        giveSurvivalRewards(); // Przyznaje nagrody, jeśli zasłużono
    } else {
        gameState.wallet += currentSession.money; 
        gameState.stats.earned += currentSession.money;
        if(currentSession.money > gameState.bestScore) gameState.bestScore = currentSession.money;
    }
    
    saveData();
    if(typeof checkAchievements === "function") checkAchievements(); 
    
    // 2. Wyświetlanie ekranu
    showScreen('end-screen');
    
    const finalMoneyEl = document.getElementById("final-money");
    const endText = document.getElementById("end-text");
    const gif = document.getElementById("end-gif");
    
    // Zmienna decydująca o sukcesie/porażce
    let isWin = false;

    // --- LOGIKA TEKSTÓW I WARUNKU ZWYCIĘSTWA ---
    if(currentSession.isSurvival) {
        // SURVIVAL
        finalMoneyEl.innerText = `Rundy: ${currentSession.correct}`;
        finalMoneyEl.style.color = "#c0392b";
        
        // Wygrana w survivalu = min. 6 punktów
        if (currentSession.correct >= 6) {
            isWin = true;
            endText.innerText = "Przetrwanie Zaliczone!";
        } else {
            isWin = false;
            endText.innerText = "Porażka (min. 6 rund)...";
        }
    } else {
        // ZWYKŁA GRA
        finalMoneyEl.innerText = `+${currentSession.money.toFixed(2)} zł`;
        finalMoneyEl.style.color = "#27ae60";
        
        // Wygrana w zwykłej grze = zarobienie czegokolwiek (> 0)
        if (currentSession.money > 0) {
            isWin = true;
            endText.innerText = "Świetna robota!";
        } else {
            isWin = false;
            endText.innerText = "Nic nie zarobiłeś...";
        }
    }

    // --- 3. EFEKTY WIZUALNE I DŹWIĘKOWE (WSPÓLNE) ---
    if (isWin) {
        playSound('win');
        gif.src = "https://media1.tenor.com/m/y0zptlFKiYIAAAAd/yay-kitty.gif";
        generateAIComment(true);
    } else {
        playSound('lose');
        gif.src = "https://media1.tenor.com/m/JRJPU6H35PwAAAAd/spider-man-spider-man-web-of-shadows.gif";
        generateAIComment(false);
    }
}

function showThemeUnlockPopup(themeId) {
    // 1. Ustawiamy ikonę i nazwę
    const theme = typeof THEMES !== 'undefined' ? THEMES.find(t => t.id === themeId) : null;
    
    if (theme) {
        document.getElementById("unlocked-theme-icon").innerText = theme.icon;
        document.getElementById("unlocked-theme-name").innerText = theme.name;
    } else {
        document.getElementById("unlocked-theme-icon").innerText = "🎨";
        document.getElementById("unlocked-theme-name").innerText = themeId;
    }

    // 2. Obsługa przycisku "Wyposaż"
    const equipBtn = document.getElementById("unlock-equip-btn");
    if(equipBtn) {
        equipBtn.onclick = function() {
            // Zmieniamy motyw
            gameState.activeTheme = themeId;
            if(typeof applyTheme === "function") applyTheme(themeId);
            
            saveData();
            closePopup('theme-unlock-popup');
            
            // Dźwięk sukcesu i powiadomienie
            showToast("Wyposażono motyw!", "success");
        };
    }

    // 3. Pokaż okno
    document.getElementById("theme-unlock-popup").style.display = "flex";
}
// NAGRODY ZA SURVIVAL (POPRAWIONE POPUPY)
function giveSurvivalRewards() {
    const score = currentSession.correct;
    let msg = "";
    const powerupsList = ['fifty', 'timefreeze', 'secondchance', 'insurance', 'goldenshot', 'reroll'];
    
    const addRandom = (count) => {
        for(let i=0; i<count; i++) {
            const randomID = powerupsList[Math.floor(Math.random() * powerupsList.length)];
            gameState.inventory[randomID]++;
        }
        msg += `+${count}x Losowy Power-up! `;
    };

    if (score >= 6 && score <= 10) addRandom(1);
    else if (score >= 11 && score <= 15) addRandom(2);
    else if (score >= 16 && score <= 20) addRandom(3);
    else if (score >= 21 && score <= 25) addRandom(4);
    
    // PRÓG 25-29 (Motyw Królewski)
    else if (score >= 25 && score <= 29) {
        addRandom(5);
        if(!gameState.ownedThemes.includes('royal')) {
            gameState.ownedThemes.push('royal');
            msg += "+ MOTYW KRÓLEWSKI! 👑";
            // DODANO: Wywołanie popupu
            setTimeout(() => showThemeUnlockPopup('royal'), 1000); 
        }
    } 
    // PRÓG 30+ (Motyw Szklany)
    else if (score >= 30) {
        addRandom(6);
        
        // Sprawdzamy Szkło
        if(!gameState.ownedThemes.includes('glass')) {
            gameState.ownedThemes.push('glass');
            msg += "+ MOTYW SZKLANY! 💎";
            // DODANO: Wywołanie popupu (z opóźnieniem, żeby najpierw wszedł ekran końcowy)
            setTimeout(() => showThemeUnlockPopup('glass'), 1000);
        }
        
        // Sprawdzamy Królewski (jeśli ktoś przeskoczył próg 25 i od razu wbił 30)
        if(!gameState.ownedThemes.includes('royal')) {
            gameState.ownedThemes.push('royal');
            // Jeśli oba naraz, drugi popup po chwili
            setTimeout(() => showThemeUnlockPopup('royal'), 4000); 
        }
    } 
    else {
        msg = "Za słabo! (Min. 6 poprawnych)";
    }
    
    if(score >= 6) {
        playSound('win');
        showToast(msg, "success");
    } else {
        showToast(msg, "error");
    }
}
// ================== POWER-UPY I INVENTORY ==================
function openInventoryPopup() {
    const list = document.getElementById("inventory-list");
    list.innerHTML = "";
    let hasItems = false;
    if (typeof POWERUPS !== 'undefined') {
        POWERUPS.forEach(p => {
            const count = gameState.inventory[p.id] || 0;
            if(count > 0) {
                hasItems = true;
                const btn = document.createElement("button");
                btn.className = "big-btn";
                btn.style.fontSize = "16px";
                btn.style.display = "flex"; btn.style.justifyContent = "space-between"; btn.style.alignItems = "center";
                btn.innerHTML = `<span>${p.icon} <b>${p.name}</b></span><span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:10px;">x${count}</span>`;
                btn.onclick = () => { usePowerUp(p.id); closePopup('inventory-popup'); };
                list.appendChild(btn);
            }
        });
    }
    if (!hasItems) list.innerHTML = "<div style='opacity:0.6; padding:20px;'>Twój plecak jest pusty.<br>Kup moce w sklepie!</div>";
    document.getElementById("inventory-popup").style.display = "flex";
    playSound('click');
}

function renderPowerUpBar() {}

function usePowerUp(id) {
    if(gameState.inventory[id] <= 0) return;
    if(!canAnswer) return; 

    // Blokada Złotego Strzału w Survivalu
    if(currentSession.isSurvival && id === 'goldenshot') {
        showToast("Złoty Strzał nie działa w Survivalu!", "error");
        return;
    }

    // LOGIKA 50/50 Z BLOKADĄ PONOWNEGO UŻYCIA
    if(id === 'fifty') {
        if(currentSession.activeFlags.fiftyUsed) {
            showToast("Już użyto 50/50 w tym pytaniu!", "error");
            return;
        }

        const q = currentSession.questions[currentSession.index];
        let allIndices = [0, 1, 2, 3].filter(i => q.a[i]);
        let wrongIndices = allIndices.filter(i => i !== q.correct);
        wrongIndices = shuffle(wrongIndices).slice(0, 2);
        
        wrongIndices.forEach(idx => {
            const btn = document.getElementById("answer" + (idx+1));
            if(btn) {
                btn.style.opacity = "0.2";
                btn.onclick = null;
                btn.removeAttribute('data-text'); 
            }
        });
        
        currentSession.activeFlags.fiftyUsed = true; // Zapisz użycie
        showToast("Użyto 50/50!", "success");
    } 
    else if(id === 'timefreeze') {
        if(currentSession.activeFlags.frozen) return showToast("Czas już zatrzymany!", "error");
        currentSession.activeFlags.frozen = true;
        clearInterval(timerId);
        document.getElementById("timer-display").style.color = "#3498db";
        showToast("Czas Zatrzymany!", "success");
    }
    else if(id === 'secondchance') {
        if(currentSession.activeFlags.secondChance) return;
        currentSession.activeFlags.secondChance = true;
        showToast("❤️ Druga Szansa Aktywna!", "success");
    }
    else if(id === 'insurance') {
        if(currentSession.activeFlags.insurance) return;
        currentSession.activeFlags.insurance = true;
        showToast("🛡️ Polisa Aktywna!", "success");
    }
    else if(id === 'goldenshot') {
        if(currentSession.activeFlags.goldenShot) return;
        currentSession.activeFlags.goldenShot = true;
        showToast("🔫 Złoty Strzał! x2 Stawka!", "success");
    }
    else if(id === 'reroll') {
        const currentQ = currentSession.questions[currentSession.index];
        let newQ;
        let pool = currentSession.isSurvival ? QUESTIONS : QUESTIONS; 
        do { newQ = pool[Math.floor(Math.random() * pool.length)]; } while (newQ === currentQ);
        currentSession.questions[currentSession.index] = newQ;
        gameState.inventory[id]--;
        saveData();
        loadQuestion();
        showToast("🎲 Pytanie wymienione!", "success");
        return;
    }

    gameState.inventory[id]--;
    saveData();
}
// POMOCNICZE
function getRewardAmount() {
    const total = gameState.wallet + currentSession.money;
    if(total < 5) return 0.5; if(total < 10) return 0.4; return 0.2;
}
function showFloatingMoney(amount) {
    const el = document.createElement("div"); el.className = "floating-money";
    el.innerText = amount > 0 ? `+${amount.toFixed(2)}` : (currentSession.isSurvival ? "💀" : "0.00"); 
    el.style.left = "50%"; el.style.top = "50%";
    document.getElementById("quiz-screen").appendChild(el); setTimeout(() => el.remove(), 1000);
}
function playSound(type) {
    // Jeśli głośność jest 0, nie graj nic
    if(globalVolume <= 0) return;

    // Zabezpieczenie przed nakładaniem się 'win'
    if (type === 'win') {
        const now = Date.now();
        if (now - lastWinSoundTime < 1000) return; 
        lastWinSoundTime = now;
    }

    const sounds = { 
        correct: "sounds/correct.mp3", 
        wrong: "sounds/wrong.mp3", 
        click: "sounds/click.mp3", 
        win: "sounds/win.mp3", 
        lose: "sounds/lose.mp3" 
    };

    if(sounds[type]) {
        const audio = new Audio(sounds[type]);
        // Ustawiamy głośność na taką, jak na suwaku (0.0 - 1.0)
        audio.volume = globalVolume; 
        audio.play().catch(()=>{});
    }
}
function showToast(msg, type='info') {
    const c = document.getElementById("toast-container"); if(!c) return;
    const t = document.createElement("div"); t.className = `toast ${type}`;
    t.innerHTML = `<span>${type==='error'?'⛔':type==='success'?'✅':'ℹ️'}</span> ${msg}`;
    c.appendChild(t); setTimeout(() => t.remove(), 4000);
}
function showScreen(id) {
    ['start-screen', 'quiz-screen', 'end-screen'].forEach(s => { const el = document.getElementById(s); if(el) el.style.display = (s===id ? 'block' : 'none'); });
    const el = document.getElementById(id); if(el) { el.classList.remove('fade-in'); void el.offsetWidth; el.classList.add('fade-in'); }
}
function closePopup(id) { 
    const el = document.getElementById(id);
    if(el) el.style.display = "none"; 
    playSound('click'); 
}
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) { randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--; [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]; }
    return array;
}
async function askGemini(prompt) {
    if (!API_KEY) { showToast("Brak klucza API!", "error"); return null; }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    try {
        const response = await fetch(url, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (!response.ok) throw new Error("API Error"); const data = await response.json(); return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (e) { return null; }
}
async function handleAI() {
    const btn = document.getElementById("ask-ai-btn"); if(btn) { btn.innerText = "⏳ Myślę..."; btn.disabled = true; }
    const q = currentSession.questions[currentSession.index];
    const hint = await askGemini(`Jesteś pomocnikiem w quizie. Pytanie: "${q.q}". Odpowiedzi: ${q.a.join(", ")}. Która to poprawna? Odpowiedz krótko i zabawnie.`);
    if(btn) {
        if (hint) { document.getElementById("ai-content").innerText = hint; document.getElementById("ai-popup").style.display = "flex"; currentSession.aiUsed = true; btn.innerText = "✨ Wykorzystano"; } 
        else { showToast("Błąd AI.", "error"); btn.disabled = false; btn.innerText = "✨ Zapytaj AI"; }
    }
}
async function generateAIComment(win) {
    const box = document.getElementById("ai-comment-box"); const txt = document.getElementById("ai-comment-text");
    if(!box || !txt) return; box.style.display = "block"; txt.innerText = "AI pisze opinię...";
    const isSurvival = currentSession.isSurvival;
    const prompt = isSurvival 
        ? `Gracz przetrwał ${currentSession.correct} rund w trybie Survival. Skomentuj ten wynik (krótko, złośliwie lub z podziwem).`
        : `Gracz skończył grę. Zarobił ${currentSession.money} zł. Poprawne: ${currentSession.correct}/5. Napisz jedno złośliwe lub gratulacyjne zdanie.`;
    
    const comment = await askGemini(prompt);
    if (comment) txt.innerText = comment; else box.style.display = "none";
}

// Otwieranie Sklepu z Mocami
function openPowerUpShop() {
    const list = document.getElementById("powerup-list");
    if(!list) return;
    list.innerHTML = "";
    
    const walletEl = document.getElementById("powerup-wallet");
    if(walletEl) walletEl.innerText = gameState.wallet.toFixed(2) + " zł";
    
    if (typeof POWERUPS !== 'undefined') {
        POWERUPS.forEach(p => {
            const div = document.createElement("div");
            div.className = "shop-item";
            const ownedCount = gameState.inventory ? (gameState.inventory[p.id] || 0) : 0;
            div.onclick = () => buyPowerUp(p);
            div.innerHTML = `<div class="shop-icon">${p.icon}</div><div class="shop-name">${p.name} <small>(${ownedCount})</small></div><div style="font-size:10px; opacity:0.7; margin-bottom:5px;">${p.desc}</div><div class="shop-price">${p.price.toFixed(2)} zł</div>`;
            list.appendChild(div);
        });
    }
    document.getElementById("powerup-shop-popup").style.display = "flex";
}

function buyPowerUp(item) {
    if(gameState.wallet >= item.price) {
        gameState.wallet -= item.price;
        gameState.stats.spent += item.price;
        if(!gameState.inventory) gameState.inventory = {};
        if(!gameState.inventory[item.id]) gameState.inventory[item.id] = 0;
        gameState.inventory[item.id]++;
        saveData();
        openPowerUpShop(); updateUI();
        if(typeof playCleanBuySound === 'function') playCleanBuySound(); else playSound('win');
        showToast(`Kupiono: ${item.name}`, "success");
    } else {
        playSound('wrong');
        showToast("Za mało pieniędzy!", "error");
    }
}

// ================== INIT ==================
window.onload = function() {
    loadData(); 
    showScreen('start-screen'); 
    
    // Timery
    setInterval(() => checkTimeLimit(), 1000);
    setInterval(() => {
        if (!document.hidden) {
            gameState.stats.totalPlayTime = (gameState.stats.totalPlayTime || 0) + 1;
            if (gameState.stats.totalPlayTime % 60 === 0) checkAchievements();
        }
    }, 1000); 
    setInterval(() => checkSurvivalLimit(), 1000);

    // --- PRZYCISKI GŁÓWNE ---
    const startBtn = document.getElementById("start-btn"); 
    if(startBtn) startBtn.onclick = () => { playSound('click'); startGame(); };

    const survivalBtn = document.getElementById("survival-btn"); 
    if(survivalBtn) survivalBtn.onclick = () => { playSound('click'); startSurvival(); };

    const shopBtn = document.getElementById("shop-btn"); 
    if(shopBtn) shopBtn.onclick = () => { playSound('click'); openShop(); };
    
    const powerupShopBtn = document.getElementById("powerup-shop-btn"); 
    if(powerupShopBtn) powerupShopBtn.onclick = () => { playSound('click'); openPowerUpShop(); }; 
    
    const achieBtn = document.getElementById("achievements-btn"); 
    if(achieBtn) achieBtn.onclick = () => { playSound('click'); openAchievements(); };

    // --- USTAWIENIA (NOWE) ---
    const settingsBtn = document.getElementById("settings-btn");
    if(settingsBtn) settingsBtn.onclick = () => {
        playSound('click');
        document.getElementById("settings-popup").style.display = "flex";
    };

    // Obsługa suwaka w ustawieniach
    const volSlider = document.getElementById("volume-slider");
    const volIcon = document.getElementById("volume-icon");
    if(volSlider) {
        volSlider.value = globalVolume;
        volSlider.oninput = function() {
            globalVolume = parseFloat(this.value);
            if(globalVolume === 0) volIcon.innerText = "🔇";
            else if(globalVolume < 0.5) volIcon.innerText = "🔉";
            else volIcon.innerText = "🔊";
        };
    }
    
    // Przycisk Statystyk (Teraz w ustawieniach)
    const statsBtn = document.getElementById("stats-btn"); 
    if(statsBtn) statsBtn.onclick = () => { 
        const s = gameState.stats; 
        document.getElementById("stats-content").innerHTML = `
            Gier: <b>${s.games}</b><br>
            Poprawne: <b style="color:green">${s.correct}</b><br>
            Błędne: <b style="color:red">${s.wrong}</b><br>
            Zarobione łącznie: <b>${s.earned.toFixed(2)} zł</b><br>
            Wydane w sklepie: <b>${s.spent.toFixed(2)} zł</b>
        `; 
        // Zamykamy ustawienia, otwieramy statystyki
        document.getElementById("settings-popup").style.display = "none";
        document.getElementById("stats-popup").style.display = "flex"; 
        playSound('click'); 
    };

    // --- INNE ---
    const restartBtn = document.getElementById("restart-btn"); 
    if(restartBtn) restartBtn.onclick = () => { showScreen('start-screen'); playSound('click'); };
    
    const walletDisplay = document.getElementById("wallet-display"); 
    if(walletDisplay) walletDisplay.onclick = () => { 
        playSound('click');
        document.getElementById("exchange-wallet").innerText = gameState.wallet.toFixed(2) + " zł"; 
        const h = document.getElementById("codes-history"); 
        h.innerHTML = gameState.codesHistory.map(c => `<div>${c}</div>`).join("") || "Brak kodów"; 
        document.getElementById("exchange-popup").style.display = "flex"; 
    };
    
    // --- PANEL ADMINA ---
    const adminBtn = document.getElementById("admin-secret"); 
    let adminTimer;
    if(adminBtn) {
        const startPress = () => adminTimer = setTimeout(() => { 
            gameState.stats.adminFound = 1; checkAchievements();
            document.getElementById("admin-login-view").style.display = "block"; 
            document.getElementById("admin-panel-view").style.display = "none"; 
            document.getElementById("admin-pass-input").value = ""; 
            document.getElementById("admin-popup").style.display = "flex"; 
        }, 1000);
        const endPress = () => clearTimeout(adminTimer); 
        adminBtn.onmousedown = startPress; 
        adminBtn.onmouseup = endPress; 
        adminBtn.ontouchstart = startPress; 
        adminBtn.ontouchend = endPress;
    }

    const adminLogin = document.getElementById("admin-login-btn"); 
    if(adminLogin) adminLogin.onclick = () => { 
        if(document.getElementById("admin-pass-input").value === "JD") { 
            document.getElementById("admin-login-view").style.display = "none"; 
            document.getElementById("admin-panel-view").style.display = "block"; 
            document.getElementById("admin-last-code").innerText = gameState.codesHistory[0] || "brak"; 
            document.getElementById("admin-history").innerHTML = gameState.codesHistory.join("<br>"); 
        } else {
            showToast("Błędne hasło!", "error"); 
        }
    };

    const adminUnlockSurv = document.getElementById("admin-unlock-survival");
    if(adminUnlockSurv) adminUnlockSurv.onclick = () => {
        if(!gameState.claimedAchievements.includes('fan')) {
            gameState.claimedAchievements.push('fan');
            saveData();
            updateUI();
            showToast("Odblokowano Survival!", "success");
        } else {
            showToast("Już odblokowane!", "info");
        }
    };

    const adminReset = document.getElementById("admin-reset-time"); 
    if(adminReset) adminReset.onclick = () => { 
        gameState.lastPlayTime = 0; 
        gameState.lastSurvivalTime = 0; 
        saveData(); 
        checkTimeLimit(); 
        checkSurvivalLimit(); 
        showToast("Zresetowano wszystkie czasy!", "success"); 
    };

    const adminMoney = document.getElementById("admin-add-money"); 
    if(adminMoney) adminMoney.onclick = () => { 
        gameState.wallet += 20; 
        updateUI(); 
        showToast("Dodano 20 zł", "success"); 
    };
    
    const buyCodeBtn = document.getElementById("buy-code-btn"); 
    if(buyCodeBtn) buyCodeBtn.onclick = () => { 
        if(gameState.wallet >= 20) { 
            gameState.wallet -= 20; 
            const code = "KOD-" + Math.floor(Math.random()*100000); 
            gameState.codesHistory.unshift(code); 
            saveData(); 
            closePopup("exchange-popup"); 
            document.getElementById("new-code-display").innerText = code; 
            document.getElementById("new-code-popup").style.display = "flex"; 
            playSound('win'); 
            fetch(WEBHOOK_URL, { 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ content: `Kupiono kod: ${code}` }) 
            }).catch(()=>{}); 
        } else { 
            showToast("Brak kasy!", "error"); 
            playSound('wrong'); 
        } 
    };
    
    // Anty-cheat
    document.addEventListener("visibilitychange", () => { 
        const quizScreen = document.getElementById("quiz-screen"); 
        if (quizScreen && quizScreen.style.display === "block" && document.hidden && canAnswer) { 
            cheatWarningsTotal++; 
            if (cheatWarningsTotal === 1) { 
                showToast("⚠️ Nie wychodź z aplikacji!", "error"); 
            } else if (cheatWarningsTotal >= 2) { 
                processAnswer(false, "Oszukiwanie!"); 
            } 
        } 
    });
};