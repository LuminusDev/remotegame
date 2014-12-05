game.module(
    'game.main'
)
.require(
    'engine.core',
    'game.main_assets',
    'game.main_objects',
    'plugins.p2',
    'plugins.fireworks',
    'plugins.websocket'
)
.body(function(){

game.createScene('Main', {
    backgroundColor: 0xeeeeee,
    obj: {},
    menu_graphics: [],
    points: 0,
    textPoints: null,
    dataSocket: {
        accx:0,
        accy:0,
        action:null,
        id:null
    },

    init: function() {

        var sprite,
            wallClass,
            wallSize = 200,
            offsetWall = wallSize / 2;
            this.offsetCamera = offsetWall + 50; 

        sprite = new game.Sprite('background.png', this.offsetCamera, this.offsetCamera);
        sprite.width = game.system.width;
        sprite.height = game.system.height;
        this.stage.addChild(sprite);

        sprite = new game.Graphics();
        sprite.beginFill(0xb9bec7);
        sprite.drawRect(this.offsetCamera,this.offsetCamera,game.system.width,120);
        this.stage.addChild(sprite);
        sprite = new game.Graphics();
        sprite.beginFill(0x637ba5);
        sprite.drawRect(this.offsetCamera,this.offsetCamera+120,game.system.width,5);
        this.stage.addChild(sprite);

        sprite = new game.Sprite('panda.png', 10+this.offsetCamera, this.offsetCamera);
        this.stage.addChild(sprite);

        this.textPoints = new game.BitmapText('Points :' + game.scene.points, {font:'25px HelveticaNeue'});
        this.textPoints.position.x = this.offsetCamera + 200;
        this.textPoints.position.y = this.offsetCamera + 20;
        this.stage.addChild(this.textPoints);

        var my = this
        game.scene.addTimer(100, function(){
                    my.stage.removeChild(my.textPoints);
                    my.textPoints = new game.BitmapText('Points :' + game.scene.points, {font:'25px HelveticaNeue'});
                    my.textPoints.position.x = my.offsetCamera + 200;
                    my.textPoints.position.y = my.offsetCamera + 20;
                    my.stage.addChild(my.textPoints);        
                }, true);

        

        //Ecran menu
        var menu_graphics = {};

        sprite = new game.Graphics();
        sprite.beginFill(0x6ebac7);
        sprite.drawRect(this.offsetCamera + 200, this.offsetCamera + 200, 600, 300);
        this.stage.addChild(sprite);
        this.menu_graphics[0] = sprite;

        sprite = new game.BitmapText('Ebola Game ', {font:'35px HelveticaNeue'});
        sprite.position.x = game.system.width / 2  - sprite.width /2 + this.offsetCamera ;
        sprite.position.y = game.system.height / 2 - sprite.height/2 + this.offsetCamera -250;
        this.stage.addChild(sprite);

        this.menu_graphics[1] = sprite;        



      
        
        

        // Init world
        this.world = new game.World({gravity: [0, 5]});
        this.world.ratio = 100;

          //Fonction call par le socket
        for(var i=0;i<game.scene.menu_graphics.length;i++)
            game.scene.stage.removeChild(game.scene.menu_graphics[i]);
        this.launch();

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
            (game.system.width + this.offsetCamera + offsetWall) / this.world.ratio,
            0,
            (wallSize - sn) / this.world.ratio,
            game.system.height * 5 / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //bottom
        wallClass = new game.WallObject(
            game.system.width / this.world.ratio,
            (game.system.height + this.offsetCamera * 2 - sn) / this.world.ratio,
            game.system.width * 2 / this.world.ratio,
            wallSize / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        //top
        wallClass = new game.WallObject(
            game.system.width / 2 / this.world.ratio,
            0,
            game.system.width * 2 / this.world.ratio,
            (wallSize + sn*2 +120*2 +10) / this.world.ratio
        );
        this.obj[wallClass.body.id] = wallClass;

        // ----------------------------------------------------------------------
        
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
        this.camera.offset.x = game.system.width / 2 - this.offsetCamera;
        this.camera.offset.y = game.system.height / 2 - this.offsetCamera;
        this.camera.acceleration = 100;

        // game.audio.playMusic('music');
        // game.audio.setMusicVolume(0.7);

        game.websocket.open = this.socketOpen.bind(this);
        game.websocket.message = this.socketMessage.bind(this);
        game.websocket.close = this.socketClose.bind(this);
        game.websocket.connect('ws://localhost:5000');
    },

    showUrl: function(text) {
        console.log("showurl");
    },

    doAction: function(){
        switch(this.dataSocket.action) {
            case "play": this.playGame(); break;
            case "resume": this.resumeGame(); break;
        }
    },

    playGame: function() {

    },

    resumeGame: function() {
 
    },

    socketOpen: function() {},

    socketMessage: function(message) {
        var data = JSON.parse(message.data);
        if (data.id) {
            this.dataSocket.id = data.id;
            this.showUrl();
        } else if (data.dataGame) {
            this.dataSocket.accx = data.dataGame.accx;
            this.dataSocket.accy = data.dataGame.accy;
            this.dataSocket.action = data.dataGame.action || null;
            this.doAction();
        } else if (data.mobileClose) {
            this.showUrl("Connexion perdue");
        } else {
            // problem
        }
        // game.websocket.send(JSON.stringify({gameover:true}));

    },

    socketClose: function(message) {},

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
    },


    launch: function(){ 
        var i, sickobj, a, b, c;
        var difficult = 0;
        for (i = 0; i < 5; i++) {
            a = Math.floor(Math.random() * 9) + 0;
            b = Math.floor(Math.random() * 5) + 0;
            sickobj = new game.SickObject(game.system.width /4 + a * 100, game.system.height - b*100,difficult);
            game.scene.addObject(sickobj);
            game.scene.obj[sickobj.body.id] = sickobj;
        }
        game.scene.addTimer(3000, function(){
                    if (difficult < 45) {
                        difficult = difficult + 3;
                    };
                    c = Math.floor(Math.random() * 3) + 1
                    for (i = 0; i < c; i++) {
                        a = Math.floor(Math.random() * 9) + 0;
                        b = Math.floor(Math.random() * 5) + 0;
                        sickobj = new game.SickObject(game.system.width /4 + a * 100, game.system.height - b*100,difficult);
                        game.scene.addObject(sickobj);
                        game.scene.obj[sickobj.body.id] = sickobj;
                    }
                }, true);
        // ----------------------------------------------------------------------

        // Object
        var center = new game.CenterObject(this.offsetCamera + 750, this.offsetCamera + 450);
        game.scene.obj[center.body.id] = center;
        game.scene.addObject(center);

        var doc = new game.DoctorObject(this.offsetCamera + 300, this.offsetCamera + 300);
        game.scene.obj[doc.body.id] = doc;
        game.scene.addObject(doc);


    }
});

game.start();

});
