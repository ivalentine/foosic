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
    var userBoard;
    // specify board color
    var boardSpec = {color: 'blue', destination: preout, context: context};
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
    // get all sample data - NOTE: can probably push some of this logic to the server
    $.getJSON("/samples.json", function(data) {
        // filter for defaults
        var defaultSampleData = [];
        data.forEach(function(sampleData){
            for (var i = 0; i < 9; i++) {
                if (sampleData.name === defaultBoard[i]) {
                    defaultSampleData.push(sampleData);
                }
            }
        });
        boardSpec.sampleData = defaultSampleData;
        userBoard = createBoard(boardSpec);
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
            $('#pad-' + padId).css("background-color", userBoard.color);
            // send pad play to connected users
            if (conn) {
                var message = {
                    messageType: 'padPlay',
                    padId: padId
                }
                conn.send(message);
            }
        };
        //if it's the space bar
        if (event.keyCode === 32) {
            //looper object responds to spacebar press
            looper.respond();
        };
    });

    addEventListener("keyup", function(event) {
        var padId = keys.indexOf(event.keyCode);
        if (padId >= 0){
            // change color back
            $('#pad-' + padId).css("background","rgba(0,0,0,0)");
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
    $('#change-pad').click(changePadHandler);

});
