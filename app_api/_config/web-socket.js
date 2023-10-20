const util = require('../../util');

module.exports = webSocket

// Define socket messages
function webSocket(socket) {
  var hbId = null;
  var tdId = null;

  console.log(`www: socket.io server is connected:' ${socket.id}`);

  socket.on('message', data => {
    console.log('Here a test Message from web-socket', data)
  })

  socket.on('status start', () => {
    console.log('www: START socket.io heartbeats');
    hbId = heartbeats(socket);
    //console.log(`www: socket.io heartbeats' ${hbId}`);

    socket.on('tagdata', tags => {
      console.log("TAGS: " + tags);
      tdId = recentDataFromTags(tags);
  })

  socket.on('status stop', () => {
      if(hbId)  {
        console.log("Clearing interval for looking at heartbeats...");
        clearInterval(hbId);          // built in function to stop execution interval of subscription
      }
  })

  socket.on('tagdata stop', () => {
      if (tdId != null) {
          console.log("Clearing interval for recent tag data...");
          clearInterval(tdId);
      }
  })

});
  
  // This will be sent to the angular component as a test viewable in the browser
  socket.emit('data', { name: 'Gib', age: 60, dob: 1234 })
}


function heartbeats(socket) {
  var hbId = setInterval(async function () {
      var beats = await util.getHeartBeats();
      console.log(`(web-Socket): HeartBeat Value: ${JSON.stringify(beats, null,2)}`);
      socket.emit('heartbeats', beats);
  }, 5000);

  return hbId;
}


function recentDataFromTags(tags) {
  var tdId = setInterval(async function () {
      var data = await util.getRecentTagData(tags);
      console.log(data);
      ioServer.emit('recentdata', data);
  }, 5000);

  return tdId;
}

function timing(callback) {
  setInterval(callback, 1000)
}
