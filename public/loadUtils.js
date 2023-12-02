let cookieKeys = [];

async function fetchCookieKeys() {
  const response = await fetch("/cookieData");
  const cookieData = await response.json()
  cookieKeys = Object.keys(cookieData);
  return cookieKeys;
}

(() => fetchCookieKeys())();
