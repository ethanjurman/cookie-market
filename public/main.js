function getCookieWells() {
  return document.getElementsByClassName('cookie-wells')[0];
}

function getCookieCharts() {
  return document.getElementsByClassName('cookie-charts')[0];
}

function getCookieButtons() {
  return document.getElementsByClassName('cookie-buttons')[0];
}

async function postDataWithToken(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

function getUserCookieDataElement(cookieType, price) {
  const userData = JSON.parse(localStorage.getItem('user') || "null")
  if (!userData) {
    return document.createElement('div');
  };
  const jarSVG = document.createElement('img');
  jarSVG.classList.add('jar');
  if (userData.cookies[cookieType] === 0) {
    // no cookies
    jarSVG.src = './images/Jar1.png'
  }
  if (userData.cookies[cookieType] > 0) {
    // some cookies
    jarSVG.src = './images/Jar2.png'
  }
  if (userData.cookies[cookieType] > 3) {
    // more cookies
    jarSVG.src = './images/Jar3.png'
  }
  if (userData.cookies[cookieType] > 8) {
    // lots of cookies
    jarSVG.src = './images/Jar4.png'
  }
  const numberOfCookies = document.createElement('span');
  numberOfCookies.innerText = userData.cookies[cookieType];
  const jarSection = document.createElement('div');
  jarSection.classList.add('jar-section');
  jarSection.appendChild(jarSVG);
  jarSection.appendChild(numberOfCookies);

  const crumbImg = document.createElement('img');
  crumbImg.classList.add('crumb');
  crumbImg.src = './images/coin.png';
  const crumbValue = document.createElement('span');
  crumbValue.innerText = Math.round(userData.cookies[cookieType] * price * 100) / 100;

  const crumbValueSection = document.createElement('div');
  crumbValueSection.classList.add('crumb-value-section');
  crumbValueSection.appendChild(crumbImg);
  crumbValueSection.appendChild(crumbValue);

  const infoSection = document.createElement('div');
  infoSection.appendChild(jarSection);
  infoSection.appendChild(crumbValueSection);
  return infoSection;
}

function buildCookieWell(data, cookieType) {
  const { label, imgSrc, price, previousPrice } = data;
  const cookieWell = document.createElement("div");
  cookieWell.classList.add("cookie-well");
  cookieWell.classList.add(cookieType);
  const labelElement = document.createElement("div");
  labelElement.classList.add('cookie-well-label')
  labelElement.innerHTML = label;
  const imgElement = document.createElement("img");
  imgElement.src = imgSrc;
  const priceElement = document.createElement("div");
  priceElement.classList.add('cookie-well-price');
  let trendIcon = `<span class="material-icons material-icons-outlined">trending_up</span>`
  if (previousPrice > price) {
    trendIcon = `<span class="material-icons material-icons-outlined">trending_down</span>`
  }
  priceElement.classList.add(previousPrice < price ? 'trending-up' : 'trending-down');
  priceElement.innerHTML = `<span>${Math.round(price * 100) / 100}</span> ${trendIcon}`;

  const infoSection = document.createElement("div");
  infoSection.classList.add('info-section');
  infoSection.classList.add(cookieType);
  infoSection.appendChild(priceElement);
  infoSection.appendChild(getUserCookieDataElement(cookieType, price));
  cookieWell.appendChild(labelElement);
  cookieWell.appendChild(infoSection);
  cookieWell.appendChild(imgElement);
  getCookieWells().appendChild(cookieWell);
}

function updateCookieWell(data, cookieType) {
  const { price, previousPrice } = data;
  const cookieWell = document.querySelector(`.cookie-well.${cookieType}`);
  const priceElement = document.createElement("div");
  priceElement.classList.add('cookie-well-price');
  let trendIcon = `<span class="material-icons material-icons-outlined">trending_up</span>`
  if (previousPrice > price) {
    trendIcon = `<span class="material-icons material-icons-outlined">trending_down</span>`
  }
  priceElement.classList.add(previousPrice < price ? 'trending-up' : 'trending-down');
  priceElement.innerHTML = `<span>${Math.round(price * 100) / 100}</span> ${trendIcon}`;

  const info = document.querySelector(`.info-section.${cookieType}`)
  info.parentElement.removeChild(info);

  const infoSection = document.createElement("div");
  infoSection.classList.add('info-section');
  infoSection.classList.add(cookieType);
  infoSection.appendChild(priceElement);
  infoSection.appendChild(getUserCookieDataElement(cookieType, price));
  cookieWell.appendChild(infoSection);
}

async function fillCookieWells() {
  const response = await fetch("/cookieData");
  const cookieData = await response.json()
  getCookieWells().innerHTML = "";
  Object.keys(cookieData).forEach(cookieKey => {
    buildCookieWell(cookieData[cookieKey], cookieKey);
  });
}

async function updateCookieWells() {
  const response = await fetch("/cookieData");
  const cookieData = await response.json()
  Object.keys(cookieData).forEach(cookieKey => {
    updateCookieWell(cookieData[cookieKey], cookieKey);
  });
}

async function buildCookieChart(cookieTypes) {
  const cookieHistoryResponse = await fetch('/cookieHistory?count=50');
  const cookieHistory = await cookieHistoryResponse.json();
  getCookieCharts().innerHTML = "";

  cookieTypes.forEach(cookieType => {
    const prices = [];
    const dateKeys = [];
    Object.entries(cookieHistory).forEach(([dateKey, cookieData]) => {
      prices.unshift(cookieData[cookieType].price);
      dateKeys.unshift(Number(dateKey));
    });

    const canvas = document.createElement("canvas");
    canvas.classList.add(`${cookieType}-chart`);
    canvas.classList.add("cookie-chart")
    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: dateKeys.map(v => `${new Date(v).toLocaleString()}`),
        datasets: [
          {
            label: "",
            data: prices,
            borderColor: "#8c5a3c",
            borderWidth: 2,
          },
        ],
      },
      options: {
        elements: { point: { radius: 1 } },
        animation: false,
        scales: {
          x: {
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
    getCookieCharts().appendChild(canvas)
  })
}

(async () => {
  await fillCookieWells();
  buildCookieChart(cookieKeys);
})();

setInterval(async () => {
  await updateCookieWells()
  buildCookieChart(cookieKeys);
}, 10000)
