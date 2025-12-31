const ExpenseTracker = {
    KEY: "expense-tracker-v1",
    state: {
        transactions: [],
        filter: ""
    },

    els: {
        balance: document.getElementById("balance"),
        income: document.getElementById("income"),
        expense: document.getElementById("expense"),
        rows: document.getElementById("rows"),
        addBtn: document.getElementById("add"),
        type: document.getElementById("type"),
        amount: document.getElementById("amount"),
        cat: document.getElementById("cat"),
        date: document.getElementById("date"),
        note: document.getElementById("note"),
        filter: document.getElementById("filter"),
        exportBtn: document.getElementById("export"),
        importInput: document.getElementById("import"),
        canvas: document.getElementById("chart")
    },

    uid: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

    fmtMoney: (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(num);
    },

    load() {
        try {
            this.state.transactions = JSON.parse(localStorage.getItem(this.KEY)) || [];
        } catch { this.state.transactions = []; }
    },

    save() {
        localStorage.setItem(this.KEY, JSON.stringify(this.state.transactions));
        this.render();
    },

    add() {
        const amt = parseFloat(this.els.amount.value);
        if (isNaN(amt) || amt <= 0) return alert("Please enter a valid amount");
        if (!this.els.date.value) return alert("Please select a date");

        const tx = {
            id: this.uid(),
            type: this.els.type.value,
            amount: amt,
            category: this.els.cat.value || "Uncategorized",
            date: this.els.date.value,
            note: this.els.note.value
        };

        this.state.transactions.unshift(tx);
        this.save();
        this.resetForm();
    },

    delete(id) {
        if (!confirm("Delete transaction?")) return;
        this.state.transactions = this.state.transactions.filter(t => t.id !== id);
        this.save();
    },

    resetForm() {
        this.els.amount.value = "";
        this.els.note.value = "";
        this.els.cat.value = "";
        this.els.amount.focus();
    },

    render() {
        const { transactions, filter } = this.state;

        const filtered = transactions.filter(t =>
            t.category.toLowerCase().includes(filter) ||
            t.note.toLowerCase().includes(filter)
        );

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        this.els.income.textContent = this.fmtMoney(totalIncome);
        this.els.income.style.color = "var(--good)";
        this.els.expense.textContent = this.fmtMoney(totalExpense);
        this.els.expense.style.color = "var(--bad)";

        const bal = totalIncome - totalExpense;
        this.els.balance.textContent = this.fmtMoney(bal);

        this.els.rows.innerHTML = filtered.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>
                    <span class="badge" style="color:${t.type === 'income' ? 'var(--good)' : 'var(--bad)'}">
                        ${t.type}
                    </span>
                </td>
                <td>${t.category}<br><span class="small">${t.note}</span></td>
                <td style="font-weight:bold;">${this.fmtMoney(t.amount)}</td>
                <td>
                    <button class="btn small danger" onclick="ExpenseTracker.delete('${t.id}')">×</button>
                </td>
            </tr>
        `).join("");

        this.drawChart(totalIncome, totalExpense);
    },

    drawChart(inc, exp) {
        const ctx = this.els.canvas.getContext('2d');
        const width = this.els.canvas.width = this.els.canvas.offsetWidth;
        const height = this.els.canvas.height = 150;

        ctx.clearRect(0, 0, width, height);

        const isDark = getComputedStyle(document.body).getPropertyValue('--text').trim() === '#e8eefc';
        const textColor = isDark ? "#e2e8f0" : "#0f172a";

        const max = Math.max(inc, exp, 1);
        const barHeight = 40;
        const padding = 20;

        const incWidth = (inc / max) * (width - 100);
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(0, padding, incWidth, barHeight);
        
        ctx.fillStyle = textColor;
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("Income", 0, padding - 5);
        ctx.fillText(this.fmtMoney(inc), incWidth + 10, padding + 25);

        const expWidth = (exp / max) * (width - 100);
        ctx.fillStyle = "#ef4444"; 
        ctx.fillRect(0, padding + barHeight + 30, expWidth, barHeight);

        ctx.fillStyle = textColor;
        ctx.fillText("Expense", 0, padding + barHeight + 25);
        ctx.fillText(this.fmtMoney(exp), expWidth + 10, padding + barHeight + 55);
    },

    exportData() {
        const dataStr = JSON.stringify(this.state.transactions, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    },

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    this.state.transactions = data;
                    this.save();
                    alert("Import successful!");
                } else {
                    alert("Invalid file format");
                }
            } catch {
                alert("Error reading file");
            }
        };
        reader.readAsText(file);
    },

    init() {
        this.load();
        this.els.date.valueAsDate = new Date();
        this.els.addBtn.addEventListener("click", () => this.add());
        this.els.filter.addEventListener("input", (e) => {
            this.state.filter = e.target.value.toLowerCase();
            this.render();
        });
        this.els.exportBtn.addEventListener("click", () => this.exportData());
        this.els.importInput.addEventListener("change", (e) => this.importData(e));
        this.render();
    }
};

ExpenseTracker.init();