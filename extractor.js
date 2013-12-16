var Extractor = {
  extract: function() {
    var addons = [];

    $('a.topic_title').each(function(index) {

      var span = $(this).children('span').first();

      var postTitle = span.text();
      if (match = postTitle.match(/^\[Addon\](.*)/i)) {
        // we have an addon
        var url = $(this).attr('href');
        var addon = {
          title: match[1],
          url: url
        }
        
        $.get(url, function(response) {
          $(response).find('a[title="Download attachment"]').each(function(dl_index) {
            addon.download = $(this).attr('href');
          });

          chrome.runtime.sendMessage({newAddon: addon}, function(response) {
            //console.log(response)
          })
        });
      }
    });
  }
}

Extractor.extract();