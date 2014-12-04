game.module(
    'game.remote'
)
.require(
    'engine.core',
    'engine.system',
    'game.remote_assets',
    'game.remote_objects',
    'plugins.p2',
    'plugins.websocket'
)
.body(function(){

game.createScene('Main', {
    backgroundColor: 0xeeeeee,
    isFullScreen: false,

    init: function() {

        var sprite,
            wallClass,
            wallSize = 200,
            offsetWall = wallSize / 2,
            offsetCamera = offsetWall + 50;

        // Init world
        this.world = new game.World({gravity: [0, -9.81]});
        this.world.ratio = 100;

        // Add walls
        //left
        wallClass = new game.WallObject(
            0, 
            game.system.height / 2 / this.world.ratio,
            wallSize / this.world.ratio,
            game.system.height * 2 / this.world.ratio
        );

        //right
        wallClass = new game.WallObject(
            (game.system.width + offsetCamera * 2) / this.world.ratio,
            game.system.height / 2 / this.world.ratio,
            wallSize / this.world.ratio,
            game.system.height * 2 / this.world.ratio
        );

        //bottom
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            (game.system.height + offsetCamera * 2) / this.world.ratio,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );

        //top
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            0,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );

        //Ball
        var ball = new game.BallObject(
            game.system.width / 2 + offsetCamera,
            game.system.height / 2 + offsetCamera
        );
        ball.pause();

        sprite = new game.ButtonSprite("Jouer", game.system.width-offsetCamera, game.system.height, 250, 100, 40);
        sprite.onReady(function(){
            game.scene.isFullScreen = !game.scene.isFullScreen;
            if (game.scene.isFullScreen) {
                this.changeText("Pause")
                ball.resume();
            } else {
                this.changeText("Jouer");
                ball.pause();
            }
        });
        sprite.addStage();

        this.camera = new game.Camera();
        this.camera.addTo(this.stage);
        this.camera.offset.x = game.system.width / 2 - offsetCamera;
        this.camera.offset.y = game.system.height / 2 - offsetCamera;
        this.camera.acceleration = 50;

        // game.websocket.open = this.socketOpen.bind(this);
        // game.websocket.message = this.socketMessage.bind(this);
        // game.websocket.close = this.socketClose.bind(this);
        // game.websocket.connect('ws://localhost:5000');
    },

    socketOpen: function() {
        // send uniqid in URL
        // game.websocket.send(JSON.stringify({requestId: "AAAA"}));
    },

    socketMessage: function(message) {
        console.log(JSON.parse(message.data));
    },

    socketClose: function(message) {
        // console.log(JSON.parse(message));
    }
});

game.start();

var clickCanvas = function () {
    setTimeout(function(){
        var docElm = document.documentElement;
        var target = game.system.canvas;
        if (game.scene.isFullScreen) {
            if (docElm.requestFullscreen) {
                target.requestFullscreen();
            } else if (docElm.msRequestFullscreen) {
                target.msRequestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                target.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullscreen) {
                target.webkitRequestFullscreen();
            }
            var lockOrientation = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
            if (lockOrientation) {
                lockOrientation("landscape");
            }
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }, 500);
}
game.system.canvas.addEventListener("click", clickCanvas, false);
game.system.canvas.addEventListener("touchstart", clickCanvas, false);

});