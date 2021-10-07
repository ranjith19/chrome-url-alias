// Load stored preferenced
store = new Object();

function updateStore() {
  chrome.storage.sync.get('urlalias', function (obj) {
    store = new Object();

    // First time, initialize.
    if (obj != null) {
      store = obj.urlalias;
    }

    // Add default keys if empty.
    if (store == null || Object.keys(store).length == 0) {
      store = new Object();
      store["m"] = "https://mail.google.com";
      store["c"] = "https://calendar.google.com";
      store["d"] = "https://drive.google.com";
      chrome.storage.sync.set({ 'urlalias': store});
    }
  });
};
updateStore();

function isNotEmpty(value) {
  return value != "";
}

// Checks if 'server' is to be redirected, and executes the redirect.
function doRedirectIfSaved(tabId, server, others) {
  var redirect = store[server]; 

  if (others) {
    others = others.filter(isNotEmpty);
    // Check if it's a dynamic alias
    if (others.length > 0) {
      // Check if we have a matching redirect
      for (var key in store) {
        if (key.startsWith(server) && key.includes("###")) {
          // Found the server
          redirect = store[key].replace("###", others.join('/'));
          break;
        }
      }
    }
  }

  if (redirect == null) {
    return;
  }

  if (redirect.indexOf('://') < 0) {
    // Add a default protocol
    redirect = "http://" + redirect;
  }
  chrome.tabs.update(tabId, { url: redirect });
}

// Called when the user changes the url of a tab.
function onBeforeRequest(details) {
  var url = details.url;

  var url_protocol_stripped = /^http[s]?:\/\/(.*)/g.exec(url);

  if (url_protocol_stripped != null && url_protocol_stripped.length >= 2) {
    var match = url_protocol_stripped[[1]].split("/");
    doRedirectIfSaved(details.tabId, match[0], match.splice(1));
  }
}

// Listen for any changes to the URL of any tab.
chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest,
{ 
    urls: ["<all_urls>"],
    types: ["main_frame"],
},
["blocking"]);

// Track changes to data object.
chrome.storage.onChanged.addListener(function(changes, namespace) {
  updateStore();
});

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}
