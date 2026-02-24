class AppHeader extends HTMLElement {
    async connectedCallback() {
        try {
            const response = await fetch("components/header.html");
            if (response.ok) {
                this.innerHTML = await response.text();
                this.initLogic();
            } else {
                console.error("Failed to load header component");
            }
        } catch (error) {
            console.error("Error loading header component:", error);
        }
    }

    initLogic() {
        const hamburger = this.querySelector("#hamburger");
        const navLinks = this.querySelector("#navLinks");

        if (hamburger && navLinks) {
            hamburger.addEventListener("click", () => {
                navLinks.classList.toggle("active");
            });

            const menuLinks = navLinks.querySelectorAll("a");
            menuLinks.forEach((link) => {
                link.addEventListener("click", () => {
                    navLinks.classList.remove("active");
                });
            });
        }
    }
}

class AppSidebars extends HTMLElement {
    async connectedCallback() {
        try {
            const response = await fetch("components/sidebars.html");
            if (response.ok) {
                this.innerHTML = await response.text();
                this.initLogic();
            } else {
                console.error("Failed to load sidebars component");
            }
        } catch (error) {
            console.error("Error loading sidebars component:", error);
        }
    }

    initLogic() {
        const overlay = this.querySelector("#sidebarOverlay");
        const sidebars = this.querySelectorAll(".sidebar");
        const closeButtons = this.querySelectorAll(".sidebar-close");

        // Event delegation for sidebar triggers (which might be in the header or main content)
        // We attach to document.body to catch clicks anywhere
        document.body.addEventListener("click", (e) => {
            if (e.target.matches(".sidebar-trigger")) {
                e.preventDefault();
                const id = e.target.dataset.sidebar;
                const sidebar = this.querySelector("#sidebar-" + id);
                if (sidebar) {
                    sidebar.classList.add("active");
                    if (overlay) overlay.classList.add("active");
                }
            }
        });

        // Close functions
        const closeSidebars = () => {
            sidebars.forEach((s) => s.classList.remove("active"));
            if (overlay) overlay.classList.remove("active");
        };

        if (overlay) overlay.addEventListener("click", closeSidebars);
        closeButtons.forEach((b) => b.addEventListener("click", closeSidebars));

        // Keyboard close
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSidebars();
        });

        // Carousel Logic
        let index = 0;
        const carousel = this.querySelector(".carousel");
        if (carousel) {
            const imgs = carousel.querySelectorAll("img");
            const nextBtn = this.querySelector(".next");
            const prevBtn = this.querySelector(".prev");

            const updateCarousel = () => {
                carousel.style.transform = `translateX(-${index * 100}%)`;
            };

            if (nextBtn) {
                nextBtn.onclick = () => {
                    index = (index + 1) % imgs.length;
                    updateCarousel();
                };
            }

            if (prevBtn) {
                prevBtn.onclick = () => {
                    index = (index - 1 + imgs.length) % imgs.length;
                    updateCarousel();
                };
            }
        }
    }
}

customElements.define("app-header", AppHeader);
customElements.define("app-sidebars", AppSidebars);

/* LIGHTBOX LOGIC */
document.addEventListener("DOMContentLoaded", () => {
    initLightbox();
});

function initLightbox() {
    // Add Lightbox Elements
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className = "lightbox";
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-btn lightbox-prev">&#10094;</button>
        <img class="lightbox-content" id="lightbox-img" alt="Fullscreen Image">
        <button class="lightbox-btn lightbox-next">&#10095;</button>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector("#lightbox-img");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");

    let currentGallery = [];
    let currentIndex = 0;

    // Select Images via Event Delegation to support dynamically loaded components
    const selectors = ".carousel img, .about-img, .contact-img, .gallery-img";

    const updateLightboxImage = () => {
        if (currentGallery.length > 0) {
            lightboxImg.src = currentGallery[currentIndex].src;
            // Hide arrows if only one image in gallery
            prevBtn.style.display =
                currentGallery.length > 1 ? "block" : "none";
            nextBtn.style.display =
                currentGallery.length > 1 ? "block" : "none";
        }
    };

    document.body.addEventListener("click", (e) => {
        if (e.target.matches(selectors)) {
            // Group images by their closest container
            const parent =
                e.target.closest(
                    ".carousel, .about-images, .contact-images, .gallery",
                ) || e.target.parentElement;
            currentGallery = Array.from(parent.querySelectorAll("img")).filter(
                (img) => img.matches(selectors),
            );

            if (currentGallery.length === 0) {
                currentGallery = [e.target];
            }

            currentIndex = currentGallery.indexOf(e.target);
            if (currentIndex === -1) currentIndex = 0;

            updateLightboxImage();

            lightbox.classList.add("active");
            lightbox.style.display = "flex"; // Ensure flex is set for centering
            // Small timeout to allow transition
            setTimeout(() => {
                lightbox.style.opacity = "1";
            }, 10);
        }
    });

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentGallery.length > 1) {
            currentIndex =
                (currentIndex - 1 + currentGallery.length) %
                currentGallery.length;
            updateLightboxImage();
        }
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (currentGallery.length > 1) {
            currentIndex = (currentIndex + 1) % currentGallery.length;
            updateLightboxImage();
        }
    });

    // Close Logic
    const closeLightbox = () => {
        lightbox.style.opacity = "0";
        setTimeout(() => {
            lightbox.classList.remove("active");
            lightbox.style.display = "none";
            lightboxImg.src = ""; // Clear src
        }, 300); // Match transition duration
    };

    closeBtn.addEventListener("click", closeLightbox);

    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (lightbox.classList.contains("active")) {
            if (e.key === "Escape") {
                closeLightbox();
            } else if (e.key === "ArrowLeft" && currentGallery.length > 1) {
                currentIndex =
                    (currentIndex - 1 + currentGallery.length) %
                    currentGallery.length;
                updateLightboxImage();
            } else if (e.key === "ArrowRight" && currentGallery.length > 1) {
                currentIndex = (currentIndex + 1) % currentGallery.length;
                updateLightboxImage();
            }
        }
    });
}
