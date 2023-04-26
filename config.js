const { create, client, Client } = require('@open-wa/wa-automate')
const options = require('./lib/options.js')
const fs = require('fs-extra')
const dataVarian = JSON.parse(fs.readFileSync('./lib/varProduk.json'))
const getData = JSON.parse(fs.readFileSync('./lib/lib.json'))
const dataLinkSup = JSON.parse(fs.readFileSync('./lib/dataSup.json'))
const dataEnd = require('./index.js')
const cron = require('node-cron')
const request = require('request')
const pin = 'monyet'
const { teksOwner, teksList} = require('./lib/teks.js')
async function beep(buzzer, timer){
 function sleep(timer){
  return new Promise(resolve => setTimeout(resolve, timer))
 }
 const config = JSON.parse(fs.readFileSync('./lib/config.json'))
 if(config.mute==false){
  await buzzer.writeSync(1)
  await sleep(timer)
  await buzzer.writeSync(0)
 }
}
function sleep(ms){
 return new Promise(resolve => setTimeout(resolve, ms))
}
const start = async(client = new Client()) => {
 const buzzer = 'babi'
 const date = new Date()
 await client.onStateChanged((state)=>{
  console.log('[Status Klien]',state)
  if(state==='CONFLICT'||state==='UNLAUNCHED'){
   client.forceRefocus()
  }
 })
 cron.schedule("0 */12 * * *", async()=>{
  const getDataSchedule = JSON.parse(fs.readFileSync('./lib/config.json'))
  if(getDataSchedule.aktifitas){
    await client.sendText(getDataSchedule.ownerNumber,'Maaf sepertinya jadwal kamu tertunda karena akses penuh, pergantian stock dilewati')
  }else{
    fs.writeFileSync('./lib/config.json',JSON.stringify({mute:getDataSchedule.mute,prefix:getDataSchedule.mute,banned:getDataSchedule.banned,aktifitas:true}))
    await client.sendText(getDataSchedule.ownerNumber,'*[READY PERGANTIAN STOCK]*\n\nPergantian stock telah dimulai, jika semua sudah benar dan lancar maka akan saya informasikan lagi!')
    await client.sendText(getDataSchedule.ownerNumber, dataEnd.changeStock(buzzer, client))
    fs.writeFileSync('./lib/config.json',JSON.stringify({mute:getDataSchedule.mute,prefix:getDataSchedule.mute,banned:getDataSchedule.banned,aktifitas:false}))
  }
 })
 client.onMessage(async(message)=>{
   const getConfig = JSON.parse(fs.readFileSync('./lib/config.json'))
   const command = message.body.toLowerCase().split(' ')[0]||''
   const { id, from, body, pushname, shortName } = message
   const args = message.body.split(' ')
   dataEnd.tanggapanSesi(id, body, client)
   switch(command){
    case getConfig.prefix+"listvarian":
    case getConfig.prefix+"varianlist":
    case getConfig.prefix+"listvar":
    case getConfig.prefix+"varian":
     if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
     var text = 'Berikut Listnya! '
     for(let g=0;g<dataVarian.length;g++){
      text+='\n\n'+dataVarian[g].name+' : '
      for(let r=0;r<dataVarian[g].value.length;r++){
       text+=dataVarian[g].value[r]+', '
      }
     }
     client.reply(from, text, id)
     break
     case getConfig.prefix+'beep':
     case getConfig.prefix+'beep!':
     case getConfig.prefix+'bunyikan':
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      const config = JSON.parse(fs.readFileSync('./lib/config.json'))
      if(config.mute == false){ 
       for(let g=0;g<3;g++){
        await beep(buzzer, 1000)
        await sleep(1000)
       }
       await client.reply(from, 'Sudah!', id)
       await buzzer.unexport()
      }else{
       await client.reply(from, 'MODE SENYAP!', id)
      }
      break
     case getConfig.prefix+'linksup':
     case getConfig.prefix+'linksupplier':
     case getConfig.prefix+'linksuplier':
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      var dataLinkText = ''
      for(let g=0;g<dataLinkSup.length;g++){
       dataLinkText+=dataLinkSup[g].dataSku+' : '+dataLinkSup[g].sup+'\n'
      }
      await client.reply(from, dataLinkText, id)
      break
     case getConfig.prefix+'addlink':
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      const loadData = JSON.parse(fs.readFileSync('./lib/dataSup.json'))
      if(args[1].includes('y')){
       const getLink = args[2]
       const boolLink = getLink.includes('https://shopee.co.id')
       if(!boolLink) return client.reply(from, 'Maaf link tidak valid', id)
       await request(getLink, async (error, response)=>{
        if(!error&&response.statusCode==200){
         var arrayId = []
         var valArray = []
         var idValue
         for(let g=0;g<loadData.length;g++){
          if(Number(loadData[g].dataSku.split('ID')[1])!==NaN){
           arrayId.push(loadData[g].dataSku)
          }
          if(getLink==loadData[g].sup){
           await client.reply(from, 'Maaf Data telah ada', id)
          }
          valArray.push({dataSku : loadData[g].dataSku, sup : loadData[g].sup})
         }
         if(arrayId.length<10){
           idValue = `ID0000${arrayId.length}` 
        }else if(arrayId.length<=100&&arrayId.length>=10){
           idValue = `ID000${arrayId.length}` 
        }else if(arrayId.length<=1000&&arrayId.length>=100){
           idValue = `ID00${arrayId.length}` 
        }valArray.push({dataSku : idValue, sup : getLink})
          fs.writeFileSync('./lib/dataSup.json',JSON.stringify(valArray))
         await client.reply(from, `*[INFORMASI DATA MASUK]*\n\nSku : ${idValue}\nLink : ${getLink}\n\nTelah tersimpan..!`, id)
        }else{
         client.reply(from, 'Mohon maaf, link tidak bisa diakses', id)
        }
       })
      }
      break
     case getConfig.prefix+"prefix":
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      const prefixChange = "#!$*~-/>."
      if(args[1]!=undefined){
       if(args[1].toLowerCase()=='change'||args[1].toLowerCase()=='ganti'){
        var boolPref = false
        for(let r=0;r<prefixChange.length;r++){
         if(prefixChange.split("")[r].includes(args[2])){
          boolPref=true
         }
        }
        if(boolPref==true){
         fs.writeFileSync('./lib/config.json',JSON.stringify({mute:getConfig.mute,prefix:args[2],banned:getConfig.banned,aktifitas:getConfig.aktifitas}))
         await client.reply(from, `*[PERGANTIAN PREFIX]*/n/nPrefix telah diganti ke "${args[2]}" mohon untuk menggunakan perintah diutamakan dengan prefix!`,id)
        }else{
         await client.reply(from, 'Mohon maaf!, Prefix tidak sesuai\nPrefix yang valid adalah '+prefixChange,id)
        }
       }
      }else{
       await client.reply(from, 'Maaf, berikan "change" utuk mengganti', id)
      }
      break
    case getConfig.prefix+"gantistock":
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      if(getData.aktifitas){
        await client.sendText(getData.ownerNumber,'Maaf sepertinya perintah kamu tertunda karena akses penuh, pergantian stock dilewati')
      }else{
        fs.writeFileSync('./lib/config.json',JSON.stringify({mute:getData.mute,prefix:getData.mute,banned:getData.banned,aktifitas:true}))
        await client.sendText(getData.ownerNumber,'*[READY PERGANTIAN STOCK]*\n\nPergantian stock telah dimulai, jika semua sudah benar dan lancar maka akan saya informasikan lagi!')
        await client.sendText(getData.ownerNumber, dataEnd.changeStock(buzzer, client))
        fs.writeFileSync('./lib/config.json',JSON.stringify({mute:getData.mute,prefix:getData.mute,banned:getData.banned,aktifitas:false}))
      }
    break
    case getConfig.prefix+"menu":
    case getConfig.prefix+"list":
    case getConfig.prefix+"start":
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      const date = new Date()
      const getJam = date.getHours()
      var greetingExpresion
      if(getJam>=4&&getJam<=11){
        greetingExpresion="Selamat Pagi"
      }else if(getJam>=12&&getJam<=13){
        greetingExpresion="Selamat Siang"
      }else if(getJam>=14&&getJam<=18){
        greetingExpresion="Selamat Sore"
      }else if((getJam>=19&&getJam<=23)||(getJam>=0&&getJam<=3)){
        greetingExpresion="Selamat Malam"
      }
      await client.reply(from, getData.teksList(greetingExpresion, pushname, getData.config), id)
    break
    case getConfig.prefix+'banlink':
    case getConfig.prefix+'bannedlink':
    case getConfig.prefix+'linkbanned':
    case getConfig.prefix+'linkban':
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      if(args[1].toLowerCase()=="add"||args[1].toLowerCase()=="tambah"){
        const dataBlockSup = JSON.parse(fs.readFileSync('./lib/config.json'))
        const dataSupplier = JSON.parse(fs.readFileSync('./lib/dataSup.json'))
        var getBoolDatSup = false
        var getIdSku
        for(let g=0;g<dataSupplier.length;g++){
          if(dataSupplier[g].dataSku.toLowerCase()==args[2].toLowerCase()){
            getBoolDatSup = true
            getIdSku = dataSupplier[g].dataSku
          }
        }
        if(getBoolDatSup){
          const getBoolBlockSup = dataBlockSup.banned.find(objek => objek.toLowerCase() === args[2].toLowerCase())
          if(getBoolBlockSup){
            await client.reply(from, 'Produk sudah di Block, pastikan untuk cek kembali!', id)
          }else{
            const dataBanned = []
            for(let g=0;g<dataBlockSup.banned.length;g++){
              dataBanned.push(dataBlockSup.banned[g])
            }
            dataBanned.push(getIdSku)
            const configAwal = {mute:dataBlockSup.mute,prefix:dataBlockSup.prefix,banned:dataBanned,aktifitas:dataBlockSup.aktifitas}
            fs.writeFileSync('./lib/config.json',JSON.stringify(configAwal))
            await client.reply(from, 'Produk telah diban!', id)
          }
        }else{
          await client.reply(from,'Maaf, Produk belum terdaftar pada bot kami!', id)
        }
      }else{
        await client.reply(from, 'Maaf fitur ini tidak akan berjalan jika tidak menambahkan dua parameter yaitu "Tambah" dan "Hapus"\n\nTambah : Untuk menambahkan list banned agar pergantian stock menolak pada sku yang anda masukkan\nHapus : Untuk menghapus list banned agar produk yang sebelumnya tidak dijalankan, maka sekarang akan berjalan sempurna', id)
      }
      break
     case getConfig.prefix+'senyap':
     case getConfig.prefix+'mute':
     case getConfig.prefix+'modesenyap':
      if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
      if(args[1].toLowerCase()=="on"||args[1].toLowerCase()=="hidup"||args[1].toLowerCase()=="hidupkan"||args[1].toLowerCase()=="aktif"||args[1].toLowerCase()=="aktifkan"){
       if(getConfig.mute==false){
        fs.writeFileSync('./lib/config.json',JSON.stringify({mute:true,prefix:getConfig.prefix,banned:getConfig.banned,aktifitas:getConfig.aktifitas}))
        await client.reply(from, '*[INFORMASI EDIT DATA]*\n\nMode Senyap telah diaktifkan!\nMode senyap!', id)
       }else if(getConfig.mute==true){
        await client.reply(from, 'Pc kamu sudah bermode senyap, jadi kamu tidak perlu mengaktifkan mode senyap lagi!', id)
       }
      }else if(args[1].toLowerCase()=="off"||args[1].toLowerCase()=="mati"||args[1].toLowerCase()=="matikan"||args[1].toLowerCase()=="nonaktif"||args[1].toLowerCase()=="nonaktifkan"){
       if(getConfig.mute==true){
        fs.writeFileSync('./lib/config.json',JSON.stringify({mute:false,prefix:getConfig.prefix,banned:getConfig.banned,aktifitas:getConfig.aktifitas}))
        await client.reply(from, '*[INFORMASI EDIT DATA]*\n\nMode Senyap telah dinonaktifkan!\nBeep bersuara!.',id)
       }else if(getConfig.mute==false){
        await client.reply(from, 'Buzzer kamu sudah menyala, kamu tidak perlu menyalakannya lagi!', id)
       }
      }
      break
      case getConfig.prefix+"tambahstock":
       if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
       const textSesi = {
        session: "#TP_REQLINK",
        info: "Meminta link",
        message: "Mohon untuk kirimkan link sekarang juga",
        ontime: {
         hour: date.getHours(),
         minute: date.getMinutes(),
         second: date.getSeconds(),
         date: date.getDate(),
         month: date.getMonth(),
         years: date.getFullYear()
        }
       }
       fs.writeFileSync('./lib/session.json',JSON.stringify([textSesi]))
       await client.reply(from, '*[TAMBAH PRODUK MANUAL]*\n\nKirimkan link shopee yang akan di tambah stock', id)
       break
       default:
        if(from!==getData.ownerNumber) return client.reply(from, teksOwner(), id)
        await client.reply(from, `Maaf, Perintah salah! kirim pesan *${getData.prefix}menu* untuk mengetahui semua fitur`, id)
     }
   })
}
create(options(true, start))
.then(client => start(client))
.catch((error) => console.log(error))
