var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Firebase = require("firebase");
var passport = require('passport');
var session = require('express-session');
var Cookies = require('cookies');
var FacebookStrategy = require('passport-facebook').Strategy;
var FirebaseStore = require('connect-firebase')(session); //Will still check if this is needed
var firebase = new Firebase('https://codefighter.firebaseio.com/');


var port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.static('bower_components'));
app.use(session({ 
  secret: 'My Glorious God, The Murmur God!',
  store: new FirebaseStore({ 
    host : 'codefighter.firebaseio.com',
    reapInterval : 10000
  }),
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(Cookies.express());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: '1727433694144167',
    clientSecret: '2a9be8774548ba0803ba29e48adb1adf',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    //store whatever profile was grabbed from call to Facebook server
    process.nextTick(function () {

      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });   
  }
));

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth-facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  }
);

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/logout' }), function(req, res) {
  //Successful authentication, sets cookies
     res.cookies.set('userID', req.user.id, {
      maxAge: 86400000,   // expires in 1 month
      httpOnly: false,    // more secure but then can't access from client
     });
     res.cookies.set('displayName', req.user.displayName, {
      maxAge: 86400000,   // expires in 1 day(s)
      httpOnly: false,    // more secure but then can't access from client
     })
  // Successful authentication, redirect home.
  res.redirect('/');
});

//Needs some fixing
app.get('/profile', function(req, res){
    res.send();
})

//Logouts the user and destroys session. But still needs refurbishing
app.get('/logout', function(req, res){
  req.session.destroy();
  req.session = null;
  
  req.logout();
  // res.clearCookie('connect.sid'); //Should I destroy this aswell?
  res.clearCookie('userID');
  res.redirect('/');
});

server.listen(port);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

/////////////////Anything below here is original and unchanged///////////////////////////




var roomCount = 0;// number of rooms so we can make new rooms

