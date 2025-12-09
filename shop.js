// Zmienne interwałów dla efektów
let effectsInterval = null; 
let hackerInterval = null;
let goldInterval = null;
let oceanFishInterval = null;
let cosmosStarsInterval = null;
let cosmosMeteorInterval = null;
let sakuraInterval = null;
let royalInterval = null;
let toxicInterval = null;
let win95Interval = null;
let minecraftInterval = null;
let cyberpunkInterval = null;
let infernoInterval = null;
let stormInterval = null;
let sketchInterval = null;
let glassInterval = null;
let casinoInterval = null;

// ================== SKLEP I MOTYWY ==================

function openShop() {
    playSound('click');
    const grid = document.getElementById("shop-grid");
    if(!grid) return;
    grid.innerHTML = "";
    
    const walletEl = document.getElementById("shop-wallet");
    if(walletEl) walletEl.innerText = gameState.wallet.toFixed(2) + " zł";
    
    THEMES.forEach(t => {
        const div = document.createElement("div");
        const owned = gameState.ownedThemes.includes(t.id);
        const active = gameState.activeTheme === t.id;
        
        div.className = `shop-item ${owned ? 'owned' : ''} ${active ? 'active' : ''}`;
        div.onclick = () => buyTheme(t);
        
        div.innerHTML = `
            <div class="shop-icon">${t.icon}</div>
            <div class="shop-name">${t.name}</div>
            <div class="shop-price">${owned ? 'Posiadane' : t.price + ' zł'}</div>
        `;
        grid.appendChild(div);
    });
    
    document.getElementById("shop-popup").style.display = "flex";
}

function buyTheme(theme) {
    if(gameState.ownedThemes.includes(theme.id)) {
        // Equip
        gameState.activeTheme = theme.id;
        applyTheme(theme.id);
        saveData();
        openShop();
        showToast("Ustawiono motyw: " + theme.name, "success");
    } else {
        // Buy
        if(gameState.wallet >= theme.price) {
            gameState.wallet -= theme.price;
            gameState.stats.spent += theme.price;
            gameState.ownedThemes.push(theme.id);
            gameState.activeTheme = theme.id;
            applyTheme(theme.id);
            
            // --- SPRAWDŹ OSIĄGNIĘCIA PO ZAKUPIE ---
            if(typeof checkAchievements === 'function') checkAchievements();
            // --------------------------------------
            
            saveData();
            openShop();
            updateUI();
            playSound('win');
            showToast("Kupiono motyw!", "success");
        } else {
            playSound('wrong');
            showToast("Za mało pieniędzy!", "error");
        }
    }
}

function applyTheme(themeId) {
    document.body.className = ""; // Reset
    if(themeId !== 'default') document.body.classList.add(`theme-${themeId}`);
    
    // Obsługa efektów
    stopThemeEffects();
    if(themeId === 'christmas') startSnow();
    if(themeId === 'valentines') startHearts();
    if(themeId === 'halloween') startPumpkin();
    if(themeId === 'hacker') startHacker();
    if(themeId === 'gold') startGold();
    if(themeId === 'ocean') startOcean();
    if(themeId === 'retro') startRetro();
    if(themeId === 'cosmos') startCosmos();
    if(themeId === 'blossom') startSakura();
    if(themeId === 'royal') startRoyal();
    if(themeId === 'toxic') startToxic();
    if(themeId === 'win95') startWin95();
    if(themeId === 'minecraft') startMinecraft();
    if(themeId === 'cyberpunk') startCyberpunk();
    if(themeId === 'inferno') startInferno();
    if(themeId === 'storm') startStorm();
    if(themeId === 'sketchbook') startSketchbook();
    if(themeId === 'glass') startGlass();
    if(themeId === 'casino') startCasino();
}

