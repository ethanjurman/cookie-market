let token;

function getAccountElement() {
  return document.getElementsByClassName('account')[0];
}

function getBuySellButtons() {
  return document.getElementsByClassName('cookie-buttons')[0];
}

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

function buildAccountElement() {
  getAccountElement().innerHTML = '';
  const user = JSON.parse(localStorage.getItem('user'));
  const accountIconElement = document.createElement('span');
  accountIconElement.innerHTML = `<span class="material-icons material-icons-outlined">person</span>`;
  const accountUserNameElement = document.createElement('span');
  accountUserNameElement.classList.add('account-user-name');
  accountUserNameElement.innerText = user.username;

  const crumbImg = document.createElement('img');
  crumbImg.classList.add('crumb');
  crumbImg.src = './images/coin.png';
  const crumbValue = document.createElement('span');
  crumbValue.innerText = user.crumbs;

  const accountSection = document.createElement('div');
  accountSection.classList.add('account-section');
  accountSection.appendChild(accountIconElement);
  accountSection.appendChild(accountUserNameElement);
  const crumbSection = document.createElement('div');
  crumbSection.classList.add('crumb-section');
  crumbSection.appendChild(crumbImg);
  crumbSection.appendChild(crumbValue);

  getAccountElement().appendChild(accountSection);
  getAccountElement().appendChild(crumbSection);

  const signOutButton = document.createElement('button');
  signOutButton.classList.add('sign-out');
  signOutButton.innerText = 'Sign out';
  signOutButton.onclick = () => {
    localStorage.clear();
    window.location.reload();
  }
  getAccountElement().appendChild(signOutButton);
  buildCookieButtons();
}

function buildSignInLoginElement() {
  getAccountElement().innerHTML = '';
  const loginUserNameInput = document.createElement('input');
  loginUserNameInput.id = "login-user-name";
  const loginPasswordInput = document.createElement('input');
  loginPasswordInput.type = 'password';
  loginPasswordInput.minLength = 8;
  loginPasswordInput.id = "login-password";
  const loginButton = document.createElement('button');
  loginButton.innerText = 'Login';
  const signUpButton = document.createElement('button');
  signUpButton.innerText = 'Sign Up';
  signUpButton.onclick = async () => {
    const username = document.getElementById('login-user-name').value;
    const password = document.getElementById('login-password').value;
    const response = await postData('/signup', { username, password });
    if (response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      buildAccountElement();
      fillCookieWells();
    } else {
      // failed to sign in
    }
  }

  loginButton.onclick = async () => {
    const username = document.getElementById('login-user-name').value;
    const password = document.getElementById('login-password').value;
    const response = await postData('/login', { username, password });
    if (response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      buildAccountElement();
      fillCookieWells();
    } else {
      // failed to login
    }
  }

  getAccountElement().appendChild(loginUserNameInput);
  getAccountElement().appendChild(loginPasswordInput);
  const loginButtonSection = document.createElement('div');
  loginButtonSection.classList.add('login-button-section');
  loginButtonSection.appendChild(loginButton);
  loginButtonSection.appendChild(signUpButton);
  getAccountElement().appendChild(loginButtonSection);
  buildCookieButtons(true);
}

async function buildCookieButtons(disabled = false) {
  getBuySellButtons().innerHTML = '';
  cookieKeys.forEach(cookieType => {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    const purchaseButton = document.createElement("button");
    purchaseButton.classList.add('purchase-button');
    purchaseButton.classList.add(cookieType);
    purchaseButton.innerText = "BUY";
    if (disabled) {
      purchaseButton.classList.add('disabled-button');
    }
    if (!disabled) {
      purchaseButton.onclick = async () => {
        const response = await postDataWithToken('/buyCookie', {
          cookieType
        });
        localStorage.setItem('user', JSON.stringify(response.user));
        fillCookieWells();
        buildAccountElement();
      }
    }
    const sellButton = document.createElement("button");
    sellButton.classList.add('sell-button');
    sellButton.classList.add(cookieType);
    sellButton.innerText = "SELL";
    if (disabled) {
      sellButton.classList.add('disabled-button');
    }
    if (!disabled) {
      sellButton.onclick = async () => {
        const response = await postDataWithToken('/sellCookie', {
          cookieType
        });
        localStorage.setItem('user', JSON.stringify(response.user));
        fillCookieWells();
        buildAccountElement();
      }
    }
    buttonContainer.appendChild(purchaseButton);
    buttonContainer.appendChild(sellButton);
    getCookieButtons().appendChild(buttonContainer);
  });
}


let intervalId = setInterval(() => {
  if (cookieKeys.length > 0) {
    clearInterval(intervalId);
    if (!localStorage.getItem('user')) {
      buildSignInLoginElement();
    } else {
      buildAccountElement();
    }
  }
}, 200)

