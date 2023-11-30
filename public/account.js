let token;

function getAccountElement() {
  return document.getElementsByClassName('account')[0];
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

const accountIconElement = document.createElement('span');
accountIconElement.innerHTML = `<span class="material-icons material-icons-outlined">person</span>`;
const accountUserNameElement = document.createElement('span');
accountUserNameElement.classList.add('account-user-name');
accountUserNameElement.innerText = 'GUEST';
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
signUpButton.onclick = () => {
  const username = document.getElementById('login-user-name').value;
  const password = document.getElementById('login-password').value;
  postData('/signup', { username, password })
}

loginButton.onclick = async () => {
  const username = document.getElementById('login-user-name').value;
  const password = document.getElementById('login-password').value;
  const response = await postData('/login', { username, password });
  localStorage.setItem('token', response.token);
}

const testButton = document.createElement('button');
testButton.innerText = 'Test';
testButton.id = 'test-button';
testButton.onclick = () => {
  fetch('/getUserInfo', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
}

getAccountElement().appendChild(accountIconElement);
getAccountElement().appendChild(accountUserNameElement);

getAccountElement().appendChild(loginUserNameInput);
getAccountElement().appendChild(loginPasswordInput);
const loginButtonSection = document.createElement('div');
loginButtonSection.classList.add('login-button-section');
loginButtonSection.appendChild(loginButton);
loginButtonSection.appendChild(signUpButton);
getAccountElement().appendChild(loginButtonSection);
getAccountElement().appendChild(testButton);
