var WSControl = {

  init: function() {
    
    this.handleScroll();
    this.attachSearchForm();
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

  loadAddons: function() {
    var self = this;

    if (this.addons && this.addons.length > 0) {
      $('.prepop-messages').hide();

      $('#num-addons').text(this.addons.length)

      $.each(this.addons, function(index) {
        var addon = this;
        var element = $("<li class='addon'><h3>"+ addon.title +"</h3></li>");
        var linkHolder = $('<ul class="links"></ul>');
        var downloadLink = $("<a href='"+ addon.download +"'>Download</a>");
        var pageLink = $("<a href='"+ addon.url +"'>Visit Thread</a>')");
        downloadLink.on("click", function(event) { 
          self.downloadFile(addon);
          event.preventDefault();
        });
        pageLink.on("click", function(event) {
          chrome.tabs.create({url: $(this).attr('href')});
          event.preventDefault();
        });
        self.addListItem(linkHolder, downloadLink);
        self.addListItem(linkHolder, pageLink);
        element.append(linkHolder);

        // attach for later use
        self.addons[index].element = element;

        $('#addons').append(element);
      });
    }
  },

  reloadAddons: function() {
    try {
      this.addons = JSON.parse(localStorage["addons"]);  
    } catch(e) {
      this.addons = [];
    }
    
    this.loadAddons();
  },

  downloadFile: function(addon) {
    chrome.downloads.download({
      url: addon.download
    }, function(downloadId) {
      chrome.downloads.show(downloadId);
    });
  },

  addListItem: function(list, content) {
    var li = $("<li></li>");
    li.append(content);
    list.append(li);
  },

  attachSearchForm: function() {
    var self = this;
    $('#search-submit').on("click", function(event) {
      event.preventDefault();
      var term = $('input#search-term').val();
      self.filterOn(term);
    });
  },

  filterOn: function(term) {
    if (term == "") { this.clearFilter(); return; }

    var self = this;

    $.each(this.addons, function(index) {
      console.log(this)
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
