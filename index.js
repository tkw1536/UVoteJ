var express = require("express");
var http = require('http');

var app = express();
var port = 3000;

app.use(express.static(__dirname + '/static'));

http.Server(app).listen(port, function(){
  console.log('listening on *:'+port);
});
