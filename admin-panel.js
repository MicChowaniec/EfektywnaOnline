// admin-panel.js - Panel administracyjny do edycji kafelków

class AdminPanel {
    constructor() {
        this.adminPanel = document.getElementById('admin-panel');
        this.sectionSelect = document.getElementById('section-select');
        this.tileSelect = document.getElementById('tile-select');
        this.tileEditor = document.getElementById('tile-editor');
        this.adminToggleBtn = document.getElementById('admin-toggle-btn');
        this.adminShowBtn = document.getElementById('admin-show-btn');
        
        // Pola edycji
        this.titleInput = document.getElementById('tile-title-input');
        this.descInput = document.getElementById('tile-desc-input');
        this.imageInput = document.getElementById('tile-image-input');
        this.imageFileInput = document.getElementById('tile-image-file');
        
        // Podgląd
        this.previewImg = document.getElementById('tile-preview-img');
        this.previewTitle = document.getElementById('tile-preview-title');
        this.previewDesc = document.getElementById('tile-preview-desc');
        
        // Przyciski
        this.saveTileBtn = document.getElementById('save-tile-btn');
        this.resetTileBtn = document.getElementById('reset-tile-btn');
        
        // Dane przechowywane
        this.currentSection = null;
        this.currentTileIndex = null;
        this.originalTileData = null;
        
        this.init();
    }
    
    init() {
        // Event listenery
        this.sectionSelect.addEventListener('change', (e) => this.onSectionChange(e));
        this.tileSelect.addEventListener('change', (e) => this.onTileChange(e));
        this.titleInput.addEventListener('input', () => this.updatePreview());
        this.descInput.addEventListener('input', () => this.updatePreview());
        this.imageInput.addEventListener('input', () => this.updatePreview());
        this.imageFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.saveTileBtn.addEventListener('click', () => this.saveTile());
        this.resetTileBtn.addEventListener('click', () => this.resetEditor());
        this.adminToggleBtn.addEventListener('click', () => this.togglePanel());
        this.adminShowBtn.addEventListener('click', () => this.showPanel());
        
        // Ładowanie danych z localStorage
        this.loadFromLocalStorage();
    }
    
    onSectionChange(e) {
        this.currentSection = e.target.value;
        this.currentTileIndex = null;
        this.tileEditor.style.display = 'none';
        this.populateTileSelect();
    }
    
