chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.tab) {
    // from a content script, probably the forums :)
    var existingAddons;
    if (localStorage["addons"]) {
      try {
        existingAddons = JSON.parse(localStorage["addons"]);
      } catch(e) {
        existingAddons = [];
      }
    } else {
      existingAddons = [];
    }
    
    existingAddons[existingAddons.length] = request.newAddon;
    localStorage["addons"] = JSON.stringify(existingAddons);

  }
  
  sendResponse({farewell: "goodbye"})
});