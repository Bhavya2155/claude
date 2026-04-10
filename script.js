// Global variables
let allMagazines = [];
let pageFlip = null;
const flipSound = document.getElementById('flip-sound');

// Load magazine data
async function loadMagazineData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allMagazines = data.magazines;
        
        populateFilters();
        renderMagazines(allMagazines);
    } catch (error) {
        console.error('Error loading magazine data:', error);
        // Fallback to hardcoded data if JSON fails
        allMagazines = [
            {
                id: 1,
                title: 'Lord Rushabhdev',
                folder: 'book1',
                pages: 16,
                language: 'English',
                year: 2025,
                month: 'April',
                coverImage: 'books/book1/1.jpg'
            },
            {
                id: 2,
                title: 'The Era Back Then',
                folder: 'book2',
                pages: 16,
                language: 'English',
                year: 2025,
                month: 'March',
                coverImage: 'books/book2/1.jpg'
            }
        ];
        populateFilters();
        renderMagazines(allMagazines);
    }
}

// Populate filter dropdowns
function populateFilters() {
    const languages = [...new Set(allMagazines.map(m => m.language))];
    const years = [...new Set(allMagazines.map(m => m.year))].sort((a, b) => b - a);
    const months = [...new Set(allMagazines.map(m => m.month))];
    
    const languageFilter = document.getElementById('language-filter');
    const yearFilter = document.getElementById('year-filter');
    const monthFilter = document.getElementById('month-filter');
    
    // Populate language
    languageFilter.innerHTML = '<option value="all">All Languages</option>';
    languages.forEach(lang => {
        languageFilter.innerHTML += `<option value="${lang}">${lang}</option>`;
    });
    
    // Populate year
    yearFilter.innerHTML = '<option value="all">All Year</option>';
    years.forEach(year => {
        yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
    });
    
    // Populate month
    monthFilter.innerHTML = '<option value="all">All Months</option>';
    months.forEach(month => {
        monthFilter.innerHTML += `<option value="${month}">${month}</option>`;
    });
}

// Render magazines in grid
function renderMagazines(magazines) {
    const grid = document.getElementById('magazine-list');
    const noResults = document.getElementById('no-results');
    
    if (magazines.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    grid.innerHTML = magazines.map((mag, index) => `
        <div class="magazine-card" onclick="openMagazine(${mag.id})">
            <img src="${mag.coverImage}" alt="${mag.title}" loading="lazy">
            <div class="overlay"></div>
            <div class="audio-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
            </div>
            <div class="title">${mag.title}</div>
        </div>
    `).join('');
}

// Filter magazines
function filterMagazines() {
    const languageValue = document.getElementById('language-filter').value;
    const yearValue = document.getElementById('year-filter').value;
    const monthValue = document.getElementById('month-filter').value;
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = allMagazines;
    
    if (languageValue !== 'all') {
        filtered = filtered.filter(m => m.language === languageValue);
    }
    
    if (yearValue !== 'all') {
        filtered = filtered.filter(m => m.year.toString() === yearValue);
    }
    
    if (monthValue !== 'all') {
        filtered = filtered.filter(m => m.month === monthValue);
    }
    
    if (searchValue) {
        filtered = filtered.filter(m => 
            m.title.toLowerCase().includes(searchValue)
        );
    }
    
    renderMagazines(filtered);
}

// Open magazine in flipbook view
function openMagazine(magazineId) {
    const magazine = allMagazines.find(m => m.id === magazineId);
    if (!magazine) return;
    
    document.getElementById('grid-view').classList.add('hidden');
    document.getElementById('flipbook-view').classList.remove('hidden');
    
    const container = document.getElementById('magazine');
    container.innerHTML = '';
    
    // Build pages
    for (let i = 1; i <= magazine.pages; i++) {
        const page = document.createElement('div');
        page.className = 'page';
        page.innerHTML = `<img src="books/${magazine.folder}/${i}.jpg" alt="Page ${i}">`;
        container.appendChild(page);
    }
    
    // Initialize PageFlip
    const isMobile = window.innerWidth < 768;
    
    pageFlip = new St.PageFlip(container, {
        width: 1358,
        height: 1004,
        size: "stretch",
        minWidth: 300,
        maxWidth: 1358,
        minHeight: 220,
        maxHeight: 1004,
        showCover: true,
        flippingTime: 1000,
        usePortrait: isMobile,
        startPage: 0,
        drawShadow: true,
        maxShadowOpacity: 0.5,
        showPageCorners: true,
        disableFlipByClick: false,
        mobileScrollSupport: true
    });
    
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    
    // Update page counter on flip
    pageFlip.on('flip', (e) => {
        if (flipSound) {
            flipSound.currentTime = 0;
            flipSound.play().catch(() => {});
        }
        
        const currentPage = e.data + 1;
        let displayPage;
        
        if (currentPage === 1 || isMobile) {
            displayPage = currentPage;
        } else if (currentPage >= magazine.pages) {
            displayPage = magazine.pages;
        } else {
            displayPage = `${currentPage}-${currentPage + 1}`;
        }
        
        document.getElementById('page-counter').innerText = `${displayPage} / ${magazine.pages}`;
    });
    
    // Set initial page counter
    document.getElementById('page-counter').innerText = `1 / ${magazine.pages}`;
}

// Close flipbook and return to grid
function closeFlipbook() {
    document.getElementById('flipbook-view').classList.add('hidden');
    document.getElementById('grid-view').classList.remove('hidden');
    
    if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadMagazineData();
    
    // Filter listeners
    document.getElementById('language-filter').addEventListener('change', filterMagazines);
    document.getElementById('year-filter').addEventListener('change', filterMagazines);
    document.getElementById('month-filter').addEventListener('change', filterMagazines);
    document.getElementById('search-input').addEventListener('input', filterMagazines);
    
    // Close button
    document.getElementById('close-flipbook').addEventListener('click', closeFlipbook);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (pageFlip) {
            if (e.key === 'ArrowLeft') {
                pageFlip.flipPrev();
            } else if (e.key === 'ArrowRight') {
                pageFlip.flipNext();
            } else if (e.key === 'Escape') {
                closeFlipbook();
            }
        }
    });
});

// Make openMagazine globally accessible
window.openMagazine = openMagazine;
