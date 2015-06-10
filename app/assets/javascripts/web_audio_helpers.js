// Define function to load audio associated with a pad html object
function loadAudio(sample) {
    if (sample.url !== null){
        var request = new XMLHttpRequest();
        request.open('GET', sample.url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            sample.context.decodeAudioData(request.response, function(buffer) {
                sample.buffer = buffer;
            });
        }
        request.send();
    } else{
        //for dropbox files associated with user id
        $.getJSON( "/users/lookup", function(data){
            var client = new Dropbox.Client({ token: data.token });
            client.readFile(sample.name, { arrayBuffer: true }, function(error, response){
                if (error) {
                  alert('Error: ' + error);
                }
                else {
                    sample.context.decodeAudioData(response, function(buffer) {
                        sample.buffer = buffer;
                    });
                }
            });
        });
    }
}

// Sample constructor
var createSample = function(spec) {
    var newSample = {
        name: spec.name,
        url: spec.url,
        id: spec.id,
        user_id: spec.user_id,
        context: spec.context,
        destination: spec.destination
    }

    loadAudio(newSample);

    newSample.play = function() {
        var source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.destination);
        source.start(0);
        this.source = source;
    }

    newSample.loop = function() {
        var source = this.context.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.destination);
        source.loop = true;
        source.start(this.context.currentTime + 0.7);
    }

    return newSample;
}
