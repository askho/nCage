	
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

refreshNCageDB();


jQuery(document).ready(async () => {
  const nCageUrls = await getNCageUrls();
  jQuery.each(jQuery("img"), (i, item) => {
    const randomImage = nCageUrls[Math.floor(Math.random() * nCageUrls.length)];
    item.src = randomImage;
  });
});
 
 