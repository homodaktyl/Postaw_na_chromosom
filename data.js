// ================== KONFIGURACJA ==================
const API_KEY = "AIzaSyDOhkvx4GLwZlfmO9uW33wAqveMTdJGsVY"; 
const WEBHOOK_URL = "https://discord.com/api/webhooks/1438853742924660816/MhnAUwDxCOX6NZp6H3Jd0mzC9I8SOHDw4zNkgpg3B-IMI8-yMu6CzofShfEvu33tF2PV";
const QUESTION_TIME = 30;

// Baza Motywów
const THEMES = [
    { id: 'default', name: 'Jasny (Domyślny)', price: 0, icon: '⚪' },
    { id: 'dark', name: 'Ciemny', price: 3, icon: '⚫' },
    { id: 'gold', name: 'Złoty', price: 4, icon: '🏆' },
    { id: 'hacker', name: 'Hacker', price: 5, icon: '💻' },
    { id: 'neon', name: 'Neon', price: 6, icon: '🟣' },
    { id: 'ocean', name: 'Ocean', price: 7, icon: '🌊' },
    { id: 'retro', name: 'Retro', price: 8, icon: '📺' },
    { id: 'cosmos', name: 'Kosmos', price: 9, icon: '🌌' },
    { id: 'blossom', name: 'Kwitnąca Wiśnia', price: 10, icon: '🌸' },
    { id: 'royal', name: 'Królewski', price: 11, icon: '👑' },
    { id: 'toxic', name: 'Toxic', price: 12, icon: '☢️' },
    { id: 'win95', name: 'Windows 95', price: 13, icon: '💾' },
    { id: 'minecraft', name: 'Minecraft', price: 14, icon: '⛏️' },
    { id: 'cyberpunk', name: 'Cyberpunk', price: 15, icon: '🦾' },
    { id: 'inferno', name: 'Piekło', price: 16, icon: '🔥' },
    { id: 'storm', name: 'Burza', price: 17, icon: '⚡' },
    { id: 'sketchbook', name: 'Szkicownik', price: 18, icon: '✏️' },
    { id: 'glass', name: 'Szklany', price: 19, icon: '💎' },
    { id: 'casino', name: 'Kasyno', price: 20, icon: '🎰' },
    { id: 'christmas', name: 'Boże Narodzenie', price: 5, icon: '🎄' },
    { id: 'valentines', name: 'Walentynki', price: 5, icon: '💖' },
    { id: 'halloween', name: 'Halloween', price: 5, icon: '🎃' }
];

