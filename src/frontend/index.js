var express = require("express");
var http = require('http');

var app = express();
var port = 3000;

app.get('/', function(req, res){
  res.send('Nothing here yet. Try again later. ');
});

//documentation served under /doc
app.use("/doc", express.static(__dirname + '/../../static/doc'));

http.Server(app).listen(port, function(){
  console.log('listening on *:'+port);
});
