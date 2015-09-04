var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Firebase = require("firebase");

var port = process.env.PORT || 3000;

server.listen(port);

app.use(express.static('public'));


var userCount = 0;
var userIds = [];

io.on('connection', function (socket) {
  var userId = userCount++;
  socket.emit('userId', {userId:userCount});
  userIds.push(userId);
  socket.on('typing', function (data) { //emit typing regardless of user id. do the check on the client side.
    io.sockets.emit('typing', data); //data has 2 properties, userId and code.
  });
});

var dataRef = new Firebase("https://popping-heat-272.firebaseio.com/");

dataRef.set({
  Challenges: {
    Sum: {
      Question: "Writ a sum function that sums up all of its parameters.",
      Answers: [
        {"Input": [1,2,3], "Output": 6},
        {"Input": [10,20,3], "Output": 33}
      ]
    }
  }
});