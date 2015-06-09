//Once the page loads
$(document).ready(function() {
    // AUDIO SETUP
    // Set audio context
    var context = new AudioContext();
    // Set preout to route all pads to for recording
    var preout = context.createGain();
    // Connect preout to destination
    preout.connect(context.destination);
    // Configure recorder.js
    var rec = new Recorder(preout);
    // Create looper - rec knows what to record, context allows loop to be played
    var looper = createLooper({rec: rec, context: context});

    // CREATE USER BOARD
    var userBoard, sampleData;
    // specify board color
    var userBoardSpec = {color: 'blue', destination: preout, context: context};
    // specify default board settings
    var defaultBoard = [
        "Boom Kick",
        "Multi Clap",
        "Cereal",
        "Don't wanna",
        "Bella Synthdrum",
        "Contact Mic",
        "SD_militaire_synth",
        "booga_hit_double",
        "ghana_bell_high"
    ];
    if (window.location.href.match(/kanye/)) {
        defaultBoard = [
            "Kanye Piano 1",
            "Kanye Piano 2",
            "Kanye Piano 3",
            "Kanye Piano 4",
            "Kanye Piano 5",
            "Kanye Piano 6",
            "Kanye Piano 7",
            "Kanye Piano 8",
            "Look at ya"
        ]
    }
    // get all sample data - NOTE: can probably push some of this logic to the server
    $.getJSON("/samples.json", function(data) {
        sampleData = data;
        // filter for defaults
        var defaultSampleData = [];
        data.forEach(function(sampleData){
            for (var i = 0; i < 9; i++) {
                if (sampleData.name === defaultBoard[i]) {
                    defaultSampleData.push(sampleData);
                }
            }
        });
        userBoardSpec.sampleData = defaultSampleData;
        // Initialize board
        userBoard = createBoard(userBoardSpec);
    });

    // BUTTON PRESS LISTENERS
    // Define key index
    var keys = [84,89,85,71,72,74,66,78,77];

    addEventListener("keydown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        var padId = keys.indexOf(event.keyCode);
        //if it's one of our keypad keys
        if (padId >= 0){
            // change state of looper if it's listening
            if (looper.looperState === 'listening') {
                looper.respond(true);
            }
            // play the sample on the userBoard
            userBoard.samples[padId].play();
            // change color of pad
            $('#pad-' + padId).addClass(userBoard.color);
            // send pad play to connected users
            if (userBoard.peerToPeer.connections.length > 0) {
                var message = {
                    messageType: 'padPlay',
                    padId: padId,
                    peerId: userBoard.peerToPeer.id
                }
                for (var i = 0; i < userBoard.peerToPeer.connections.length; i++) {
                    userBoard.peerToPeer.connections[i].send(message);
                }
            }
        };
        //if it's the space bar
        if (event.keyCode === 32) {
            //looper object responds to spacebar press
            looper.respond();
            // send message to peer
            if (userBoard.peerToPeer.connections.length > 0) {
                var message = {
                    messageType: 'spacebarToggle'
                }
                for (var i = 0; i < userBoard.peerToPeer.connections.length; i++) {
                    userBoard.peerToPeer.connections[i].send(message);
                }
            }
        };
    });

    addEventListener("keyup", function(event) {
        var padId = keys.indexOf(event.keyCode);
        if (padId >= 0){
            // change color back
            $('#pad-' + padId).removeClass(userBoard.color);
            // change peer's color back
            if (userBoard.peerToPeer.connections.length > 0) {
                var message = {
                    messageType: 'padStop',
                    padId: padId,
                    peerId: userBoard.peerToPeer.id
                }
                for (var i = 0; i < userBoard.peerToPeer.connections.length; i++) {
                    userBoard.peerToPeer.connections[i].send(message);
                }
            }
        };
    });

    // CLICK TRIGGERS
    //toggle menu
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
        $("#menu-arrow").toggleClass("glyphicon-chevron-right glyphicon-chevron-left");
    });

    //click "change pad" from menu
    var changePadHandler;
    $('#change-pad').click(function() {
        if (!changePadHandler) {
            var changePadHandlerSpec = {
                board: userBoard,
                sampleData: sampleData,
                context: context,
                destination: preout
            }
            changePadHandler = createChangePadHandler(changePadHandlerSpec);
        }
        changePadHandler.selectAPadOn();
        $('#sample-list').append(changePadHandler.sampleList);
        $('#confirm-sample').click(function(){
            changePadHandler.changePadConfirm();
        });
        $("#sampleModal").on('hidden.bs.modal', function(){
            $('.pad').unbind();
            $('#confirm-sample').off();
            $('.sample-list').removeClass('active');
            changePadHandler.mode = 'inactive';
        });
    });

    // KANYE MODE
    if (window.location.href.match(/kanye/)) {
        var key_array=[]
        var runaway = [84, 84, 84, 89, 85, 85, 85, 71, 72, 72, 72, 74, 66, 66, 78, 84].join("yeezy");
        var kanyeSpec = {
            name: "kanye loop",
            url: "https://dl.dropboxusercontent.com/s/kk2n3c4fi2zmhbe/kanye-west-runaway-beat-loop.wav?dl=0",
            context: context,
            destination: context.destination
        }
        kanyeLoop = createSample(kanyeSpec);

        addEventListener("keydown", function(event) {
            key_array.push(event.keyCode);
            if (key_array.length >= 16){
                key_array = key_array.slice(-16);
                if (key_array.join("yeezy") === runaway){
                    kanyeLoop.loop();
                }
            }
        });
    }

    // PEER MODE
    function initializePeerToPeer(userBoard){
        var colors = ["yellow","red","orange","purple","green","white"]
        // Remove audio components, which do not appear to be supported by Peer JS data connection
        userBoardSpecTransmission = {
            color: colors[Math.floor(Math.random()*colors.length)],
            sampleData: userBoard.sampleData
        }
        var peerToPeerSpec = {
            id: username,
            userBoardSpecTransmission: userBoardSpecTransmission,
            context: userBoardSpec.context,
            destination: userBoardSpec.destination,
            looper: looper
        }
        userBoard.peerToPeer = createPeerToPeer(peerToPeerSpec);
    }

    // USER MANAGEMENT
    // open modal on click from menu
    $('#connect').click(function(){
        // toggle online users modal
        $('#online-users-modal').modal('toggle');

        // populate username
        $('#username-for-connection').text(username);

        // define callback to populate online users modal
        function callback(onlineUserList) {
            $('#online-users').empty();
            for (var i = 0; i < onlineUserList.length; i++) {
                $('#online-users').append($('<li class="online-user">').text(onlineUserList[i]));
            }
            $('.online-user').click(function(){
                var message = {
                    sender: username,
                    receiver: this.textContent
                };
                dispatcher.trigger('request_connection', message);
                $('#online-users-modal').modal('toggle');
                $('#connection-message-modal').modal('toggle');
                $('#connection-message-modal p').text("REQUEST SENT. WAITING FOR RESPONSE...");
            });
        }

        // get the online users using WebSocket dispatcher
        dispatcher.trigger('get_online_users', 1, callback);
    });

    // websockets user management
    var username, channel, requestedConnection;
    var requestInProgress = false;
    var dispatcher = new WebSocketRails('www.tyutyu.be/websocket');
    dispatcher.bind('set_username',function(generatedUsername){
        username = generatedUsername;
        channel = dispatcher.subscribe(username);
        channel.bind('connection_requested',function(message){
            requestInProgress = true;
            requestedConnection = message;
            // handle modal showing request
            $('#connection-requested-modal').modal('toggle');
            $('#requested-connection').text(message.sender + " WANTS TO CONNECT WITH YOU");
        });
        channel.bind('connection_accepted',function(message){
            // $('#request-sent-modal').modal('toggle');
            userBoard.peerToPeer.prepareForConnection();
            userBoard.peerToPeer.connectToPeer(message.receiver);
            $('#connection-message-modal p').text("REQUEST ACCEPTED. CONNECTING...");
        });
        channel.bind('connection_rejected',function(message){
            $('#connection-message-modal p').text("REQUEST REJECTED. BUMMER");
            window.setTimeout(function(){
                $('#connection-message-modal').modal('toggle')
            }, 1000);
        });

        // Start peer mode - eventually we need to make sure this only fire after we have the user board
        initializePeerToPeer(userBoard);
    });

    $('#confirm-connection-request').click(function(){
        requestInProgress = false;
        userBoard.peerToPeer.prepareForConnection();
        dispatcher.trigger('accept_connection',requestedConnection);
        $('#connection-message-modal').modal('toggle');
        $('#connection-message-modal p').text('CONNECTING...');
    });

    $('#reject-connection-request').click(function(){
        requestInProgress = false;
        dispatcher.trigger('reject_connection',requestedConnection);
    });

    $("#connection-requested-modal").on('hidden.bs.modal', function(){
        if (requestInProgress) {
            dispatcher.trigger('reject_connection',requestedConnection);
        }
    });
});
