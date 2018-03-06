//nCage 
var main = async function($) { 
	
var self = $.nCage = new function(){};

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
    jQuery.ajax("https://api.flickr.com/services/feeds/photos_public.gne", {
      data: {
        tags: "nicolas cage",
        tagmode: "any",
        format: "json",
        nojsoncallback: 1
      },
      dataType: "json",
      success: resolve,
      error: reject
    });
  });
  const results = await searchPromise;
  return results.items.map(item => item.media.m);
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

const nCageUrls = await getNCageUrls();

$.extend(self, {
	nCageImgs : nCageUrls,
	handleImages : function (lstImgs, time)
	{
		$.each($('img'), function(i,item) { 
			//Skip if image is already replaced
			if($.inArray($(item).attr('src'), lstImgs) == -1)
			{
				var h = $(item).height();
				var w = $(item).width();
				
				//If image loaded
				if(h > 0 && w > 0)
				{
					//Replace
					$(item).css('width', w + 'px').css('height', h + 'px');
					$(item).attr('src', lstImgs[Math.floor(Math.random() * lstImgs.length)]); 
				}
				else
				{
					//Replace when loaded
					$(item).load(function(){
						//Prevent 'infinite' loop
							if($.inArray($(item).attr('src'), lstImgs) == -1)
							{
								var h = $(item).height();
								var w = $(item).width();
								$(item).css('width', w + 'px').css('height', h + 'px');
								$(item).attr('src', lstImgs[Math.floor(Math.random() * lstImgs.length)]); 
							}
						});
					}
				}
			});
			
			//Keep replacing
			if(time > 0)
				setTimeout(function(){self.handleImages(lstImgs, time);},time);
		}
	});

//Run on jQuery ready
$(function(){
	self.handleImages(self.nCageImgs, 3000);
});
};

	
main(jQuery);
 
 