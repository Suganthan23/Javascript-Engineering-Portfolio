const ClockApp = {
    timeEl: document.getElementById("clock-display"),
    dateEl: document.getElementById("clock-date"),
    toggleEl: document.getElementById("clock-toggle"),

    timeoutId: null,

    pad2: (n) => String(n).padStart(2, '0'),
    
    formatTime: (d, use12) => {
        let h = d.getHours();
        const m = ClockApp.pad2(d.getMinutes());
        const s = ClockApp.pad2(d.getSeconds());
        if (use12) {
            const ampm = h >= 12 ? ' PM' : ' AM';
            h = h % 12 || 12;
            return `${ClockApp.pad2(h)}:${m}:${s}<span style="font-size:0.5em">${ampm}</span>`;
        }
        return `${ClockApp.pad2(h)}:${m}:${s}`;
    },

    formatDate: (d) => {
        return d.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    },

    tick: () => {
        const now = new Date();
        ClockApp.timeEl.innerHTML = ClockApp.formatTime(now, ClockApp.toggleEl.checked);
        ClockApp.dateEl.textContent = ClockApp.formatDate(now);

        const ms = 1000 - now.getMilliseconds();
        ClockApp.timeoutId = setTimeout(ClockApp.tick, ms);
    },

    init: () => {
        ClockApp.toggleEl.addEventListener('change', () => {
            const now = new Date();
            ClockApp.timeEl.innerHTML = ClockApp.formatTime(now, ClockApp.toggleEl.checked);
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                clearTimeout(ClockApp.timeoutId);
                ClockApp.tick();
            }
        });

        ClockApp.tick();
    }
};

const TimerApp = {
    display: document.getElementById("timer-display"),
    input: document.getElementById("timer-input"),
    btnStart: document.getElementById("timer-start"),
    btnPause: document.getElementById("timer-pause"),
    btnReset: document.getElementById("timer-reset"),

    timerId: null,
    target: 0,
    remaining: 0,
    running: false,

    pad2: (n) => String(n).padStart(2, '0'),

    formatDuration: (sec) => {
        sec = Math.max(0, Math.floor(sec));
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return h > 0
            ? `${TimerApp.pad2(h)}:${TimerApp.pad2(m)}:${TimerApp.pad2(s)}`
            : `${TimerApp.pad2(m)}:${TimerApp.pad2(s)}`;
    },

    parseDuration: (text) => {
        const v = String(text).trim();
        if (!v) return null;
        if (/^\d+$/.test(v)) return Number(v);

        const parts = v.split(':').map(Number);
        if (parts.some(n => !Number.isFinite(n) || n < 0)) return null;

        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return null;
    },

    updateUi: () => {
        TimerApp.display.textContent = TimerApp.formatDuration(TimerApp.remaining);

        TimerApp.btnStart.disabled = TimerApp.running;
        TimerApp.btnPause.disabled = !TimerApp.running && TimerApp.remaining === 0;
        TimerApp.btnReset.disabled = TimerApp.remaining === 0 && !TimerApp.running;

        TimerApp.btnPause.textContent = TimerApp.running ? 'Pause' : 'Resume';

        if (TimerApp.running) TimerApp.display.classList.add('active');
        else TimerApp.display.classList.remove('active');
    },

    stop: () => {
        clearInterval(TimerApp.timerId);
        TimerApp.timerId = null;
        TimerApp.running = false;
        TimerApp.remaining = 0;
        TimerApp.updateUi();
    },

    tick: () => {
        const secs = Math.max(0, Math.ceil((TimerApp.target - Date.now()) / 1000));
        if (secs !== TimerApp.remaining) {
            TimerApp.remaining = secs;
            TimerApp.display.textContent = TimerApp.formatDuration(TimerApp.remaining);
        }
        if (TimerApp.remaining <= 0) {
            TimerApp.stop();
            alert('Time is up!');
        }
    },

    start: () => {
        if (TimerApp.running) return;

        if (TimerApp.remaining === 0) {
            const parsed = TimerApp.parseDuration(TimerApp.input.value);
            if (parsed === null || parsed <= 0) {
                alert("Please enter a valid duration (e.g. 10, 1:30)");
                return;
            }
            TimerApp.remaining = parsed;
        }

        TimerApp.target = Date.now() + TimerApp.remaining * 1000;
        TimerApp.running = true;
        TimerApp.updateUi();

        clearInterval(TimerApp.timerId);
        TimerApp.timerId = setInterval(TimerApp.tick, 200);
        TimerApp.tick();
    },

    pause: () => {
        if (!TimerApp.running) return;
        TimerApp.remaining = Math.max(0, Math.ceil((TimerApp.target - Date.now()) / 1000));
        TimerApp.running = false;
        clearInterval(TimerApp.timerId);
        TimerApp.updateUi();
    },

    resume: () => {
        if (TimerApp.running || TimerApp.remaining === 0) return;
        TimerApp.target = Date.now() + TimerApp.remaining * 1000;
        TimerApp.running = true;
        TimerApp.updateUi();
        clearInterval(TimerApp.timerId);
        TimerApp.timerId = setInterval(TimerApp.tick, 200);
    },

    reset: () => {
        clearInterval(TimerApp.timerId);
        TimerApp.timerId = null;
        TimerApp.remaining = 0;
        TimerApp.running = false;
        TimerApp.input.value = "";
        TimerApp.updateUi();
    },

    init: () => {
        TimerApp.btnStart.addEventListener('click', TimerApp.start);
        TimerApp.btnPause.addEventListener('click', () => TimerApp.running ? TimerApp.pause() : TimerApp.resume());
        TimerApp.btnReset.addEventListener('click', TimerApp.reset);

        TimerApp.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') TimerApp.start();
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && TimerApp.running) {
                TimerApp.remaining = Math.max(0, Math.ceil((TimerApp.target - Date.now()) / 1000));
                TimerApp.tick();
            }
        });

        TimerApp.updateUi();
    }
};

ClockApp.init();
TimerApp.init();