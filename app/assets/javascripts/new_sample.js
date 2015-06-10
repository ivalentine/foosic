function CreateRecorder(client, context){
  var newRecorder = {
    client: client,
    context: context,
    fileName: null,
    //states are recording, full, cleared
    state: "cleared",
    recButtonHTML: '<svg height="100" width="100" id="record"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>',
    stopButtonHTML: '<svg height="100" width="100" id="stop"><rect width="100" height="100" stroke="black" fill="blue" stroke-width=3/></svg>'
  };

  newRecorder.initAudio = function(stream){
    var inputPoint = newRecorder.context.createGain();
    var input = newRecorder.context.createMediaStreamSource(stream);    
    input.connect(inputPoint);
    newRecorder.recorder =  new Recorder(inputPoint, {workerPath: "/recorderWorker.js"})
  }

  newRecorder.start = function(){
    this.recorder.record();
    this.state = "recording";
  };

  newRecorder.stop = function(){
    this.recorder.stop();
    this.state = "full"
    this.fileName = new Date().toISOString() + '.wav'
    //to display audio, need better way
    this.recorder.exportWAV(function(blob){
      var url = URL.createObjectURL(blob);
      var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');
      var recordingslist = $("#recordingslist")[0];
      
      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = newRecorder.fileName;
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      recordingslist.appendChild(li);
    });
  };

  newRecorder.save = function(){
    if (this.fileName === null){
      this.fileName = new Date().toISOString() + '.wav'
    }
    this.recorder.exportWAV(this.writeFile.bind(this));
    $.post( "/samples", {fileName:this.fileName});
    this.recorder.clear();
    this.state = "cleared";
  };
  newRecorder.writeFile = function(blob){
    this.client.writeFile(this.fileName, blob, function (error) {
      if (error) {
          alert('Error: ' + error);
      } else {
          alert('File written successfully!');
      }
    });
  }
  //pass in a jQuery div and this will add Save, Clear and Cancel buttons
  newRecorder.activateButtons = function(){
    $("#rec-buttons").off();
    $("#rec-buttons").show();
    $("#new-sample-save").on("click", function(){
      if (rec.state === "full"){
        rec.save();
        $("#recordingslist").empty();
      }
    });
    $("#new-sample-clear").on("click", function(){
      rec.recorder.clear();
      rec.state = "cleared";
      $("#recordingslist").empty();
    });
    $("#new-sample-cancel").on("click", function(){
      rec.recorder.clear();
      rec.state = "cleared";
      $("#recordingslist").empty();
    });

  }


  return newRecorder;

}

function initializeRecorder(client, context){
  rec = CreateRecorder(client, context);
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
  navigator.getUserMedia({audio:true}, rec.initAudio, function(e) {
    console.log(e);
  });
  $('#recording-interface').empty();
  $('#recording-interface').append(rec.recButtonHTML);

  $('#recording-interface').click(function(event){
    if (rec.state === "cleared"){
      rec.start();
      $(this).empty();
      $(this).append(rec.stopButtonHTML);
    }else if (rec.state === "recording"){
      rec.stop();
      $(this).empty();
      $(this).append(rec.recButtonHTML);
      rec.activateButtons();
    }

  });

  addEventListener("keydown", function(event) {
    //if they press r start or stop
    if (event.keyCode === 82){
      if (rec.state === "cleared"){
        rec.start();
      }
      else if (rec.state === "recording"){
        rec.stop();
      }
    };
    //if they press s save
    if (event.keyCode === 83){
      if (rec.state === "full"){
        rec.save();
      }
    };
    // if c, clear
    if (event.keyCode === 67){
      if (rec.state === "full"){
        rec.recorder.clear();
        rec.state = "cleared";
      }
    };
    console.log(rec.state);
  });

}


function dropboxFlow(client, context, $button) {
  //takes user token from database and returns authenticated client object
  function authenticateFromDatabase(token){
    var client = new Dropbox.Client({token: token})
    console.log("I got yr dropbox info so I logged you in!!!!")
    return client;
  }

  function saveUser (token){
    $.post( "/users/save_token", {dropBoxToken:token});
  }
  function handleError(error){
    console.log(error);
  }

  function dropboxSignInFlow(client){
    $button.append("CLICK HERE TO CONNECT TO DROPBOX")
    $button.on("click", function() {
      // The user will have to click an 'Authorize' button.
      client.authenticate(function(error, client) {
        if (error) {
          return handleError(error);
        }
      });
    });
  }


  function authenticateWithDropbox(error, client){
    if (error) {
      return handleError(error);
    }
    //if they are back from flow, save user's token in DB 
    if (client.isAuthenticated()) {
      saveUser(client.credentials().token)
      console.log("you have been authenticated!")
      initializeRecorder(client, context);
    //TODO need to clear client so that next user doesn't have access to it

    } else {
      // show and set up the "Sign into Dropbox" button
      //once they click and authenticate they will come back to this page authenticated
      dropboxSignInFlow(client);
    }

  }


  $.getJSON( "/samples/new.json", function( data ) {

    //if there's a user token from db, authenticate with that
    if(data.user_token !== null){
      client = authenticateFromDatabase(data.user_token);
      initializeRecorder(client, context);
    }
    else {
    //create client object from our app_key
    client = new Dropbox.Client({ key: data.app_key });
    //send user through authentication process
      client.authenticate({interactive: false}, authenticateWithDropbox);
    }
  });

};

//TODO
//save sample to database-
  //sample belongs_to user
  //create and save sample
  //modify how samples load so we can access custom ones
//better file naming