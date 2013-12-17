var Extractor = {
  extract: function() {
    var self = this;

    // clear existing
    chrome.runtime.sendMessage({newAddon: null, clear: true}, function(response) {});

    // init variables
    this.addons = [];
    this.statusID = 'wscontrol-status-elementation';
    this.numPages = this.findNumPages(document);
    this.numAddonsFound = 0;
    
    this.buildStatusElement();
    this.updateNumPagesLeft(this.numPages - 1);
    this.insertStatusElement();

    // parse the current page
    this.parseListingPage(document, 1);
    // follow page links
    this.parseNonActivePages(document);
    
  },

  buildStatusElement: function() {
    this.statusElement = $("<div style='"+ this.statusStyle() +"' id='"+ this.statusID +"'>WS Addon Control Searching for Addons <br/>Pages left: <span id='wsnumpagesleft'>" + this.numPagesLeft + "</span><br/>Addons found: <span id='wsnumaddonsfound'>0</span></div>")
    this.closeButton = $('<div style="cursor:pointer;position:absolute;right:2px;bottom:2px;">CLOSE</div>');
    this.closeButton.on("click", function() {
      self.statusElement.remove();
    });
    this.statusElement.append(this.closeButton);
  },

  statusStyle: function() {
    return "padding:4px 0 4px 10px;position:fixed;top:0;left:0;width:400px;height:50px;background:black;opacity:0.8;color:white;";
  },

  insertStatusElement: function() {
    $('body').prepend(this.statusElement);
  },

  parseListingPage: function(htmlDocument, pageIndex) {
    var self = this;
    $(htmlDocument).find('a.topic_title').each(function(index) {

      var span = $(this).children('span').first();

      var postTitle = span.text();
      if (match = postTitle.match(/^\[Addon\](.*)/i)) {
        // we have an addon
        var url = $(this).attr('href');
        var addon = {
          title: match[1].trim(),
          url: url,
          pageIndex: pageIndex,
          positionOnPage: index
        }
        
        $.get(url, function(response) {
          addon.downloads = self.parseAddonPageForDownloads(response);

          if (addon.downloads.length > 0) {
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

  parseAddonPageForDownloads: function(response) {
    var attachmentElement;
    var downloads = [];

    // first find the strong text. This is an attachment
    var strongs = $(response).find('a[title="Download attachment"] strong');

    strongs.each(function(index) {
      download = {}
      download.url = $(this).parent().attr('href');
      download.title = $(this).text();

      var dl_text = $(this).parent().siblings('span.desc.lighter').first().text();
      if (match = dl_text.match(/([0-9]+)/)) {
        download.num = match[1];
      }

      downloads.push(download);
    });

    return downloads;
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
        self.parseListingPage(response, i);
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