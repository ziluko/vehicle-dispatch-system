const http = require('http');
const socketio = require('socket.io');
const port = process.env.PORT || 8020

const server = http.createServer((req, res) => {
  res.end('connected!')
});

const io = socketio(server);

io.on('connection', (socket, req) => {
  socket.on('osc', (data) => {
    console.log(data);
    io.emit('osc', data);
    //io.emit(data.address, data.args[0].value);
  })

  socket.on('connected', (data) => {
    console.log("connected");
  })

  socket.on('disconnected',(data) => {
    console.log('disconnectd')
  })
})

server.listen(port, function listening() {
  console.log("Listening on %d", server.address().port);
});

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
app.use(bodyParser.json());

app.use('/set', express.static(__dirname + '/allocation_v2')); //Serves resources from public folder
app.use('/display', express.static(__dirname + '/display_v2'));

app.post("/datastream", function (req, res) {
  fs.writeFile("output_v2.json", JSON.stringify(req.body), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
    console.log("JSON file has been saved.");
  });
  res.send('You sent the data: "' + req.body + '".');
});

app.get("/datastream", function (req, res) {
  let rawdata = fs.readFileSync('output_v2.json', { encoding: 'utf8', flag: 'r' });
  let res_json = JSON.parse(rawdata.match(/.*current_duty_name":".{3,10}"}}/)[0]);
  res.send(res_json);
});

app.post("/datastreamDefault", function (req, res) {
  fs.writeFile("default_v2.json", JSON.stringify(req.body), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
    console.log("JSON file has been saved.");
  });
  res.send('You sent the data: "' + req.body + '".');
});

app.get("/datastreamDefault", function (req, res) {
  let rawdata = fs.readFileSync('default_v2.json');
  let res_json = JSON.parse(rawdata);
  res.send(res_json);
});

app.get("/substituteOrder", function (req, res) {
  let rawdata = fs.readFileSync('substitute_v2.json');
  let res_json = JSON.parse(rawdata);
  res.send(res_json);
});
 
const server2 = app.listen(8030, ()=>{
  console.log("Listening on 8030");
});

/*const fs = require('fs');

const server2 = http.createServer(function(req, res){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

server2.listen(8030, function listening() {
    console.log("Listening on %d", server2.address().port);
});*/
