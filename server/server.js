var express = require('express');
var server = express();
var port = process.env.Port || 3000;
var path = require('path');

server.use(express.static(path.join(__dirname, '../public')));

server.listen(port, function(){
  console.log("it's working")
});