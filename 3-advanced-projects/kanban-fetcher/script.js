const TaskManager = {
    KEY: "kanban-v1",
    tasks: [],

    load() {
        const stored = localStorage.getItem(this.KEY);
        this.tasks = stored ? JSON.parse(stored) : [
            { id: "t1", content: "Learn JavaScript", status: "todo" },
            { id: "t2", content: "Build Kanban Board", status: "doing" },
            { id: "t3", content: "Master CSS Grid", status: "done" }
        ];
    },

    save() {
        localStorage.setItem(this.KEY, JSON.stringify(this.tasks));
        UIManager.render();
    },

    add(content) {
        const newTask = {
            id: Date.now().toString(),
            content: content,
            status: "todo" 
        };
        this.tasks.push(newTask);
        this.save();
    },

    delete(id) {
        if (!confirm("Delete this task?")) return;
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
    },

    updateStatus(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            this.save();
        }
    },

    updateContent(id, newContent) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.content = newContent;
            this.save(); 
        }
    }
};

const DragManager = {
    draggedId: null,

    init() {
        document.addEventListener("dragstart", (e) => {
            if (e.target.classList.contains("task")) {
                this.draggedId = e.target.dataset.id;
                e.target.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
            }
        });

        document.addEventListener("dragend", (e) => {
            if (e.target.classList.contains("task")) {
                e.target.classList.remove("dragging");
                document.querySelectorAll(".task-list").forEach(el => el.classList.remove("drag-over"));
                this.draggedId = null;
            }
        });

        const columns = document.querySelectorAll(".task-list");

        columns.forEach(col => {
            col.addEventListener("dragover", (e) => {
                e.preventDefault(); 
                col.classList.add("drag-over");
            });

            col.addEventListener("dragleave", () => {
                col.classList.remove("drag-over");
            });

            col.addEventListener("drop", (e) => {
                e.preventDefault();
                col.classList.remove("drag-over");

                if (this.draggedId) {
                    const newStatus = col.dataset.status;
                    TaskManager.updateStatus(this.draggedId, newStatus);
                }
            });
        });
    }
};

const UIManager = {
    cols: {
        todo: document.getElementById("todo"),
        doing: document.getElementById("doing"),
        done: document.getElementById("done")
    },
    counts: {
        todo: document.getElementById("count-todo"),
        doing: document.getElementById("count-doing"),
        done: document.getElementById("count-done")
    },

    render() {
        Object.values(this.cols).forEach(col => col.innerHTML = "");

        TaskManager.tasks.forEach(task => {
            const card = document.createElement("div");
            card.className = "task";
            card.draggable = true;
            card.dataset.id = task.id;

            card.innerHTML = `
                <div contenteditable="true" class="editable" onblur="UIManager.handleEdit(this, '${task.id}')">
                    ${task.content}
                </div>
                <button class="btn small danger" style="margin-top:8px; padding: 2px 6px; font-size:10px;" onclick="TaskManager.delete('${task.id}')">
                    Delete
                </button>
            `;

            this.cols[task.status].appendChild(card);
        });

        this.updateCounts();
    },

    updateCounts() {
        this.counts.todo.textContent = TaskManager.tasks.filter(t => t.status === "todo").length;
        this.counts.doing.textContent = TaskManager.tasks.filter(t => t.status === "doing").length;
        this.counts.done.textContent = TaskManager.tasks.filter(t => t.status === "done").length;
    },

    handleEdit(el, id) {
        const newText = el.innerText.trim();
        if (newText) {
            TaskManager.updateContent(id, newText);
        } else {
            UIManager.render();
        }
    },

    init() {
        TaskManager.load();
        DragManager.init();
        this.render();

        document.getElementById("add-btn").addEventListener("click", () => {
            const text = prompt("Enter task details:");
            if (text) TaskManager.add(text);
        });
    }
};

UIManager.init();