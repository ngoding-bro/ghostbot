const teksOwner = () => {
    return `Maaf anda tidak memiliki izin akses untuk menjalankan bot ini!`
}
exports.teksOwner = teksOwner()
const teksList = (greetingExpresion, nameOfContact, prefix) => {
    return `Selamat ${greetingExpresion} ${nameOfContact}
Berikut adalah list-list fitur dari bot ini!
    
- *${prefix}listvarian* fitur ini digunakan untuk menampilkan singkatan singkatan dari varian produk yang ada di Id SKU

- *${prefix}beep* fitur ini digunakan untuk membunyikan sebuah Buzzer mini yang tertancap pada Raspberry PI 4, jika kamu memakai pc atau laptop maka fitur ini tidak akan berjalan

- *${prefix}linksup* fitur ini adalah fitur untuk menampilkan data data yang ada di Database lokal dengan Id SKU dan juga Link Supplier

- *${prefix}addlink* fitur yang wajib kamu gunakan ketika kamu ingin menambahkan produk di tokopedia, fitur ini secara otomatis tertata rapi dan pastikan link yang kamu masukkan mulai dari awal kamu melaksanakan penambahan produk
    
- *${prefix}prefix* fitur untuk mengganti prefix dan prefix hanya bisa diganti dengan simbol "#!$*~-/>."
    
- *${prefix}banlink* digunakan untuk mengeblock agar tidak dikerjakan pada produk tertentu, masukkan sesuai dengan id sku yang akan diblock
    
- *${prefix}senyap* untuk menonaktifkan suara beep pada Raspberry PI 4`
}
exports.teksList = teksList()