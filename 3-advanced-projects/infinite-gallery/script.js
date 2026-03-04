const ImageService = {
    BASE_URL: "https://api.unsplash.com",
    ACCESS_KEY: "B9p0jIydkwNO3dNO6Fmn1XxbScDQBuqpwtryWuE1GOc",
    QUERY: "nature", 

    async fetchImages(page = 1, perPage = 12) {
        const url =
            `${this.BASE_URL}/search/photos` +
            `?page=${page}&per_page=${perPage}` +
            `&query=${encodeURIComponent(this.QUERY)}` +
            `&orientation=portrait` +
            `&client_id=${this.ACCESS_KEY}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        return data.results || [];
    }
};

const GalleryUI = {
    container: document.getElementById("gallery"),
    sentinel: document.getElementById("sentinel"),

    escape(str) {
        return String(str || "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c]));
    },

    appendImages(images) {
        const fragment = document.createDocumentFragment();

        images.forEach((photo) => {
            const card = document.createElement("div");
            card.className = "img-card";

            const img = document.createElement("img");
            img.src = photo.urls.small || photo.urls.regular;
            img.alt = this.escape(photo.alt_description || photo.user?.name || "Unsplash image");
            img.loading = "lazy";
            img.addEventListener("load", () => img.classList.add("loaded"));

            const overlay = document.createElement("div");
            overlay.className = "overlay";
            overlay.innerHTML = `<strong>${this.escape(photo.user?.name || "Unknown")}</strong>`;

            card.appendChild(img);
            card.appendChild(overlay);
            fragment.appendChild(card);
        });

        this.container.appendChild(fragment);
    },

    showEndMessage() {
        this.sentinel.textContent = "No more images.";
    },

    showError(msg) {
        this.sentinel.textContent = msg || "Error loading images.";
    }
};

const App = {
    state: {
        page: 1,
        isLoading: false,
        hasMore: true,
        seenIds: new Set()
    },

    get sentinel() {
        return GalleryUI.sentinel;
    },

    async loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;

        this.state.isLoading = true;

        try {
            await new Promise((r) => setTimeout(r, 400));

            const images = await ImageService.fetchImages(this.state.page);

            const fresh = images.filter((img) => {
                if (!img.id || this.state.seenIds.has(img.id)) return false;
                this.state.seenIds.add(img.id);
                return true;
            });

            if (!fresh.length) {
                this.state.hasMore = false;
                GalleryUI.showEndMessage();
                return;
            }

            GalleryUI.appendImages(fresh);
            this.state.page++;
        } catch (err) {
            console.error(err);
            this.state.hasMore = false;
            GalleryUI.showError("Failed to load images.");
        } finally {
            this.state.isLoading = false;
        }
    },

    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    this.loadMore();
                }
            },
            {
                rootMargin: "100px"
            }
        );

        observer.observe(this.sentinel);

        this.loadMore();
    }
};

App.init();