// Board Constructor
var createBoard = function(spec) {

    var newBoard = {
        color: spec.color,
        sampleData: spec.sampleData,
        context: spec.context,
        destination: spec.destination
    };

    newBoard.samples = [];

    for (var i = 0; i < 9; i++) {
        var sampleSpec = newBoard.sampleData[i];
        sampleSpec.context = newBoard.context;
        sampleSpec.destination = newBoard.destination;
        var sample = createSample(sampleSpec);
        newBoard.samples.push(sample);
        // delete context from spec to enable transmission
        sampleSpec.context = null;
        sampleSpec.destination = null;
    };

    newBoard.updateSample = function(padId, newSample) {
        this.sampleData[padId] = {
            id: newSample.id,
            name: newSample.name,
            url: newSample.url
        }
        this.samples[padId] = newSample;
        if (this.peerToPeer && this.peerToPeer.connections.length > 0) {
            var message = {
                messageType: 'padUpdated',
                peerId: this.peerToPeer.id,
                padId: padId,
                newSampleSpecTransmission: {
                    name: newSample.name,
                    url: newSample.url
                }
            }
            for (var i = 0; i < this.peerToPeer.connections.length; i++) {
                this.peerToPeer.connections[i].send(message);
            }
        }
    }

    newBoard.refreshBoard = function(data) {
        for (var i = 0; i < 9; i++) {
            this.sampleData[i] = data.sampleData[i];
            var sampleSpec = this.sampleData[i];
            sampleSpec.context = this.context;
            sampleSpec.destination = this.destination;
            var sample = createSample(sampleSpec);
            newBoard.updateSample(i, sample);
            // delete context from spec to enable transmission
            sampleSpec.context = null;
            sampleSpec.destination = null;
        };
    }

    return newBoard;
}
