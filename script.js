// 1. Global variables
let allMagazines = [];
let pageFlip = null;
let panzoomInstance = null;

// 2. Load magazine data from JSON
async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (error) {
        console.error("ERROR loading data.json:", error);
        // Fallback data for testing if JSON fails
        allMagazines = [
            { id: 1, title: 'Lord Rushabhdev', folder: 'book1', pages: 16, coverImage: 'books/book1/1.jpg' },
            { id: 2, title: 'The Era Back Then', folder: 'book2', pages: 16, coverImage: 'books/book2/1.jpg' }
        ];
        renderMagazines(allMagazines);
    }
}

// 3. Render magazines in the home grid
function renderMagazines(magazines) {
    const grid = document.getElementById('magazine-list');
    grid.innerHTML = magazines.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="${mag.title}">
            <div class="overlay"></div>
            <div class="title">${mag.title}</div>
        </div>
    `).join('');
}

// 4. Open magazine in flipbook view
function openMagazine(magazineId) {
    const magazine = allMagazines.find(m => m.id === magazineId);
    if (!magazine) return;

    // Switch views
    document.getElementById('grid-view').classList.add('hidden');
    const flipbookView = document.getElementById('flipbook-view');
    flipbookView.classList.remove('hidden');
    flipbookView.classList.add('flex');

    // Rebuild the container to prevent library destruction bugs
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    // Inject pages into the DOM
    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(page);
    }

    try {
        // Initialize St.PageFlip
        pageFlip = new St.PageFlip(container, {
            width: 679,         // Single page width
            height: 1004,       // Single page height
            size: "stretch",    // Required for responsive sizing
            minWidth: 300,
            maxWidth: 679,
            minHeight: 400,
            maxHeight: 1004,
            showCover: true,
            flippingTime: 450,  // Fast, snappy turns
            usePortrait: true,  // Allows 1-page view on mobile
            startPage: 0,
            drawShadow: true,
            maxShadowOpacity: 0.3,
            showPageCorners: true,
            mobileScrollSupport: true,
            swipeDistance: 30
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Initialize Panzoom for Pinch-to-Zoom
        panzoomInstance = Panzoom(wrapper, {
            maxScale: 4,
            minScale: 1,
            contain: 'outside'
        });
        wrapper.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

        // UI Listeners
        pageFlip.on('init', () => {
            document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
        });

        pageFlip.on('flip', (e) => {
            const currentPage = e.data + 1;
            let displayPage;
            // Handle counter logic for 1-page vs 2-page orientation
            if (pageFlip.getOrientation() === 'portrait' || currentPage === 1 || currentPage >= magazine.pages) {
                displayPage = currentPage;
            } else {
                displayPage = `${currentPage}-${currentPage + 1}`;
            }
            document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
        });

        setupSwipes(flipbookView);

    } catch (error) {
        console.error("Flipbook Init Error:", error);
    }
}

// 5. Setup global swipe logic (prevents double-flipping)
function setupSwipes(view) {
    let startX = null;
    let isAnimating = false;

    pageFlip.on('changeState', (e) => {
        isAnimating = (e.data !== 'read');
    });

    view.addEventListener('touchstart', e => {
        // Ignore global swipe if touching the book or zoomed in
        if (e.target.closest('#magazine') || (panzoomInstance && panzoomInstance.getScale() > 1)) {
            startX = null;
            return;
        }
        startX = e.changedTouches[0].screenX;
    }, { passive: true });

    view.addEventListener('touchend', e => {
        if (startX === null || isAnimating) return;
        const dist = e.changedTouches[0].screenX - startX;
        if (Math.abs(dist) > 50) {
            dist < 0 ? pageFlip.flipNext() : pageFlip.flipPrev();
        }
    }, { passive: true });
}

// 6. Close viewer
function closeFlipbook() {
    document.getElementById('flipbook-view').classList.add('hidden');
    document.getElementById('grid-view').classList.remove('hidden');
    if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
    }
    if (panzoomInstance) {
        panzoomInstance.destroy();
        panzoomInstance = null;
    }
}

// 7. Event Listeners for bootup
document.addEventListener('DOMContentLoaded', () => {
    loadMagazineData();
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    document.getElementById('prev-page').addEventListener('click', () => pageFlip?.flipPrev());
    document.getElementById('next-page').addEventListener('click', () => pageFlip?.flipNext());
});

window.openMagazine = openMagazine;
