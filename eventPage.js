function addItem(category, item) {
  var existingItems;
  if (localStorage[category]) {
    try {
      existingItems = JSON.parse(localStorage[category]);
    } catch(e) {
      existingItems = [];
    }
  } else {
    existingItems = [];
  }
  
  existingItems[existingItems.length] = item;
  localStorage[category] = JSON.stringify(existingItems);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.tab) {
    // from a content script, probably the forums ;)

    if (request.clear == true) {
      localStorage.removeItem("addons");
      localStorage.removeItem("libraries");
    } else {
      if (typeof(request.newAddon) != "undefined") {
        addItem("addons", request.newAddon)
      } else {
        addItem("libraries", request.newLibrary);
      }
    }
  }
  
  sendResponse({farewell: "goodbye"})
});