io.on('connection', function (socket) {
  /* new socket (user) joins waiting room */
  
  /* handles the animation */
  socket.on('startAnimate', function(data){
    socket.emit('animate', {
      action : [data.animation, data.avatar]
    })
  });

  socket.on('knockOut', function(data){
    this.rooms.forEach(function(room){
      if( room !== 'waitingRoom'){
        io.to(room).emit('animate', {
          facebookId: data.facebookId,
          moveType: 'knockOut',
        });
      }
    })
  })

  socket.on('problem', function(data){
    /*  relay problem statement to slave  */
    this.rooms.forEach(function(room){
      this.to(room).emit('problem', data);
    }.bind(this));
  });

  socket.on('start', function(data){
    socket.username = data.username;
    if(data.gameType === 'ghostMatch'){

      ghostPair(this, data.username);

    } else if(data.gameType === 'randomPlayerVsPlayer'){
      socket.join('waitingRoom', function(err){
        if(err){
          console.log(err)
        }else{
          /*  check the wiating room for other players */
          checkWaitingRoom();
          // logRooms();
        }
      });
    }
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
        if (room.split(' ')[0] === 'codeRoomGhost'){
          if(data.maxSemiColons < data.semiColonCount){
            io.to(room).emit('animate', {
              facebookId: data.facebookId,
              moveType: 'knockOut',
            })
            console.log('should fire the new knockout animation')
          }

          io.to(room).emit('animate', {
            facebookId: data.facebookId,
            moveType: 'normalAttack',
          });
        }
      }

      roomMatch = room.split(' ');
      if(roomMatch[0] === 'codeRoom' || roomMatch[0] === 'codeRoomGhost') {

        var matchRefUrl = roomMatch[1];
        var matchRef = new Firebase(matchRefUrl);
        var playerRef = matchRef.child('players/' + data.facebookId)
        var typingState = playerRef.push();

        matchRef.update({'startTime': data.startTime});
        matchRef.update({'challengeId': data.challengeId});
        data.timestamp = Date.now();
        // data.room = room;
        typingState.update(data);
      }
    }.bind(this));
  });

  socket.on('ghostMatchBegin', function(data){
    this.rooms.forEach(function(room){
      if( room !== 'waitingRoom'){
        testGhost(room);
      }
    });
  });

  function testGhost(room){

    var testGhostRef = firebase.child('Challenges/-Jzbf6p07j8OETQvJa4u/Ghosts/-Jzl6oKyfPS4vU_ET_C_/typingData');

    testGhostRef.once('value', function(snapshot){
      var ghostTypingObj = snapshot.val();
      var ghostTypingArr = [];

      for(var key in ghostTypingObj){
        ghostTypingArr[ghostTypingArr.length] = ghostTypingObj[key];
      }

      ghostTypingArr.sort(function(a,b){
        return a.timestamp - b.timestamp;
      })

      ghostTypingArr.forEach(function(typedObject, i, l){
        var delay = typedObject.timestamp - typedObject.startTime;
        console.log('outside', i, delay)
        setTimeout(function(){
          // if(typedObject.room === room){
            console.log('fire', i);
            io.to(room).emit('typing', typedObject);
            io.to(room).emit('animate', {
              facebookId: 'ghost',
              moveType: 'normalAttack',
            });
          // }
        }, delay)
      })
    })
  }

  socket.on('passed', function(){
    /* player passed */
    this.rooms.forEach(function(room){
      if( room !== 'waitingRoom'){
        this.to(room).emit('passed');
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
    /*  add prefix so coding rooms can be filtered later  */
    var matchId = firebase.child('Matches').push();
    matchId.set({
      'startTime': Date.now(),
      'endTime': 'empty',
      'challengeId': 'empty',
      'winnerId': 'empty',
    })
    console.log('waiting room matchID', matchId.toString())
    var room = 'codeRoom ' + matchId;

    var player1 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms.waitingRoom)[0]
      ];
    var player2 = io.of('/').connected[
        Object.keys(io.sockets.adapter.rooms.waitingRoom)[1]
      ];

    pair(room, player1, player2, function(room){
      /*  remit roomJoined to all members, possibly for start  */
      var roomMatch = room.split(' ');
      var matchId = roomMatch[1].slice(-20);
      io.sockets.to(room).emit('roomJoined', {
        matchId: matchId,
        player1:player1.username,
        player2:player2.username
      });
      // logRooms();
    });
  }else{
    // logRooms();
  }
};

var ghostPair = function(player1, playerUserName){
  var matchId = firebase.child('Matches').push();
  matchId.set({
    'startTime': Date.now(),
    'endTime': 'empty',
    // 'challengeId': 'empty',
    // 'winnerId': 'empty',
  })

  var room = 'codeRoomGhost ' + matchId;
  player1.join(room, function(err){
    if(err){
      console.log(err);
    }
    io.to(player1.id).emit('master');

      /*  remit roomJoined to all members, possibly for start  */
      var roomMatch = room.split(' ');
      var matchId = roomMatch[1].slice(-20);
      io.sockets.to(room).emit('roomJoined', {
        matchId: matchId,
        player1:'Ghost Player',
        player2: playerUserName,
      });
  })
}

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
    player2.join(room, function(err){
      if(err){
        console.error(err);
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
    /*  only check coding rooms, not socket default rooms */
    if(/codeRoom/.test(rooms[i])){
      var clients = Object.keys(io.nsps['/'].adapter.rooms[rooms[i]]);
      if( clients.length < 2 && (rooms[i] !== 'waitingRoom' && rooms[i].slice(8, 14) !== 'Ghost') ){
        /* found a room with a single socket */
          io.sockets.to(rooms[i]).emit('opponentLeft');
      }
    }
  }
};

var logRooms = function(){
  /*  just a helper function for debugging, not that there would be any :) */
  console.log('============================================================');
  for(var socket in io.of('/').connected){
    console.log('socket.username: ', io.of('/').connected[socket].username,  ' rooms :', io.of('/').connected[socket].rooms); 
  }
  console.log('============================================================');
};


