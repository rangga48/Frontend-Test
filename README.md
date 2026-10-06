# Geospatial Entity Management (Frontend)

Antarmuka web interaktif untuk menampilkan dan mengelola data entitas geospasial (Latitude & Longitude) pada peta secara real-time. Dibangun dengan fokus pada fungsionalitas, kemudahan penggunaan (*usability*), integrasi peta yang responsif, serta desain minimalis dan bersih (*clean & neutral design*).

---

## 1. Cara Menjalankan Program

### Prasyarat (*Prerequisites*)
- **Node.js**: v18.0.0 atau lebih baru (direkomendasikan Node.js v20+)
- **NPM**: v9.0.0 atau lebih baru
- **Backend Service**: Pastikan server backend berjalan pada `http://localhost:8080` (endpoint `/api/entities`).

### Langkah Instalasi & Menjalankan

1. **Clone / Buka Direktori Proyek**
   ```bash
   cd Frontend-Test
   ```

2. **Instalasi Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Konfigurasi Environment Variable**
   File `.env` sudah disediakan pada *root* proyek:
   ```env
   VITE_API_URL=/api
   ```
   > **Catatan Proxy:** Port development Vite (`5173`) telah dikonfigurasi dengan reverse proxy ke backend `http://localhost:8080` pada file `vite.config.ts`. Hal ini memastikan seluruh request API bebas dari isu **CORS** pada browser.

