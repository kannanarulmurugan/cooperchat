var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs')

app.listen(process.env.PORT || 3005, function() {
    // console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    console.log("Express server listening on port %d in mode", this.address().port);
});

var clients = {};


function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.sockets.on('connection', function(socket) {

    socket.on('add-user', function(data) {
        clients[data.username] = {
            "socket": socket.id
        };
    });

    socket.on('get-user', function(data) {

        // io.sockets.connected[clients[data.username].socket].emit("get-userlist", clients);
        io.sockets.emit('get-userlist', clients);

    });

    socket.on('private-message', function(data) {
        console.log("Sending: " + data.content + " to " + data.username);
        if (clients[data.username]) {
            io.sockets.connected[clients[data.username].socket].emit("add-message", data);
        } else {
            console.log("User does not exist: " + data.username);
        }
    });


    //Removing the socket on disconnect
    socket.on('disconnect', function() {
        for (var name in clients) {
            if (clients[name].socket === socket.id) {
                delete clients[name];
                break;
            }
        }
        io.sockets.emit('get-userlist', clients);
    })

});