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
            <img src="${mag.coverImage}" alt="Cover">
        </div>
    `).join('');
}

function openMagazine(id) {
    const mag = allMagazines.find(m => m.id === id);
    if (!mag) return;

    const view = document.getElementById('flipbook-view');
    view.style.display = 'flex';
    setTimeout(() => view.style.opacity = '1', 50);

    const wrapper = document.getElementById('flipbook-wrapper');
    wrapper.innerHTML = '<div id="magazine"></div>';
    const container = document.getElementById('magazine');

    for (let i = 1; i <= mag.pages; i++) {
        const p = document.createElement('div');
        p.className = 'page';
        p.setAttribute('data-density', 'soft');
        p.innerHTML = `<img src="books/${mag.folder}/${i}.jpg" loading="eager">`;
        container.appendChild(p);
    }

    try {
        pageFlip = new St.PageFlip(container, {
            width: 1004, 
            height: 1358, 
            size: "stretch", 
            showCover: true, 
            flippingTime: 800, 
            usePortrait: true,
            drawShadow: true, 
            // Light shadow opacity prevents the 'diving' black effect
            maxShadowOpacity: 0.2, 
            showPageCorners: false,
            mobileScrollSupport: true,
            swipeDistance: 20
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

        document.getElementById('btn-prev').onclick = () => pageFlip.flipPrev();
        document.getElementById('btn-next').onclick = () => pageFlip.flipNext();
        
    } catch (e) { console.error(e); }
}

function closeFlipbook() {
    const view = document.getElementById('flipbook-view');
    view.style.opacity = '0';
    setTimeout(() => {
        view.style.display = 'none';
        if (pageFlip) { pageFlip.destroy(); pageFlip = null; }
        document.getElementById('flipbook-wrapper').innerHTML = '';
    }, 300);
}

document.getElementById('close-flipbook').onclick = closeFlipbook;
document.addEventListener('DOMContentLoaded', loadMagazineData);
window.openMagazine = openMagazine;
