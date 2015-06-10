// Animator constructor
var createAnimator = function(spec) {
    newAnimator = {
        looping: false
    };

    newAnimator.startLoop = function(duration) {
        this.looping = true;
        that = this;
        function wipe_right(elem, width) {
            elem.css('width', '0px');
            elem.css("right", width);
            elem.animate({
                width: width,
                right: '0px'
            }, duration, 'linear', function(){
                if (that.looping) {
                    wipe_right(elem, width);
                }
            });
        }
        $('#player-layer').addClass('show');
        wipe_right($('#player-layer'), $('#player-layer').css('width'));
    }

    newAnimator.endLoop = function() {
        this.looping = false;
        $('#player-layer').removeClass('show');
    }

    newAnimator.startBlinking = function() {
        this.blinker = window.setInterval(function () {
            $('#recording-layer').toggleClass("show");
        }, 100);
    }

    newAnimator.stopBlinking = function() {
        clearInterval(this.blinker);
    }

    newAnimator.showRecordingIndicator = function() {
        $('#recording-layer').addClass("show");
    }

    newAnimator.hideRecordingIndicator = function() {
        $('#recording-layer').removeClass("show");
    }

    return newAnimator;
}

// Looper constructor
var createLooper = function(spec) {
    newLooper = {
        rec: spec.rec,
        looperState: 'off',
        animator: createAnimator(),
        context: spec.context
    };

    newLooper.respond = function(notSpaceBar) {
        if (this.looperState === 'off') {
            // animate
            this.animator.startBlinking();
            // start listening
            this.looperState = 'listening';
        } else if (this.looperState === 'listening') {
            if (notSpaceBar) {
                // animate
                this.animator.stopBlinking();
                this.animator.showRecordingIndicator();
                // start recording
                this.rec.clear();
                this.rec.record();
                this.looperState = 'recording';
            } else {
                // animate
                this.animator.stopBlinking();
                this.animator.hideRecordingIndicator();
                // cancel listening
                this.looperState = 'off';
            }
        } else if (this.looperState === 'recording') {
            // animate
            this.animator.hideRecordingIndicator();
            // stop recording and start playback
            this.rec.stop();
            this.playLoop();
            this.looperState = 'playback';
        } else if (this.looperState === 'playback'){
            // animate
            this.animator.endLoop();
            // stop recording
            this.loopSource.stop();
            this.looperState = 'off';
        }
    };

    newLooper.playLoop = function() {
        this.rec.getBuffer(function(buffers) {
            this.loopSource = this.context.createBufferSource();
            this.loopBuffer = this.context.createBuffer(2, buffers[0].length, this.context.sampleRate);
            this.loopBuffer.getChannelData(0).set(buffers[0]);
            this.loopBuffer.getChannelData(1).set(buffers[1]);
            this.loopSource.buffer = this.loopBuffer;
            // line below added for looping
            this.loopSource.loop = true;

            this.loopSource.connect(this.context.destination);
            this.loopSource.start(0);
            // Animate
            this.animator.startLoop(this.loopBuffer.duration * 1000);
        }.bind(this));
    };

    return newLooper;
}
