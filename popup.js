
var ChromeControl = {

  init: function() {
    var addons = JSON.parse(localStorage["addons"]);
    if (addons && addons.length > 0) {
      $('.prepop-messages').hide();


      $.each(addons, function(index) {
        var addon = this;
        var element = $("<div class='addon'><h3>"+ addon.title +"</h3></div>");
        var downloadLink = $("<a href='"+ addon.download +"'>Download</a>");
        downloadLink.on("click", function() {
          chrome.downloads.showDefaultFolder();
          chrome.downloads.download({
            url: addon.download
          }, function() {

          });
          return false;
        });
        element.append(downloadLink);
        $('#addons').append(element);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  ChromeControl.init();
});
