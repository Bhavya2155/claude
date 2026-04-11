let allMagazines = [];
let pageFlip = null;
let panzoomInstance = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (error) {
        console.error("ERROR loading data.json:", error);
    }
}

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

function openMagazine(magazineId) {
    const magazine = allMagazines.find(m => m.id === magazineId);
    if (!magazine) return;

    document.getElementById('grid-view').classList.add('hidden');
    const flipbookView = document.getElementById('flipbook-view');
    flipbookView.classList.remove('hidden');
    flipbookView.classList.add('flex');

    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(page);
    }

    try {
        pageFlip = new St.PageFlip(container, {
            width: 679, height: 1004, size: "stretch",
            minWidth: 300, maxWidth: 679, minHeight: 400, maxHeight: 1004,
            showCover: true, flippingTime: 450, usePortrait: true,
            startPage: 0, drawShadow: true, maxShadowOpacity: 0.3,
            showPageCorners: true, mobileScrollSupport: true, swipeDistance: 30
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Initialize Panzoom
        panzoomInstance = Panzoom(wrapper, { maxScale: 4, minScale: 1, contain: 'outside' });
        wrapper.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

        pageFlip.on('init', () => {
            document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
        });

        pageFlip.on('flip', (e) => {
            const currentPage = e.data + 1;
            let displayPage = (pageFlip.getOrientation() === 'portrait' || currentPage === 1 || currentPage >= magazine.pages) 
                ? currentPage : `${currentPage}-${currentPage + 1}`;
            document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
        });

        setupSwipes(flipbookView);
    } catch (error) { console.error(error); }
}

function setupSwipes(view) {
    let startX = null, isAnimating = false;
    pageFlip.on('changeState', (e) => isAnimating = (e.data !== 'read'));

    view.addEventListener('touchstart', e => {
        if (e.target.closest('#magazine') || (panzoomInstance && panzoomInstance.getScale() > 1)) {
            startX = null; return;
        }
        startX = e.changedTouches[0].screenX;
    }, { passive: true });

    view.addEventListener('touchend', e => {
        if (startX === null || isAnimating) return;
        const dist = e.changedTouches[0].screenX - startX;
        if (Math.abs(dist) > 50) dist < 0 ? pageFlip.flipNext() : pageFlip.flipPrev();
    }, { passive: true });
}

function closeFlipbook() {
    document.getElementById('flipbook-view').classList.add('hidden');
    document.getElementById('grid-view').classList.remove('hidden');
    if (pageFlip) pageFlip.destroy();
    if (panzoomInstance) panzoomInstance.destroy();
}

document.addEventListener('DOMContentLoaded', () => {
    loadMagazineData();
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    document.getElementById('prev-page').addEventListener('click', () => pageFlip?.flipPrev());
    document.getElementById('next-page').addEventListener('click', () => pageFlip?.flipNext());
});
window.openMagazine = openMagazine;
