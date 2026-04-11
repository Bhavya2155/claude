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
        console.error("Data Load Error:", error);
    }
}

function renderMagazines(magazines) {
    const grid = document.getElementById('magazine-list');
    grid.innerHTML = magazines.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="${mag.title}">
            <div class="title">${mag.title}</div>
        </div>
    `).join('');
}

function openMagazine(magazineId) {
    const magazine = allMagazines.find(m => m.id === magazineId);
    if (!magazine) return;

    document.getElementById('grid-view').classList.add('hidden');
    const flipbookView = document.getElementById('flipbook-view');
    flipbookView.classList.replace('hidden', 'flex');

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
        // EXACT PIXELS FROM YOUR SCREENSHOT
        const trueWidth = 1004; 
        const trueHeight = 1358;

        pageFlip = new St.PageFlip(container, {
            width: trueWidth, 
            height: trueHeight,
            size: "stretch", 
            minWidth: 300, 
            maxWidth: trueWidth,
            minHeight: 400, 
            maxHeight: trueHeight,
            showCover: true, 
            flippingTime: 450, 
            usePortrait: true,
            startPage: 0, 
            drawShadow: true, 
            maxShadowOpacity: 0.3,
            showPageCorners: true, 
            mobileScrollSupport: true, 
            swipeDistance: 30
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // Initialize Zoom on the WRAPPER
        panzoomInstance = Panzoom(wrapper, { 
            maxScale: 4, 
            minScale: 1, 
            contain: 'outside' 
        });
        wrapper.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);

        pageFlip.on('init', () => {
            document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
        });

        pageFlip.on('flip', (e) => {
            const cur = e.data + 1;
            let display = (pageFlip.getOrientation() === 'portrait' || cur === 1 || cur >= magazine.pages) 
                ? cur : `${cur}-${cur + 1}`;
            document.getElementById('page-counter').innerText = `${display} / ${magazine.pages}`;
        });

        setupSwipes(flipbookView);
    } catch (e) { console.error(e); }
}

function setupSwipes(view) {
    let startX = null, isAnimating = false;
    pageFlip.on('changeState', (e) => isAnimating = (e.data !== 'read'));

    view.addEventListener('touchstart', e => {
        // DISABLE SWIPE IF ZOOMED
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
    document.getElementById('flipbook-view').classList.replace('flex', 'hidden');
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
