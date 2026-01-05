const ImageService = {
    BASE_URL: "https://picsum.photos/v2/list",

    async fetchImages(page = 1, limit = 12) {
        const response = await fetch(`${this.BASE_URL}?page=${page}&limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch");
        return response.json();
    }
};

const GalleryUI = {
    container: document.getElementById("gallery"),

    appendImages(images) {
        const fragment = document.createDocumentFragment();

        images.forEach(imgData => {
            const div = document.createElement("div");
            div.className = "img-card";

            div.innerHTML = `
                <img src="${imgData.download_url}" alt="${imgData.author}" loading="lazy" onload="this.classList.add('loaded')">
                <div class="overlay">
                    <strong>${imgData.author}</strong>
                </div>
            `;

            fragment.appendChild(div);
        });

        this.container.appendChild(fragment);
    }
};

const App = {
    state: {
        page: 1,
        isLoading: false,
        hasMore: true
    },

    sentinel: document.getElementById("sentinel"),

    async loadMore() {
        if (this.state.isLoading || !this.state.hasMore) return;

        this.state.isLoading = true;

        try {
            await new Promise(r => setTimeout(r, 800));

            const images = await ImageService.fetchImages(this.state.page);

            if (images.length === 0) {
                this.state.hasMore = false;
                this.sentinel.innerHTML = "No more images.";
                return;
            }

            GalleryUI.appendImages(images);
            this.state.page++;
        } catch (err) {
            console.error(err);
        } finally {
            this.state.isLoading = false;
        }
    },

    init() {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                this.loadMore();
            }
        }, {
            rootMargin: "100px" 
        });

        observer.observe(this.sentinel);
    }
};

App.init();