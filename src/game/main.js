game.module(
    'game.main'
)
.require(
    'engine.core',
    'game.main_assets',
    'game.main_objects',
    'plugins.p2',
    'plugins.fireworks'
)
.body(function(){

game.createScene('Main', {
    backgroundColor: 0xeeeeee,
    current: null,
    mouseConstraint: null,
    nullBody: new game.Body({}),
    obj: {},
    victoryTotal: 0,
    victoryCurrent: 0,
    dataSocket: {
        accx:0,
        accy:0,
        action:null
    },

    init: function() {

        var sprite,
            wallClass,
            wallSize = 200,
            offsetWall = wallSize / 2,
            offsetCamera = offsetWall + 50; 

        sprite = new game.Sprite('background.png', offsetCamera, offsetCamera);
        sprite.width = game.system.width;
        sprite.height = game.system.height;
        this.stage.addChild(sprite);

        sprite = new game.Graphics();
        sprite.beginFill(0xb9bec7);
        sprite.drawRect(offsetCamera,offsetCamera,game.system.width,120);
        this.stage.addChild(sprite);
        sprite = new game.Graphics();
        sprite.beginFill(0x637ba5);
        sprite.drawRect(offsetCamera,offsetCamera+120,game.system.width,5);
        this.stage.addChild(sprite);

        sprite = new game.Sprite('panda.png', 10+offsetCamera, offsetCamera);
        this.stage.addChild(sprite);

        sprite = new game.Sprite('icons/heart.png');
        sprite.width = 150;
        sprite.height = 150;
        sprite.position.x = game.system.width - sprite.width - 10 + offsetCamera;
        sprite.position.y = offsetCamera;
        this.stage.addChild(sprite);

        sprite = new game.BitmapText('We wish this event on this special day', {font:'25px HelveticaNeue'});
        sprite.position.x = offsetCamera + 200;
        sprite.position.y = offsetCamera + 20;
        this.stage.addChild(sprite);

        sprite = new game.ButtonSprite("button", offsetCamera+100, offsetCamera+100);
        sprite.addStage();

        // Init world
        this.world = new game.World({gravity: [0, 5]});
        this.world.ratio = 100;

        // Add walls
        //left
        wallClass = new game.WallObject(
            0, 
            game.system.height / 2 / this.world.ratio,
            wallSize / this.world.ratio,
            game.system.height * 2 / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //right
        wallClass = new game.WallObject(
            (game.system.width + offsetCamera * 2) / this.world.ratio,
            game.system.height / 2 / this.world.ratio,
            wallSize / this.world.ratio,
            game.system.height * 2 / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //bottom
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            (game.system.height + offsetCamera * 2) / this.world.ratio,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //top
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            0,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        // ----------------------------------------------------------------------
        var i, answerObj;
        // var happy = ["H","A","P","P","Y"];
        var happy = ["H"];
        // happy
        for (i = 0; i < happy.length; i++) {
            answerObj = new game.AnswerObject(game.system.width / 2 - 50 + i*100, game.system.height - 20, happy[i]);
            game.scene.addObject(answerObj);
            game.scene.obj[answerObj.body.id] = answerObj;
        }
        // var birthday = ["B","I","R","T","H","D","A","Y"];
        var birthday = ["B"];
        // happy
        for (i = 0; i < birthday.length; i++) {
            answerObj = new game.AnswerObject(game.system.width / 2 - 180 + i*100, game.system.height + 80, birthday[i]);
            game.scene.addObject(answerObj);
            game.scene.obj[answerObj.body.id] = answerObj;
        }
        this.victoryTotal = happy.length + birthday.length;
        // ----------------------------------------------------------------------

        // Object

        var doc = new game.DoctorObject(game.system.width /2 + offsetWall, game.system.height / 2 );
        game.scene.addObject(doc);







        // var alphabet = "ARTYIPDHB";
        var alphabet = "HB";
        var alphatab = alphabet.split("");
        this.addTimer(1000, function(){
            if (game.scene.victoryCurrent !== game.scene.victoryTotal) {
                var object = new game.PhonemeObject(game.system.width + offsetWall, game.system.height / 2, alphatab[Math.floor(Math.random()*alphatab.length)], "left");
                game.scene.addObject(object);
                game.scene.obj[object.body.id] = object;
            } else {
                game.audio.playMusic("musicVictory");
                game.audio.setMusicVolume(1);

                var fireworks = new game.Fireworks();

                var sprite = new game.Sprite('best.png', game.system.width / 2 + offsetCamera, game.system.height / 2);
                sprite.anchor.set(0.5,0.5);
                game.scene.stage.addChild(sprite);

                var tween = new game.Tween(sprite.scale);
                tween.to({x:1.3, y:1.3}, 4000);
                tween.easing(game.Tween.Easing.Back.InOut);
                tween.repeat();
                tween.yoyo();
                tween.start();

                game.scene.removeTimer(this);

                game.scene.addTimer(5000, function(){
                    var sprite = new game.BitmapText("J'ai pas eu le temps, ni les talents\npour ajouter le dinosaure, sorry :'(", {font:'25px HelveticaNeue'});
                    sprite.position.x = game.system.width / 2 - sprite.textWidth / 2 + offsetCamera;
                    sprite.position.y = game.system.height / 2 - sprite.textHeight / 2 + offsetCamera + 120;
                    game.scene.stage.addChild(sprite);
                }, false);
            }
        }, true);

        this.world.on('beginContact', function(event){
            game.scene.obj[event.bodyA.id].contactBegin(event.bodyB);
            game.scene.obj[event.bodyB.id].contactBegin(event.bodyA);
        });

        this.world.on('endContact', function(event){
            if ((event.bodyA.id in game.scene.obj) &&
                (event.bodyB.id in game.scene.obj)
            ) {
                game.scene.obj[event.bodyA.id].contactEnd(event.bodyB);
                game.scene.obj[event.bodyB.id].contactEnd(event.bodyA);
            }
        });

        this.camera = new game.Camera();
        this.camera.addTo(this.stage);
        this.camera.offset.x = game.system.width / 2 - offsetCamera;
        this.camera.offset.y = game.system.height / 2 - offsetCamera;
        this.camera.acceleration = 50;

        game.audio.playMusic('music');
        game.audio.setMusicVolume(0.7);
    },

    update: function() {
        // Check if key is currently down
        if (game.keyboard.down('UP')) {
            this.dataSocket.accx += 0.01;            
            console.log('up');
        }
        if (game.keyboard.down('DOWN')) {
            this.dataSocket.accx -= 0.01;
            console.log('down');
        }
        if (game.keyboard.down('LEFT')) {
            this.dataSocket.accy -= 0.01;
            console.log('left');
        }
        if (game.keyboard.down('RIGHT')) {
            this.dataSocket.accy += 0.01;
            console.log('right');
        }

        
        this._super();
    },

    mousemove: function(e) {
        if(this.mouseConstraint){
            var physicsPosition = [
                (e.global.x + this.current.offset.x) / game.scene.world.ratio,
                (e.global.y + this.current.offset.y) / game.scene.world.ratio
            ];
            p2.vec2.copy(this.mouseConstraint.pivotA, physicsPosition);
            this.mouseConstraint.bodyA.wakeUp();
            this.mouseConstraint.bodyB.wakeUp();
        }
    }
});

game.start();

});