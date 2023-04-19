const puppeteer = require('puppeteer-extra')
const { executablePath } = require('puppeteer')
const fs = require("fs-extra")
const { table } = require('table')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(stealthPlugin())
const request = require('request')
const libDataPrib = JSON.parse(fs.readFileSync('./lib/lib.json'))
const linkSupplier = JSON.parse(fs.readFileSync('./lib/dataSup.json'))
const varianUtama = JSON.parse(fs.readFileSync('./lib/varProduk.json'))
function truncateText(text){
 if(text.length>27){
  return text.substring(0,27)+"..."
 }else{
  return text
 }
}
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
async function configBrowser(){
  const googleUsername = libDataPrib.username
  const googlePassword = libDataPrib.password
  const browser = await puppeteer.launch({
   headless: false,
   args: [
    '--no-sandbox',
    '--disable-gpu',
    '--enable-gpu',
   ],
   executablePath: executablePath(),
   userDataDir: 'C:/Users/dwiin/ghostbot/session'
  })
  const loginUrl = 'https://accounts.google.com/AccountChooser?service=mail&continue=https://google.com&hl=en'
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'; 
  const page = await browser.newPage();
   await page.setDefaultNavigationTimeout(0)
   await page.setUserAgent(ua);
   await page.goto(loginUrl, { waitUntil: 'networkidle2' });
   await page.waitForTimeout(5000)
   return {browser, page}
 }
      