const QUESTIONS = [
    { q: "Ile jest papierosów w jednej paczce?", a: ["15", "20", "25", "10"], correct: 1 },
    { q: "Jaki to model pociągu?", a: ["ED161", "EU44", "ED160", "ED162"], correct: 2, mediaType: "image", mediaUrl: "images/pociag.jpg" },
    { q: "Jak ma na imię koleżanka Amelki?", a: ["Martyna", "Marta", "Emilka", "Svietlana"], correct: 0 },
    { q: "Co to za dźwięk?", a: ["Twoj stary chrapie", "Szlifierka kątowa", "Zepsuty wiatrak", "Komuś burczy w brzuchu"], correct: 0, mediaType: "audio", mediaUrl: "sounds/augh.mp3" },
    { q: "Jak nazywa się ta broń?", a: ["Guardan", "Gardan", "Guardian", "Gardin"], correct: 2, mediaType: "image", mediaUrl: "images/bron_z_valo.jpg" },
    { q: "Co przeskrobał Iso?", a: ["Nie dał ci skina", "Zwyzywał cię po rusku", "Pokazał ci siura", "Nie napisał ci NT"], correct: 1, mediaType: "video", mediaUrl: "videos/iso.mp4" },
    { q: "Przed czym chroni ta ściana?", a: ["Przez najazdem przeciwników na B", "Przed niczym", "Przed granatami", "Przed robotem Raze"], correct: 1, mediaType: "video", mediaUrl: "videos/sciana.mp4" },
    { q: "Co następnie powiedział Tomek?", a: ["Ale masz seksi dupcie", "Dzięki kochana", "Good girl", "Grzeczna dziewczynka"], correct: 2, mediaType: "videoCut", mediaUrlShort: "videos/good_cut.mp4", mediaUrlFull:  "videos/good.mp4", mediaStart: 24 },
    { q: "Gdzie Tomek próbuje się dodzwonić?", a: ["Umówić na seks", "Do lokalnego burdelu", "Do serduszka Amelki", "Do Andrzeja Dudy"], correct: 2, mediaType: "videoCut", mediaUrlShort: "videos/dzwoni_cut.mp4", mediaUrlFull:  "videos/dzwoni.mp4", mediaStart: 13 },
    { q: "Którego dnia była ci pisana śmierć przez chorobę?", a: ["29 październik", "4 listopada", "31 września", "29 listopada"], correct: 0 },
    { q: "Ile złotych zaoszczędziłeś crackując Train Sim World 6?", a: ["6 499.49 zł", "459.99 zł", "16 474.90 zł", "18 299.99 zł"], correct: 2 },
    { q: "Jaka waluta obowiązuje na yubo?", a: ["Ruble", "Pixelki", "Coinsy", "Monety"], correct: 1 },
    { q: "Do kogo napisałeś tę wiadomość?", a: ["Do Martyny", "Do dziwki", "Do Amelki", "Do mamy"], correct: 2, mediaType: "image", mediaUrl: "images/dojenie.jpg" },
    { q: "Dlaczego niuna płakała na live?", a: ["Bo chłopak z nią zerwał", "Bo Tomek nie chciał jej wyruchać", "Bo spłonął McDonald's", "Bo ktoś pomylił ją z Dorotą Welman"], correct: 2 },
    { q: "Jaki kształt ma penis kaczora?", a: ["Podłużny", "Spiralny", "Trójkątny", "Szpiczasty"], correct: 1 },
    { q: "Jaki jest wzór na deltę?", a: ["b^2 - 4ac", "a^2 + b^2 = c^2", "e = mc^2", "a/b = c/d"], correct: 0 },
    { q: "Co robi Tomek gdy skończą się fajki?", a: ["Kupuje nową paczkę w sklepie", "Robi loda w krzakach", "Idzie żebrać na ulicę", "Skręca własne na maszynce"], correct: 2 },
    { q: "Jak ma na imię ta ryba?", a: ["Pusia", "Ryba bananowa", "Tomek", "Łosoś"], correct: 2, mediaType: "image", mediaUrl: "images/ryba.jpg" },
    { q: "Co to za budynek?", a: ["Burning Towers", "World Trade Center", "Tilted Towers", "Pałac Kultury i Nauki"], correct: 1, mediaType: "image", mediaUrl: "images/budynek.jpg" },
    { q: "Jak nazywa się to miejsce w Fortnite?", a: ["Przyjemny Park", "Słone Strzechy", "Lepki Lasek", "Karkołomne Kino"], correct: 0, mediaType: "image", mediaUrl: "images/park.jpg" },
    { q: "Jak nazywa się ten przystojniak?", a: ["Tomek", "Darius", "Garen", "Zac"], correct: 1, mediaType: "image", mediaUrl: "images/lold.jpg" },
    { q: "Jak nazywa się ten przystojniak?", a: ["Feniks", "Brimstone", "Tejo", "Omen"], correct: 2, mediaType: "image", mediaUrl: "images/valo.jpg" },
    { q: "Co palisz na tym filmiku?", a: ["Malboraska", "Kenta", "Winstona", "Chesterfielda"], correct: 1, mediaType: "video", mediaUrl: "videos/tomek.mp4" },
    { q: "Gdzie znajduje się ten monumentalny pomnik Jezusa Chrystusa?", a: ["W Rio De Janeiro", "W Gdańsku", "W Świebodzinie", "W Paryżu"], correct: 2, mediaType: "image", mediaUrl: "images/pomnik.jpg" },
    { q: "Co stało się dalej?", a: ["Amelka chrumknęła", "Tomek zaczął jęczeć", "Tomek zaczął śpiewać piosenkę Zombie", "Tomek puścił bąka"], correct: 1, mediaType: "videoCut", mediaUrlShort: "videos/chrumknij_cut.mp4", mediaUrlFull:  "videos/chrumknij.mp4", mediaStart: 13 },
    { q: "Gdzie zostałeś zamknięty?", a: ["W ulcie", "W piwnicy", "W ciemnicy", "W wirtualnej rzeczywistości"], correct: 2, mediaType: "videoCut", mediaUrlShort: "videos/ciemnica_cut.mp4", mediaUrlFull:  "videos/ciemnica.mp4", mediaStart: 4 },
    { q: "Co powie zaraz Tomek?", a: ["Sage please fuck my ass", "Sage give me ass", "Sage can i eat your ass", "Sage show me ass"], correct: 1, mediaType: "videoCut", mediaUrlShort: "videos/ass_cut.mp4", mediaUrlFull:  "videos/ass.mp4", mediaStart: 12 },
    { q: "W jaki sposób Tomek dokończył treść piosenki?", a: ["Ty kurwo jebana", "Zoooombie", "Now watch me whip", "Jebać cię cwelu"], correct: 3, mediaType: "videoCut", mediaUrlShort: "videos/cwel_cut.mp4", mediaUrlFull:  "videos/cwel.mp4", mediaStart: 3.7 },
    { q: "Kto wbił do ciebie na live?", a: ["Kutas Kozła", "Diho Orangutan", "Jurson Luzak", "Jezus Chrystus"], correct: 3, mediaType: "videoCut", mediaUrlShort: "videos/live_cut.mp4", mediaUrlFull:  "videos/live.mp4", mediaStart: 9.8 },
    { q: "Kto ziewnął?", a: ["Tomek", "Kamil", "Janek", "Napewno nie ja"], correct: 3, mediaType: "videoCut", mediaUrlShort: "videos/ziew_cut.mp4", mediaUrlFull:  "videos/ziew.mp4", mediaStart: 7 },

];

