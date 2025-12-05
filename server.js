// server.js - Backend serwera Node.js/Express
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serwuj pliki statyczne
app.use(express.static(path.join(__dirname)));

// Plik z danymi strony
const DATA_FILE = path.join(__dirname, 'site-data.json');
const ADMIN_PASSWORD_HASH = bcryptjs.hashSync('admin123', 10); // Zmień hasło!

// Struktura domyślnych danych
const DEFAULT_DATA = {
  logo: 'https://placehold.co/240x240?text=LOGO',
  sections: {
    'o-mnie': [
      { title: 'Kafelek A', desc: 'Opis kafelka A', image: 'https://placehold.co/80x80?text=A' },
      { title: 'Kafelek B', desc: 'Opis kafelka B', image: 'https://placehold.co/80x80?text=B' },
      { title: 'Kafelek C', desc: 'Opis kafelka C', image: 'https://placehold.co/80x80?text=C' }
    ],
    'uslugi': [
      { title: 'Kafelek X', desc: 'Opis kafelka X', image: 'https://placehold.co/80x80?text=X' },
      { title: 'Kafelek Y', desc: 'Opis kafelka Y', image: 'https://placehold.co/80x80?text=Y' },
      { title: 'Kafelek Z', desc: 'Opis kafelka Z', image: 'https://placehold.co/80x80?text=Z' }
    ],
    'kontakt': [
      { title: 'Kafelek K1', desc: 'Opis kafelka K1', image: 'https://placehold.co/80x80?text=K1' },
      { title: 'Kafelek K2', desc: 'Opis kafelka K2', image: 'https://placehold.co/80x80?text=K2' },
      { title: 'Kafelek K3', desc: 'Opis kafelka K3', image: 'https://placehold.co/80x80?text=K3' }
    ]
  }
};

// Funkcja do ładowania danych
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Błąd przy ładowaniu danych:', error);
  }
  return DEFAULT_DATA;
}

// Funkcja do zapisania danych
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Błąd przy zapisywaniu danych:', error);
    return false;
  }
}

// ==== API ENDPOINTS ====

// GET - Pobierz dane strony
app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

// POST - Logowanie
app.post('/api/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Hasło jest wymagane' });
  }

  // Porównaj hasło
  if (bcryptjs.compareSync(password, ADMIN_PASSWORD_HASH)) {
    // Wygeneruj prosty token (w produkcji użyj JWT)
    const token = Buffer.from(password + Date.now()).toString('base64');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Niepoprawne hasło' });
  }
});

// POST - Zaktualizuj logo
app.post('/api/update-logo', (req, res) => {
  const { logo, token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Nie jesteś zalogowany' });
  }

  if (!logo) {
    return res.status(400).json({ error: 'Logo jest wymagane' });
  }

  try {
    const data = loadData();
    data.logo = logo;
    
    if (saveData(data)) {
      res.json({ success: true, message: 'Logo zostało zaktualizowane' });
    } else {
      res.status(500).json({ error: 'Błąd przy zapisywaniu' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// POST - Zaktualizuj kafelek
app.post('/api/update-tile', (req, res) => {
  const { section, index, title, desc, image, token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Nie jesteś zalogowany' });
  }

  if (!section || index === undefined) {
    return res.status(400).json({ error: 'Brakuje parametrów' });
  }

  try {
    const data = loadData();

    if (!data.sections[section] || !data.sections[section][index]) {
      return res.status(404).json({ error: 'Kafelek nie znaleziony' });
    }

    // Zaktualizuj kafelek
    data.sections[section][index] = {
      title: title || data.sections[section][index].title,
      desc: desc || data.sections[section][index].desc,
      image: image || data.sections[section][index].image
    };

    if (saveData(data)) {
      res.json({ success: true, message: 'Kafelek został zaktualizowany' });
    } else {
      res.status(500).json({ error: 'Błąd przy zapisywaniu' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// GET - Główna strona
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✓ Serwer uruchomiony na http://localhost:${PORT}`);
  console.log(`✓ Domyślne hasło: admin123 (ZMIEŃ W PRODUKCJI!)`);
  console.log(`✓ Dane zapisywane w: ${DATA_FILE}`);
});
