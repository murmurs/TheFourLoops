var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Firebase = require("firebase");

var port = process.env.PORT || 3000;

server.listen(port);

app.use(express.static('public'));
app.use(express.static('bower_components'));

var userCount = 0;
var userIds = [];

var roomCount = 0;// number of rooms so we can make new rooms

io.on('connection', function (socket) {
  /* new socket (user) joins waiting room */
  socket.join('waitingRoom', function(err){
    if(err){
      console.log(err)
    }else{
      /*  check the wiating room for other players */
      checkWaitingRoom();
    }
  });

  socket.on('problem', function(data){
    /*  relay problem statement to slave  */
    this.rooms.forEach(function(room){
      this.to(room).emit('problem', data);
    }.bind(this));
  });

  socket.on('typing', function(data){
    /*  
    route typing inputs to relevant rooms 
    this refers to the socket, emissions sent 
    to a socket's list of rooms    
    */
    this.rooms.forEach(function(room){
      if( room !== 'waitingRoom'){
        this.to(room).emit('typing', data);
      }
    }.bind(this));
  });

  socket.on('disconnect', function(){
    /*
    after socket disconnects, its room list is empty
    so this is a hacky way of checking all rooms for one
    with a single occupant
    */
    checkPlayerRooms();
  });

});

var checkWaitingRoom = function(){
  
  var waitingSockets = Object.keys(io.sockets.adapter.rooms.waitingRoom);

  if( waitingSockets.length > 1){

    var room = roomCount.toString();
    roomCount++;

    var player1 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms.waitingRoom)[0]
      ];
    var player2 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms.waitingRoom)[1]
      ];
    
    pair(room, player1, player2, function(room){
      /*  remit roomJoined to all members, possibly for start  */
      io.sockets.to(room).emit('roomJoined', {
        id:room,
        player1:player1.id,
        player2:player2.id
      });
      // logRooms();
    });
  }else{
    // logRooms();
  }
};

var pair = function(room, player1, player2, callback){

  /*  players join rooms one after another, with callback invoked afterwards 
    -player1 joins
    -player2 joins
    -both player leave waiting room, all in node async fashion
  */

  player1.join(room, function(err){
    if(err){
      console.log(err);
    }
    io.to(player1.id).emit('master');
    // io.to(player2.id).emit('slave');
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
                callback(room, player1, player2);
              }
            });
          }
        });
      }
    });
  });
};

var checkPlayerRooms = function(){
  /*  get list of all rooms */
  var rooms = Object.keys(io.sockets.adapter.rooms);

  for(var i = 0; i < rooms.length; i++){
    var clients = Object.keys(io.nsps['/'].adapter.rooms[rooms[i]]);

    if(clients.length < 2 && 
        (rooms[i] !== 'waitingRoom' || rooms[i] !== 'lonelySockets')){
      /* found a room with a single socket */
      var lonelySocket = io.of('/').connected[clients[0]];
      /*  leave the room (deletes room according to socket docs */
      lonelySocket.leave(rooms[i], function(err){
        if(err){
          console.log(err);
        }
        /*  join lonelySockets room */
        lonelySocket.join('lonelySockets', function(err){
          if(err){
            console.log(err);
          }
          io.sockets.to('lonelySockets').emit('lonelySockets');
        });
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


