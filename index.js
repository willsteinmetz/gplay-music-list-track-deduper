var PlayMusic = require('playmusic'),
  util = require('util');

var pm = new PlayMusic(),
  credentials = require('./credentials'),
  playlists = {},
  playlistInfo = {};

pm.init(credentials, function(err) {
  if (err) { console.error(err); }

  getPlaylists();
});

function getPlaylists() {
  console.log("Fetching playlist info...");
  pm.getPlayLists(function(err, data) {
    for (var index in data.data.items) {
      var playlist = data.data.items[index];
      playlistInfo[playlist.id] = playlist.name;
    }

    console.log("Fetched playlist info.");

    getPlaylistPage();
  });
}

function getPlaylistPage(nextPageToken) {
  console.log("Fetching tracks in playlists...");
  var opts = {};
  if (nextPageToken) {
    opts.nextPageToken = nextPageToken;
  }
  pm.getPlayListEntries(opts, function(err, data) {
    groomPlaylistData(data.data.items);

    if (data.nextPageToken) {
      getPlaylistPage(data.nextPageToken);
    } else {
      console.log("Fetched tracks in playlists.");
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
  for (var key in playlists) {
    var playlist = playlists[key],
      tracks = [],
      tracksToRemove = [];

    console.log("Cleaning up playlist '"  + playlistInfo[key] + "'");

    for (var index in playlist) {
      var track = playlist[index];
      if (tracks.indexOf(track.trackId) === -1) {
        tracks.push(track.trackId);
      } else {
        tracksToRemove.push(track.id);
      }
    }

    console.log("Removing " + tracksToRemove.length + " tracks from playlist...");
    console.log("");

    pm.removePlayListEntry(tracksToRemove, function(err, data) {
      if (err) { console.error(err); }
    });
  }
}
