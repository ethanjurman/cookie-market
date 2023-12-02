const express = require('express');
const app = express();
const port = 3000;
const { readCookieData, readUsersData, readCookieHistoryData, writeUsersData } = require('./fileRead.js');

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('node:fs/promises');
// var https = require('https');
// var http = require('http');

// var options = {
//   key: fs.readFile('test/fixtures/keys/agent2-key.pem'),
//   cert: fs.readFile('test/fixtures/keys/agent2-cert.cert')
// };

// TODO:
// add script to every 30 minutes to update the pricing
// allow buying cookies
// users need account name, password, cookie amounts, and total cash
// 

app.use(express.static('public'));
app.use(express.json())

app.get('/cookieData', async (req, res) => {
  const cookieData = await readCookieData();
  res.send(cookieData);
})

app.get('/cookieHistory', async (req, res) => {
  const cookieHistoryData = await readCookieHistoryData();
  res.send(cookieHistoryData)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

function getSecret() {
  return fs.readFile('./data/secret', 'utf8');
}
app.use(bodyParser.json());

// User signup
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = await readUsersData();
    users.push({
      username, password: hashedPassword, crumbs: 2500, cookies: {
        chocolateChipCookie: 0,
        sugarCookie: 0,
        sandwichCookie: 0,
      }
    });
    await writeUsersData(users);
    const user = users.find(u => u.username === username);
    const { __password, ...userData } = user; // take all data except password
    const token = jwt.sign({ ...userData }, await getSecret(), { expiresIn: '24h' });

    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).send('Error during signup');
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readUsersData();
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
      const { __password, ...userData } = user; // take all data except password
      const token = jwt.sign({ ...userData }, await getSecret(), { expiresIn: '24h' });
      res.json({ token, user: userData });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error during login');
  }
});

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  };

  jwt.verify(token, await getSecret(), (err, user) => {
    if (err) {
      return res.sendStatus(403);
    };
    req.user = user;
    next();
  });
};

app.get('/getUserInfo', authenticateToken, (req, res) => {
  res.send(req.user);
});

app.post('/buyCookie', authenticateToken, async (req, res) => {
  const cookieType = req.body.cookieType;
  const username = req.user.username;
  const users = await readUsersData();
  const user = users.find(u => u.username === username);
  const cookieData = await readCookieData();
  if (!cookieData[cookieType] || !cookieData[cookieType].price) {
    return res.send({ status: 'error', message: 'Invalid cookie', cookieType: cookieType });
  }
  const cookiePrice = cookieData[cookieType].price;
  const newCrumbCount = Math.round((user.crumbs - cookiePrice) * 100) / 100;
  if (newCrumbCount > 0) {
    await writeUsersData(users.map(user => {
      if (user.username === username) {
        const newCookieCount = user.cookies[cookieType] + 1;
        const newCookieMap = { ...user.cookies, [cookieType]: newCookieCount }
        return {
          ...user, crumbs: newCrumbCount, cookies: newCookieMap
        }
      }
      return user;
    }))
    res.send({ status: 'success', message: 'purchased cookie!', user: { ...user, cookies: { ...user.cookies, [cookieType]: user.cookies[cookieType] + 1 }, crumbs: newCrumbCount }, cookie: cookieData[req.cookieType] });
  } else {
    res.send({ status: 'error', message: 'not enough crumbs', user, cookie: cookieData[req.cookieType] })
  }
});

app.post('/sellCookie', authenticateToken, async (req, res) => {
  const cookieType = req.body.cookieType;
  const username = req.user.username;
  const users = await readUsersData();
  const user = users.find(u => u.username === username);
  const cookieData = await readCookieData();
  if (!cookieData[cookieType] || !cookieData[cookieType].price) {
    return res.send({ status: 'error', message: 'Invalid cookie', cookieType: cookieType });
  }
  const cookiePrice = cookieData[cookieType].price;
  const newCrumbCount = Math.round((user.crumbs + cookiePrice) * 100) / 100;
  if (user.cookies[cookieType]) {
    await writeUsersData(users.map(user => {
      if (user.username === username) {
        const newCookieCount = user.cookies[cookieType] - 1;
        const newCookieMap = { ...user.cookies, [cookieType]: newCookieCount };
        return {
          ...user, crumbs: newCrumbCount, cookies: newCookieMap
        };
      };
      return user;
    }));
    res.send({ status: 'success', message: 'sell cookie!', cookieType, user: { ...user, cookies: { ...user.cookies, [cookieType]: user.cookies[cookieType] - 1 }, crumbs: newCrumbCount }, cookie: cookieData[req.cookieType] });
  } else {
    res.send({ status: 'error', message: 'not enough cookies', cookieType, user, cookie: cookieData[req.cookieType] })
  }
});
