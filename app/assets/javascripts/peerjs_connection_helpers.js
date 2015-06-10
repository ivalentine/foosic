var createPeerToPeer = function(spec) {
    newPeerToPeer = {
        id: spec.id,
        peerIds: [],
        config: {
            host: 'tyutyu-peerjs-server.herokuapp.com',
            port: 80,
            path: '/',
            debug: true
        },
        userBoardSpecTransmission: spec.userBoardSpecTransmission,
        context: spec.context,
        destination: spec.destination,
        looper: spec.looper,
        connections: [],
        peerBoards: []
    }

    newPeerToPeer.peer = new Peer(newPeerToPeer.id, newPeerToPeer.config);

    newPeerToPeer.handleMessage = function(peerMessage){
        switch(peerMessage.messageType) {
        case 'padPlay':
            this.peerBoards[this.peerIds.indexOf(peerMessage.peerId)].samples[peerMessage.padId].play();
            $('#pad-' + peerMessage.padId).addClass(this.peerBoards[this.peerIds.indexOf(peerMessage.peerId)].color);
            // handle looping
            if (this.looper.looperState === 'listening') {
                this.looper.respond(true);
            }
            break;
        case 'padStop':
            $('#pad-' + peerMessage.padId).removeClass(this.peerBoards[this.peerIds.indexOf(peerMessage.peerId)].color);
            break;
        case 'connectionOpened':
            // log 'hello'
            console.log(peerMessage.messageBody + " from " + peerMessage.peerId);
            // load peerBoardSpec
            var peerBoardSpec = peerMessage.userBoardSpecTransmission;
            peerBoardSpec.context = this.context;
            peerBoardSpec.destination = this.destination;
            // create peer board and save
            this.peerBoards.push(createBoard(peerBoardSpec));
            this.peerIds.push(peerMessage.peerId);
            // show success message
            $('#connection-message-modal p').text("CONNECTED!");
            window.setTimeout(function(){
                $('#connection-message-modal').modal('toggle')
            }, 1000);
            // connect to missing connections (people connected to the person you're connected to)
            var missingConnections = [];
            // iterate through all other connections
            for (var i = 0; i < peerMessage.otherConnections.length; i++) {
                var missing = true;
                // ignore if self
                if (peerMessage.otherConnections[i] === this.id) {
                    missing = false;
                }
                // ignore if already connected
                for (var j = 0; j < this.peerIds.length; j++) {
                    if (this.peerIds[j] === peerMessage.otherConnections[i]) {
                        missing = false;
                    }
                }
                // add to list of missing connections if still missing
                if (missing) {
                    missingConnections.push(peerMessage.otherConnections[i]);
                }
            }
            // connect to all of the missing connections
            for (var i = 0; i < missingConnections.length; i++) {
                this.connectToPeer(missingConnections[i]);
            }
            break;
        case 'padUpdated':
            var newSampleSpec = peerMessage.newSampleSpecTransmission;
            newSampleSpec.context = this.context;
            newSampleSpec.destination = this.destination;
            var newSample = createSample(newSampleSpec);
            this.peerBoards[this.peerIds.indexOf(peerMessage.peerId)].samples[peerMessage.padId] = newSample;
            break;
        case 'spacebarToggle':
            this.looper.respond();
            break;
        }
    }

    newPeerToPeer.sayHello = function(connection) {
        var otherConnections = [];
        for (var i = 0; i < this.connections.length; i++) {
            otherConnections.push(this.connections[i].peer);
        }
        var message = {
            messageType: 'connectionOpened',
            messageBody: 'Hello!',
            peerId: this.id,
            userBoardSpecTransmission: this.userBoardSpecTransmission,
            otherConnections: otherConnections
        }
        connection.send(message);
    }

    newPeerToPeer.prepareForConnection = function(){
        if (newPeerToPeer.peer.disconnected === true) {
            newPeerToPeer.peer.reconnect();
        }
    }

    newPeerToPeer.connectToPeer = function(peerId) {
        var newConnection = newPeerToPeer.peer.connect(peerId);
        newPeerToPeer.connections.push(newConnection);
        newConnection.on('open',function(){
            newPeerToPeer.sayHello(newConnection);
        });
        newConnection.on('data', function(peerMessage){
            newPeerToPeer.handleMessage(peerMessage)
        });
        newConnection.on('close',function(){
            // display message if connection closes
            $('#connection-message-modal p').text("LOST CONNECTION TO " + newConnection.peer);
            $('#connection-message-modal').modal('toggle');
            window.setTimeout(function(){
                $('#connection-message-modal').modal('toggle');
            },1500);
        });
    }

    newPeerToPeer.peer.on('connection', function(connection){
        newPeerToPeer.connections.push(connection);
        connection.on('data', function(peerMessage){
            newPeerToPeer.handleMessage(peerMessage);
            if (peerMessage.messageType === 'connectionOpened') {
                newPeerToPeer.sayHello(connection);
            }
        });
        connection.on('close',function(){
            // display message if connection closes
            $('#connection-message-modal p').text("LOST CONNECTION TO " + connection.peer);
            $('#connection-message-modal').modal('toggle');
            window.setTimeout(function(){
                $('#connection-message-modal').modal('toggle');
            },1500);
        });
    });

    return newPeerToPeer;
}
