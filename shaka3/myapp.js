function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// There are two cases, the user has either provided a URL or streamID of a manifest list, or both
// in which case the URL get's the priority.
function defineManifest() {
  var streamId = getParameterByName('streamId');
  console.log("streamid: " + streamId);
  // var URL = getParameterByName('URL');
  // var URL = "https://storage.googleapis.com/shaka-demo-assets/sintel-trickplay/dash.mpd"
  var URL = 'http://media.developer.dolby.com/DolbyVision_Atmos/profile8.1_DASH/p8.1.mpd';
  console.log("URL: " + URL);

  if (URL != null) {
    console.log("URL: " + URL);
    return URL.toString();
  }
  if (streamId != null) {
    console.log("streamid: " + streamId);
    return list[streamId].link.toString();
  }
  else {
    console.debug("streamId nor URL were provided in the url");
  }
}


var shakaDemo = {};

var loadButton = 0;
var lastRate = 0;           //variable used to compute frameRate
var lastDroppedFrames = 0;
statsLocation = '#taStats'  //stats for nerds object
playingStatusLocation = '#taPlayingStatus'
var stringStats = new String();   //map of data for stats for nerds
var stats = "";

const manifestUri =  defineManifest();
//const manifestUri = 'https://storage.googleapis.com/shaka-demo-assets/sintel-mp4-only/dash.mpd';
const licenseServer = 'https://cwip-shaka-proxy.appspot.com/no_auth';

function onError(error) {
  // Log the error.
  // name = 'Error name ' + error.name + ' ,Error code ' + error.code + ' ,object ' + error;
  // console.error('Error name', error.name, 'Error code', error.code, 'object', error);
  console.log(error)
  $('#debugDiv').append('<p>' + name + '</p>');
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function initApp() {
  console.log("Init app loaded");
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();
  initPlayer(); 
    // Check to see if the browser supports the basic APIs Shaka needs.
  // if (! shaka.Player.isBrowserSupported()) {
  //   // This browser does not have the minimum set of APIs we need.
  //   //console.error('Browser not supported!');
  // } else {
  //   console.log('Browser supported!');
  // }
}

async function initPlayer() {
  // Create a Player instance.
  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  player.configure({
    drm: {
      servers: { 'com.widevine.alpha': licenseServer }
    }
  });


  // player.getNetworkingEngine().registerRequestFilter(function(type, request) {
  //   // Only add headers to license requests:
  //   if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
  //     // This is the specific parameter name and value the server wants:
  //     // Note that all network requests can have multiple URIs (for fallback),
  //     // and therefore this is an array. But there should only be one license
  //     // server URI in this tutorial.
  //     request.uris[0] += '?CWIP-Auth-Param=VGhpc0lzQVRlc3QK';
  //   }
  // });

  player.configure('streaming.jumpLargeGaps', true);

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(manifestUri);
    console.log('The video has now been loaded!');
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }

  //Loading all the additional shaklaplayer methods
  shakaDemo.setupInfo_();

}

//Adding a value to a string which is displayed on the player
function pushToString(key, value) {
  stringStats += key + ": " + value + "\n";
}

//Reseting a value of the string to an empty value
function resetString() {
  stringStats = "";
}

//Fetching the values from the string
function getString() {
  return stringStats;
}

function fetchStats() {
  try {
    stats = player.getStats();
    stats2 = video.getVideoPlaybackQuality();
  }
  catch (e) {
    console.error(e);
  }
}

// Invoking shakDemoMethods
shakaDemo.setupInfo_ = function () {
  try {
    window.setInterval(shakaDemo.updateDebugInfo_, 1000);
    window.setInterval(shakaDemo.loadPlayingStatus_, 100);
    shakaDemo.loadEventDebug();
  }
  catch (e) {
    console.error(e);
  }
}

// Stats - current state of the player (paused/buffering/playing)
shakaDemo.loadPlayingStatus_ = function () {
  if (typeof player != 'undefined') {
    fetchStats();
    try {
      length = stats.stateHistory.length;
      element = stats.stateHistory[length - 1].state;

      switch (element) {
        case "playing":
          $(playingStatusLocation).html(element).removeClass("paused");
          $(playingStatusLocation).html(element).removeClass("buffering");
          $(playingStatusLocation).html(element).addClass("playing");
          break;

        case "paused":
          $(playingStatusLocation).html(element).removeClass("playing");
          $(playingStatusLocation).html(element).removeClass("buffering");
          $(playingStatusLocation).html(element).addClass("paused");
          break;

        case "buffering":
          $(playingStatusLocation).html(element).removeClass("playing");
          $(playingStatusLocation).html(element).removeClass("paused");
          $(playingStatusLocation).html(element).addClass("buffering");
          break;

      }
    }
    catch (e) {
    }
  }
}


