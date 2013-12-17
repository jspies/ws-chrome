var Extractor = {
  extract: function() {
    var self = this;

    chrome.runtime.sendMessage({newAddon: null, clear: true}, function(response) {});

    this.addons = [];
    this.statusID = 'wscontrol-status-elementation';

    this.numPages = this.findNumPages(document);
    this.numAddonsFound = 0;

    this.statusElement = $("<div style='"+ this.statusStyle() +"' id='"+ this.statusID +"'>WS Addon Control Searching for Addons <br/>Pages left: <span id='wsnumpagesleft'>" + this.numPagesLeft + "</span><br/>Addons found: <span id='wsnumaddonsfound'>0</span></div>")
    this.closeButton = $('<div style="cursor:pointer;position:absolute;right:2px;bottom:2px;">CLOSE</div>');
    this.closeButton.on("click", function() {
      self.statusElement.remove();
    });
    this.statusElement.append(this.closeButton);
    
    this.updateNumPagesLeft(this.numPages - 1);

    this.insertStatusElement();

    // parse the current page
    this.parseListingPage(document);
    // follow page links
    this.parseNonActivePages(document);
    
  },

  statusStyle: function() {
    return "padding:4px 0 4px 10px;position:fixed;top:0;left:0;width:400px;height:50px;background:black;opacity:0.8;color:white;";
  },

  insertStatusElement: function() {
    $('body').prepend(this.statusElement);
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

          if (typeof(addon.download) != "undefined" && addon.download != null && addon.download != "") {
            
            chrome.runtime.sendMessage({newAddon: addon}, function(response) {
              self.incrementAddonsFound();
            });
          }
        });
      }
    });
  },

  incrementAddonsFound: function() {
    this.numAddonsFound += 1;
    $('#wsnumaddonsfound').text(this.numAddonsFound);
  },

  updateNumPagesLeft: function(num) {
    this.numPagesLeft = num;
    this.statusElement.find('#wsnumpagesleft').text(num);
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
    if (this.numPages == null) {
      this.numPages = this.findNumPages(htmlDocument);
    }

    var pageHref = $(htmlDocument).find("ul.pages li.page a").first().attr('href');

    for (var i = 2; i <= this.numPages; i++) {
      var url = pageHref.replace(/page-[0-9]+/, "page-" + i);

      $.get(url, function(response) {
        self.parseListingPage(response);
        self.updateNumPagesLeft(self.numPagesLeft - 1);
      });
    };
  },

  findNumPages: function(doc) {
    var anchor = $(doc).find("li.pagejump a").first();
    var match = anchor.text().match(/Page [0-9]+ of ([0-9]+)/); //Page x of y
    return match[1];
  }
}

Extractor.extract();