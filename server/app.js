const express = require('express');
const app = express();
const port = 3000;
const { readCookieData, readUsersData, readCookieHistoryData, writeUsersData } = require('./fileRead.js');

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

app.get('/cookieHistory', async (req, res) => {
  const cookieHistoryData = await readCookieHistoryData();
  res.send(cookieHistoryData)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('node:fs/promises');

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
      username, password: hashedPassword, crumbs: 10000, cookies: [
        { chocolateChipCookie: 0 },
        { sugarCookie: 0 },
        { sandwichCookie: 0 }
      ]
    });
    await writeUsersData(users);

    res.status(201).send('User created');
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
      res.json({ token, ...userData });
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
  const users = await readUsersData();
  const user = users.find(u => u.username === username);
  const cookieData = await readCookieData();
  const cookiePrice = cookieData[req.cookieType].price;
  if (!cookieData[req.cookieType] || !cookiePrice) {
    return res.send({ status: 'error', message: 'Invalid cookie', cookieType: req.cookieType });
  }
  if (cookiePrice < user.crumbs) {
    await writeUsersData(users.map(user => {
      if (user.username === username) {
        return { ...user, crumbs: user.crumbs - cookiePrice }
      }
      return user;
    }))
  } else {
    res.send({ status: 'error', message: 'not enough crumbs', user: req.user, cookie: cookieData[req.cookieType] })
  }
  res.send({ status: 'success', message: 'purchased cookie!', user: req.user, cookie: cookieData[req.cookieType] });
});
