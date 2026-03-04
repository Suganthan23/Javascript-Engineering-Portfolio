const NotesApp = {
  KEY: "notes-app-v2",

  state: {
    notes: [],
    activeId: null,
    debounceTimer: null,
    draft: {
      title: "",
      body: ""
    }
  },

  els: {
    list: document.getElementById("list"),
    q: document.getElementById("q"),
    title: document.getElementById("title"),
    body: document.getElementById("body"),
    meta: document.getElementById("meta"),
    count: document.getElementById("count"),
    addHeader: document.getElementById("add"),
    addBelow: document.getElementById("add-below"),
    del: document.getElementById("del"),
    pin: document.getElementById("pin")
  },

  Storage: {
    load() {
      try {
        return JSON.parse(localStorage.getItem(NotesApp.KEY)) ?? [];
      } catch {
        return [];
      }
    },
    save(notes) {
      localStorage.setItem(NotesApp.KEY, JSON.stringify(notes));
    }
  },

  uid: () =>
    (crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).substr(2)),

  nowISO: () => new Date().toISOString(),

  escapeHtml: (str) =>
    String(str || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]),

  actions: {
    newDraft() {
      NotesApp.state.activeId = null;
      NotesApp.state.draft = { title: "", body: "" };
      NotesApp.els.title.value = "";
      NotesApp.els.body.value = "";
      NotesApp.render.editor();
      NotesApp.render.list();
      NotesApp.els.title.focus();
    },

    addNoteFromDraft() {
      const title = NotesApp.els.title.value.trim();
      const body = NotesApp.els.body.value.trim();

      if (!title && !body) return;

      if (NotesApp.state.activeId) {
        const n = NotesApp.state.notes.find(
          (x) => x.id === NotesApp.state.activeId
        );
        if (!n) return;

        n.title = title;
        n.body = body;
        n.updatedAt = NotesApp.nowISO();
        NotesApp.Storage.save(NotesApp.state.notes);
        NotesApp.render.all();
        return;
      }

      const newNote = {
        id: NotesApp.uid(),
        title,
        body,
        pinned: false,
        updatedAt: NotesApp.nowISO()
      };

      NotesApp.state.notes.unshift(newNote);
      NotesApp.state.activeId = newNote.id;
      NotesApp.state.draft = { title: "", body: "" };
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.all();
    },

    delete() {
      if (!NotesApp.state.activeId) return;
      if (!confirm("Delete this note?")) return;

      NotesApp.state.notes = NotesApp.state.notes.filter(
        (n) => n.id !== NotesApp.state.activeId
      );

      NotesApp.state.activeId = null;
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.actions.newDraft();
    },

    togglePin() {
      const n = NotesApp.state.notes.find(
        (x) => x.id === NotesApp.state.activeId
      );
      if (!n) return;

      n.pinned = !n.pinned;
      n.updatedAt = NotesApp.nowISO();
      NotesApp.Storage.save(NotesApp.state.notes);
      NotesApp.render.all();
    },

    updateFromInput() {
      const titleVal = NotesApp.els.title.value;
      const bodyVal = NotesApp.els.body.value;

      if (NotesApp.state.activeId) {
        const n = NotesApp.state.notes.find(
          (x) => x.id === NotesApp.state.activeId
        );
        if (!n) return;

        n.title = titleVal;
        n.body = bodyVal;
        n.updatedAt = NotesApp.nowISO();

        NotesApp.Storage.save(NotesApp.state.notes);
        NotesApp.render.list();
        NotesApp.render.editorMeta();
      } else {
        NotesApp.state.draft.title = titleVal;
        NotesApp.state.draft.body = bodyVal;
        NotesApp.render.editorMeta();
      }
    }
  },

  render: {
    all() {
      this.list();
      this.editor();
    },

    getVisible() {
      const q = NotesApp.els.q.value.trim().toLowerCase();
      const arr = [...NotesApp.state.notes];

      arr.sort(
        (a, b) => (b.pinned - a.pinned) || b.updatedAt.localeCompare(a.updatedAt)
      );

      if (!q) return arr;

      return arr.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.body || "").toLowerCase().includes(q)
      );
    },

    list() {
      const visibleNotes = this.getVisible();
      const total = NotesApp.state.notes.length;

      NotesApp.els.count.textContent = `${total} ${total === 1 ? "note" : "notes"}`;
      NotesApp.els.list.innerHTML = "";

      visibleNotes.forEach((n) => {
        const li = document.createElement("li");
        li.dataset.id = n.id;

        if (n.id === NotesApp.state.activeId) {
          li.classList.add("active");
        }

        li.innerHTML = `
          <div class="row" style="justify-content:space-between; pointer-events:none;">
            <strong>${n.pinned ? "📌 " : ""}${NotesApp.escapeHtml(
          n.title || "Untitled Note"
        )}</strong>
            <span class="small">${new Date(
          n.updatedAt
        ).toLocaleDateString()}</span>
          </div>
          <div class="small" style="margin-top:6px; pointer-events:none; opacity:0.8;">
            ${NotesApp.escapeHtml((n.body || "").slice(0, 60))}...
          </div>
        `;

        NotesApp.els.list.appendChild(li);
      });
    },

    editor() {
      const n = NotesApp.state.notes.find(
        (x) => x.id === NotesApp.state.activeId
      );

      if (n) {
        NotesApp.els.title.disabled = false;
        NotesApp.els.body.disabled = false;
        NotesApp.els.title.value = n.title || "";
        NotesApp.els.body.value = n.body || "";
      } else {
        NotesApp.els.title.disabled = false;
        NotesApp.els.body.disabled = false;
        NotesApp.els.title.value = NotesApp.state.draft.title;
        NotesApp.els.body.value = NotesApp.state.draft.body;
      }

      this.editorMeta();
    },

    editorMeta() {
      const n = NotesApp.state.notes.find(
        (x) => x.id === NotesApp.state.activeId
      );

      if (n) {
        const dateStr = new Date(n.updatedAt).toLocaleString();
        NotesApp.els.meta.textContent = `Last updated: ${dateStr} • ${n.pinned ? "Pinned" : "Not pinned"}`;
        NotesApp.els.pin.textContent = n.pinned ? "Unpin" : "Pin";
      } else {
        if (
          NotesApp.state.draft.title.trim() ||
          NotesApp.state.draft.body.trim()
        ) {
          NotesApp.els.meta.textContent = "Draft (not yet saved).";
        } else {
          NotesApp.els.meta.textContent =
            "Start typing and click ADD NOTE to save.";
        }
        NotesApp.els.pin.textContent = "Pin";
      }
    }
  },

  init() {
    this.state.notes = this.Storage.load();
    this.state.activeId = null;

    this.els.addHeader.addEventListener("click", () => this.actions.newDraft());
    this.els.addBelow.addEventListener("click", () =>
      this.actions.addNoteFromDraft()
    );
    this.els.del.addEventListener("click", () => this.actions.delete());
    this.els.pin.addEventListener("click", () => this.actions.togglePin());
    this.els.q.addEventListener("input", () => this.render.list());

    const debouncedUpdate = () => {
      clearTimeout(this.state.debounceTimer);
      this.state.debounceTimer = setTimeout(
        () => this.actions.updateFromInput(),
        250
      );
    };

    this.els.title.addEventListener("input", debouncedUpdate);
    this.els.body.addEventListener("input", debouncedUpdate);

    this.els.body.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.actions.addNoteFromDraft();
      }
    });

    this.els.list.addEventListener("click", (e) => {
      e.stopPropagation();
      const li = e.target.closest("li");
      if (!li || !li.dataset.id) return;

      this.state.activeId = li.dataset.id;
      this.render.all();
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("#list")) return;
      if (e.target.closest("button, input, textarea, #add, #add-below, #del, #pin, #q")) return;
      if (this.state.activeId !== null) {
        this.state.activeId = null;
        this.state.draft = { title: "", body: "" };
        this.els.title.value = "";
        this.els.body.value = "";
        this.render.all();
      }
    });

    this.render.all();
  }
};

NotesApp.init();