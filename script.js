let allMagazines = [], pageFlip = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (e) { console.error("Data fetch error:", e); }
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

    const container = document.getElementById('magazine');
    container.innerHTML = ''; 

    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.setAttribute('data-density', 'soft'); // Critical for smooth physics
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(p);
    }

    try {
        const tw = 1004, th = 1358;
        pageFlip = new St.PageFlip(container, {
            width: tw, height: th, size: "stretch",
            minWidth: 300, maxWidth: tw, minHeight: 400, maxHeight: th,
            showCover: true, 
            flippingTime: 800, 
            usePortrait: true,
            drawShadow: true, 
            maxShadowOpacity: 0.5, 
            showPageCorners: true,
            mobileScrollSupport: true,
            useMouseEvents: true
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

        // Mapping all navigation buttons
        document.getElementById('arrow-prev').onclick = () => pageFlip.flipPrev();
        document.getElementById('arrow-next').onclick = () => pageFlip.flipNext();
        document.getElementById('btn-prev').onclick = () => pageFlip.flipPrev();
        document.getElementById('btn-next').onclick = () => pageFlip.flipNext();
        
    } catch (e) { console.error("PageFlip error:", e); }
}

function closeFlipbook() {
    const view = document.getElementById('flipbook-view');
    view.style.opacity = '0';
    setTimeout(() => {
        view.classList.replace('flex', 'hidden');
        if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
    }, 300);
}

document.getElementById('close-flipbook').onclick = closeFlipbook;
document.addEventListener('DOMContentLoaded', loadMagazineData);
window.openMagazine = openMagazine;
