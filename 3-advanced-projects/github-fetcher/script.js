const GithubAPI = {
    BASE_URL: "https://api.github.com/users",

    async getUser(username) {
        const response = await fetch(`${this.BASE_URL}/${encodeURIComponent(username)}`);

        if (response.status === 404) throw new Error("User not found");
        if (!response.ok) throw new Error("Network error");

        return response.json();
    },

    async getRepos(username) {
        const response = await fetch(
            `${this.BASE_URL}/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`
        );

        if (!response.ok) throw new Error("Could not fetch repos");

        return response.json();
    }
};

const UI = {
    els: {
        search: document.getElementById("search"),
        profile: document.getElementById("profile"),
        loader: document.getElementById("loader"),
        error: document.getElementById("error"),
        avatar: document.getElementById("u-avatar"),
        name: document.getElementById("u-name"),
        bio: document.getElementById("u-bio"),
        reposCount: document.getElementById("u-repos"),
        followers: document.getElementById("u-followers"),
        following: document.getElementById("u-following"),
        link: document.getElementById("u-link"),
        repoList: document.getElementById("repos")
    },

    escape(str) {
        return String(str || "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    },

    showLoader() {
        this.els.loader.style.display = "block";
        this.els.profile.style.display = "none";
        this.els.error.style.display = "none";
    },

    resetView() {
        this.els.profile.style.display = "none";
        this.els.error.style.display = "none";
        this.els.loader.style.display = "none";
        this.els.repoList.innerHTML = "";
    },

    showProfile(user) {
        this.els.loader.style.display = "none";
        this.els.profile.style.display = "block";
        this.els.error.style.display = "none";

        this.els.avatar.src = user.avatar_url;
        this.els.avatar.alt = `${user.login} avatar`;
        this.els.name.textContent = user.name || user.login;
        this.els.bio.textContent = user.bio || "No bio available";
        this.els.reposCount.textContent = user.public_repos;
        this.els.followers.textContent = user.followers;
        this.els.following.textContent = user.following;
        this.els.link.href = user.html_url;
    },

    showRepos(repos) {
        if (!Array.isArray(repos) || repos.length === 0) {
            this.els.repoList.innerHTML = `<p class="small">No public repositories found.</p>`;
            return;
        }

        this.els.repoList.innerHTML = repos
            .map((repo) => {
                const name = this.escape(repo.name);
                const desc = repo.description ? this.escape(repo.description) : "No description";
                const language = repo.language || "Plain";
                const updated = new Date(repo.updated_at).toLocaleDateString();

                return `
          <article class="repo-card">
            <a href="${repo.html_url}" target="_blank" rel="noopener"
               style="text-decoration:none; color:inherit;">
              <strong style="font-size:16px;">${name}</strong>
              <p class="small" style="margin:6px 0 8px;">${desc}</p>
              <div class="repo-meta">
                <span>★ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
                <span>${language}</span>
                <span>Updated: ${updated}</span>
              </div>
            </a>
          </article>
        `;
            })
            .join("");
    },

    showError(msg) {
        this.els.loader.style.display = "none";
        this.els.profile.style.display = "none";
        this.els.error.style.display = "block";
        this.els.error.innerHTML = `<h3 style="margin:0;">${this.escape(msg)}</h3>`;
    }
};

const App = {
    timeout: null,

    async performSearch(query) {
        if (!query) return;

        UI.showLoader();

        try {
            const [user, repos] = await Promise.all([
                GithubAPI.getUser(query),
                GithubAPI.getRepos(query)
            ]);

            UI.showProfile(user);
            UI.showRepos(repos);
        } catch (err) {
            UI.showError(err.message);
        }
    },

    init() {
        UI.els.search.addEventListener("input", (e) => {
            const query = e.target.value.trim();

            clearTimeout(this.timeout);

            if (!query) {
                UI.resetView();
                return;
            }

            this.timeout = setTimeout(() => {
                this.performSearch(query);
            }, 600);
        });
    }
};

App.init();