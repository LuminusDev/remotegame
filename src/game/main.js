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
    obj: {},
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
        var sn=35;
        wallClass = new game.WallObject(
            0,
            0,
            (wallSize + sn*2) / this.world.ratio,
            game.system.height * 5 / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //right
        wallClass = new game.WallObject(
            (game.system.width + offsetCamera + offsetWall) / this.world.ratio,
            0,
            (wallSize - sn) / this.world.ratio,
            game.system.height * 5 / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //bottom
        wallClass = new game.WallObject(
            game.system.width / this.world.ratio,
            (game.system.height + offsetCamera * 2 - sn) / this.world.ratio,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //top
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            0,
            game.system.width * 2 / this.world.ratio,
            (wallSize +sn) / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        // ----------------------------------------------------------------------
        var i, sickobj, a, b;
        var difficult = 0;
        for (i = 0; i < 5; i++) {
            a = Math.floor(Math.random() * 9) + 0;
            b = Math.floor(Math.random() * 5) + 0
            sickobj = new game.SickObject(game.system.width /4 + a * 100, game.system.height - b*100,difficult);
            game.scene.addObject(sickobj);
            game.scene.obj[sickobj.body.id] = sickobj;
        }
        game.scene.addTimer(3000, function(){
                    if (difficult < 45) {
                        difficult = difficult + 3;
                    };
                    a = Math.floor(Math.random() * 9) + 0;
                    b = Math.floor(Math.random() * 5) + 0
                    sickobj = new game.SickObject(game.system.width /4 + a * 100, game.system.height - b*100,difficult);
                    game.scene.addObject(sickobj);
                    game.scene.obj[sickobj.body.id] = sickobj;      
                }, true);
        // ----------------------------------------------------------------------

        // Object
    	var center = new game.CenterObject(offsetCamera + 750, offsetCamera + 450);
     	game.scene.obj[center.body.id] = center;
        game.scene.addObject(center);

        var doc = new game.DoctorObject(offsetCamera + 300, offsetCamera + 300);
        game.scene.obj[doc.body.id] = doc;
        game.scene.addObject(doc);

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
        this.camera.acceleration = 100;

        // game.audio.playMusic('music');
        // game.audio.setMusicVolume(0.7);
    },

    update: function() {
        // Check if key is currently down
        if (game.keyboard.down('UP')) {
            this.dataSocket.accx += 0.01;            
        }
        if (game.keyboard.down('DOWN')) {
            this.dataSocket.accx -= 0.01;
        }
        if (game.keyboard.down('LEFT')) {
            this.dataSocket.accy -= 0.01;
        }
        if (game.keyboard.down('RIGHT')) {
            this.dataSocket.accy += 0.01;
        }

        
        this._super();
    }
});

game.start();

});
