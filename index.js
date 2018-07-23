const PlayMusic = require('playmusic');
const util = require('util');

const pm = new PlayMusic();
const credentials = require('./credentials');
const playlists = {};
const playlistInfo = {};

pm.init(credentials, function(err) {
  if (err) { console.error(err); }

  getPlaylists();
});

function getPlaylists() {
  console.log('Fetching playlist info...');
  pm.getPlayLists(function(err, data) {
    for (const playlist of data.data.items) {
      playlistInfo[playlist.id] = playlist.name;
    }

    console.log('Fetched playlist info.');

    getPlaylistPage();
  });
}

function getPlaylistPage(nextPageToken) {
  console.log('Fetching tracks in playlists...');
  var opts = {};
  if (nextPageToken) {
    opts.nextPageToken = nextPageToken;
  }
  pm.getPlayListEntries(opts, function(err, data) {
    groomPlaylistData(data.data.items);

    if (data.nextPageToken) {
      getPlaylistPage(data.nextPageToken);
    } else {
      console.log('Fetched tracks in playlists.');
      displayResults();
    }
  });
}

function groomPlaylistData(playlistData) {
  for (const list of playlistData) {
    if (!playlists.hasOwnProperty(list.playlistId)) {
      playlists[list.playlistId] = [];
    }
    playlists[list.playlistId].push(list);
  }
}

function displayResults() {
  for (const key in playlists) {
    const playlist = playlists[key];
    const tracks = [];
    const tracksToRemove = [];

    console.log(`Cleaning up playlist "${playlistInfo[key]}"`);

    for (const track of playlist) {
      if (tracks.indexOf(track.trackId) === -1) {
        tracks.push(track.trackId);
      } else {
        tracksToRemove.push(track.id);
      }
    }

    if (tracksToRemove.length) {
      console.log(`Removing ${tracksToRemove.length} tracks from playlist...`);
      console.log("");

      pm.removePlayListEntry(tracksToRemove, function(err, data) {
        if (err) { console.error(err); }
      });
    } else {
      console.log('This playlist is clear of duplicates.');
      console.log('');
    }
  }
}
