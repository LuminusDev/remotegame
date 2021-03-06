game.module(
    'game.main_objects'
)
.require(
	'engine.core',
    'game.main_assets',
    'plugins.p2'
)
.body(function(){

var SCENE          = Math.pow(2,1),
	PEOPLE		   = Math.pow(2,2),
	CENTER		   = Math.pow(2,3);

game.DoctorSprite = game.Sprite.extend({
	offset: { x: 0, y: 0 },
	attachObject: null,

	init: function(x, y, bodyAttach) {
	    this._super("doctor.png", x, y);
	    this.attachObject = bodyAttach;
	},

	addStage: function(){
	    game.scene.stage.addChild(this);
	},

	removeStage: function(){
	    game.scene.stage.removeChild(this);
	},

	updatePos: function(x, y) {
	    this.position.x = x;
	    this.position.y = y;
	}
});


game.DoctorObject = game.Class.extend({
	size: 70,
	body: null,
	sprite: null,
	isMedic: true,
	shape: null,
	current_medic: 100,
	max_medic: 100,

	init: function(x, y, direction) {
	    // Add body and shape
	    this.shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    this.shape.collisionGroup = PEOPLE;
	    this.shape.collisionMask  = SCENE | PEOPLE | CENTER;
	    this.body = new game.Body({
	        mass: 1,
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ],
	        angularVelocity: 0
	    });
	    this.body.addShape(this.shape);

	    // Ignore gravity
	    this.body.velocity[0] = 0;
	    this.body.velocity[1] = 0;
	    this.body.gravityScale = 0;
	    this.sprite = new game.DoctorSprite(x, y, this);
	    this.sprite.anchor.set(0.5, 0.5);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	cure: function() {
	    this.current_medic -= 10;
	    if(this.current_medic < 0) {
	    	this.current_medic = 0;
	    }
	},

	reload: function() {
		this.current_medic = this.max_medic;
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	update: function() {
	    if (this.body !== null) {
	    	
	    	this.body.velocity[0] =  game.scene.dataSocket.accy * game.system.delta *400;
	    	this.body.velocity[1] = -game.scene.dataSocket.accx * game.system.delta *400;

	        this.sprite.updatePos(
	            this.body.position[0] * game.scene.world.ratio,
	            this.body.position[1] * game.scene.world.ratio
	        );
	    }
	},

	contactBegin: function(contactObject) {
		console.log("that");
	    if (game.scene.obj[contactObject.id].isSick === true) {
	    	console.log("that2");
	    	this.cure();
	        game.audio.playSound("cure");
	    }

	    if (game.scene.obj[contactObject.id].isCenter === true) {
	    	this.reload();
	        game.audio.playSound("reload");
	    }
	},

	contactEnd: function(contactObject) {
	    //nothing
	}
});



game.WallObject = game.Class.extend({
	body: null,

	init: function(x, y, w, h) {
	    var wallShape = new game.Rectangle(w, h);
	    wallShape.collisionGroup = SCENE;
	    wallShape.collisionMask  = PEOPLE;
	    this.body = new game.Body({
	        position: [x, y]
	    });
	    this.body.gravityScale = 0;
	    this.body.addShape(wallShape);
	    game.scene.world.addBody(this.body);
	    var sprite = new game.Graphics();
        sprite.beginFill(0xb9bec7);
        sprite.drawRect(x*game.scene.world.ratio,y*game.scene.world.ratio,w*game.scene.world.ratio,h*game.scene.world.ratio);
        game.scene.stage.addChild(sprite);
	},

	contactBegin: function(contactObject) {},
	contactEnd: function(contactObject) {}
});

game.SickSprite = game.Sprite.extend({
	offset: { x: 0, y: 0 },
	attachObject: null,
	tween: null,

	init: function(x, y, bodyAttach) {
	    this._super("Sick_circle.png", x, y);
	    this.attachObject = bodyAttach;
	},

	addStage: function(){
	    game.scene.stage.addChild(this);
	},

	removeStage: function(){
	    game.scene.stage.removeChild(this);
	},

	updatePos: function(x, y, rotation) {
	    this.position.x = x;
	    this.position.y = y;
	    this.rotation = rotation;
	},

	createTween: function() {
	    this.tween = new game.Tween(this.scale);
	    this.tween.easing(game.Tween.Easing.Back.InOut);
	}
});

game.SickObject = game.Class.extend({
	size: 70,
	body: null,
	sprite: null,
	isFind: false,
	isSick: true,
	life: 5,

	init: function(x, y) {
	    // Add body and shape
	    var shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    shape.sensor = true;
	    shape.collisionGroup = PEOPLE;
	    shape.collisionMask  = PEOPLE | SCENE;
	    this.body = new game.Body({
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ]
	    });
	    this.body.addShape(shape);

	    this.sprite = new game.SickSprite(x, y ,this);
	    this.sprite.anchor.set(0.5, 0.5);

	    var my = this;
	    game.scene.addTimer(1000, function(){
                    my.life--;
                    if(my.life==0) {
                    	game.scene.removeTimer(this);
                    	my.sickDie(x,y);
                    }     	
                }, true);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	contactBegin: function(contactObject) {
	    if (game.scene.obj[contactObject.id].isMedic === true) {
	        this.sickCure();
	    }

	    game.scene.obj[contactObject.id].cptContact += 1;
	    game.scene.obj[contactObject.id].sickhover = this;

	    this.sprite.scale.x = 1.3;
	    this.sprite.scale.y = 1.3;
	    this.sprite.alpha = 0.8;
	},

	contactEnd: function(contactObject) {
	    
	},

	sickDie: function(x, y) {
	    this.sprite.setTexture('skull.png');
	    var my = this;
	    game.scene.addTimer(1500, function(){
    		//mettre un son
    		game.scene.removeTimer(this);
    		my.remove();	
        }, false);
		
	},

	sickCure: function() {
		this.remove();
	}

});


game.ButtonSprite = game.Class.extend({
	spriteInButton: null,
    spriteOutButton: null,
	spriteText: null,
	text: null,
    colorInButton: 0xDFDFDF,
    colorOutButton: 0x5B5B5B,
    active: false,
    actionReady: function(){console.log('ready');},
    actionComplete: function(){console.log('complete');},

	init: function(text, x, y, w, h) {
	    var border = 10;
	    var shift = [10, 15];
        var outButton = new game.Graphics();
        var inButton = new game.Graphics();
		this.text = new game.BitmapText(text, {font:'HelveticaNeue'});

	    w = w || this.text.textWidth + border*2 + shift[0]*2;
	    h = h || this.text.textHeight + border*2 + shift[1]*2;

        this.spriteText = new game.Sprite(this.text.generateTexture(false));
        this.spriteText.position.set(x+w/2, y+h/2);
        this.spriteText.anchor = new game.Point(0.5, 0.5);

	    outButton.beginFill(this.colorOutButton);
	    outButton.drawRoundedRect(0, 0, w, h, border);
	    outButton.endFill();

        inButton.beginFill(this.colorInButton);
        inButton.drawRoundedRect(border, border, w-border*2, h-border*2, border);
        inButton.endFill();

        this.spriteOutButton = new game.Sprite(outButton.generateTexture(false));
        this.spriteOutButton.position.set(x+w/2, y+h/2);
        this.spriteOutButton.anchor = new game.Point(0.5, 0.5);
        this.spriteInButton = new game.Sprite(inButton.generateTexture(false));
        this.spriteInButton.position.set(x+w/2, y+h/2);
        this.spriteInButton.anchor = new game.Point(0.5, 0.5);

	    this.spriteOutButton.interactive = true;
	    this.spriteOutButton.buttonMode = true;
	    this.spriteOutButton.click = this.click.bind(this);
	},

	addStage: function() {
		game.scene.stage.addChild(this.spriteOutButton);
		game.scene.stage.addChild(this.spriteInButton);
		game.scene.stage.addChild(this.spriteText);
	},

	removeStage: function() {
		game.scene.stage.removeChild(this.spriteText);
		game.scene.stage.removeChild(this.spriteInButton);
		game.scene.stage.removeChild(this.spriteOutButton);
	},

	onReady: function(action) {
		this.actionReady = action;
	},

    onComplete: function(action) {
        this.actionComplete = action;
    },

	click: function() {
        if (this.active === false) {
            this.active = true;

            var group = new game.TweenGroup();
            var tween = new game.Tween(this.spriteInButton.scale);
            tween.easing(game.Tween.Easing.Bounce.InOut);
            tween.to({x:0.8, y:0.8}, 100);
            var tween2 = new game.Tween(this.spriteInButton.scale);
            tween2.easing(game.Tween.Easing.Bounce.InOut);
            tween2.to({x:1.2, y:1.2}, 100);
            var tween3 = new game.Tween(this.spriteInButton.scale);
            tween3.easing(game.Tween.Easing.Bounce.InOut);
            tween3.to({x:1, y:1}, 200);
            tween.chain(tween2);
            tween2.chain(tween3);
            group.add(tween);

            tween = new game.Tween(this.spriteText.scale);
            tween.easing(game.Tween.Easing.Bounce.InOut);
            tween.to({x:0.9, y:0.9}, 100);
            tween2 = new game.Tween(this.spriteText.scale);
            tween2.easing(game.Tween.Easing.Bounce.InOut);
            tween2.to({x:1.1, y:1.1}, 100);
            tween3 = new game.Tween(this.spriteText.scale);
            tween3.easing(game.Tween.Easing.Bounce.InOut);
            tween3.to({x:1, y:1}, 200);
            tween.chain(tween2);
            tween2.chain(tween3);
            group.add(tween);

            tween = new game.Tween(this.spriteOutButton.scale);
            tween.easing(game.Tween.Easing.Bounce.InOut);
            tween.to({x:0.9, y:0.9}, 100);
            tween2 = new game.Tween(this.spriteOutButton.scale);
            tween2.easing(game.Tween.Easing.Bounce.InOut);
            tween2.to({x:1.1, y:1.1}, 100);
            tween3 = new game.Tween(this.spriteOutButton.scale);
            tween3.easing(game.Tween.Easing.Bounce.InOut);
            tween3.to({x:1, y:1}, 200);
            var my = this;
            tween3.onComplete(function(){
                my.actionComplete();
                my.active = false;
            });
            tween.chain(tween2);
            tween2.chain(tween3);
            group.add(tween);

            group.start();

            this.actionReady();
        }
    }
});


game.CenterSprite = game.Sprite.extend({
	offset: { x: 0, y: 0 },
	attachObject: null,

	init: function(x, y, bodyAttach) {
	    this._super("center.png", x, y);
	    this.attachObject = bodyAttach;
	},

	addStage: function(){
	    game.scene.stage.addChild(this);
	},

	removeStage: function(){
	    game.scene.stage.removeChild(this);
	},

	createTween: function() {
	    this.tween = new game.Tween(this.scale);
	    this.tween.easing(game.Tween.Easing.Back.InOut);
	},

	updatePos: function(x, y) {
	    this.position.x = x;
	    this.position.y = y;
	}
});
game.CenterObject = game.Class.extend({
	size: 70,
	body: null,
	sprite: null,
	isCenter: true,
	shape: null,
	isEmpty: true,

	init: function(x, y) {
	    // Add body and shape
	    this.shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    this.shape.sensor = true;
	    this.shape.collisionGroup = CENTER;
	    this.shape.collisionMask  = SCENE | PEOPLE;
	    this.body = new game.Body({
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ],
	        angularVelocity: 0
	    });
	    this.body.addShape(this.shape);

	    // Ignore gravity
	    this.body.gravityScale = 0;

	    this.sprite = new game.CenterSprite(x, y, this);
	    this.sprite.anchor.set(0.5, 0.5);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	update: function() {
		// if (this.body !== null && this.isEmpty) {
		//          this.active = !this.active;
		//     this.createTween();
		//     if (this.active) {
		//         this.tween.to({x:1.2, y:1.2}, 300);
		//     } else {
		//         this.tween.to({x:1, y:1}, 300);
		//     }
		//     this.tween.start();
	 //    }
	},

	contactBegin: function(contactObject) {
	    if (game.scene.obj[contactObject.id].isMedic) {
	        var soundName = Math.random() > 0.5 ? "popwood1" : "popwood2";
	        game.audio.playSound(soundName);
	    }
	},

	contactEnd: function(contactObject) {
	    //nothing
	}
});

});
