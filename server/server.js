var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

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