// Set the configuration for your app
var config = {
  apiKey: "AIzaSyCFFVZNetMbd5O4ki7JHau49Th7dKzV6sg",
  authDomain: "ds-save-bank.firebaseapp.com",
  databaseURL: "https://ds-save-bank.firebaseio.com",
  storageBucket: "ds-save-bank.appspot.com",
  messagingSenderId: "148864661511"
};
firebase.initializeApp(config);

// Handlebars templating for the search area.
var search_template_source   = document.getElementById("template-search-result").innerHTML;
var search_template = Handlebars.compile(search_template_source);
var alert_template_source   = document.getElementById("template-alert").innerHTML;
var alert_template = Handlebars.compile(alert_template_source);

/* Shamelessly stolen from SO here: http://stackoverflow.com/a/105074 */
// Generate a random-enough ID. Used for file identifiers.
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();
var storage_saves = storage.ref('saves');
var db = firebase.database();
var ref = db.ref('saves');

var form = document.getElementById("form");
form.onsubmit = function (e) {
  e.preventDefault();
  var hash = window.location.hash.slice(1);
  var uniqueid = guid();
  var storage_savegame = storage_saves.child("games/" + hash + "/saves/3ds-save-" + uniqueid + ".zip");
  file = document.getElementById("savegame-file");
  var storageUploadTask = storage_savegame
    .put(file.files[0], {contentType: "application/zip"})
    .then(function (snapshot) {
      var db_savegame = db.ref("games/" + hash + "/saves");
      db_savegame.push({
        uniqueid: uniqueid,
        name: document.getElementById("savegame-name").value,
        description: document.getElementById("savegame-desc").value,
        permalink: snapshot.downloadURL
      }).then(function (thing) {
        window.location.reload();
      });
    });
};

var search_input = document.getElementById("search-input");
var search_form = document.getElementById("search-form");

search_form.onsubmit = function (e) {
  e.preventDefault();
  var search_query = search_input.value;
  var region;
  var radios = document.getElementsByName("region");
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      region = radios[i].value;
      break;
    }
  }
  if (region == "USA" || region == "EUR") {
    search_query = search_query.toLowerCase();
  }
  console.log("Value: " + search_query);
  console.log("Searching in: " + "games/" + region);
  var results_elt = document.getElementById("search-results");
  results_elt.innerHTML = "";
  results_elt.innerHTML += alert_template({
    type: "info",
    text: "Displaying up to 10 results."
  });

  var search_ref = db.ref("games/" + region);
  search_ref.orderByChild("search_name")
    .startAt(search_query)
    .limitToFirst(10)
    .on("child_added", function(snapshot) {
      var game = snapshot.val();
      console.log("Game: " + region + "/" + snapshot.key + " " + game.name);
      if (game.saves) {
        num_saves = Object.keys(game.saves).length;
      } else {
        num_saves = 0;
      }
      results_elt.innerHTML += search_template({
        name: game.name,
        url: region + "/" + snapshot.key,
        num_saves: num_saves
      });
  });
};

function change_page(page_id) {
  if (page_id == "main-area") {
    window.location.hash = "";
  }
  var pages = document.getElementsByClassName("page-in");
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    page.classList.remove("page-in");
    page.classList.add("page-out");
  }
  document.getElementById("savegame-name").value = "";
  document.getElementById("savegame-desc").value = "";
  document.getElementById(page_id).classList.remove("page-out");
  document.getElementById(page_id).classList.add("page-in");
}

function hash_change() {
  if (window.location.hash.length < 3) {
    change_page("main-area");
  }
  else {
    load_game_from_hash();
  }
}

function load_game_from_hash() {
  var hash = window.location.hash.slice(1);
  if (hash.length === 0) {
    return;
  }
  var search_ref = db.ref("games/" + hash);
  search_ref.once("value", function(snapshot) {
    var game = snapshot.val();
    populate_game_area(game);
  });
}

window.onhashchange = hash_change;

if (window.location.hash) {
  load_game_from_hash();
}

function populate_game_area(game) {
  var template_source   = document.getElementById("template-game-area").innerHTML;
  var template = Handlebars.compile(template_source);
  if (window.location.hash.indexOf("USA") > -1) {
    game.region = "USA";
    game.region_emoji = "&#x1F1FA;&#x1F1F8;";
  }
  if (window.location.hash.indexOf("EUR") > -1) {
    game.region = "EUR";
    game.region_emoji = "&#x1F1EA;&#x1F1FA;";
  }
  if (window.location.hash.indexOf("JPN") > -1) {
    game.region = "JPN";
    game.region_emoji = "&#x1F1EF;&#x1F1F5;";
  }
  if (window.location.hash.indexOf("CHN") > -1) {
    game.region = "CHN";
    game.region_emoji = "&#x1F1E8;&#x1F1F3;";
  }
  if (window.location.hash.indexOf("TWN") > -1) {
    game.region = "TWN";
    game.region_emoji = "&#x1F1F9;&#x1F1FC;";
  }
  if (window.location.hash.indexOf("KOR") > -1) {
    game.region = "KOR";
    game.region_emoji = "&#x1F1F0;&#x1F1F7;";
  }
  document.getElementById("game-details").innerHTML = template(game);
  change_page("game-area");
}
