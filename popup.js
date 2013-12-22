var WSControl = {

  init: function() {
    
    this.handleScroll();
    this.attachSearchForm();
    this.currentSort = "name";
    this.reloadAddons();
  },

  handleScroll: function() {
    var search = $('form#search-form');
    $(document).on("scroll", function() {
      if ($(this).scrollTop() > search.position().top) {
        search.css('position', 'fixed');
      } else {
        search.css('position', 'relative');
      }
    });
  },

  loadAddons: function(addons) {
    var self = this;

    if (addons && addons.length > 0) {
      $('#addons').html("");

      $('.prepop-messages').hide();

      $('#num-addons').text(addons.length)

      $.each(addons, function(index) {
        var addon = this;
        var element = $("<li class='addon'><h3>"+ addon.title +"<div class='thread-link'></div></h3></li>");
        var linkHolder = $('<ul class="links"></ul>');

        if (addon.downloads) {
          for (var i = 0; i < addon.downloads.length; i++ ) {
            var download = addon.downloads[i];
            var downloadLink = $("<a href='"+ download.url +"'>"+ download.title +"</a>");

            downloadLink.on("click", function(event) { 
              self.downloadFile(download.url);
              event.preventDefault();
            });

            var li = self.addListItem(linkHolder, downloadLink);
            li.append($("<span> "+ download.num +" Downloads</span>"));
          }
        }

        element.append(linkHolder);

        var pageLink = $("<a href='"+ addon.url +"'>Visit Thread</a>')");
        
        pageLink.on("click", function(event) {
          chrome.tabs.create({url: $(this).attr('href')});
          event.preventDefault();
        });
        element.find('.thread-link').append(pageLink);

        // attach for later use
        self.addons[index].element = element;

        $('#addons').append(element);
      });
    }
  },

  sortByName: function() {
    this.addons.sort(function(a, b) {
      return a.title > b.title ? 1 : -1;
    });
  },

  sortByIndex: function() {
    this.addons.sort(function(a, b) {
      x = (a.pageIndex * 20) + a.positionOnPage;
      y = (b.pageIndex * 20) + b.positionOnPage;
      return x - y;
    });
  },

  resortAddons: function() {
    if (this.currentSort == "name") {
      this.sortByName();
    } else {
      this.sortByIndex();
    }
    
    this.loadAddons(this.addons);
  },

  reloadAddons: function() {
    try {
      this.addons = JSON.parse(localStorage["addons"]);
      this.libraries = JSON.parse(localStorage["libraries"]);
    } catch(e) {
      this.addons = [];
      this.libraries = [];
    }

    this.resortAddons();
  },

  downloadFile: function(url) {
    chrome.downloads.download({
      url: url
    }, function(downloadId) {
      chrome.downloads.show(downloadId);
    });
  },

  addListItem: function(list, content) {
    var li = $("<li></li>");
    li.append(content);
    list.append(li);
    return li;
  },

  attachSearchForm: function() {
    var self = this;
    $('#search-submit').on("click", function(event) {
      event.preventDefault();
      var term = $('input#search-term').val();
      self.filterOn(term);
    });

    $('a.sort-by').on("click", function(e) {
      e.preventDefault();
      $('a.sort-by').removeClass("active");
      $(this).addClass('active');
      self.currentSort = $(this).data("sort-by");
      self.resortAddons();
    });

    $('a#library-toggle').on("click", function(e) {
      e.preventDefault();
      if ($(this).text() == "View Libraries") {
        self.showLibraries();  
        $(this).text("View Addons");
      } else {
        self.loadAddons(self.addons);
        $(this).text("View Libraries");
      }
    });
  },

  showLibraries: function() {
    this.loadAddons(this.libraries);
  },

  filterOn: function(term) {
    if (term == "") { this.clearFilter(); return; }

    var self = this;

    $.each(this.addons, function(index) {
      if (this.title.toLowerCase().indexOf(term.toLowerCase()) == -1) {
        self.addons[index].element.hide();
      } else {
        self.addons[index].element.show();
      }
    });
  },

  clearFilter: function() {
    var self = this;
    $.each(this.addons, function(index) {
      self.addons[index].element.show();
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  WSControl.init();
});
