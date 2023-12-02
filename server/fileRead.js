const fs = require('node:fs/promises');

const readFile = async (filePath) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (e) {
    console.log(e)
    return 0;
  }
};

const writeFile = (filePath, data) => {
  return fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const readCookieData = () => {
  return readFile('./data/cookie.json')
}

const writeCookieData = async newData => {
  const oldCookieData = await readCookieHistoryData()
  // filter out cookie data that is older than 24 hours
  const cookieData = Object.keys(oldCookieData).reduce((data, timestamp) => {
    if (Number(oldCookieData[timestamp]) < 24 * 60 * 60 * 1000) {
      return data; // older than 24 hours - skip
    }
    data[timestamp] = oldCookieData[timestamp];
    return data;
  }, {})

  await writeCookieHistoryData({
    // new data should only be price data
    [new Date().getTime()]: Object.keys(newData).reduce((dataToWrite, cookieKey) => ({ ...dataToWrite, [cookieKey]: { price: newData[cookieKey].price } }), {}),
    // also include old cookie data
    ...cookieData
  });
  return writeFile('./data/cookie.json', newData);
}

const readUsersData = () => {
  return readFile('./data/users.json')
}

const writeUsersData = newData => {
  return writeFile('./data/users.json', newData)
}

const readCookieHistoryData = () => {
  return readFile('./data/cookieHistory.json');
}

const writeCookieHistoryData = newData => {
  return writeFile('./data/cookieHistory.json', newData)
}

module.exports = {
  readCookieData,
  writeCookieData,
  readUsersData,
  writeUsersData,
  readCookieHistoryData,
  writeCookieHistoryData
};