// === KOŁA RATUNKOWE ===
const POWERUPS = [
    { id: 'fifty', name: '50/50', price: 0.20, icon: '✂️', desc: 'Usuwa dwie błędne odpowiedzi.' },
    { id: 'timefreeze', name: 'Stop Czas', price: 0.10, icon: '❄️', desc: 'Zatrzymuje czas na tym pytaniu.' },
    { id: 'secondchance', name: 'Druga Szansa', price: 0.50, icon: '❤️', desc: 'Chroni przed jedną błędną odpowiedzią.' },
    { id: 'insurance', name: 'Polisa', price: 0.30, icon: '🛡️', desc: 'Brak kary finansowej przy błędzie.' },
    { id: 'goldenshot', name: 'Złoty Strzał', price: 1.00, icon: '🔫', desc: '2x Wygrana lub 2x Strata.' },
    { id: 'reroll', name: 'Reroll', price: 0.20, icon: '🎲', desc: 'Losuje nowe pytanie.' }
];

// === OSIĄGNIĘCIA (ACHIEVEMENTS) ===
const ACHIEVEMENTS = [
    // PIENIĄDZE
    { 
        id: 'money100', name: "Pierwsza stówka", desc: "Zarób łącznie 100 zł.", 
        type: 'earned', target: 100, 
        reward: { money: 5, powerups: { goldenshot: 1 } } 
    },
    { 
        id: 'money1000', name: "Pierwszy tysiak", desc: "Zarób łącznie 1000 zł.", 
        type: 'earned', target: 1000, 
        reward: { money: 20, powerups: { secondchance: 1, goldenshot: 1 } } 
    },
    
    // SPECJALNE
    { 
        id: 'gambler', name: "Hazardzista", desc: "Kup motyw Kasyno.", 
        type: 'themeOwned', target: 'casino', 
        reward: { powerups: { goldenshot: 3, reroll: 5 } } 
    },
    { 
        id: 'collector', name: "Kolekcjoner", desc: "Zdobądź wszystkie motywy.", 
        type: 'allThemes', target: 0, // Target obliczymy dynamicznie
        reward: { money: 20, powerups: { fifty: 3, timefreeze: 3, secondchance: 3, insurance: 3, goldenshot: 3, reroll: 3 } } 
    },
    { 
        id: 'hacker_secret', name: "???", desc: "Znajdź ukryty panel admina.", 
        type: 'secretAdmin', target: 1, 
        reward: { theme: 'hacker' } 
    },
    
    // WIDEO
    { 
        id: 'cinemaman', name: "Kinoman", desc: "Obejrzyj 50 filmów bez pomijania.", 
        type: 'videosWatched', target: 50, 
        reward: { powerups: { fifty: 3, timefreeze: 3 } } 
    },

    // PORAŻKI (ZŁE ODPOWIEDZI)
    { 
        id: 'fail10', name: "Kretyn", desc: "Udziel 10 złych odpowiedzi.", 
        type: 'wrong', target: 10, 
        reward: { powerups: { fifty: 1 } } 
    },
    { 
        id: 'fail50', name: "Imbecyl", desc: "Udziel 50 złych odpowiedzi.", 
        type: 'wrong', target: 50, 
        reward: { powerups: { insurance: 1 } } 
    },
    { 
        id: 'fail100', name: "Debil", desc: "Udziel 100 złych odpowiedzi.", 
        type: 'wrong', target: 100, 
        reward: { powerups: { fifty: 3 } } 
    },
    { 
        id: 'fail300', name: "Down", desc: "Udziel 300 złych odpowiedzi.", 
        type: 'wrong', target: 300, 
        reward: { theme: 'toxic', powerups: { fifty: 1, timefreeze: 1, secondchance: 1, insurance: 1, goldenshot: 1, reroll: 1 } } 
    },
    { 
        id: 'fail500', name: "Upośledzeniec", desc: "Udziel 500 złych odpowiedzi.", 
        type: 'wrong', target: 500, 
        reward: { theme: 'minecraft', powerups: { goldenshot: 2, reroll: 2, insurance: 2, secondchance: 2 } } 
    },

    // SUKCESY (DOBRE ODPOWIEDZI)
    { 
        id: 'win10', name: "Nowicjusz", desc: "Udziel 10 poprawnych odpowiedzi.", 
        type: 'correct', target: 10, 
        reward: { theme: 'dark', powerups: { fifty: 1 } } 
    },
    { 
        id: 'win50', name: "Amator", desc: "Udziel 50 poprawnych odpowiedzi.", 
        type: 'correct', target: 50, 
        reward: { powerups: { timefreeze: 2 } } 
    },
    { 
        id: 'win100', name: "Przeciętniak", desc: "Udziel 100 poprawnych odpowiedzi.", 
        type: 'correct', target: 100, 
        reward: { theme: 'gold', powerups: { insurance: 3 } } 
    },
    { 
        id: 'win300', name: "Zawodowiec", desc: "Udziel 300 poprawnych odpowiedzi.", 
        type: 'correct', target: 300, 
        reward: { theme: 'neon', powerups: { reroll: 5 } } 
    },
    { 
        id: 'win500', name: "Sigma", desc: "Udziel 500 poprawnych odpowiedzi.", 
        type: 'correct', target: 500, 
        reward: { theme: 'win95', powerups: { fifty: 2, timefreeze: 2, secondchance: 2, insurance: 2, goldenshot: 2, reroll: 2 } } 
    },
    { 
        id: 'fan', name: "Fan", desc: "Spędź 1h w grze.", 
        type: 'playtime', target: 3600, // 3600 sekund = 1h
        reward: { unlockSurvival: true } // Specjalna nagroda: Odblokowanie
    },
    { 
        id: 'superfan', name: "Superfan", desc: "Spędź 24h w grze.", 
        type: 'playtime', target: 86400, // 24h
        reward: { reduceCooldown: true } // Specjalna nagroda: Cooldown 15min
    },
    { 
        id: 'addict', name: "Nałogowiec", desc: "Wymień 20zł na kod na fajki.", 
        type: 'codesBought', target: 1, 
        reward: { theme: 'inferno', powerups: { insurance: 3 } } 
    },
    { 
        id: 'hoarder', name: "Żydek", desc: "Zgromadź po 1 sztuce każdego koła ratunkowego.", 
        type: 'hoarder', target: 1, 
        reward: { theme: 'cosmos' } 
    }
];