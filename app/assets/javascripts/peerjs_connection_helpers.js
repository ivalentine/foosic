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
            console.log(peerMessage.messageBody);
            var peerBoardSpec = peerMessage.userBoardSpecTransmission;
            peerBoardSpec.context = this.context;
            peerBoardSpec.destination = this.destination;
            this.peerBoards.push(createBoard(peerBoardSpec));
            this.peerIds.push(peerMessage.peerId);
            $('#connection-message-modal p').text("CONNECTED!");
            window.setTimeout(function(){
                $('#connection-message-modal').modal('toggle')
            }, 1000);
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
        var message = {
            messageType: 'connectionOpened',
            messageBody: 'Hello!',
            peerId: this.id,
            userBoardSpecTransmission: this.userBoardSpecTransmission
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
    }

    newPeerToPeer.peer.on('connection', function(connection){
        newPeerToPeer.connections.push(connection);
        connection.on('data', function(peerMessage){
            newPeerToPeer.handleMessage(peerMessage);
            if (peerMessage.messageType === 'connectionOpened') {
                newPeerToPeer.sayHello(connection);
            }
        });
    });

    return newPeerToPeer;
}
