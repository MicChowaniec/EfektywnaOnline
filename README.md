# Efektywna Online - Panel Administracyjny

## 🚀 Jak uruchomić serwer

### 1. Instalacja zależności
```bash
npm install
```

### 2. Uruchomienie serwera
```bash
npm start
```

Serwer będzie dostępny na: **http://localhost:3000**

## 🔐 Logowanie

**Domyślne hasło:** `admin123`

⚠️ **ZMIEŃ HASŁO W PRODUKCJI!**

Aby zmienić hasło, edytuj plik `server.js` i zmień linię:
```javascript
const ADMIN_PASSWORD_HASH = bcryptjs.hashSync('TWOJE_NOWE_HASŁO', 10);
```

## 📋 Funkcjonalności

### Panel Administracyjny
- ✅ **Logowanie** - Wymagane hasło do dostępu do panelu
- ✅ **Edycja Logo** - Zmiana logo na stronie
- ✅ **Edycja Kafelków** - Zmiana tytułu, opisu i obrazka kafelków
- ✅ **Zapis na Serwer** - Wszystkie zmiany zapisywane w `site-data.json`
- ✅ **Wylogowywanie** - Bezpieczne wylogowanie z panelu

### Strona Główna
- 📖 Domyślnie widoczna bez dostępu do edycji (read-only)
- 🔒 Panel admin dostępny tylko dla zalogowanych użytkowników

## 📁 Struktura Plików

```
EfektywnaOnline/
├── index.html           # Strona główna + panel admin
├── style.css            # Style CSS
├── admin-panel.js       # Logika panelu administracyjnego
├── tiles-lazy.js        # Animacja lazy loading kafelków
├── server.js            # Backend Express
├── package.json         # Dependencje Node.js
├── site-data.json       # Zapisane dane (generowana automatycznie)
└── SeanSlab.woff        # Czcionka
```

## 🔧 API Endpoints

### GET /api/data
Pobiera wszystkie dane strony (logo, kafelki)

### POST /api/login
Logowanie do panelu
```javascript
{ "password": "admin123" }
```

### POST /api/update-logo
Zaktualizuj logo
```javascript
{ "logo": "url_do_obrazka", "token": "token" }
```

### POST /api/update-tile
Zaktualizuj kafelek
```javascript
{
  "section": "o-mnie",
  "index": 0,
  "title": "Nowy tytuł",
  "desc": "Nowy opis",
  "image": "url_do_obrazka",
  "token": "token"
}
```

## 💾 Zapis Danych

Wszystkie dane są zapisywane w pliku `site-data.json` w formacie JSON:
```json
{
  "logo": "url_do_logo",
  "sections": {
    "o-mnie": [
      {"title": "...", "desc": "...", "image": "..."}
    ]
  }
}
```

## 🐛 Troubleshooting

### Port 3000 jest zajęty
Zmień port w `server.js`:
```javascript
const PORT = 3001; // lub inny port
```

### CORS errors
Upewnij się, że `http://localhost:3000` jest dostępny w przeglądarce

### Node.js nie zainstalowany
Pobierz i zainstaluj z: https://nodejs.org

## 📝 Uwagi
- Dane przechowywane w `site-data.json` (baz danych)
- Session token przechowywany w `sessionStorage` przeglądarki
- Domyślnie strona jest read-only bez logowania
