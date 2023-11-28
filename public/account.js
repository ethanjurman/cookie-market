function getAccount() {
  return document.getElementsByClassName('account')[0];
}

const accountIconElement = document.createElement('span');
accountIconElement.innerHTML = `<span class="material-icons material-icons-outlined">person</span>`
const accountUserNameElement = document.createElement('span');
accountUserNameElement.classList.add('account-user-name')
accountUserNameElement.innerText = 'GUEST';

getAccount().appendChild(accountIconElement);
getAccount().appendChild(accountUserNameElement);