4. **Menjalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan dan dapat diakses di browser pada:
   **[http://localhost:5173/](http://localhost:5173/)**

5. **Kompilasi & Verifikasi Kode**
   - **Typecheck & Production Build**:
     ```bash
     npm run build
     ```
   - **Linting (ESLint)**:
     ```bash
     npm run lint
     ```

---

## 2. Alasan Pemilihan Library yang Digunakan

| Library / Tool | Alasan Pemilihan |
| :--- | :--- |
| **React 19 & TypeScript** | Menyediakan arsitektur komponen modular dan reaktif. TypeScript memberikan *type-safety* yang ketat terutama untuk validasi data geospasial (koordinat, DTO, status enum), mencegah *runtime bugs*, dan mempermudah pemeliharaan kode. |
| **Vite** | Build tool modern dengan kecepatan kompilasi dan *Hot Module Replacement* (HMR) yang instan. Memiliki fitur *dev server proxy* bawaan yang sangat krusial untuk meneruskan request ke backend lokal tanpa terhambat CORS policy. |
| **Leaflet & React Leaflet** | Standar industri pustaka pemetaan web yang ringan, stabil, dan fleksibel. Terintegrasi mulus dengan React untuk rendering marker, kontrol pan/zoom, popup, serta penyesuaian *custom SVG pin* berbasis status entitas tanpa membutuhkan dependensi berat. |
| **OpenStreetMap (OSM)** | Penyedia peta berbasis *open-source* yang gratis, tidak memerlukan kartu kredit atau API Key komersial (seperti Google Maps API), dan memiliki cakupan data spasial global yang akurat. |
| **Axios** | Pustaka HTTP client yang andal dengan dukungan otomatis untuk JSON parsing/stringifying, konfigurasi timeout, *error handling* terstandarisasi, dan kemudahan pembuatan instance API terpusat. |
| **Tailwind CSS (v4)** | Framework CSS *utility-first* yang efisien, memungkinkan penerapan desain minimalis, konsisten, dan terstruktur tanpa menambah ukuran file CSS yang membengkak. Memudahkan pengaturan warna status (Active: Hijau, Maintenance: Oranye, Inactive: Abu-abu). |

---

## 3. Workflow Penggunaan Agentic AI pada Pengerjaan Test Ini

Pada pengerjaan teknis ini, **Agentic AI (Google Antigravity)** digunakan sebagai **akselerator pengembangan (AI Pair Programmer & Autonomous Dev Agent)** dengan batasan dan alur kerja sebagai berikut:

### Batasan Penggunaan
- **Aplikasi Akhir Bebas AI**: Aplikasi web yang dihasilkan **100% merupakan software frontend deterministik konvensional**. Tidak ada dependensi AI, model LLM, prompt, atau agen runtime di dalam kode aplikasi.
- **Peran Agentic AI**: Berperan pada tahap *design-to-code*, *refactoring*, *testing automation*, dan *debugging* di lingkungan IDE pengembang.

### Alur Kerja (Workflow) yang Dijalankan oleh Agentic AI:
1. **Analisis PRD & Scaffolding Arsitektur**:
   - Membaca spesifikasi teknis dan menyusun arsitektur kode modular sesuai *best practice* React: pemisahan layer `components/`, `pages/`, `services/`, `hooks/`, `types/`, dan `utils/`.
2. **Implementasi Komponen & Validasi Geospasial**:
   - Mengembangkan form validasi ketat sebelum API call (Latitude -90 s/d 90, Longitude -180 s/d 180, nama dan status wajib diisi).
   - Mengimplementasikan fitur interaktif: klik pada peta untuk otomatis menangkap koordinat form.
   - Merancang custom SVG markers dengan warna dinamis sesuai status entitas.
3. **Integrasi Backend API & Penyesuaian Skema**:
   - Menghubungkan frontend ke endpoint Go backend (`http://localhost:8080/api/entities`).
   - Mengadaptasi skema request dan response spesifik backend:
     - Format payload POST & PUT dengan field `longtitude` (string) dan `latitude` (string).
     - Format status dalam *Title Case* (`Active`, `Inactive`, `Maintenance`).
     - Penggunaan query parameter `?id={id}` pada endpoint `DELETE` dan `PUT`.
   - Mengonfigurasi reverse proxy Vite untuk mengeliminasi kendala CORS browser.
4. **Automated Verification & Lint Compliance**:
   - Menjalankan build TypeScript (`tsc -b && vite build`) dan linter (`eslint .`).
   - Menyelesaikan *linter warnings* React Compiler (seperti penanganan *cascading renders* dan fast-refresh modularitas).
5. **UI Polishing & Problem Solving**:
   - Menganalisis isu benturan visual pada tombol close popup Leaflet marker yang sempat menimpa badge status, lalu memperbaikinya dengan penyesuaian padding `pr-7` dan styling tombol close kustom.

---

## 4. Status Fitur & Definition of Done (DoD)

Semua fitur yang tercantum pada PRD dan integrasi backend telah **selesai 100%**:

- [x] **Peta Geospasial Berjalan**: OpenStreetMap & Leaflet aktif dengan kemampuan pan & zoom.
- [x] **Marker Entitas Backend**: Data dari backend `http://localhost:8080/api/entities` dirender sebagai marker sesuai koordinat dan warna status.
- [x] **Interaksi Marker & Popup**: Klik marker membuka popup informatif dengan tombol pintas *"View Details"*.
- [x] **Detail Side Panel**: Menampilkan nama, tipe, status badge, koordinat, deskripsi lengkap, serta aksi Edit & Delete.
- [x] **Create Entity (POST)**: Form modal dengan validasi lengkap dan opsi klik peta untuk memilih titik lokasi.
- [x] **Update Entity (PUT)**: Edit data entitas via query parameter `?id=...` dan payload yang sesuai.
- [x] **Delete Entity (DELETE)**: Dialog konfirmasi penghapusan untuk mencegah ketidaksengajaan.
- [x] **State Feedback**: Indikator loading, empty state jika belum ada data, serta toast notifikasi sukses/gagal.
- [x] **Anti-CORS Reverse Proxy**: Komunikasi lancar antara frontend (port 5173) dan backend (port 8080).
- [x] **UI Minimalis**: Dominan putih/netral, warna terfokus pada tombol aksi dan status (Active: Hijau, Maintenance: Oranye, Inactive: Abu-abu, Primary: Biru, Delete: Merah).

---

## 5. Struktur Direktori Proyek

```
Frontend-Test/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── ConfirmDialog.tsx # Modal konfirmasi aksi hapus
│   │   ├── EntityDetail.tsx  # Side panel informasi detail entitas
│   │   ├── EntityForm.tsx    # Modal form tambah & ubah entitas
│   │   └── EntityMap.tsx     # Komponen peta Leaflet & custom marker
│   ├── hooks/
│   │   └── useEntities.ts    # Custom hook manajemen state & operasi CRUD
│   ├── pages/
│   │   └── EntityPage.tsx    # Halaman utama (Header, Peta, Kontrol Status)
│   ├── services/
│   │   └── entityApi.ts      # Axios service untuk komunikasi API backend
│   ├── types/
│   │   └── entity.ts         # TypeScript interface, model, dan DTO
│   ├── utils/
│   │   └── entityHelpers.ts  # Helper styling badge dan normalisasi status
│   ├── App.tsx               # Root component
│   ├── index.css             # Konfigurasi Tailwind CSS v4 & custom Leaflet styles
│   └── main.tsx              # Entry point aplikasi React
├── .env                     # Konfigurasi environment (VITE_API_URL)
├── eslint.config.js         # Konfigurasi ESLint & React Compiler rules
├── package.json             # Dependensi dan script proyek
├── tsconfig.json            # Konfigurasi TypeScript
├── vite.config.ts           # Konfigurasi Vite & reverse proxy backend
└── README.md                # Dokumentasi proyek
```
