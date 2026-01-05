const GithubAPI = {
    BASE_URL: "https://api.github.com/users",

    async getUser(username) {
        const response = await fetch(`${this.BASE_URL}/${username}`);

        if (response.status === 404) throw new Error("User not found");
        if (!response.ok) throw new Error("Network error");

        return response.json();
    },

    async getRepos(username) {
        const response = await fetch(`${this.BASE_URL}/${username}/repos?sort=updated&per_page=10`);

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

    showLoader() {
        this.els.loader.style.display = "block";
        this.els.profile.style.display = "none";
        this.els.error.style.display = "none";
    },

    showProfile(user) {
        this.els.loader.style.display = "none";
        this.els.profile.style.display = "block";

        this.els.avatar.src = user.avatar_url;
        this.els.name.textContent = user.name || user.login;
        this.els.bio.textContent = user.bio || "No bio available";
        this.els.reposCount.textContent = user.public_repos;
        this.els.followers.textContent = user.followers;
        this.els.following.textContent = user.following;
        this.els.link.href = user.html_url;
    },

    showRepos(repos) {
        this.els.repoList.innerHTML = repos.map(repo => `
            <div class="repo-card">
                <a href="${repo.html_url}" target="_blank" style="text-decoration:none; color:inherit;">
                    <strong style="color:var(--accent); font-size:16px;">${repo.name}</strong>
                    <p style="font-size:13px; color:var(--muted); margin: 6px 0;">${repo.description || "No description"}</p>
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:10px;">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                        <span>${repo.language || "Plain"}</span>
                    </div>
                </a>
            </div>
        `).join("");
    },

    showError(msg) {
        this.els.loader.style.display = "none";
        this.els.profile.style.display = "none";
        this.els.error.style.display = "block";
        this.els.error.innerHTML = `<h3 style="margin:0;">${msg}</h3>`;
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
                UI.els.profile.style.display = "none";
                UI.els.error.style.display = "none";
                return;
            }

            this.timeout = setTimeout(() => {
                this.performSearch(query);
            }, 600);
        });
    }
};

App.init();