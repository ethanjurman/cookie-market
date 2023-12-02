
const { readCookieData, writeCookieData } = require('./fileRead.js');

async function updatePrices() {
  const cookieData = await readCookieData();
  const updatedCookieData = Object.keys(cookieData).reduce((updated, key) => {
    const trendUp = cookieData[key].price > cookieData[key].previousPrice;
    const oldPrice = cookieData[key].price;
    let newPrice = oldPrice + (Math.random() * 10) + (trendUp ? - 6 : - 4); // if it's trending up, have a higher chance to decrease
    // the price should never be less than 50;
    if (newPrice < 50) {
      newPrice = 49.99;
    }
    // the price should never be more than 1000
    if (newPrice > 1000) {
      newPrice = 999.99;
    }
    updated[key].price = Math.round(newPrice * 100) / 100;
    updated[key].previousPrice = oldPrice;
    return updated;
  }, cookieData)
  return await writeCookieData(updatedCookieData);
}

setInterval(
  updatePrices,
  30 * 1000 /* every 30 seconds */
)
console.log(`schedule running every 30 seconds`);
