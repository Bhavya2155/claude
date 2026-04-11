let allMagazines = [], pageFlip = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (e) { console.error(e); }
}

function renderMagazines(mags) {
    const grid = document.getElementById('magazine-list');
    grid.innerHTML = mags.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="${mag.title}">
            <div class="title">${mag.title}</div>
        </div>
    `).join('');
}

function openMagazine(id) {
    const mag = allMagazines.find(m => m.id === id);
    if (!mag) return;

    // DO NOT HIDE THE GRID VIEW. We need it visible but blurred.
    // document.getElementById('grid-view').classList.add('hidden'); // Removed

    const view = document.getElementById('flipbook-view');
    view.classList.replace('hidden', 'flex');
    setTimeout(() => view.style.opacity = '1', 50);

    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(p);
    }

    try {
        const tw = 1004, th = 1358;
        pageFlip = new St.PageFlip(container, {
            width: tw, height: th, size: "stretch",
            minWidth: 300, maxWidth: tw, minHeight: 400, maxHeight: th,
            showCover: true, // Book style
            flippingTime: 450, usePortrait: true,
            drawShadow: true, maxShadowOpacity: 0.2,
            mobileScrollSupport: true, swipeDistance: 30
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        // ==========================================
        // PANZOOM REMOVED - WHITE BG ISSUE FIXED
        // ==========================================

        pageFlip.on('init', () => document.getElementById('page-counter').innerText = `1 / ${mag.pages}`);
        pageFlip.on('flip', (e) => {
            const cur = e.data + 1;
            let disp = (pageFlip.getOrientation() === 'portrait' || cur === 1 || cur >= mag.pages) ? cur : `${cur}-${cur+1}`;
            document.getElementById('page-counter').innerText = `${disp} / ${mag.pages}`;
        });
        setupSwipes(view);
    } catch (e) { console.error(e); }
}

function setupSwipes(view) {
    // Zoom lock logic removed. Swiping is now always native and clean.
    let sx = null, isAnim = false;
    pageFlip.on('changeState', (e) => isAnim = (e.data !== 'read'));
    view.addEventListener('touchstart', e => sx = e.changedTouches[0].screenX, { passive: true });
    view.addEventListener('touchend', e => {
        if (sx === null || isAnim) return;
        const d = e.changedTouches[0].screenX - sx;
        if (Math.abs(d) > 50) d < 0 ? pageFlip.flipNext() : pageFlip.flipPrev();
    }, { passive: true });
}

function closeFlipbook() {
    const view = document.getElementById('flipbook-view');
    view.style.opacity = '0';
    setTimeout(() => {
        view.classList.replace('flex', 'hidden');
        // Grid View is already visible, no need to unhide.
        if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMagazineData();
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    document.getElementById('prev-page').addEventListener('click', () => pageFlip?.flipPrev());
    document.getElementById('next-page').addEventListener('click', () => pageFlip?.flipNext());
});
window.openMagazine = openMagazine;
