let allMagazines = [], pageFlip = null;

async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        renderMagazines(allMagazines);
    } catch (e) { console.error("Error loading JSON. Use a local server."); }
}

function renderMagazines(mags) {
    const grid = document.getElementById('magazine-list');
    grid.innerHTML = mags.map((mag) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="Cover" onerror="this.style.opacity='0'">
        </div>
    `).join('');
}

function openMagazine(id) {
    const mag = allMagazines.find(m => m.id === id);
    if (!mag) return;

    if (pageFlip) { pageFlip.destroy(); pageFlip = null; }

    const view = document.getElementById('flipbook-view');
    view.style.display = 'flex';
    
    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" loading="eager">`;
        container.appendChild(p);
    }

    try {
        pageFlip = new St.PageFlip(container, {
            width: 1004, height: 1358, size: "stretch",
            showCover: true, flippingTime: 1000, 
            usePortrait: true, drawShadow: true,
            maxShadowOpacity: 0.2, mobileScrollSupport: true
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.getElementById('page-counter').innerText = `1 / ${mag.pages}`;

        pageFlip.on('flip', (e) => {
            document.getElementById('page-counter').innerText = `${e.data + 1} / ${mag.pages}`;
        });

        document.getElementById('btn-prev').onclick = () => pageFlip.flipPrev();
        document.getElementById('btn-next').onclick = () => pageFlip.flipNext();
    } catch (e) { console.error(e); }
}

function closeFlipbook() {
    document.getElementById('flipbook-view').style.display = 'none';
    if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
    document.getElementById('flipbook-wrapper').innerHTML = '';
}

document.getElementById('close-flipbook').onclick = closeFlipbook;
document.addEventListener('DOMContentLoaded', loadMagazineData);
