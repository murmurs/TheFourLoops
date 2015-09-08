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

var roomCount = 0;// number of rooms so we can make new rooms

io.on('connection', function (socket) {

  socket.join('waitingRoom', function(err){
    if(err){
      console.log(err)
    }else{
      checkWaitingRoom();
    }
  }); //joins room named waitingRoom

  socket.on('typing', function(data){
    this.rooms.forEach(function(room){
      this.to(room).emit('typing', data);
    }.bind(this));
  });

  socket.on('disconnect', function(){
    checkPlayerRooms();
  });



});

var checkWaitingRoom = function(){
  
  var waitingSockets = Object.keys(io.sockets.adapter.rooms['waitingRoom']);

  if( waitingSockets.length > 1){

    var room = roomCount.toString();
    roomCount++;

    var player1 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms['waitingRoom'])[0]
      ];
    var player2 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms['waitingRoom'])[1]
      ];
    
    pair(room, player1, player2, function(room){

      logRooms();
    });
  }else{
    logRooms();
  }
};

var pair = function(room, player1, player2, callback){

  /*  players join rooms one after another, with callback invoked afterwards*/

  player1.join(room, function(err){
    if(err){
      console.log(err);
    }
    player2.join(room, function(err){
      if(err){
        console.log(err);
      }else{
        player1.leave('waitingRoom', function(err){
          if(err){
            console.error(err);
          }else{
            player2.leave('waitingRoom', function(err){
              if(err){
                console.error(err);
              }else{
                callback(room);
              }
            });
          }
        });
      }
    });
  });
};

var checkPlayerRooms = function(){
  
  var rooms = Object.keys(io.sockets.adapter.rooms);

  for(var i = 0; i < rooms.length; i++){
    var clients = Object.keys(io.nsps['/'].adapter.rooms[rooms[i]]);

    if(clients.length < 2 && rooms[i] !== 'waitingRoom'){

      io.of('/').connected[clients[0]].to(rooms[i]).emit('opponentLeft');
      io.of('/').connected[clients[0]].leave(rooms[i], function(){
        logRooms();
      });

    }
  }

};

var logRooms = function(){

  console.log('============================================================');
  for(var socket in io.of('/').connected){
    console.log('socket: ', socket, ' rooms :', io.of('/').connected[socket].rooms); 
  }
  console.log('============================================================');
};


