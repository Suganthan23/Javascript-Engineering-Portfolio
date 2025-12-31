const MorseLib = {
    DICT: {
        A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".",
        F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
        K: "-.-", L: ".-..", M: "--", N: "-.", O: "---",
        P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
        U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--",
        Z: "--..",
        "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
        "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
        ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
        "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
        ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
        "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
    },

    get REVERSE() {
        return Object.fromEntries(Object.entries(this.DICT).map(([k, v]) => [v, k]));
    },

    encode: (text) => {
        if (!text) return "";
        return text.trim().split(/\s+/).map(word => {
            return word.toUpperCase().split("").map(ch => MorseLib.DICT[ch] || "?").join(" ");
        }).join(" / ");
    },

    decode: (morse) => {
        const clean = morse.trim().replace(/\s*\/\s*/g, " / ");
        return clean.split(" / ").map(word => {
            return word.split(" ").map(code => MorseLib.REVERSE[code] || "?").join("");
        }).join(" ");
    }
};

const AudioEngine = {
    ctx: null,
    oscillator: null,
    isPlaying: false,
    DOT_MS: 80,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    playTone: async function (duration) {
        if (!this.isPlaying) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = 600;
        osc.connect(gain);

        gain.connect(this.ctx.destination);

        osc.start();

        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (duration / 1000));

        await this.wait(duration);
        osc.stop();
    },

    async playSequence(morseString, onComplete) {
        this.init();
        if (this.ctx.state === 'suspended') await this.ctx.resume();

        this.isPlaying = true;
        const symbols = morseString.split("");

        for (let char of symbols) {
            if (!this.isPlaying) break;

            if (char === ".") {
                await this.playTone(this.DOT_MS);
                await this.wait(this.DOT_MS); 
            }
            else if (char === "-") {
                await this.playTone(this.DOT_MS * 3);
                await this.wait(this.DOT_MS); 
            }
            else if (char === " " || char === "/") {
                await this.wait(this.DOT_MS * 3); 
            }
        }

        this.isPlaying = false;
        if (onComplete) onComplete();
    },

    stop() {
        this.isPlaying = false;
    }
};

const App = {
    els: {
        input: document.getElementById("input"),
        output: document.getElementById("output"),
        outputCard: document.getElementById("output-card"),
        btnTranslate: document.getElementById("btn-translate"),
        btnPlay: document.getElementById("btn-play"),
        btnStop: document.getElementById("btn-stop"),
        btnDict: document.getElementById("btn-toggle-dict"),
        dictGrid: document.getElementById("dict-grid"),
        dictPanel: document.getElementById("dictionary")
    },

    state: {
        currentMorse: ""
    },

    populateDictionary() {
        Object.entries(MorseLib.DICT).forEach(([char, code]) => {
            const div = document.createElement("div");
            div.className = "item";
            div.style.textAlign = "center";
            div.innerHTML = `<strong>${char}</strong><br><span style="color:var(--accent); font-size:12px">${code}</span>`;
            App.els.dictGrid.appendChild(div);
        });
    },

    handleTranslate() {
        const text = App.els.input.value;
        const result = MorseLib.encode(text);

        App.state.currentMorse = result;
        App.els.output.textContent = result || "... --- ...";
        App.els.btnPlay.disabled = !result;
    },

    handlePlay() {
        if (!App.state.currentMorse) return;

        App.els.outputCard.classList.add("playing");
        App.els.btnPlay.disabled = true;
        App.els.btnStop.disabled = false;

        AudioEngine.playSequence(App.state.currentMorse, () => {
            App.els.outputCard.classList.remove("playing");
            App.els.btnPlay.disabled = false;
            App.els.btnStop.disabled = true;
        });
    },

    handleStop() {
        AudioEngine.stop();
        App.els.outputCard.classList.remove("playing");
        App.els.btnPlay.disabled = false;
        App.els.btnStop.disabled = true;
    },

    init() {
        this.populateDictionary();
        this.els.btnTranslate.addEventListener("click", this.handleTranslate);
        this.els.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.handleTranslate();
            }
        });
        this.els.btnPlay.addEventListener("click", this.handlePlay);
        this.els.btnStop.addEventListener("click", this.handleStop);
        this.els.btnDict.addEventListener("click", () => {
            const isHidden = this.els.dictPanel.style.display === "none";
            this.els.dictPanel.style.display = isHidden ? "block" : "none";
            this.els.btnDict.textContent = isHidden ? "Hide Dictionary" : "Show Dictionary";
        });
    }
};

App.init();