const changeStock = async (buzzer) => {
 try{
  var bool = 'TIDAK_AKTIF'
  const {browser, page} = await configBrowser()
  const tokopediaPage = page
  await tokopediaPage.goto('https://seller.tokopedia.com/')
  beep(buzzer, 200)
  await tokopediaPage.waitForTimeout(15000)
  await tokopediaPage.click('#sidebar-wrapper > div > nav > div:nth-child(2) > li:nth-child(5) > ul > li:nth-child(2) > a > span')
  .catch(()=>{
   tokopediaPage.click('#sidebar-wrapper > div > nav > div:nth-child(2) > li:nth-child(5) > ul > li:nth-child(2) > div > span')
  })
  beep(buzzer, 200)
  await tokopediaPage.waitForTimeout(10000)
  const getAllProductItem = await tokopediaPage.evaluate(()=>document.querySelector('#merchant-root div div.content-container div section div.css-ckbpxp-unf-tab-wrapper.ehv0kkf0 div button.css-3lvael.ehv0kkf3 p span').innerHTML)
  var getLoopToGetAllProduct
  const getAllProductParamToTokped = getAllProductItem.split('(')[1].split(')')[0]
  console.log(getAllProductParamToTokped)
  do{
   getLoopToGetAllProduct = await tokopediaPage.$$('.css-1993fdz')
   console.log(getLoopToGetAllProduct.length>parseInt(getAllProductParamToTokped))
   if(getLoopToGetAllProduct.length<parseInt(getAllProductParamToTokped)){
    const previousHeight = await tokopediaPage.evaluate('document.body.scrollHeight')
    await tokopediaPage.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    await tokopediaPage.waitForFunction(`document.body.scrollHeight > ${previousHeight}`)
    await new Promise((resolve)=>setTimeout(resolve, 15000))
   }
  }while(getLoopToGetAllProduct.length>parseInt(getAllProductParamToTokped))
  console.log("tes")
  await tokopediaPage.waitForTimeout(5000)
  var textTable = [["Nomor","Nama","Sku","Var","Bfore","Aftr"]]
  let idx = 0
  var textReturn = ''
  do{
    console.log("tes coi")
   beep(buzzer, 200)
   const getIndexBool = getLoopToGetAllProduct[idx]
   const boolVarianItems = await tokopediaPage.evaluate(getIndexBool => document.body.contains(getIndexBool.querySelector('div.css-ru3gk0 div div div.css-2zwm76.e19by5ca1 h5')), getIndexBool)
   const getNamaBarang = await tokopediaPage.evaluate(getIndexBool => getIndexBool.querySelector('div.css-eniub8.e19by5ca0 div.css-196kfws.e19by5ca1 div div.css-k008qs div.css-uroh7h div.styPLCProductNameInfo a h5').innerHTML, getIndexBool)
   if(!boolVarianItems){
    console.log("barang masuk sini")
    const getSkuBarang = await tokopediaPage.evaluate(getIndexBool => getIndexBool.querySelector('.css-cias66 p span').innerHTML, getIndexBool)
    const getStockBarang = await tokopediaPage.evaluate(getIndexBool => getIndexBool.querySelector('div.css-fb90vp.e19by5ca1 div div div div div input').getAttribute('value'), getIndexBool)
    var getLinkSup
    const config = JSON.parse(fs.readFileSync('./lib/config.json'))
    for(let g=0;g<linkSupplier.length;g++){
     if(linkSupplier[g].dataSku.toLowerCase().includes(getSkuBarang.toLowerCase())){
      if(config.banned.includes(linkSupplier[g].dataSku)){
        getLinkSup = linkSupplier[g].sup
      }
     }
    }
    const shopeePage = await browser.newPage()
    beep(buzzer, 300)
    await shopeePage.goto(getLinkSup, {timeout:0})
    await shopeePage.waitForTimeout(20000)
    const getStock = await shopeePage.evaluate(()=>document.querySelector('#main div div:nth-child(3) div:nth-child(1) div div div div.product-briefing.flex.card.s9-a-0 div.flex.flex-auto.RBf1cu div div.h-y3ij div div.flex.rY0UiC.j9be9C div div div.flex.items-center div:nth-child(2)').innerHTML)
    const getNumberStock = await getStock.split(' ')[1]
    await tokopediaPage.type(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div > div.css-fb90vp.e19by5ca1 > div > div > div > div > div > input`,getNumberStock)
    beep(buzzer, 500)
    await textTable.push([`${idx+1}`,truncateText(getNamaBarang),getSkuBarang,'-',getStockBarang,getNumberStock])
    textReturn+=`${idx+1}.\t${truncateText(getNamaBarang)}\nSKU\t: ${getSkuBarang}\nVarian\t: -\nBefore\t: ${getStockBarang}\nAfter\t: ${getNumberStock}\n\n`
    await shopeePage.close()
   }else{
    await tokopediaPage.click(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div.css-ru3gk0 > div > div > div.css-1702nmo.e19by5ca1 > div > svg`)
    beep(buzzer, 100)
    await tokopediaPage.waitForTimeout(10000)
    const getVarian = await getIndexBool.$$('div.css-wo4tdh.e19by5ca0')
    const shopeePage = await browser.newPage()
    beep(buzzer, 300)
    for(let b=0;b<getVarian.length;b++){
     console.log("Looping pertama")
     const getVarianArr = getVarian[b]
     const getStockVarr = await tokopediaPage.evaluate(getVarianArr => getVarianArr.querySelector('div.css-2eodbt.e19by5ca1 div div div div div input').getAttribute('value'), getVarianArr)
     const getNamaVarian = await tokopediaPage.evaluate(getVarianArr => getVarianArr.querySelector('div.css-1qir7n3 div div h5').innerHTML, getVarianArr)
     const getSkuIdx = await tokopediaPage.evaluate(getVarianArr => getVarianArr.querySelector('div.css-6idl0y div.css-cias66 p span').innerHTML, getVarianArr)
     var getSkuVarian = getSkuIdx.split('-')[1]
     const getSku = getSkuIdx.split('-')[0]
     var boolOptional1=false, getOptional1, getSkuLink
     console.log(getSkuIdx)
      if(getSkuIdx.includes("|")){
      console.log("ini true ya anjir")
      boolOptional1=true
      getOptional1=getSkuIdx.split("|")[1]
      getSkuVarian = getSkuVarian.split("|")[0]
     }
     for(let g=0;g<linkSupplier.length;g++){
      if(linkSupplier[g].dataSku.includes(getSku)){
       getSkuLink = linkSupplier[g].sup
      }
     }
     await shopeePage.goto(getSkuLink, {timeout:0})
     beep(buzzer, 100)
     await shopeePage.waitForTimeout(20000)
     const getArrayVarianShopee = await shopeePage.$$('.flex.items-center:nth-child(1) .flex.items-center.bR6mEk button.product-variation')
     console.log(getArrayVarianShopee)
     for(let c=0;c<getArrayVarianShopee.length;c++){
      console.log("Looping kedua")
      const getVarianShopee = getArrayVarianShopee[c]
      await shopeePage.waitForTimeout(2000)
      const getnamaBarangShopee = await shopeePage.evaluate(getVarianShopee => getVarianShopee.innerHTML, getVarianShopee)
      const boolStockKosong = await shopeePage.evaluate(getVarianShopee => getVarianShopee.getAttribute('class'), getVarianShopee)
      for(let a=0;a<varianUtama.length;a++){
        if(varianUtama[a].name.toLowerCase()==getSkuVarian.toLowerCase()){
          const valueVar = varianUtama[a].value.map(element => {return element.toLowerCase()}) 
          if(valueVar.includes(getnamaBarangShopee.toLowerCase())){
            console.log("Ini nama barang shopee")
            if(boolStockKosong.includes('product-variation--disabled')){
              console.log("ini disabled")
              await tokopediaPage.type(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div.css-1gmcosb > div.css-1t1xv2g > div:nth-child(${b+1}) > div.css-2eodbt.e19by5ca1 > div > div > div > div > div > input`,'0')
              beep(buzzer,500)
              await textTable.push([`${idx+1}.${b+1}`,truncateText(getNamaBarang),getSkuIdx,getNamaVarian,getStockVarr,'0'])
              textReturn+=`${idx+1}.${b+1}.\t${truncateText(getNamaBarang)}\nSKU\t: ${getSkuIdx}\nVarian\t: ${getNamaVarian}\nBefore\t: ${getStockVarr}\nAfter\t: 0\n\n`
            }else{
              await shopeePage.click(`#main > div > div:nth-child(3) > div:nth-child(1) > div > div > div > div.product-briefing.flex.card.s9-a-0 > div.flex.flex-auto.RBf1cu > div > div.h-y3ij > div > div.flex.rY0UiC.j9be9C > div > div:nth-child(1) > div > button:nth-child(${c+1})`)
              beep(buzzer,200)
              console.log("ngetes")
              if(boolOptional1){
                console.log("ini jalan deh")
                const getOptionalArray1 = await shopeePage.$$(".flex.items-center:nth-child(2) .flex.items-center.bR6mEk button.product-variation")
                for(let y=0;y<getOptionalArray1.length;y++){
                  const getOptionalDone1 = getOptionalArray1[y]
                  const getNamaOptionalShopee1 = await shopeePage.evaluate(getOptionalDone1 => getOptionalDone1.innerHTML, getOptionalDone1)
                  const boolStockOptionalKosong1 = await shopeePage.evaluate(getOptionalDone1 => getOptionalDone1.getAttribute('class'), getOptionalDone1)
                  const boolOption1Variasi = boolStockOptionalKosong1.includes("product-variation--disabled")
                  console.log("ini jalan")
                  if(getNamaOptionalShopee1==getOptional1){
                    console.log("ini jalan akhir")
                    await shopeePage.waitForTimeout(8000)
                    if(!boolOption1Variasi){
                      console.log("ini jalan akhir bgt")
                      await shopeePage.click(`#main > div > div:nth-child(3) > div:nth-child(1) > div > div > div.container > div.product-briefing.flex.card.s9-a-0 > div.flex.flex-auto.RBf1cu > div > div.h-y3ij > div > div.flex.rY0UiC.j9be9C > div > div:nth-child(2) > div > button:nth-child(${y+1})`)
                      await shopeePage.waitForTimeout(2000)
                      const getStock = await shopeePage.evaluate(()=>document.querySelector('#main > div > div:nth-child(3) > div:nth-child(1) > div > div > div.container > div.product-briefing.flex.card.s9-a-0 > div.flex.flex-auto.RBf1cu > div > div.h-y3ij > div > div.flex.rY0UiC.j9be9C > div > div.flex.items-center._6lioXX > div.flex.items-center > div:nth-child(2)').innerHTML)
                      const getStockValue = getStock.split(" ")[1]
                      await tokopediaPage.type(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div.css-1gmcosb > div.css-1t1xv2g > div:nth-child(${b+1}) > div.css-2eodbt.e19by5ca1 > div > div > div > div > div > input`,getStockValue)
                      beep(buzzer,500)
                      await textTable.push([`${idx+1}.${b+1}`,truncateText(getNamaBarang),getSkuIdx,getNamaVarian,getStockVarr,getStockValue])
                      textReturn+=`${idx+1}.${b+1}.\t${truncateText(getNamaBarang)}\nSKU\t: ${getSkuIdx}\nVarian\t: ${getNamaVarian}\nBefore\t: ${getStockVarr}\nAfter\t: ${getStockValue}\n\n`
                    }else{
                      await tokopediaPage.type(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div.css-1gmcosb > div.css-1t1xv2g > div:nth-child(${b+1}) > div.css-2eodbt.e19by5ca1 > div > div > div > div > div > input`,'0')
                      beep(buzzer,500)
                      await textTable.push([`${idx+1}.${b+1}`,truncateText(getNamaBarang),getSkuIdx,getNamaVarian,getStockVarr,'0'])
                      textReturn+=`${idx+1}.${b+1}.\t${truncateText(getNamaBarang)}\nSKU\t: ${getSkuIdx}\nVarian\t: ${getNamaVarian}\nBefore\t: ${getStockVarr}\nAfter\t: 0\n\n`
                    }
                  }
                }
              }else{
              await shopeePage.waitForTimeout(10000)
              const getStock = await shopeePage.evaluate(()=>document.querySelector('#main > div > div:nth-child(3) > div:nth-child(1) > div > div > div > div.product-briefing.flex.card.s9-a-0 > div.flex.flex-auto.RBf1cu > div > div.h-y3ij > div > div.flex.rY0UiC.j9be9C > div > div.flex.items-center._6lioXX > div.flex.items-center > div:nth-child(2)').innerHTML)
              console.log(getStock)
              const getStockValue = getStock.split(' ')[1]
              await tokopediaPage.type(`#merchant-root > div > div.content-container > div > section > div.css-1gbu4dk > div:nth-child(2) > div:nth-child(${idx+2}) > div.css-1gmcosb > div.css-1t1xv2g > div:nth-child(${b+1}) > div.css-2eodbt.e19by5ca1 > div > div > div > div > div > input`,getStockValue)
              beep(buzzer,500)
              await textTable.push([`${idx+1}.${b+1}`,truncateText(getNamaBarang),getSkuIdx,getNamaVarian,getStockVarr,getStockValue])
              textReturn+=`${idx+1}.${b+1}.\t${truncateText(getNamaBarang)}\nSKU\t: ${getSkuIdx}\nVarian\t: ${getNamaVarian}\nBefore\t: ${getStockVarr}\nAfter\t: ${getStockValue}\n\n`
              }
            }

          }
        }
      }
     }
    }
    await shopeePage.close()
   }
   idx++
  }while(idx<getLoopToGetAllProduct.length)
  await tokopediaPage.keyboard.press('Enter')
  await tokopediaPage.waitForTimeout(5000)
  await browser.close()
  console.log(table(textTable))
  return textReturn
 }catch(err){
  console.log(err)
  return '*[ERROR CHANGE STOCK]*\n\nError terjadi karena '+`${err}`
 }
}
const semuaJadiSatu = async(buzzer, client, date) => {
 try{

 }catch(err){
  console.log(err)
  await client.sendText(libDataPrib.ownerNumber, `${err}`)
 }
}
const tanggapanSesi = async(id, body, client) => {
 try{
  const session = JSON.parse(fs.readFileSync('./lib/session.json'))
  const sesiCommand = await body.toLowerCase().split(" ")[0]||""
  if(sesiCommand.includes('https://shopee.co.id')){
   if(session[0].session=="#TP_REQLINK"){
    fs.writeFileSync('./lib/session.json',JSON.stringify([]))
    const { page, browser } = await configBrowser()
    request(body.split(" ")[0], async(err, response) => {
     if(!err&&response.statusCode==200){
      const shopeePage = await page
      await shopeePage.goto(body.split(" ")[0])
      await shopeePage.waitForTimeout(150000)
      const getImage = await shopeePage.screenshot()
      const getTitle = await shopeePage.evaluate(()=>document.querySelector('div:nth-child(3) div.Sxova7 div div.page-product div.container div.product-briefing.flex.card.s9-a-0 div.flex.flex-auto.RBf1cu div div._44qnta span').innerHTML)
      console.log(getImage, getTitle)
     }else{
      await client.reply(libDataPrib.ownerNumber, 'Maaf link tidak valid, mohon ulangi lagi', id)      
     }
    })
   }
  }
 }catch(err){
  console.log(err)
  await client.reply(libDataPrib.ownerNumber, `${err}`, id)
 }
}
module.exports = {
 changeStock,
 semuaJadiSatu,
 tanggapanSesi
}