// ================== EFEKTY SPECJALNE ==================
function stopThemeEffects() {
    // 1. NOWOŚĆ: Czyścimy nasłuchiwanie myszki (dla motywu Inferno)
    const buttons = document.querySelectorAll('.big-btn');
    buttons.forEach(btn => {
        if(btn.infernoMouseMoveHandler) {
            // Usuwamy listener
            btn.removeEventListener('mousemove', btn.infernoMouseMoveHandler);
            // Czyścimy przypisaną funkcję
            delete btn.infernoMouseMoveHandler;
            // Resetujemy zmienne CSS
            btn.style.removeProperty('--x');
            btn.style.removeProperty('--y');
        }
    });

    // 2. Czyścimy wszystkie interwały (czasomierze)
    const intervals = [
        effectsInterval, hackerInterval, goldInterval, oceanFishInterval, 
        cosmosStarsInterval, cosmosMeteorInterval, sakuraInterval, royalInterval, 
        toxicInterval, win95Interval, minecraftInterval, cyberpunkInterval, 
        infernoInterval, stormInterval, sketchInterval, glassInterval, casinoInterval
    ];
    intervals.forEach(i => { if(i) clearInterval(i); });

    // Czyścimy specjalną pętlę Matrixa
    if(window.cyberMatrixLoop) clearInterval(window.cyberMatrixLoop);

    // 3. Czyścimy główny kontener efektów
    const container = document.getElementById("theme-effects");
    if(container) container.innerHTML = "";
    
    // 4. Usuwamy specyficzne elementy HTML dodane przez motywy
    const removals = [
        // Stare motywy
        "#matrix-canvas", 
        ".toxic-overlay", 
        ".toxic-scanlines", 
        ".sakura-petal",
        ".particle.sakura",
        ".event-ghost",
        ".event-heart",
        ".particle.snow",
	".glowing-pumpkin",
        
        // Windows 95
        ".win95-icons-container", 
        "#clippy-container",
        ".win95-error-popup",
        ".vaporwave-item",
        
        // Cyberpunk
        ".cyber-scanner",       
        "#cyber-matrix",        
        ".cyber-breach-popup",
        
        // Inferno
        ".inferno-particle",
        ".inferno-crack-overlay",
        ".inferno-fire-overlay", // Ważne
        ".inferno-ash",          // Ważne
        
        // Sketchbook
        ".eraser-effect",
        ".sketch-plane",
        ".sketch-doodle",
        ".sketch-eraser-overlay",
        
        // Minecraft (wersja 3D i 2D dla pewności)
        ".mc-tnt-sprite",
        ".mc-tnt-wrapper",
        ".mc-creeper",
        ".mc-redstone",
        
        // Casino
        ".casino-chip",      // Nowe
        ".casino-card",      // Nowe
        ".casino-coin-win",
        
        // Storm
        ".storm-rain-drop",
        ".storm-glass-overlay",
        ".storm-flash-overlay",
        ".storm-cloud",

        // Glass
        ".glass-orb"
    ];

    removals.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
    });
    
    // Reset stylów globalnych
    document.body.style.transform = "none";
    document.body.style.textShadow = "none";
}

// === WIN95 ===
function startWin95() {
    const container = document.getElementById("theme-effects");

    // 1. Ikony
    const iconsContainer = document.createElement("div");
    iconsContainer.className = "win95-icons-container";
    iconsContainer.innerHTML = `
        <div class="win95-icon"><div class="win95-icon-img">💻</div>Mój Komputer</div>
        <div class="win95-icon"><div class="win95-icon-img">🗑️</div>Kosz</div>
        <div class="win95-icon"><div class="win95-icon-img">📝</div>Notatnik</div>
        <div class="win95-icon"><div class="win95-icon-img">🌐</div>Internet</div>
    `;
    document.body.appendChild(iconsContainer);

    // 2. Clippy
    const clippyCont = document.createElement("div");
    clippyCont.id = "clippy-container";
    clippyCont.innerHTML = `
        <div id="clippy-bubble">Wygląda na to, że grasz w grę.</div>
        <img id="clippy-img" src="images/clippy.png" onerror="this.style.display='none'">
    `;
    document.body.appendChild(clippyCont);

    // Baza tekstów
    const quotes = [
        "Wygląda na to, że próbujesz zgadnąć.",
        "Potrzebujesz pomocy? Niestety, jestem tylko spinaczem.",
        "Zapisz grę! A nie, czekaj, autosave działa.",
        "To pytanie wygląda na podchwytliwe.",
        "Czy jesteś pewien tej odpowiedzi?",
        "Jesteś zwykłym głąbem.",
        "Widzę, że Twój portfel świeci pustkami.",
        "Zapaliłbyś papieroska?",
        "Może przerwa na pasjansa?",
        "Klikasz bardzo niepewnie.",
        "Wykryto niski poziom wiedzy.",
        "Twoja stara by to zgadła.",
        "Poważnie? Taką odpowiedź wybierasz?",
        "Zbierasz na paczkę fajek?",
        "Sugeruję użyć Google, ale nie możesz. HAHA!"
    ];

    win95Interval = setInterval(() => {
        const rand = Math.random();

        // A. Critical Error (20% szans)
        if(rand < 0.2) {
            spawnWinError();
        }

        // B. Clippy gada (30% szans)
        if(rand > 0.7) {
            const bubble = document.getElementById("clippy-bubble");
            if(bubble) {
                bubble.innerText = quotes[Math.floor(Math.random() * quotes.length)];
                bubble.style.display = "block";
                setTimeout(() => bubble.style.display = "none", 10000);
            }
        }
    }, 6000); 
}

