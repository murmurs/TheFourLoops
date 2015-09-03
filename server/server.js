var express = require('express');
var expressInvoked = express();
var server = require('http').Server(expressInvoked);
var port = process.env.Port || 3000;
var path = require('path');
var io = require('socket.io')(server);
var textStore = {};

io.on('connection', function(socket){

  socket.on('typing', function(data){
    console.log(data);
  });

  socket.on('disconnect', function(){
    console.log("we're disconnected");
  })

})

expressInvoked.use(express.static(path.join(__dirname, '../public')));

expressInvoked.listen(port, function(){
  console.log("it's working")
});