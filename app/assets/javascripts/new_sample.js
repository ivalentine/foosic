function CreateRecorder(client, context){
  var newRecorder = {
    client: client,
    context: context,
    //states are recording, full, cleared
    state: "cleared"
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
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      recordingslist.appendChild(li);
    });
  };

  newRecorder.save = function(){
    this.recorder.exportWAV(this.writeFile);
    this.recorder.clear();
    this.state = "cleared";
  };
  newRecorder.writeFile = function(blob){
    newRecorder.client.writeFile("test_audio.wav", blob, function (error) {
      if (error) {
          alert('Error: ' + error);
      } else {
          alert('File written successfully!');
      }
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

  //build HTML
  //set click handlers
}
//runners, should go elsewhere

//var context = new AudioContext();
//var client = {};
//initializeRecorder(client, context);