function spawnWinError() {
    const err = document.createElement("div");
    err.className = "win95-error-popup";
    const x = Math.random() * 60 + 20;
    const y = Math.random() * 60 + 20;
    err.style.left = x + "%";
    err.style.top = y + "%";

    err.innerHTML = `
        <div class="win95-error-header"><span>Błąd</span><span style="background:#c0c0c0;cursor:pointer;">X</span></div>
        <div class="win95-error-body"><div class="win95-error-icon">X</div><div>Critical Error 0x000F</div></div>
        <div style="text-align:center; margin-bottom:10px;"><button class="big-btn" style="width:80px; font-size:12px;">OK</button></div>
    `;
    document.body.appendChild(err);
    if(typeof playCasinoJackpotSound === 'function') playCasinoJackpotSound(); 
    setTimeout(() => err.remove(), 1000);
}

// === MINECRAFT (Wersja 3D) ===
function startMinecraft() {
    const container = document.getElementById("theme-effects");
    
    minecraftInterval = setInterval(() => {
        const rand = Math.random();

        // 1. Spadające TNT 3D
        if(rand < 0.3) {
            const wrapper = document.createElement("div");
            wrapper.className = "mc-tnt-wrapper";
            wrapper.style.left = Math.random() * 90 + "vw";
            
            const cube = document.createElement("div");
            cube.className = "mc-tnt-cube";
            
            const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
            faces.forEach(faceName => {
                const face = document.createElement("div");
                face.className = `mc-tnt-face face-${faceName}`;
                cube.appendChild(face);
            });
            
            wrapper.appendChild(cube);
            container.appendChild(wrapper);
            
            setTimeout(() => wrapper.remove(), 3000);
        }

        // 2. Creeper
        if(rand > 0.85 && !document.querySelector(".mc-creeper")) {
            const creeper = document.createElement("div");
            creeper.className = "mc-creeper";
            container.appendChild(creeper);
            setTimeout(() => creeper.remove(), 4000);
        }

        // 3. Redstone
        if(rand > 0.4 && rand < 0.6) {
            for(let i=0; i<3; i++) {
                setTimeout(() => {
                    const dust = document.createElement("div");
                    dust.className = "mc-redstone";
                    dust.style.left = (Math.random() * 100) + "vw";
                    dust.style.bottom = "0px";
                    container.appendChild(dust);
                    setTimeout(() => dust.remove(), 2000);
                }, i * 200);
            }
        }
    }, 1500);
}

