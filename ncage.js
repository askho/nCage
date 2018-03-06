	
let INSTALL_DATE = new Date();
const DAY_IN_MS = 1000 * 60 * 60 * 24;
function writeToStorage(key, val) {
	return new Promise((resolve) => {
    const insertionData = {};
    insertionData[key] = val;
    chrome.storage.local.set(insertionData, () => {
      resolve();
		});
	})
}

function readFromStorage(key) {
	return new Promise((resolve) => {
		chrome.storage.local.get(key, (items) => {
      resolve(items);
		})
	})
}

async function searchForNCageImages() {
  const searchPromise = new Promise((resolve, reject) => {
    jQuery.ajax("https://api.qwant.com/api/search/images", {
      data: {
        count: 50,
        q: "nicolas cage"
      },
      dataType: "json",
      success: resolve,
      error: reject
    });
  });
  const results = await searchPromise;
  return results.data.result.items.map(item => item.media);
}

async function refreshNCageDB() {
  try {
    const result = await searchForNCageImages();
    writeToStorage("ncage", result);
  } catch (err) {
    console.error(err);
  }
}

async function getNCageUrls() {
  const urls = await readFromStorage("ncage");
  return urls.ncage || DEFAULT_NCAGE_URLS;
}

async function setInstallationDate() {
  const result = await readFromStorage("installDate");
  if (!result.installDate) {
    writeToStorage("installDate", (new Date().getTime()));
  } else {
    INSTALL_DATE = (new Date(result.installDate));
  }
}

function shouldReplaceImage() {
  const daysSinceInstall = Math.floor((new Date() - INSTALL_DATE) / DAY_IN_MS);
  const random = Math.random();
  return random < (daysSinceInstall / 100)
}

setInstallationDate();
refreshNCageDB();


jQuery(document).ready(async () => {
  const nCageUrls = await getNCageUrls();
  jQuery.each(jQuery("img"), (i, item) => {
    const randomImage = nCageUrls[Math.floor(Math.random() * nCageUrls.length)];
    if (shouldReplaceImage()) {
      item.src = randomImage;
    }
  });
});
 
 