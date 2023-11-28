const express = require('express');
const app = express();
const port = 3000;
const { readCookieData, readUsersData, readCookieHistoryData } = require('./fileRead.js');

// TODO:
// add script to every 30 minutes to update the pricing
// allow buying cookies
// users need account name, password, cookie amounts, and total cash
// 

app.use(express.static('public'));

app.get('/cookieData', async (req, res) => {
  const cookieData = await readCookieData();
  res.send(cookieData);
})

app.get('/user', async (req, res) => {
  const usersData = await readUsersData();
  res.send(usersData[req.query.user])
})

app.get('/cookieHistory', async (req, res) => {
  const cookieHistoryData = await readCookieHistoryData();
  res.send(cookieHistoryData)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})