// Stats - updating 'stats for nerds' block in the corrner of the screen. Relevant features should
// be added or taken out here.
shakaDemo.updateDebugInfo_ = function () {
  //Setting the string to null
  resetString();
  //Fetching stats
  fetchStats();

  //Defining current playing status
  pushToString("Video resolution", fetchVideoRes());
  pushToString("Buffer", fetchBufferingTime());
  pushToString("Estimated bandwidth", stats.estimatedBandwidth);
  pushToString("Playing time", stats.playTime);
  pushToString("Paused time", stats.pauseTime);
  pushToString("Buffering time", stats.bufferingTime);
  pushToString("Playing speed", player.getPlaybackRate());
  pushToString("Framerate", computeFrameRate(stats.decodedFrames));
  pushToString("DroppedFrames", computeDroppedFrames(stats.droppedFrames));
  pushToString("TotalDecodedFrames", stats.decodedFrames);
  pushToString("TotalDroppedFrames", stats.droppedFrames);
  pushToString("Playing ", player.getAssetUri());
  // pushToString("Type of content", list[getParameterByName('streamId')].auth);

  $(statsLocation).html(getString());
}

//Loading events
shakaDemo.loadEventDebug = function () {

  (function () {
    var old = console.log;
    var logger = document.getElementById('log');
    console.log = function (message) {
      if (typeof message == 'object') {
        logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '\n';
      } else {
        logger.innerHTML += message + "</br>";
      }
    }
  })();

  video.addEventListener("abort", function () { console.log(" abort "); }, true);
  video.addEventListener("error", function () { console.log(" error"); }, true);
  video.addEventListener("loadstart", function (e) { console.log(" loadstart: ", e) }, true);
  video.addEventListener("playing", function (e) { console.log(" playing ", video.currentSrc); }, true);
  video.addEventListener("waiting", function () { console.log(" waiting "); }, true);
  video.addEventListener("seeking", function () { console.log(" seeking "); }, true);
  video.addEventListener("seeked", function () { console.log(" seeked "); }, true);
  video.addEventListener("ended", function () { console.log(" ended "); }, true);
  video.addEventListener("loadedmetadata", function () { console.log(" loadedmetadata "); }, true);
  video.addEventListener("loadeddata", function () { console.log(" loadeddata "); }, true);
  video.addEventListener("canplay", function () { console.log(" canplay "); }, true);
  video.addEventListener("canplaythrough", function () { console.log(" canplaythrough "); }, true);
  video.addEventListener("durationchange", function () { console.log(" durationchange "); }, true);
  video.addEventListener("play", function () { console.log(" play"); }, true);
  video.addEventListener("pause", function () { console.log(" pause"); }, true);
  video.addEventListener("ratechange", function () { console.log(" ratechange"); }, true);
  video.addEventListener("volumechange", function () { console.log(" volumechange"); }, true);
  video.addEventListener("emptied", function () { console.log(" emptied"); }, true);
  video.addEventListener("timeupdate", function () { console.log("timeupdate: " + video.currentTime); }, true);
  video.addEventListener('stalled', (event) => {
    console.log('Failed to fetch data, but trying.');
  });
  video.addEventListener('suspend', (event) => {
    console.log('Data loading has been suspended.');
  });

}

// Fetching video resolution
function fetchVideoRes() {
  return video.videoWidth + ' x ' + video.videoHeight;
}

//Frame rate is deduced from decodedFrames.
function computeFrameRate(decodedFrames) {
  frameRate = decodedFrames - lastRate;
  lastRate = decodedFrames;
  return frameRate;
}

//DroppedFrames per second
function computeDroppedFrames(droppedFrames) {
  droppedFrameRate = droppedFrames - lastDroppedFrames;
  lastDroppedFrames = droppedFrames;
  return droppedFrameRate;
}

//Compute buffered time
function fetchBufferingTime() {
  var behind = 0;
  var ahead = 0;

  var currentTime = video.currentTime;
  var buffered = video.buffered;
  for (var i = 0; i < buffered.length; ++i) {
    if (buffered.start(i) <= currentTime && buffered.end(i) >= currentTime) {
      ahead = buffered.end(i) - currentTime;
      behind = currentTime - buffered.start(i);
      break;
    }
  }
  var temp = '- ' + behind.toFixed(0) + 's / ' + '+ ' + ahead.toFixed(0) + 's';

  //document.getElementById('bufferedDebug').textContent = temp;
  return temp;
}


// -------------------------------
// -------------BUTTONS-----------
// -------------------------------
var curTrick = 1;

document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  console.log("KeyPress " + keyName);
  if (keyName === 'MediaFastForward' || keyName === 'F3') {
    switch (curTrick) {
      case -2:
        console.log("Trickplay 1x");
        player.trickPlay(1);
        curTrick = 1;
        break;
      case 1:
        console.log("Trickplay 2x");
        player.trickPlay(2);
        curTrick = 2;    
        break;
      case 2:
        console.log("Trickplay 5x");
        player.trickPlay(5);
        curTrick = 5;
        break
      default:
        console.log("Trickplay IGNORED");
        break;
    }    
  }
  if (keyName === 'MediaRewind' || keyName === 'F2') {
    switch (curTrick) {
      case 1:
        console.log("Trickplay -2x");
        player.trickPlay(-2);
        curTrick = -2;
        break;
      case 2:
        console.log("Trickplay 1x");
        player.trickPlay(1);
        curTrick = 1;
        break
      case 5:
        console.log("Trickplay 2x");
        player.trickPlay(2);
        curTrick = 2;
        break;
      default:
        console.log("Trickplay IGNORED");
        break;
    }
  }
}, false);


document.addEventListener('DOMContentLoaded', initApp);