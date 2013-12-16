var Extractor = {
  extract: function() {
    
    var addons = [];

    // parse the current page
    this.parseListingPage(document);
    // follow page links
    this.parseNonActivePages(document);
    
  },

  parseListingPage: function(htmlDocument) {
    var self = this;
    $(htmlDocument).find('a.topic_title').each(function(index) {

      var span = $(this).children('span').first();

      var postTitle = span.text();
      if (match = postTitle.match(/^\[Addon\](.*)/i)) {
        // we have an addon
        var url = $(this).attr('href');
        var addon = {
          title: match[1].trim(),
          url: url
        }
        
        $.get(url, function(response) {
          addon.download = self.parseAddonPageForDownload(response);

          chrome.runtime.sendMessage({newAddon: addon}, function(response) {
            //console.log(response)
          });
        });
      }
    });
  },

  parseAddonPageForDownload: function(response) {
    var href;
    $(response).find('a[title="Download attachment"]').each(function(dl_index) {
      href = $(this).attr('href');
    });

    return href;
  },

  parseNonActivePages: function(htmlDocument) {
    var self = this;
    var pageURLs = [];
    $(htmlDocument).find("ul.pages li.page").each(function(index) {

      if ($(this).hasClass('active') == false) {
        var href = $(this).find('a').first().attr("href");
        if (pageURLs.indexOf(href) == -1) {
          pageURLs.push(href);  
        }
      }
    });

    for (var i = 0; i < pageURLs.length; i++) {
      $.get(pageURLs[i], function(response) {
        self.parseListingPage(response);
      });
    }
  }
}

Extractor.extract();