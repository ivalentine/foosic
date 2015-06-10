//Once the page loads
$(document).ready(function() {
    // DISPLAY INSTRUCTIONS IF FIRST VISIT
    if ($('#first-visit-indicator').text() === 'true') {
        $('#intro-message-modal').modal('toggle');
        window.setTimeout(function(){
            $('#intro-message-modal').modal('toggle');
        }, 2500);
    }

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
    var userBoard;
    // specify board color and audio environment
    var userBoardSpec = {color: 'blue', destination: preout, context: context};
    // specify default board settings
    var defaultBoardId = 1;
    if (window.location.href.match(/kanye/)) {
        defaultBoardId = 2;
    }
    //look up samples for default board
    $.getJSON("/boards/lookup", { id: defaultBoardId}, function(data){
        userBoardSpec.sampleData = data;
        userBoard = createBoard(userBoardSpec);
    });


    // BUTTON PRESS LISTENERS
    // Define key index
    var keys = [84,89,85,71,72,74,66,78,77];

    addEventListener("keydown", function(event) {
        // event.preventDefault();
        // event.stopPropagation();
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
            if (userBoard.peerToPeer && userBoard.peerToPeer.connections.length > 0) {
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
            if (userBoard.peerToPeer && userBoard.peerToPeer.connections.length > 0) {
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
            if (userBoard.peerToPeer && userBoard.peerToPeer.connections.length > 0) {
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

    // CHANGE PAD
    var changePadHandler;
    $('#change-pad').click(function() {
        if (!changePadHandler) {
            var changePadHandlerSpec = {
                board: userBoard,
                sampleData: allSampleData,
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

    // CONNECTION MANAGEMENT
    function triggerConnectionMenu(){
        // Start peer mode if needed
        if (!userBoard.peerToPeer) {
            initializePeerToPeer(userBoard);
        }

        // get the currently connected users
        var currentlyConnectedUsers = [];
        for (var i = 0; i < userBoard.peerToPeer.connections.length; i++) {
            var connection = userBoard.peerToPeer.connections[i];
            if (connection.open) {
                currentlyConnectedUsers.push(connection.peer);
            }
        }

        // toggle online users modal
        $('#connected-users').empty();
        for (var i = 0; i < currentlyConnectedUsers.length; i++) {
            $('#connected-users').append('<li class="connected-user">' + currentlyConnectedUsers[i] + '<div class="deletable-li" data-username="' + currentlyConnectedUsers[i] + '">✕</div></li>');
            // enable connection closing
            $('.deletable-li[data-username=' + currentlyConnectedUsers[i] + ']').one('click',function(){
                for (var i = 0; i < userBoard.peerToPeer.connections.length; i++) {
                    if (userBoard.peerToPeer.connections[i].peer === currentlyConnectedUsers[i]) {
                        // gracefully close connection
                        userBoard.peerToPeer.connections[i].close();
                        // delete connection
                        delete userBoard.peerToPeer.connections[i];
                        // delete board and peer associated with the connection
                        for (var j = 0; j < userBoard.peerToPeer.peerIds.length; j++) {
                            if (userBoard.peerToPeer.peerIds[j] === currentlyConnectedUsers[i]) {
                                delete userBoard.peerToPeer.peerIds[j];
                                delete userBoard.peerToPeer.peerBoards[j];
                            }
                        }
                    }
                }
                $(this).closest('li').remove();
                $('#online-users-modal').modal('toggle');
                window.setTimeout(function(){
                    triggerConnectionMenu();
                },1000);
            });
        }
        if (currentlyConnectedUsers.length === 0) {
            $('#connected-users-title').css('display','none');
        } else {
            $('#connected-users-title').css('display','block');
        }

        $('#connected-users').append();
        $('#online-users').empty();
        $('#online-users').append('<li class="online-user">NO ONE ELSE IS ONLINE :(</li>');
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

        // get online users via websocket connection
        dispatcher.trigger('get_online_users', currentlyConnectedUsers, callback);
    }

    // open connection modal on click from menu
    $('#connect').click(triggerConnectionMenu);

    // websockets
    var username, channel, requestedConnection, allSampleData;
    var signedIn = false;
    var requestInProgress = false;
    var dispatcher = new WebSocketRails('localhost:3000/websocket');
    // the 1 is because I'm not sure how to skip the arguments to specify the anon func is callback
    dispatcher.trigger('get_all_sample_data', 1, function(data){
        allSampleData = data;
    });

    dispatcher.bind('set_username',function(data){
        username = data.username;
        signedIn = data.signed_in;
        channel = dispatcher.subscribe(username);
        channel.bind('connection_requested',function(message){
            // Start peer mode if needed
            if (!userBoard.peerToPeer) {
                initializePeerToPeer(userBoard);
            }
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

    $('#load-board').click(function(){
        // toggle list-boards modal
        $('#list-boards-modal').modal('toggle');

        // get all of the boards
        $.getJSON("/boards", function(data){
            // clear existing list
            $('#list-boards-ul').empty()

            // populate list
            data.forEach(function(board){
                var HTMLString = '<li class="board-list-item" data-id="' +
                    board.id + '">' + board.name + '</li>';
                $('#list-boards-ul').append(HTMLString);
            });

            // add click listeners to boards
            $('.board-list-item').one('click',function(){
                var boardId = $(this).data("id");
                $.getJSON("/boards/lookup", { id: boardId }, function(data){
                    userBoardSpec.sampleData = data;
                    userBoard.refreshBoard(userBoardSpec);
                });
                $('#list-boards-modal').modal('toggle')
            });
        });
    });

    $('#save-board').click(function(){
        // check to see if user is signed in
        if (signedIn) {
            $('#board-save-modal').modal('toggle');
            $('#confirm-board-save').one('click',function(event){
                event.preventDefault();
                event.stopPropagation();
                var boardName = $('#board-name-input').val();
                if (boardName !== ""){
                    $.post('/boards', {name: boardName, sampleData: userBoard.sampleData});
                    $('#board-save-modal').modal('toggle');
                }
            });
        } else {
            $('#sign-in-to-save-modal').modal('toggle');
            window.setTimeout(function(){
                $('#sign-in-to-save-modal').modal('toggle');
            }, 1500);
        }
    });

    //adding a sample
    //move this client variable inside click handler? Or clear it at end of handler?
    var client;
    $('#add-sample').click(function(){
        if (signedIn) {
            $('#add-sample-modal').modal('toggle');
            $button = $("#dropbox-connect")
            dropboxFlow(client, context, $button)
        }else {
            $('#sign-in-to-save-modal').modal('toggle');
            window.setTimeout(function(){
                $('#sign-in-to-save-modal').modal('toggle');
            }, 1500);
        }
    });

    // clear notices after a bit
    window.setTimeout(function(){
        $('.notice').hide();
    },3000);

});
