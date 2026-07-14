# Stardew Share — Developer Branding Guide

Semua konfigurasi branding (logo, background, nama situs) diatur di satu file:

> **`src/siteConfig.js`**

---

## 📁 Struktur file gambar

Letakkan file gambar di folder **`public/`** di root project:

```
Akash/
├── public/
│   ├── logo.png       ← logo navbar
│   └── bg.png         ← background texture/image
└── src/
    └── siteConfig.js  ← konfigurasi utama
```

---

## 🖼️ Logo bawaan

File `logo.png` yang sudah disiapkan:

- Ukuran tampil: **36 × 36 px** di navbar
- Format yang didukung: PNG, SVG, WebP, JPG
- Jika `logo` di-set `null`, akan muncul emoji fallback 🌾

---

## 🔧 Cara ganti logo

1. Letakkan file logo baru di `public/` (contoh: `public/mylogo.png`)
2. Buka `src/siteConfig.js`
3. Ubah nilai `logo`:
   ```js
   logo: '/mylogo.png',
   ```

---

## 🌄 Cara ganti background

**Option A — Warna solid saja:**
```js
background: {
  bgColor: '#1a1a2e',
  bgImage: null,
}
```

**Option B — Gambar/tekstur saja:**
```js
background: {
  bgColor: '#0f1a12',
  bgImage: '/mybg.png',
  bgRepeat: 'repeat',
  bgSize: 'auto',
}
```

**Option C — Gambar + fallback warna:**
```js
background: {
  bgColor: '#0f1a12',  // ditampilkan jika gambar gagal dimuat
  bgImage: '/mybg.png',
  bgRepeat: 'no-repeat',
  bgSize: 'cover',
}
```

---

## 🎨 Ganti warna aksen

```js
accentColor: '#6abf69',   // warna highlight / link / active
brandColor:  '#4e9a5e',   // warna tombol utama
```

---

## 📌 Setup awal: salin gambar bawaan

Jalankan perintah ini sekali di root project untuk menyalin gambar default:

```powershell
# Di PowerShell, dari folder d:\AntiGravityCode\Akash
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/assets/logo.png" -OutFile "public/logo.png"
```

Atau cukup **letakkan manual** file `logo.png` dan `bg.png` ke dalam folder `public/`.
