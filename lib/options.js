module.exports = options = (headless, start) => {
 const options = {
  sessionId: 'Putrauy',
  headless: headless,
  qrTimeout: 0,
  authTimeout: 0,
  restartOnCrash: start,
  cacheEnabled: true,
  useChrome: true,
  killProcessOnBrowserClose: true,
  throwErrorOnTosBlock: false,
  chromiumArgs: [
   '--no-sandbox',
   '--disable-setuid-sandbox',
   '--disable-cache',
   '--disable-application-cache'
  ]
 }
 return options
}
