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
  await writeCookieHistoryData({ [new Date().getTime()]: newData, ...oldCookieData });
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