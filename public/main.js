let cookieKeys = [];

function getCookieWells() {
  return document.getElementsByClassName('cookie-wells')[0];
}

function getCookieCharts() {
  return document.getElementsByClassName('cookie-charts')[0];
}

function getCookieButtons() {
  return document.getElementsByClassName('cookie-buttons')[0];
}

function buildCookieWell(data) {
  const { label, imgSrc, price, previousPrice } = data;
  const cookieWell = document.createElement("div");
  cookieWell.className = "cookie-well";
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


  cookieWell.appendChild(labelElement);
  cookieWell.appendChild(imgElement);
  cookieWell.appendChild(priceElement);
  getCookieWells().appendChild(cookieWell);
}

async function fillCookieWells() {
  const response = await fetch("/cookieData");
  const cookieData = await response.json()
  getCookieWells().innerHTML = "";
  Object.keys(cookieData).forEach(cookieKey => {
    buildCookieWell(cookieData[cookieKey]);
  });
  cookieKeys = Object.keys(cookieData);
  return cookieKeys;
}

async function buildCookieChart(cookieTypes) {
  const cookieHistoryResponse = await fetch('/cookieHistory');
  const cookieHistory = await cookieHistoryResponse.json();
  getCookieCharts().innerHTML = "";

  cookieTypes.forEach(cookieType => {
    const prices = [];
    const dateKeys = [];
    Object.entries(cookieHistory).slice(0, 100).forEach(([dateKey, cookieData]) => {
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

async function buildCookieButtons() {
  cookieKeys.forEach(cookieType => {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    const purchaseButton = document.createElement("button");
    purchaseButton.classList.add('purchase-button');
    purchaseButton.classList.add(cookieType);
    purchaseButton.innerText = "BUY";
    const sellButton = document.createElement("button");
    sellButton.classList.add('sell-button');
    sellButton.classList.add(cookieType);
    sellButton.innerText = "SELL";
    buttonContainer.appendChild(purchaseButton);
    buttonContainer.appendChild(sellButton);
    getCookieButtons().appendChild(buttonContainer);
  });
}

(async () => {
  await fillCookieWells();
  buildCookieChart(cookieKeys);
  buildCookieButtons();
})();

setInterval(async () => {
  await fillCookieWells()
  buildCookieChart(cookieKeys)
}, 10000)
