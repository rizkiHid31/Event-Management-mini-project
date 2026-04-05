# Script Presentasi — Master Event
> Durasi estimasi: 8–12 menit

---

## PEMBUKAAN (30 detik)

"Halo semua, saya akan mempresentasikan project mini saya yang bernama **Master Event** — sebuah aplikasi web full-stack untuk manajemen event. Aplikasi ini memungkinkan pengguna untuk menjelajahi event, membeli tiket, dan bagi penyelenggara, dapat membuat dan mengelola event mereka sendiri."

---

## 1. GAMBARAN UMUM APLIKASI (1 menit)

"Master Event memiliki dua jenis pengguna utama:

- **Customer** — bisa browsing event, beli tiket, bayar via Transfer, Wallet, atau Points, dan menulis review.
- **Organizer** — bisa membuat event, mengelola pesanan masuk, melihat statistik, dan mengelola voucher diskon.

Aplikasi ini dibangun dengan arsitektur **full-stack terpisah** — frontend dan backend berjalan secara independen dan berkomunikasi melalui REST API."

---

## 2. ARSITEKTUR SISTEM (2 menit)

*[Tunjuk diagram arsitektur di layar]*

"Kalau kita lihat arsitekturnya, ada tiga bagian utama:

**Frontend** di folder `web/` dibangun dengan React 19 dan Vite. Di sini ada layer Pages, Route Guards, Components, Custom Hooks, State Management dengan Zustand, dan API layer menggunakan Axios.

**Backend** di folder `api/` dibangun dengan Express.js. Strukturnya mengikuti pola yang jelas:
- **Routes** — mendefinisikan endpoint
- **Middleware** — menangani autentikasi, validasi input, upload file, dan rate limiting
- **Controllers** — menerima request dan kirim response
- **Services** — di sinilah semua business logic berada

Kemudian backend berkomunikasi ke database melalui **Prisma ORM**, yang terhubung ke **PostgreSQL** di Supabase.

Ada juga **Redis** yang digunakan untuk dua hal: menyimpan token reset password, dan sebagai message broker untuk **BullMQ** — queue system yang menangani expired order secara otomatis."

---

## 3. TECH STACK (1 menit)

*[Tunjuk bagian Tech Stack]*

"Berikut teknologi yang saya gunakan:

Di **frontend**: React 19, Vite, TypeScript, Zustand untuk state management, Tailwind CSS untuk styling, dan React Router v7 untuk routing.

Di **backend**: Express.js dengan TypeScript, Prisma ORM, PostgreSQL, Redis, dan BullMQ untuk job queue.

Untuk layanan eksternal: Cloudinary untuk penyimpanan gambar, Resend untuk mengirim email notifikasi, dan JWT untuk autentikasi."

---

## 4. ALUR REQUEST (1,5 menit)

*[Tunjuk bagian Request Flow]*

"Mari kita lihat bagaimana sebuah request berjalan di sistem ini. Misalnya saat user menekan tombol 'Beli Tiket':

1. React di browser memanggil fungsi `handleOrder`
2. **Axios client** mengirim HTTP POST ke endpoint `/api/orders`
3. **Express Router** menerima dan meneruskan ke middleware
4. **Middleware Auth** memverifikasi JWT token — apakah user sudah login?
5. **Middleware Validate** mengecek data dengan Zod — apakah data valid?
6. **Controller** menerima request yang sudah bersih, memanggil service
7. **Service** menjalankan business logic: cek ketersediaan kursi, hitung diskon voucher, potong points jika ada, buat order
8. **Prisma** mengeksekusi query ke **PostgreSQL**
9. Response dikirim balik ke frontend

Secara paralel, ada **BullMQ queue** yang bekerja di background — jika order tidak dibayar dalam 2 jam, worker otomatis mengubah status jadi EXPIRED dan mengembalikan kursi ke event."

---


## 6. STRUKTUR FILE (1 menit)

*[Tunjuk bagian File Tree]*

"Dari sisi struktur file, saya mengikuti konvensi yang umum digunakan di industri.

Di **frontend**, ada pemisahan yang jelas antara `pages/`, `components/`, `hooks/`, `store/`, dan `api/`. Route guards seperti `AuthRoute`, `CustomerRoute`, dan `OrganizerRoute` memastikan halaman hanya bisa diakses oleh user yang berhak.

Di **backend**, setiap domain punya file terpisah: `auth.route.ts`, `auth.controller.ts`, `auth.service.ts`. Ini membuat kode mudah di-maintain dan di-scale."

---

## PENUTUP (30 detik)

"Itu adalah gambaran keseluruhan dari project **Master Event**. Meski ini project pertama saya dalam skala full-stack, saya belajar banyak tentang bagaimana membangun sistem yang memiliki banyak moving parts — mulai dari autentikasi, payment flow, background job, hingga email notification.

Terima kasih, saya siap menjawab pertanyaan."

---

## ANTISIPASI PERTANYAAN

**Q: Kenapa pakai Zustand bukan Redux?**
> "Zustand lebih ringan dan simple untuk project ukuran ini. Setup-nya minimal tapi tetap punya fitur persist untuk menyimpan session user."

**Q: Kenapa PostgreSQL bukan MongoDB?**
> "Data di aplikasi ini relasional — user punya orders, orders punya voucher, event punya reviews. PostgreSQL lebih cocok karena bisa enforce relasi dan constraint dengan baik."

**Q: Bagaimana keamanan aplikasinya?**
> "Saya menggunakan JWT untuk autentikasi, bcrypt untuk hash password, Zod untuk validasi input di setiap endpoint, rate limiting untuk mencegah abuse, dan role-based access control agar endpoint organizer tidak bisa diakses oleh customer."

**Q: Apa tantangan terbesar saat membangun ini?**
> "Payment flow — mengelola berbagai kombinasi metode pembayaran, voucher, dan points secara bersamaan cukup kompleks. Saya juga perlu memahami bagaimana database transaction bekerja untuk memastikan konsistensi data."
