const NotesApp = {
  KEY: "notes-app-v1",
  state: {
    notes: [],
    activeId: null,
    debounceTimer: null
  },

  els: {
    list: document.getElementById("list"),
    q: document.getElementById("q"),
    title: document.getElementById("title"),
    body: document.getElementById("body"),
    meta: document.getElementById("meta"),
    count: document.getElementById("count"),
    add: document.getElementById("add"),
    del: document.getElementById("del"),
    pin: document.getElementById("pin")
  },

  Storage: {
    load() {
      try { return JSON.parse(localStorage.getItem(NotesApp.KEY)) ?? []; }
      catch { return []; }
    },
    save(notes) {
      localStorage.setItem(NotesApp.KEY, JSON.stringify(notes));
    }
  },

  uid: () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2),
  nowISO: () => new Date().toISOString(),

  escapeHtml: (str) => {
    return String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  },

  actions: {
    create() {
      const newNote = {
        id: NotesApp.uid(),
        title: "",
        body: "",
        pinned: false,
        updatedAt: NotesApp.nowISO()
      };
      NotesApp.state.notes.unshift(newNote);
      NotesApp.state.activeId = newNote.id;
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.all();
      NotesApp.els.title.focus();
    },

    delete() {
      if (!NotesApp.state.activeId) return;
      if (!confirm("Delete this note?")) return;

      NotesApp.state.notes = NotesApp.state.notes.filter(n => n.id !== NotesApp.state.activeId);
      NotesApp.state.activeId = NotesApp.state.notes[0]?.id ?? null;
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.all();
    },

    togglePin() {
      const n = NotesApp.state.notes.find(x => x.id === NotesApp.state.activeId);
      if (!n) return;
      n.pinned = !n.pinned;
      n.updatedAt = NotesApp.nowISO();
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.all();
    },

    updateFromInput() {
      const n = NotesApp.state.notes.find(x => x.id === NotesApp.state.activeId);
      if (!n) return;

      n.title = NotesApp.els.title.value;
      n.body = NotesApp.els.body.value;
      n.updatedAt = NotesApp.nowISO();

      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.list();
    }
  },

  render: {
    all() {
      this.list();
      this.editor();
    },

    getVisible() {
      const q = NotesApp.els.q.value.trim().toLowerCase();
      let arr = [...NotesApp.state.notes];

      arr.sort((a, b) => (b.pinned - a.pinned) || (b.updatedAt.localeCompare(a.updatedAt)));

      if (!q) return arr;
      return arr.filter(n =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q)
      );
    },

    list() {
      const visibleNotes = this.getVisible();
      NotesApp.els.count.textContent = `${NotesApp.state.notes.length} notes`;
      NotesApp.els.list.innerHTML = "";

      visibleNotes.forEach(n => {
        const li = document.createElement("li");
        li.dataset.id = n.id;
        li.className = (n.id === NotesApp.state.activeId) ? "active" : "";

        if (n.id === NotesApp.state.activeId) {
          li.style.borderColor = "color-mix(in srgb, var(--accent) 50%, transparent)";
          li.style.backgroundColor = "color-mix(in srgb, var(--accent) 5%, transparent)";
        }

        li.innerHTML = `
                    <div class="row" style="justify-content:space-between; pointer-events:none;">
                        <strong>${n.pinned ? "📌 " : ""}${NotesApp.escapeHtml(n.title || "Untitled Note")}</strong>
                        <span class="small">${new Date(n.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="small" style="margin-top:6px; pointer-events:none; opacity:0.8;">
                        ${NotesApp.escapeHtml((n.body || "").slice(0, 60))}...
                    </div>
                `;
        NotesApp.els.list.appendChild(li);
      });
    },

    editor() {
      const n = NotesApp.state.notes.find(x => x.id === NotesApp.state.activeId);
      const isDisabled = !n;

      NotesApp.els.title.disabled = isDisabled;
      NotesApp.els.body.disabled = isDisabled;
      NotesApp.els.title.value = n?.title ?? "";
      NotesApp.els.body.value = n?.body ?? "";

      if (n) {
        const dateStr = new Date(n.updatedAt).toLocaleString();
        NotesApp.els.meta.textContent = `Last updated: ${dateStr} • ${n.pinned ? "Pinned" : "Not pinned"}`;
        NotesApp.els.pin.textContent = n.pinned ? "Unpin" : "Pin";
      } else {
        NotesApp.els.meta.textContent = "Select or create a note to start writing.";
        NotesApp.els.pin.textContent = "Pin";
      }
    }
  },

  init() {
    this.state.notes = this.Storage.load();

    if (this.state.notes.length > 0) {
      this.state.activeId = this.state.notes[0].id;
    } else {
      this.actions.create();
    }

    this.els.add.addEventListener("click", this.actions.create);
    this.els.del.addEventListener("click", this.actions.delete);
    this.els.pin.addEventListener("click", this.actions.togglePin);
    this.els.q.addEventListener("input", () => this.render.list());

    const handleType = () => {
      clearTimeout(this.state.debounceTimer);
      this.state.debounceTimer = setTimeout(this.actions.updateFromInput, 300);
    };
    this.els.title.addEventListener("input", handleType);
    this.els.body.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.actions.create();
      }
    });
    this.els.list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (li && li.dataset.id) {
        this.state.activeId = li.dataset.id;
        this.render.all();
      }
    });

    this.render.all();
  }
};

NotesApp.init();