
const { readCookieData, writeCookieData } = require('./fileRead.js');

async function updatePrices() {
  const cookieData = await readCookieData();
  const updatedCookieData = Object.keys(cookieData).reduce((updated, key) => {
    const trendUp = cookieData[key].price > cookieData[key].previousPrice;
    const oldPrice = cookieData[key].price;
    const newPrice = oldPrice + (Math.random() * 10) + (trendUp ? - 6 : - 4); // if it's trending up, have a higher chance to decrease
    updated[key].price = newPrice;
    updated[key].previousPrice = oldPrice;
    return updated;
  }, cookieData)
  return await writeCookieData(updatedCookieData);
}

setInterval(
  updatePrices,
  30 * 1000 /* every 30 seconds */
)