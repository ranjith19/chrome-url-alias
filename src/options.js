// Saves options to storage.
function saveStore(store) {
  displaySync(store)
  chrome.storage.sync.set({ 'urlalias': store });
  // Update status to let user know options were saved.
  toast("Saved")
}

function save() {
  var store = new Object();

  // Saves all options
  var entries = $('#entries input');
  for (var i = 0; i < entries.length; i += 2) {
    key = entries[i].value;
    val = entries[i + 1].value;

    if (key != '' && val != '') {
      store[key] = val;
    }
  }
  saveStore(store)
}

// Restores select box state to saved value from localStorage.
function onLoad() {
  // Restore all options
  chrome.storage.sync.get('urlalias', function (store) {
    store = store.urlalias;
    displaySync(store)
    showJson(store)
  });

  // Register click handlers
  $("#save").click(save);
  $('#newEntry').click(function () { addRow("", ""); });
  $('#savejson').click(saveJson);

  var elem = document.querySelector('.collapsible.expandable');
  var instance = M.Collapsible.init(elem, {
    accordion: false
  });

}

// Add an individual row to the table.
function addRow(alias, redirect) {
  var tr = $('<tr>');

  var del = $('<button class="waves-effect waves-light btn-small pink">Delete</button>');
  del.click(function () { tr.remove(); });

  tr.append($('<td width="20%">').append($('<input>').val(alias)));
  tr.append($('<td width="60%">').append($('<input>').val(redirect)));
  tr.append($('<td width="10%">').append(del));

  $('#entries tbody').append(tr);
}

function showJson(store) {
  let data = {}
  for (var key in store) {
    data[key] = store[key]
  }
  let txt = JSON.stringify(data, undefined, 2);
  $("#json-data").val(txt)
  M.textareaAutoResize($('#json-data'));
}

function showKeyVals(store) {
  $('#entries tbody').empty()
  for (var key in store) {
    addRow(key, store[key]);
  }
}

function displaySync(store) {
  showKeyVals(store)
  showJson(store)
}

function saveJson() {
  let jsonData = $("#json-data").val()
  try {
    let store = JSON.parse(jsonData)
    saveStore(store)
  }
  catch (e) {
    toast("invalid JSON")
  }
}

function toast(msg) {
  M.toast({ html: msg })
}



function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}


$(document).ready(onLoad);
