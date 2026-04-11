let allMagazines = [], pageFlip = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (e) { console.error("Data Load Error:", e); }
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

    const view = document.getElementById('flipbook-view');
    view.classList.replace('hidden', 'flex');
    setTimeout(() => view.style.opacity = '1', 50);

    // HARD RESET: Wipe the wrapper and recreate the magazine div
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.setAttribute('data-density', 'soft');
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" loading="eager" alt="Page ${i}">`;
        container.appendChild(p);
    }

    try {
        const tw = 1004, th = 1358;
        pageFlip = new St.PageFlip(container, {
            width: tw, height: th, size: "stretch",
            minWidth: 300, maxWidth: tw, minHeight: 400, maxHeight: th,
            showCover: true, 
            flippingTime: 600, 
            usePortrait: true,
            drawShadow: true, 
            maxShadowOpacity: 0.3, 
            showPageCorners: false,
            mobileScrollSupport: true,
            swipeDistance: 15
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));

        pageFlip.on('init', () => {
            document.getElementById('page-counter').innerText = `1 / ${mag.pages}`;
        });

        pageFlip.on('flip', (e) => {
            const cur = e.data + 1;
            let disp = (pageFlip.getOrientation() === 'portrait' || cur === 1 || cur >= mag.pages) ? cur : `${cur}-${cur+1}`;
            document.getElementById('page-counter').innerText = `${disp} / ${mag.pages}`;
        });

        // BIND BUTTONS
        document.getElementById('btn-prev').onclick = (e) => {
            e.preventDefault();
            if (pageFlip) pageFlip.flipPrev();
        };

        document.getElementById('btn-next').onclick = (e) => {
            e.preventDefault();
            if (pageFlip) pageFlip.flipNext();
        };
        
    } catch (e) { console.error("PageFlip Error:", e); }
}

function closeFlipbook() {
    const view = document.getElementById('flipbook-view');
    view.style.opacity = '0';
    setTimeout(() => {
        view.classList.replace('flex', 'hidden');
        if (pageFlip) {
            pageFlip.destroy();
            pageFlip = null;
        }
        // Wipe the inner content so it's clean for the next open
        document.getElementById('flipbook-wrapper').innerHTML = '';
    }, 300);
}

document.getElementById('close-flipbook').onclick = closeFlipbook;
document.addEventListener('DOMContentLoaded', loadMagazineData);
window.openMagazine = openMagazine;
