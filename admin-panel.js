// admin-panel.js - Panel administracyjny do edycji kafelków i logo

const API_URL = 'http://localhost:3000/api';

class AdminPanel {
    constructor() {
        // Modal logowania
        this.loginModal = document.getElementById('login-modal');
        this.loginPasswordInput = document.getElementById('login-password');
        this.loginBtn = document.getElementById('login-btn');
        this.loginError = document.getElementById('login-error');
        
        // Panel admina
        this.adminPanel = document.getElementById('admin-panel');
        this.logoutBtn = document.getElementById('logout-btn');
        this.sectionSelect = document.getElementById('section-select');
        this.tileSelect = document.getElementById('tile-select');
        this.tileEditor = document.getElementById('tile-editor');
        this.adminToggleBtn = document.getElementById('admin-toggle-btn');
        this.adminShowBtn = document.getElementById('admin-show-btn');
        
        // Logo editor
        this.logoPreview = document.getElementById('logo-preview');
        this.logoUrlInput = document.getElementById('logo-url-input');
        this.logoFileInput = document.getElementById('logo-file-input');
        this.saveLogoBtn = document.getElementById('save-logo-btn');
        
        // Pola edycji kafelka
        this.titleInput = document.getElementById('tile-title-input');
        this.descInput = document.getElementById('tile-desc-input');
        this.imageInput = document.getElementById('tile-image-input');
        this.imageFileInput = document.getElementById('tile-image-file');
        
        // Podgląd kafelka
        this.previewImg = document.getElementById('tile-preview-img');
        this.previewTitle = document.getElementById('tile-preview-title');
        this.previewDesc = document.getElementById('tile-preview-desc');
        
        // Przyciski
        this.saveTileBtn = document.getElementById('save-tile-btn');
        this.resetTileBtn = document.getElementById('reset-tile-btn');
        
        // Dane przechowywane
        this.token = null;
        this.isLoggedIn = false;
        this.currentSection = null;
        this.currentTileIndex = null;
        this.originalTileData = null;
        this.serverData = null;
        
        this.init();
    }
    
    init() {
        // Event listenery logowania
        this.loginBtn.addEventListener('click', () => this.login());
        this.loginPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        // Event listenery panelu
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.sectionSelect.addEventListener('change', (e) => this.onSectionChange(e));
        this.tileSelect.addEventListener('change', (e) => this.onTileChange(e));
        
        // Event listenery logo
        this.logoUrlInput.addEventListener('input', () => this.updateLogoPreview());
        this.logoFileInput.addEventListener('change', (e) => this.handleLogoFileUpload(e));
        this.saveLogoBtn.addEventListener('click', () => this.saveLogo());
        
        // Event listenery kafelka
        this.titleInput.addEventListener('input', () => this.updateTilePreview());
        this.descInput.addEventListener('input', () => this.updateTilePreview());
        this.imageInput.addEventListener('input', () => this.updateTilePreview());
        this.imageFileInput.addEventListener('change', (e) => this.handleTileFileUpload(e));
        this.saveTileBtn.addEventListener('click', () => this.saveTile());
        this.resetTileBtn.addEventListener('click', () => this.resetEditor());
        this.adminToggleBtn.addEventListener('click', () => this.togglePanel());
        this.adminShowBtn.addEventListener('click', () => this.showPanel());
        
        // Sprawdź czy jest token w sessionStorage
        this.checkSession();
    }
    
    checkSession() {
        const token = sessionStorage.getItem('adminToken');
        if (token) {
            this.token = token;
            this.isLoggedIn = true;
            this.showPanel();
            this.loadData();
        } else {
            this.showLoginModal();
        }
    }
    
    showLoginModal() {
        this.loginModal.classList.remove('hidden');
        this.loginPasswordInput.focus();
    }
    
    hideLoginModal() {
        this.loginModal.classList.add('hidden');
    }
    
