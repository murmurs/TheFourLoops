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
  console.log('connection');
  socket.on('typing', function (data) {
    if(userIds.indexOf(data.userId)){
      io.sockets.emit('typing',{
        userId:data.userId,
        code:data.code
      });
    }
  });
});

console.log('Listening');