// === CYBERPUNK (Poprawiony) ===
function startCyberpunk() {
    const container = document.getElementById("theme-effects");

    // 1. Skaner
    const scan = document.createElement("div");
    scan.className = "cyber-scanner";
    document.body.appendChild(scan);

    // 2. Tło Matrix
    const canvas = document.createElement("canvas");
    canvas.id = "cyber-matrix";
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '0123456789ABCDEF';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const matrixLoop = setInterval(() => {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const isYellow = Math.random() > 0.90;
            ctx.fillStyle = isYellow ? '#fcee0a' : '#00e5ff';
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 50);
    window.cyberMatrixLoop = matrixLoop;

    // 3. Pętla Zdarzeń (TYLKO GLITCH, BEZ BREACH)
    cyberpunkInterval = setInterval(() => {
        const rand = Math.random();

        // A. Glitch UI
        if(rand > 0.7) {
            const x = (Math.random() - 0.5) * 10;
            const rgbSplit = (Math.random() - 0.5) * 5;
            
            document.body.style.transform = `translateX(${x}px)`;
            document.body.style.textShadow = `${rgbSplit}px 0 red, ${-rgbSplit}px 0 cyan`;

            setTimeout(() => {
                document.body.style.transform = "none";
                document.body.style.textShadow = "none";
            }, 50);
        }   
    }, 2000);
}

// === INFERNO (PREMIUM DARK) ===
function startInferno() {
    const container = document.getElementById("theme-effects");

    // --- OBSŁUGA DYNAMICZNEGO OŚWIETLENIA ---
    const buttons = document.querySelectorAll('.big-btn');
    buttons.forEach(btn => {
        btn.infernoMouseMoveHandler = function(e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', x + 'px');
            btn.style.setProperty('--y', y + 'px');
        };
        btn.addEventListener('mousemove', btn.infernoMouseMoveHandler);
    });

    // --- CZĄSTECZKI ---
    infernoInterval = setInterval(() => {
        const rand = Math.random();
        // 1. ISKRY
        if(rand > 0.3) {
            const ember = document.createElement("div");
            ember.className = "inferno-particle";
            ember.style.width = (Math.random() * 3 + 1) + "px";
            ember.style.height = ember.style.width;
            ember.style.background = "#ffaa00";
            ember.style.boxShadow = "0 0 4px #ff4500";
            ember.style.left = (Math.random() * 100) + "vw";
            ember.style.bottom = "-10px";
            ember.style.opacity = "1";
            
            const duration = Math.random() * 2000 + 1000; 
            const drift = Math.random() * 100 - 50; 
            
            ember.animate([
                { transform: `translate(0, 0)`, opacity: 1 },
                { transform: `translate(${drift}px, -${Math.random() * 60 + 20}vh)`, opacity: 0 }
            ], { duration: duration, easing: 'ease-out' });
            
            container.appendChild(ember);
            setTimeout(() => ember.remove(), duration);
        }
        // 2. POPIÓŁ
        if(rand < 0.3) {
            const ash = document.createElement("div");
            ash.className = "inferno-particle";
            ash.style.width = (Math.random() * 6 + 2) + "px";
            ash.style.height = ash.style.width;
            ash.style.background = "#555";
            ash.style.opacity = "0.4";
            ash.style.left = (Math.random() * 100) + "vw";
            ash.style.bottom = "-20px";
            const duration = Math.random() * 5000 + 4000; 
            ash.animate([
                { transform: `translate(0, 0) rotate(0deg)` },
                { transform: `translate(${Math.random()*200 - 100}px, -110vh) rotate(360deg)` }
            ], { duration: duration, easing: 'linear' });
            container.appendChild(ash);
            setTimeout(() => ash.remove(), duration);
        }
    }, 100); 
}

// === STORM ===
function startStorm() {
    const container = document.getElementById("theme-effects");

    // Elementy tła
    const cloud = document.createElement("div");
    cloud.className = "storm-cloud";
    container.appendChild(cloud);

    const glass = document.createElement("div");
    glass.className = "storm-glass-overlay";
    document.body.appendChild(glass);

    const flash = document.createElement("div");
    flash.className = "storm-flash-overlay";
    document.body.appendChild(flash);

    stormInterval = setInterval(() => {
        const rand = Math.random();
        
        // Deszcz
        for(let i=0; i<3; i++) {
            const drop = document.createElement("div");
            drop.className = "storm-rain-drop";
            drop.style.left = (Math.random() * 100) + "vw";
            drop.style.opacity = Math.random() * 0.5 + 0.2;
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + "s";
            container.appendChild(drop);
            setTimeout(() => drop.remove(), 1000);
        }

        // Piorun
        if(rand > 0.98) {
            triggerLightning(flash);
        }
    }, 100);
}

function triggerLightning(flashElement) {
    flashElement.style.opacity = "0.8";
    flashElement.style.transition = "none"; 
    
    setTimeout(() => {
        flashElement.style.transition = "opacity 0.5s ease-out";
        flashElement.style.opacity = "0";
    }, 50);

    const gameContainer = document.querySelector(".container");
    if(gameContainer) {
        gameContainer.style.animation = "thunderShake 0.3s ease-in-out";
        setTimeout(() => {
            gameContainer.style.animation = "none";
        }, 300);
    }
}

// === SKETCHBOOK (POPRAWIONY) ===
function startSketchbook() {
    const container = document.getElementById("theme-effects");

    // Element gumki
    const eraser = document.createElement("div");
    eraser.className = "sketch-eraser-overlay";
    document.body.appendChild(eraser);

    sketchInterval = setInterval(() => {
        const rand = Math.random();

        // 1. Papierowy samolot (SVG)
        if(rand > 0.85) {
            const plane = document.createElement("div");
            plane.className = "sketch-plane";
            
            // ZMIANA: Zamiast tekstu, wstawiamy rysunek SVG
            plane.innerHTML = `
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
            `;
            
            // Usuwamy stary styl filter, bo SVG ma już swój kolor
            // plane.style.filter = ... (to usuwamy)
            
            container.appendChild(plane);
            setTimeout(() => plane.remove(), 8000);
        }

        // 2. Bazgroły (bez zmian)
        if(rand < 0.3) {
            const doodle = document.createElement("div");
            doodle.className = "sketch-doodle";
            
            const svgContent = `
                <svg viewBox="0 0 100 100" fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round" style="overflow:visible">
                    <path d="M10,50 Q25,25 50,50 T90,50" />
                    <path d="M10,60 Q30,80 50,60 T90,60" opacity="0.5" />
                </svg>
            `;
            const svgSpiral = `
                <svg viewBox="0 0 100 100" fill="none" stroke="#2980b9" stroke-width="2" stroke-linecap="round">
                    <path d="M50,50 m-20,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0 m-10,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0" />
                </svg>
            `;
            
            doodle.innerHTML = Math.random() > 0.5 ? svgContent : svgSpiral;
            doodle.style.left = (Math.random() * 90) + "vw";
            doodle.style.top = (Math.random() * 90) + "vh";
            doodle.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            container.appendChild(doodle);
            setTimeout(() => doodle.remove(), 4000);
        }

    }, 2000);
}

// === GLASS / SZKLANY (Z ANIMACJĄ PŁYWANIA + DODATKOWA KULA) ===
function startGlass() {
    const container = document.getElementById("theme-effects");

    const colors = [
        "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)", // Różowa
        "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",             // Błękitna
        "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)"              // Biało-szara
    ];

    // --- 4 KULE W ROGACH (Stary kod) ---
    for(let i=0; i<4; i++) {
        const orb = document.createElement("div");
        orb.className = "glass-orb";
        const size = Math.random() * 200 + 300; 
        orb.style.width = size + "px"; orb.style.height = size + "px";
        orb.style.background = colors[i % colors.length];
        
        const isLeft = Math.random() > 0.5;
        const isTop = Math.random() > 0.5;

        if (isLeft) orb.style.left = (Math.random() * 20 - 10) + "vw";
        else orb.style.left = (Math.random() * 20 + 80) + "vw";
        if (isTop) orb.style.top = (Math.random() * 20 - 10) + "vh";
        else orb.style.top = (Math.random() * 20 + 80) + "vh";
        
        const xMove = Math.random() * 200 - 100;
        const yMove = Math.random() * 200 - 100;
        const duration = Math.random() * 3000 + 5000; 

        orb.animate([
            { transform: `translate(0px, 0px) scale(1)` },
            { transform: `translate(${xMove}px, ${yMove}px) scale(1.1)` }
        ], { duration: duration, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        
        container.appendChild(orb);
    }

    // --- NOWOŚĆ: DODATKOWA KULA NA PRAWEJ KRAWĘDZI ---
    const rightOrb = document.createElement("div");
    rightOrb.className = "glass-orb";
    const rightSize = 500; // Duża
    rightOrb.style.width = rightSize + "px";
    rightOrb.style.height = rightSize + "px";
    // Używamy np. błękitnego gradientu (indeks 1)
    rightOrb.style.background = colors[1]; 

    // POZYCJA: Maksymalnie po prawej (wystaje poza ekran)
    rightOrb.style.left = "95vw"; 
    // Wyśrodkowana w pionie
    rightOrb.style.top = "calc(50vh - 250px)"; 

    // ANIMACJA: Pływa głównie góra/dół wzdłuż krawędzi
    rightOrb.animate([
        { transform: `translate(0px, -100px) scale(1)` }, // Start trochę wyżej
        { transform: `translate(-30px, 100px) scale(1.05)` } // Koniec niżej i lekko w lewo
    ], {
        duration: 8000, // Wolniejsza
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
    container.appendChild(rightOrb);
}
// === CASINO / VEGAS (PREMIUM) ===
function startCasino() {
    const container = document.getElementById("theme-effects");
    const suits = ["♠", "♥", "♣", "♦"];
    
    // Generowanie tła (Karty i Żetony)
    casinoInterval = setInterval(() => {
        const rand = Math.random();

        // 1. Spadające Żetony 3D (Często)
        if(rand > 0.4) {
            const chip = document.createElement("div");
            chip.className = "casino-chip";
            
            // Losowanie koloru żetonu (Czerwony, Czarny, Niebieski, Zielony)
            const colors = ["#d32f2f", "#212121", "#1976d2", "#388e3c"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            chip.style.color = color; // To ustawia kolor obramowania w CSS (currentColor)
            chip.style.backgroundColor = color;
            chip.innerText = "$";
            
            chip.style.left = (Math.random() * 95) + "vw";
            chip.style.animationDuration = (Math.random() * 3 + 3) + "s"; // 3-6s
            
            container.appendChild(chip);
            setTimeout(() => chip.remove(), 6000);
        }

        // 2. Wirujące Karty w tle (Rzadziej)
        if(rand < 0.2) {
            const card = document.createElement("div");
            card.className = "casino-card";
            card.innerText = suits[Math.floor(Math.random() * suits.length)];
            
            // Czerwone lub czarne
            card.style.color = (card.innerText === "♥" || card.innerText === "♦") ? "#d32f2f" : "#000";
            
            card.style.left = (Math.random() * 90) + "vw";
            card.style.top = (Math.random() * 90) + "vh";
            
            container.appendChild(card);
            setTimeout(() => card.remove(), 5000);
        }

    }, 800); // Co 0.8 sekundy
}

// ================== SKLEP Z POWER-UPAMI ==================
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
// === EFEKTY WYGRANEJ/PRZEGRANEJ ===
function triggerThemeWinEffect() {
    const theme = gameState.activeTheme;
    
    if(theme === 'sketchbook') {
        const el = document.createElement("div");
        el.innerText = "✔";
        el.style.position = "fixed"; el.style.left = "50%"; el.style.top = "50%";
        el.style.transform = "translate(-50%, -50%)";
        el.style.zIndex = "10000";
        el.style.pointerEvents = "none";
        
        el.innerHTML = `
            <svg width="200" height="200" viewBox="0 0 100 100">
                <path d="M20,50 L40,70 L80,20" fill="none" stroke="green" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"
                      style="stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 0.5s ease-out forwards;" />
            </svg>
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    if(theme === 'casino') {
        // Odtwórz dźwięk (potrójny ding)
        playCasinoJackpotSound();
        
        // Zrzucamy 50 monet!
        for(let i=0; i<50; i++) {
            setTimeout(() => {
                const coin = document.createElement("div");
                coin.className = "casino-coin-win";
                // Losowa pozycja startowa
                coin.style.left = (Math.random() * 100) + "vw";
                document.body.appendChild(coin);
                
                // Usuń po spadnięciu
                setTimeout(() => coin.remove(), 1500);
            }, i * 30); // Szybka seria (co 30ms)
        }
    }
}

function triggerThemeLoseEffect() {
    const theme = gameState.activeTheme;

    // Sketchbook: Gumkowanie
    if(theme === 'sketchbook') {
        const eraser = document.querySelector(".sketch-eraser-overlay");
        if(eraser) {
            eraser.style.animation = "eraserRub 0.6s ease-in-out";
            eraser.style.opacity = "0.9";
            setTimeout(() => {
                eraser.style.animation = "none";
                eraser.style.opacity = "0";
            }, 600);
        }
    }

    // Inferno - Pęknięcie i Trzęsienie
    if(theme === 'inferno') {
        const container = document.querySelector(".container");
        
        // 1. Czerwony błysk na ekranie
        let crack = document.createElement("div");
        crack.className = "inferno-crack-overlay";
        document.body.appendChild(crack);
        
        // Pokaż
        setTimeout(() => crack.style.opacity = "1", 10);
        
        // 2. Trzęsienie TYLKO KONTENERA (nie całej strony)
        if(container) {
            container.style.animation = "shakeContainer 0.4s ease-in-out";
        }
        
        // Sprzątanie po 0.5s
        setTimeout(() => {
            crack.style.opacity = "0";
            if(container) container.style.animation = "none";
            setTimeout(() => crack.remove(), 500);
        }, 400);
    }
}

// Generator dźwięku JACKPOT (C-E-G arpeggio)
function playCasinoJackpotSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if(!AudioContext) return;
        const ctx = new AudioContext();
        
        // Trzy dźwięki w odstępie czasu
        [523.25, 659.25, 783.99].forEach((freq, i) => { // C5, E5, G5
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = "square"; // Dźwięk 8-bitowy/elektroniczny
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                
                // Głośność: start -> zanikanie
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }, i * 150); // Odstęp 150ms
        });
    } catch(e) {}
}

// === PODSTAWOWE EFEKTY ===
function startSnow() {
    const container = document.getElementById("theme-effects");
    effectsInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle snow"; el.innerText = "❄️";
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = Math.random() * 3 + 2 + "s";
        container.appendChild(el);
        setTimeout(() => el.remove(), 5000);
    }, 300);
}
function startSakura() {
    const container = document.getElementById("theme-effects");
    sakuraInterval = setInterval(() => {
        const petal = document.createElement("div");
        petal.className = "sakura-petal";
        const size = Math.random() * 10 + 10;
        petal.style.width = size + "px"; petal.style.height = size + "px";
        petal.style.left = (Math.random() * 100) + "vw";
        const colors = ['#ffc0cb', '#ffb7b2', '#ff9aa2', '#ffe6e6'];
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        petal.style.animationDuration = (Math.random() * 7 + 5) + "s";
        container.appendChild(petal); setTimeout(() => petal.remove(), 12000);
    }, 300);
}
function startHearts() {
    const container = document.getElementById("theme-effects");
    effectsInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle heart"; el.innerText = "❤️";
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = Math.random() * 3 + 2 + "s";
        container.appendChild(el);
        setTimeout(() => el.remove(), 5000);
    }, 400);
}
// === HALLOWEEN (POPRAWIONY) ===
function startPumpkin() {
    const container = document.getElementById("theme-effects");

    // 1. Wielka statyczna dynia w rogu
    const bigPumpkin = document.createElement("div");
    bigPumpkin.className = "glowing-pumpkin"; 
    bigPumpkin.innerText = "🎃";
    container.appendChild(bigPumpkin);

    // 2. Latające duszki i małe dynie (Interval)
    effectsInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "event-ghost";
        // Losujemy czy to duch czy dynia
        el.innerText = Math.random() > 0.5 ? "👻" : "🎃";
        
        // Losowa pozycja startowa
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = Math.random() * 100 + "vh";
        el.style.fontSize = (Math.random() * 30 + 20) + "px";
        
        // Animacja ruchu (błąkanie się)
        const duration = Math.random() * 5000 + 5000;
        el.animate([
            { transform: 'translate(0, 0)', opacity: 0 },
            { transform: `translate(${Math.random()*200-100}px, ${Math.random()*200-100}px)`, opacity: 0.8, offset: 0.5 },
            { transform: `translate(${Math.random()*200-100}px, ${Math.random()*200-100}px)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });

        container.appendChild(el);
        
        // Usuwanie po zakończeniu animacji
        setTimeout(() => el.remove(), duration);
    }, 1000); // Nowy duszek co sekundę
}
function startGold() {
    const container = document.getElementById("theme-effects");
    goldInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle shine"; el.innerText = "✦";
        el.style.left = Math.random() * 95 + "vw";
        el.style.top = Math.random() * 95 + "vh";
        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }, 600);
}
function startOcean() {
    const container = document.getElementById("theme-effects");
    const waveBg = document.createElement("div"); waveBg.className = "ocean-wave bg";
    const waveMid = document.createElement("div"); waveMid.className = "ocean-wave mid";
    const waveFg = document.createElement("div"); waveFg.className = "ocean-wave fg";
    container.appendChild(waveBg); container.appendChild(waveMid); container.appendChild(waveFg);
    oceanFishInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle fish";
        const fishTypes = ['🐠', '🐟', '🐡'];
        el.innerText = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const direction = Math.random() > 0.5 ? 1 : 0; 
        el.style.bottom = (Math.random() * 5) + "%"; 
        if (direction === 0) { el.classList.add('fish-right'); el.style.animationDuration = (10 + Math.random() * 5) + "s"; } 
        else { el.classList.add('fish-left'); el.style.animationDuration = (10 + Math.random() * 5) + "s"; }
        container.appendChild(el); setTimeout(() => el.remove(), 15000);
    }, 2000);
}
function startRetro() {
    const container = document.getElementById("theme-effects");
    const grain = document.createElement("div"); grain.className = "retro-grain"; container.appendChild(grain);
    const overlay = document.createElement("div"); overlay.className = "retro-overlay"; container.appendChild(overlay);
    const line = document.createElement("div"); line.className = "retro-line"; container.appendChild(line);
}
function startRoyal() {
    const container = document.getElementById("theme-effects");
    royalInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle royal-item";
        el.innerText = Math.random() > 0.5 ? "👑" : "💎";
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = Math.random() * 3 + 3 + "s"; 
        container.appendChild(el); setTimeout(() => el.remove(), 6000);
    }, 800);
}
function startToxic() {
    const container = document.getElementById("theme-effects");
    const overlay = document.createElement("div"); overlay.className = "toxic-overlay"; document.body.appendChild(overlay); 
    const scanlines = document.createElement("div"); scanlines.className = "toxic-scanlines"; document.body.appendChild(scanlines);
    toxicInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "particle toxic-bubble";
        const size = Math.random() * 30 + 10; 
        el.style.width = size + "px"; el.style.height = size + "px";
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = Math.random() * 5 + 4 + "s";
        if(size > 25) el.innerText = "☢";
        container.appendChild(el); setTimeout(() => el.remove(), 9000);
    }, 400);
}
function startCosmos() {
    const container = document.getElementById("theme-effects");
    for(let i=0; i<200; i++) {
        const el = document.createElement("div");
        el.className = "particle star";
        el.style.left = Math.random() * 100 + "vw"; el.style.top = Math.random() * 100 + "vh";
        el.style.width = (Math.random() * 2 + 1) + "px"; el.style.height = el.style.width;
        el.style.animationDuration = (Math.random() * 3 + 2) + "s"; 
        container.appendChild(el);
    }
    cosmosMeteorInterval = setInterval(() => {
        const el = document.createElement("div");
        el.className = "falling-star"; 
        const startX = Math.random() * 100;
        el.style.top = "-10px"; el.style.left = startX + "vw";
        el.style.animationDuration = (Math.random() * 1 + 0.5) + "s";
        container.appendChild(el); setTimeout(() => el.remove(), 2000);
    }, 800);
}

function playCleanBuySound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if(!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Ustawienia tonu (Sine = miękki dźwięk)
        osc.type = "sine"; 
        // Zaczyna wysoko (1000Hz) i szybko spada, co daje efekt "kliknięcia"
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);

        // Głośność (Bardzo cicho - 5% mocy)
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08); // Trwa tylko 0.08 sekundy
    } catch(e) {}
}

function startHacker() {
    const container = document.getElementById("theme-effects");
    const canvas = document.createElement("canvas"); canvas.id = "matrix-canvas"; container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cols = canvas.width / 20; const drops = Array(Math.floor(cols)).fill(1);
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0'; ctx.font = '15px monospace';
        drops.forEach((y, i) => {
            const text = letters[Math.floor(Math.random() * letters.length)];
            const x = i * 20; ctx.fillText(text, x, y * 20);
            if(y * 20 > canvas.height && Math.random() > 0.975) { drops[i] = 0; }
            drops[i]++;
        });
    }
    hackerInterval = setInterval(draw, 50);
}