    async login() {
        const password = this.loginPasswordInput.value.trim();
        
        if (!password) {
            this.showLoginError('Wpisz hasło');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.token = data.token;
                this.isLoggedIn = true;
                sessionStorage.setItem('adminToken', this.token);
                this.loginPasswordInput.value = '';
                this.hideLoginModal();
                this.showPanel();
                this.loadData();
            } else {
                this.showLoginError('❌ Niepoprawne hasło');
                this.loginPasswordInput.value = '';
            }
        } catch (error) {
            this.showLoginError('⚠️ Błąd połączenia z serwerem');
            console.error('Login error:', error);
        }
    }
    
    showLoginError(message) {
        this.loginError.textContent = message;
        setTimeout(() => {
            this.loginError.textContent = '';
        }, 3000);
    }
    
    logout() {
        this.token = null;
        this.isLoggedIn = false;
        sessionStorage.removeItem('adminToken');
        this.hidePanel();
        this.showLoginModal();
        this.currentSection = null;
        this.currentTileIndex = null;
    }
    
    async loadData() {
        try {
            const response = await fetch(`${API_URL}/data`);
            this.serverData = await response.json();
            
            // Załaduj logo
            if (this.serverData.logo) {
                this.logoPreview.src = this.serverData.logo;
                document.querySelector('.hero-img').src = this.serverData.logo;
            }
            
            // Załaduj kafelki z serwera
            this.loadTilesFromServer();
        } catch (error) {
            console.error('Błąd przy ładowaniu danych:', error);
        }
    }
    
    loadTilesFromServer() {
        if (!this.serverData || !this.serverData.sections) return;
        
        // Dla każdej sekcji zaktualizuj kafelki na stronie
        Object.keys(this.serverData.sections).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            const tiles = section.querySelectorAll('.tile');
            const tileData = this.serverData.sections[sectionId];
            
            tiles.forEach((tile, index) => {
                if (index >= tileData.length) return;
                
                const imgEl = tile.querySelector('img');
                const titleEl = tile.querySelector('.tile-title');
                const descEl = tile.querySelector('.tile-desc');
                const data = tileData[index];
                
                if (imgEl) imgEl.src = data.image;
                if (titleEl) titleEl.textContent = data.title;
                if (descEl) descEl.textContent = data.desc;
                if (imgEl) imgEl.alt = data.title;
            });
        });
    }
    
    onSectionChange(e) {
        this.currentSection = e.target.value;
        this.currentTileIndex = null;
        this.tileEditor.style.display = 'none';
        this.populateTileSelect();
    }
    
    populateTileSelect() {
        this.tileSelect.innerHTML = '<option value="">-- Wybierz kafelek --</option>';
        
        if (!this.currentSection || !this.serverData) {
            return;
        }
        
        const tiles = this.serverData.sections[this.currentSection] || [];
        tiles.forEach((tile, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${tile.title} (${index + 1})`;
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
        if (!this.serverData || !this.currentSection) return;
        
        const tileData = this.serverData.sections[this.currentSection][tileIndex];
        if (!tileData) return;
        
        this.originalTileData = { ...tileData };
        
        this.titleInput.value = tileData.title;
        this.descInput.value = tileData.desc;
        this.imageInput.value = tileData.image;
        this.previewImg.src = tileData.image;
        
        this.updateTilePreview();
    }
    
    updateTilePreview() {
        this.previewTitle.textContent = this.titleInput.value || 'Tytuł';
        this.previewDesc.textContent = this.descInput.value || 'Opis';
        
        if (this.imageInput.value) {
            this.previewImg.src = this.imageInput.value;
            this.previewImg.onerror = () => {
                this.previewImg.src = 'https://placehold.co/80x80?text=Błąd';
            };
        }
    }
    
    updateLogoPreview() {
        if (this.logoUrlInput.value) {
            this.logoPreview.src = this.logoUrlInput.value;
            this.logoPreview.onerror = () => {
                this.logoPreview.src = 'https://placehold.co/240x240?text=Błąd';
            };
        }
    }
    
    handleTileFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.imageInput.value = event.target.result;
            this.updateTilePreview();
        };
        reader.readAsDataURL(file);
    }
    
    handleLogoFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            this.logoUrlInput.value = event.target.result;
            this.updateLogoPreview();
        };
        reader.readAsDataURL(file);
    }
    
    async saveLogo() {
        const logoUrl = this.logoUrlInput.value.trim();
        
        if (!logoUrl) {
            alert('❌ Wpisz URL lub wgraj plik');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/update-logo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logo: logoUrl, token: this.token })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.serverData.logo = logoUrl;
                document.querySelector('.hero-img').src = logoUrl;
                alert('✓ Logo zostało zaktualizowane!');
                this.logoUrlInput.value = '';
                this.logoFileInput.value = '';
            } else {
                alert('❌ Błąd: ' + (data.error || 'Nie udało się zapisać'));
            }
        } catch (error) {
            alert('⚠️ Błąd połączenia');
            console.error('Save logo error:', error);
        }
    }
    
    async saveTile() {
        if (this.currentTileIndex === null || !this.currentSection) {
            alert('Proszę wybrać kafelek do edycji');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/update-tile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: this.currentSection,
                    index: parseInt(this.currentTileIndex),
                    title: this.titleInput.value,
                    desc: this.descInput.value,
                    image: this.imageInput.value,
                    token: this.token
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Zaktualizuj dane na stronie
                const section = document.getElementById(this.currentSection);
                const tiles = section.querySelectorAll('.tile');
                const tile = tiles[this.currentTileIndex];
                
                const imgEl = tile.querySelector('img');
                const titleEl = tile.querySelector('.tile-title');
                const descEl = tile.querySelector('.tile-desc');
                
                if (imgEl) imgEl.src = this.imageInput.value;
                if (titleEl) titleEl.textContent = this.titleInput.value;
                if (descEl) descEl.textContent = this.descInput.value;
                
                alert('✓ Zmiany zostały zapisane na serwerze!');
                this.updateTilePreview();
            } else {
                alert('❌ Błąd: ' + (data.error || 'Nie udało się zapisać'));
            }
        } catch (error) {
            alert('⚠️ Błąd połączenia z serwerem');
            console.error('Save tile error:', error);
        }
    }
    
    resetEditor() {
        if (this.originalTileData) {
            this.titleInput.value = this.originalTileData.title;
            this.descInput.value = this.originalTileData.desc;
            this.imageInput.value = this.originalTileData.image;
            this.previewImg.src = this.originalTileData.image;
            this.updateTilePreview();
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
});
