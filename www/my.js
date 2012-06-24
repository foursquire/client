(function($) {
  $.widget('mobile.tabbar', $.mobile.navbar, {
    _create: function() {
      // Set the theme before we call the prototype, which will 
      // ensure buttonMarkup() correctly grabs the inheritied theme.
      // We default to the "a" swatch if none is found
      var theme = this.element.jqmData('theme') || "a";
      this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

      // Make sure the page has padding added to it to account for the fixed bar
      this.element.closest('[data-role="page"]').addClass('ui-page-footer-fixed');


      // Call the NavBar _create prototype
      $.mobile.navbar.prototype._create.call(this);
    },

    // Set the active URL for the Tab Bar, and highlight that button on the bar
    setActive: function(url) {
      // Sometimes the active state isn't properly cleared, so we reset it ourselves
      this.element.find('a').removeClass('ui-btn-active ui-state-persist');
      this.element.find('a[href="' + url + '"]').addClass('ui-btn-active ui-state-persist');
    }
  });

  $(document).bind('pagecreate create', function(e) {
    return $(e.target).find(":jqmData(role='tabbar')").tabbar();
  });
  
  $(":jqmData(role='page')").live('pageshow', function(e) {
    // Grab the id of the page that's showing, and select it on the Tab Bar on the page
    var tabBar, id = $(e.target).attr('id');

    tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
    if(tabBar.length) {
      tabBar.tabbar('setActive', '#' + id);
    }
  });
 

})(jQuery);

$(document).ready(function() {

 var client_browser = null;

 function parseParameters(s) {
    var x = s.split('&');
    var i = 0;
    var q = {};
    while (i < x.length) {
        var t = x[i].split('=', 2);
        var name = unescape(t[0]);
        q[name] = unescape(t[1]);
        i++;
    }
    return q;
 }

 var authorize_url = "https://foursquare.com/oauth2/authenticate?client_id=BSNUGYGRRVEK3KR0ZOWUUWHXPOLWYSNNAILOQIGC1GRWBGJA&response_type=token&redirect_uri=https://foursquire.herokuapp.com/callback&display=touch";
                  
 function foursquareAuthLocChanged(loc) {
    /* Here we check if the url is the login success */
    if (loc.indexOf('https://foursquire.herokuapp.com/callback') == 0) {
        client_browser.close();
        window.location = window.location + '#home'
        loc = unescape(loc);
        console.log("foursquareAuthLocChanged: " + loc);
        var s = loc.match(/#(.*)$/)[1];
        console.log("matched: " + s);
        //alert(loc);
        var token = parseParameters(s)['access_token'];
        console.log("access_token: " + token);
        if (token) {
            $.getJSON('https://foursquire.herokuapp.com/login/' + token, function(data) {
                console.log("login complete");
                var ios = { udid : device.uuid };
                if (window.deviceToken) ios.deviceToken = window.deviceToken;
                if (data && data.entities && data.entities[0]) {
                    console.log("logged in: " + data.entities[0].uuid);
                    $.ajax({
                        type: "PUT",
                        url: 'http://usergrid-prod-api-v2.elasticbeanstalk.com/Foursquire/foursquire2/users/'+ data.entities[0].uuid,
                        data: JSON.stringify({ ios : ios }),
                        contentType: 'application/json',
                        dataType: 'json',
                        success: function(data, textStatus, jqXHR) {
                            console.log( "Data saved: " + textStatus );
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log( "Data not saved: " + errorThrown + " : " + textStatus );
                        },
                        xhrFields: {
                              withCredentials: true
                        }
                    });
                }
            });
    
        }
    }
 }

 function onFoursquareAuthBtn() { 
    console.log("onFoursquareAuthBtn");

    client_browser = ChildBrowser.install(); 
    client_browser.onLocationChange = function(loc) {
        foursquareAuthLocChanged(loc);
    };
    if (client_browser != null) {
        window.plugins.childBrowser.showWebPage(authorize_url);
    }
    else {
      console.log("no child browser");
    }
 }

  $("#connect_fq").bind("tap", onFoursquareAuthBtn); 
                  
                  
});