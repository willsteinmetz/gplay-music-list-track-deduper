var PlayMusic = require('playmusic');
var pm = new PlayMusic();
var util = require('util');

var credentials = require('./credentials');

var playlists = {};

pm.init(credentials, function(err) {
  if (err) { console.error(err); }
  getPlaylistPage();
});

function getPlaylistPage(nextPageToken) {
  var opts = {};
  if (nextPageToken) {
    opts.nextPageToken = nextPageToken;
  }
  pm.getPlayListEntries(opts, function(err, data) {
    groomPlaylistData(data.data.items);

    if (data.nextPageToken) {
      getPlaylistPage(data.nextPageToken);
    } else {
      displayResults();
    }
  });
}

function groomPlaylistData(playlistData) {
  for (var index in playlistData) {
    var list = playlistData[index];
    if (!playlists.hasOwnProperty(list.playlistId)) {
      playlists[list.playlistId] = [];
    }
    playlists[list.playlistId].push(list);
  }
}

function displayResults() {
  var aquaMixId = '8074debf-38d2-364c-94de-95ddaff2a0a8';
  if (playlists.hasOwnProperty(aquaMixId)) {
    var playlist = playlists[aquaMixId];
    console.log("Aqua Mix playlist:");
    var tracks = {};
    for (var index in playlist) {
      var track = playlist[index];
      if (!tracks.hasOwnProperty(track.trackId)) {
        tracks[track.trackId] = 0;
      }
      tracks[track.trackId]++;
    }
    console.log(tracks);
  } else {
    console.log('couldn\'t find aqua mix');
  }
}
