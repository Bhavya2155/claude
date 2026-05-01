let allMagazines = [], pageFlip = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (e) { console.error("JSON Error: Are you running a local server?"); }
}

function renderMagazines(mags) {
    const grid = document.getElementById('magazine-list');
    grid.innerHTML = mags.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="Magazine" onerror="this.style.display='none'">
        </div>
    `).join('');
}

function openMagazine(id) {
    const mag = allMagazines.find(m => m.id === id);
    if (!mag) return;

    // 1. Hard Wipe memory
    if (pageFlip) { pageFlip.destroy(); pageFlip = null; }

    // 2. Show the Overlay & Lock Scroll
    const view = document.getElementById('flipbook-view');
    view.classList.replace('hidden', 'flex');
    document.body.classList.add('no-scroll');

    // 3. Inject Container
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine" class="st-page-flip"></div>';
    const container = document.getElementById('magazine');

    // 4. Create Pages
    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.setAttribute('data-density', 'soft');
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" loading="eager">`;
        container.appendChild(p);
    }

    try {
        pageFlip = new St.PageFlip(container, {
            width: 1004, height: 1358, size: "stretch",
            showCover: true, flippingTime: 1000, 
            usePortrait: true, drawShadow: true,
            maxShadowOpacity: 0.15, mobileScrollSupport: true,
            swipeDistance: 30
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

        document.getElementById('btn-prev').onclick = () => { if(pageFlip) pageFlip.flipPrev(); };
        document.getElementById('btn-next').onclick = () => { if(pageFlip) pageFlip.flipNext(); };
        
    } catch (e) { console.error("PageFlip Error", e); }
}

function closeFlipbook() {
    const view = document.getElementById('flipbook-view');
    view.classList.replace('flex', 'hidden');
    document.body.classList.remove('no-scroll');
    
    if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
    document.getElementById('flipbook-wrapper').innerHTML = '';
}

document.getElementById('close-flipbook').onclick = closeFlipbook;
document.addEventListener('DOMContentLoaded', loadMagazineData);
window.openMagazine = openMagazine;
