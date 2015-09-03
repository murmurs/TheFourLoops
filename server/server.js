var express = require('express');
var expressInvoked = express();
var server = require('http').Server(expressInvoked);
var port = process.env.Port || 3000;
var path = require('path');
var io = require('socket.io')(server);

io.on('connection', function(socket){

  socket.on('event', function(data){});

  socket.on('disconnect', function(){
    console.log("we're disconnected");
  })

})

expressInvoked.use(express.static(path.join(__dirname, '../public')));

expressInvoked.listen(port, function(){
  console.log("it's working")
});