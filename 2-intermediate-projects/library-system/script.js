class Book {
    constructor(title, author, copies, isbn) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.author = author;
        this.isbn = isbn || "N/A";
        this.total = parseInt(copies);
        this.borrowed = 0; 
    }
}

class Member {
    constructor(name, email) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.email = email || "N/A";
        this.joined = new Date().toISOString();
    }
}

class Loan {
    constructor(bookId, memberId) {
        this.id = crypto.randomUUID();
        this.bookId = bookId;
        this.memberId = memberId;
        this.date = new Date().toISOString();
        this.active = true;
    }
}

const Library = {
    KEY: "library-system-v1",
    data: {
        books: [],
        members: [],
        loans: []
    },

    load() {
        const stored = localStorage.getItem(this.KEY);
        if (stored) {
            this.data = JSON.parse(stored);
        }
    },

    save() {
        localStorage.setItem(this.KEY, JSON.stringify(this.data));
        UI.renderAll();
    },

    addBook(title, author, isbn, copies) {
        const book = new Book(title, author, copies, isbn);
        this.data.books.unshift(book);
        this.save();
    },

    removeBook(id) {
        const hasActiveLoan = this.data.loans.some(l => l.bookId === id && l.active);
        if (hasActiveLoan) return alert("Cannot delete: This book is currently borrowed.");

        if (!confirm("Delete this book?")) return;
        this.data.books = this.data.books.filter(b => b.id !== id);
        this.save();
    },

    addMember(name, email) {
        const member = new Member(name, email);
        this.data.members.unshift(member);
        this.save();
    },

    removeMember(id) {
        const hasActiveLoan = this.data.loans.some(l => l.memberId === id && l.active);
        if (hasActiveLoan) return alert("Cannot delete: Member has unreturned books.");

        if (!confirm("Delete this member?")) return;
        this.data.members = this.data.members.filter(m => m.id !== id);
        this.save();
    },

    borrowBook(bookId, memberId) {
        const book = this.data.books.find(b => b.id === bookId);

        if (!book) return alert("Book not found");
        if ((book.total - book.borrowed) <= 0) return alert("No copies available");

        book.borrowed++;
        const loan = new Loan(bookId, memberId);
        this.data.loans.unshift(loan);
        this.save();
    },

    returnBook(loanId) {
        const loan = this.data.loans.find(l => l.id === loanId);
        if (!loan || !loan.active) return;

        const book = this.data.books.find(b => b.id === loan.bookId);
        if (book) book.borrowed--;

        this.data.loans = this.data.loans.filter(l => l.id !== loanId);
        this.save();
    }
};

const UI = {
    els: {
        tabs: document.querySelectorAll('[data-tab]'),
        contents: {
            books: document.getElementById('books'),
            members: document.getElementById('members'),
            loans: document.getElementById('loans')
        },
        bookRows: document.getElementById('bookRows'),
        memberRows: document.getElementById('memberRows'),
        loanRows: document.getElementById('loanRows'),
        loanBookSelect: document.getElementById('loanBook'),
        loanMemberSelect: document.getElementById('loanMember')
    },

    init() {
        Library.load();

        this.els.tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                this.els.tabs.forEach(b => b.classList.remove('primary'));
                Object.values(this.els.contents).forEach(div => div.style.display = 'none');

                btn.classList.add('primary');
                const target = btn.dataset.tab;
                this.els.contents[target].style.display = 'block';

                if (target === 'loans') this.populateDropdowns();
            });
        });

        this.setupBooks();
        this.setupMembers();
        this.setupLoans();

        this.renderAll();
    },

    setupBooks() {
        document.getElementById('addBook').addEventListener('click', () => {
            const title = document.getElementById('bTitle').value;
            const author = document.getElementById('bAuthor').value;
            const isbn = document.getElementById('bIsbn').value;
            const copies = document.getElementById('bCopies').value;

            if (!title || !author || !copies) return alert("Title, Author and Copies are required");

            Library.addBook(title, author, isbn, copies);

            // Clear inputs
            document.getElementById('bTitle').value = "";
            document.getElementById('bAuthor').value = "";
            document.getElementById('bIsbn').value = "";
            document.getElementById('bCopies').value = "";
        });
    },

    setupMembers() {
        document.getElementById('addMember').addEventListener('click', () => {
            const name = document.getElementById('mName').value;
            const email = document.getElementById('mEmail').value;

            if (!name) return alert("Name is required");

            Library.addMember(name, email);
            document.getElementById('mName').value = "";
            document.getElementById('mEmail').value = "";
        });
    },

    setupLoans() {
        document.getElementById('borrow').addEventListener('click', () => {
            const bookId = this.els.loanBookSelect.value;
            const memberId = this.els.loanMemberSelect.value;

            if (!bookId || !memberId) return alert("Select a book and a member");

            Library.borrowBook(bookId, memberId);
            this.populateDropdowns(); 
        });
    },

    populateDropdowns() {
        // Fill Book Select
        this.els.loanBookSelect.innerHTML = '<option value="">-- Select Book --</option>';
        Library.data.books.forEach(b => {
            const avail = b.total - b.borrowed;
            if (avail > 0) {
                const opt = document.createElement('option');
                opt.value = b.id;
                opt.textContent = `${b.title} (${avail} left)`;
                this.els.loanBookSelect.appendChild(opt);
            }
        });

        this.els.loanMemberSelect.innerHTML = '<option value="">-- Select Member --</option>';
        Library.data.members.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            this.els.loanMemberSelect.appendChild(opt);
        });
    },

    renderAll() {
        this.renderBooks();
        this.renderMembers();
        this.renderLoans();
    },

    renderBooks() {
        this.els.bookRows.innerHTML = Library.data.books.map(b => `
            <tr>
                <td><strong>${b.title}</strong><br><span class="small">${b.isbn}</span></td>
                <td>${b.author}</td>
                <td>
                    <span class="badge" style="color:${(b.total - b.borrowed) > 0 ? 'var(--good)' : 'var(--bad)'}">
                        ${b.total - b.borrowed} / ${b.total}
                    </span>
                </td>
                <td>
                    <button class="btn small danger" onclick="Library.removeBook('${b.id}')">×</button>
                </td>
            </tr>
        `).join("");
    },

    renderMembers() {
        this.els.memberRows.innerHTML = Library.data.members.map(m => `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.email}</td>
                <td>
                    <button class="btn small danger" onclick="Library.removeMember('${m.id}')">×</button>
                </td>
            </tr>
        `).join("");
    },

    renderLoans() {
        this.els.loanRows.innerHTML = Library.data.loans.map(l => {
            const book = Library.data.books.find(b => b.id === l.bookId) || { title: "Unknown Book" };
            const member = Library.data.members.find(m => m.id === l.memberId) || { name: "Unknown Member" };

            return `
            <tr>
                <td>${book.title}</td>
                <td>${member.name}</td>
                <td>${new Date(l.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn small primary" onclick="Library.returnBook('${l.id}')">Return</button>
                </td>
            </tr>
            `;
        }).join("");
    }
};

UI.init();