    populateTileSelect() {
        this.tileSelect.innerHTML = '<option value="">-- Wybierz kafelek --</option>';
        
        if (!this.currentSection) {
            return;
        }
        
        const section = document.getElementById(this.currentSection);
        if (!section) return;
        
        const tiles = section.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            const titleEl = tile.querySelector('.tile-title');
            const title = titleEl ? titleEl.textContent : `Kafelek ${index + 1}`;
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${title} (${index + 1})`;
            this.tileSelect.appendChild(option);
        });
    }
    
    onTileChange(e) {
        this.currentTileIndex = e.target.value;
        
        if (this.currentTileIndex === '' || this.currentTileIndex === null) {
            this.tileEditor.style.display = 'none';
            return;
        }
        
        this.loadTileData(parseInt(this.currentTileIndex));
        this.tileEditor.style.display = 'block';
    }
    
    loadTileData(tileIndex) {
        const section = document.getElementById(this.currentSection);
        if (!section) return;
        
        const tiles = section.querySelectorAll('.tile');
        if (tileIndex >= tiles.length) return;
        
        const tile = tiles[tileIndex];
        const imgEl = tile.querySelector('img');
        const titleEl = tile.querySelector('.tile-title');
        const descEl = tile.querySelector('.tile-desc');
        
        const tileData = {
            image: imgEl ? imgEl.src : '',
            title: titleEl ? titleEl.textContent : '',
            desc: descEl ? descEl.textContent : ''
        };
        
        this.originalTileData = { ...tileData };
        
        this.titleInput.value = tileData.title;
        this.descInput.value = tileData.desc;
        this.imageInput.value = tileData.image;
        this.previewImg.src = tileData.image;
        
        this.updatePreview();
    }
    
    updatePreview() {
        this.previewTitle.textContent = this.titleInput.value || 'Tytuł';
        this.previewDesc.textContent = this.descInput.value || 'Opis';
        
        if (this.imageInput.value) {
            this.previewImg.src = this.imageInput.value;
            this.previewImg.onerror = () => {
                this.previewImg.src = 'https://placehold.co/80x80?text=Błąd';
            };
        }
    }
    
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.imageInput.value = event.target.result;
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    }
    
    saveTile() {
        if (this.currentTileIndex === null || !this.currentSection) {
            alert('Proszę wybrać kafelek do edycji');
            return;
        }
        
        const section = document.getElementById(this.currentSection);
        if (!section) return;
        
        const tiles = section.querySelectorAll('.tile');
        const tile = tiles[this.currentTileIndex];
        
        const imgEl = tile.querySelector('img');
        const titleEl = tile.querySelector('.tile-title');
        const descEl = tile.querySelector('.tile-desc');
        
        if (imgEl) imgEl.src = this.imageInput.value;
        if (titleEl) titleEl.textContent = this.titleInput.value;
        if (descEl) descEl.textContent = this.descInput.value;
        if (imgEl) imgEl.alt = this.titleInput.value;
        
        // Zapisanie do localStorage
        this.saveToLocalStorage();
        
        alert('✓ Zmiany zostały zapisane pomyślnie!');
        this.updatePreview();
    }
    
    resetEditor() {
        if (this.originalTileData) {
            this.titleInput.value = this.originalTileData.title;
            this.descInput.value = this.originalTileData.desc;
            this.imageInput.value = this.originalTileData.image;
            this.previewImg.src = this.originalTileData.image;
            this.updatePreview();
        }
    }
    
    saveToLocalStorage() {
        const data = {};
        
        // Zbierz dane ze wszystkich sekcji
        ['o-mnie', 'uslugi', 'kontakt'].forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            data[sectionId] = [];
            const tiles = section.querySelectorAll('.tile');
            tiles.forEach(tile => {
                const imgEl = tile.querySelector('img');
                const titleEl = tile.querySelector('.tile-title');
                const descEl = tile.querySelector('.tile-desc');
                
                data[sectionId].push({
                    image: imgEl ? imgEl.src : '',
                    title: titleEl ? titleEl.textContent : '',
                    desc: descEl ? descEl.textContent : ''
                });
            });
        });
        
        localStorage.setItem('adminPanelData', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('adminPanelData');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            Object.keys(data).forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (!section) return;
                
                const tiles = section.querySelectorAll('.tile');
                data[sectionId].forEach((tileData, index) => {
                    if (index >= tiles.length) return;
                    
                    const tile = tiles[index];
                    const imgEl = tile.querySelector('img');
                    const titleEl = tile.querySelector('.tile-title');
                    const descEl = tile.querySelector('.tile-desc');
                    
                    if (imgEl && tileData.image) imgEl.src = tileData.image;
                    if (titleEl && tileData.title) titleEl.textContent = tileData.title;
                    if (descEl && tileData.desc) descEl.textContent = tileData.desc;
                    if (imgEl && tileData.title) imgEl.alt = tileData.title;
                });
            });
        } catch (error) {
            console.error('Błąd przy ładowaniu danych z localStorage:', error);
        }
    }
    
    togglePanel() {
        if (this.adminPanel.style.display === 'none') {
            this.showPanel();
        } else {
            this.hidePanel();
        }
    }
    
    showPanel() {
        this.adminPanel.style.display = 'flex';
        this.adminShowBtn.style.display = 'none';
        this.adminToggleBtn.textContent = 'Schowaj';
    }
    
    hidePanel() {
        this.adminPanel.style.display = 'none';
        this.adminShowBtn.style.display = 'block';
        this.adminToggleBtn.textContent = 'Pokaż';
    }
}

// Inicjalizuj panel administracyjny po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    const adminPanel = new AdminPanel();
    
    // Opcjonalnie: ustaw domyślnie widoczny panel
    // adminPanel.hidePanel(); // Odkomentuj, jeśli chcesz aby był ukryty domyślnie
});
