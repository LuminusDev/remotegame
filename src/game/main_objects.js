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
	PHONEME_THROW  = Math.pow(2,2),
	PHONEME_INGAME = Math.pow(2,3),
	OBSTACLE       = Math.pow(2,4),
	ANSWER         = Math.pow(2,5);

game.PhonemeSprite = game.Sprite.extend({
	interactive: true,
	offset: { x: 0, y: 0 },
	attachObject: null,
	text: null,
	letter: null,

	init: function(x, y, bodyAttach, letter) {
	    this._super("circle.png", x, y);
	    this.createText(x, y, letter);
	    this.attachObject = bodyAttach;
	},

	createText: function(x, y, letter) {
	    this.letter = letter;
	    this.text = new game.BitmapText(this.letter, {font:'HelveticaNeue'});
	    this.text.position.set(x, y);
	    this.text.pivot = new game.Point(this.text.textWidth/2, this.text.textHeight/2);
	},

	addStage: function(){
	    game.scene.stage.addChild(this);
	    game.scene.stage.addChild(this.text);
	},

	removeStage: function(){
	    if (game.scene.current == this) {
	        this.mouseup();
	    }
	    game.scene.stage.removeChild(this.text);
	    game.scene.stage.removeChild(this);
	},

	updatePos: function(x, y, rotation) {
	    this.position.x = x;
	    this.position.y = y;
	    this.rotation = rotation;
	    
	    this.text.position.x = x;
	    this.text.position.y = y;
	    this.text.rotation = rotation;
	},

	click: function(e) {
	    game.audio.playSound('catch');
	    this.interactive = false;
	    this.attachObject.fall();
	}
});

game.PhonemeObject = game.Class.extend({
	size: 70,
	body: null,
	sprite: null,
	answerHover: null,
	cptContact: 0,
	isPhoneme: true,
	shape: null,

	init: function(x, y, letter, direction) {
	    // Add body and shape
	    this.shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    this.shape.collisionGroup = PHONEME_THROW;
	    this.shape.collisionMask  = SCENE;
	    this.body = new game.Body({
	        mass: 1,
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ],
	        angularVelocity: 0
	    });
	    this.body.addShape(this.shape);

	    // Apply velocity
	    var force = 4;
	    var angle = (direction == "left") ? Math.PI + Math.PI / 2 : Math.PI / 2;
	    this.body.velocity[0] = Math.sin(angle) * force;
	    this.body.velocity[1] = Math.cos(angle) * force;

	    // Ignore gravity
	    this.body.gravityScale = 0;

	    this.sprite = new game.PhonemeSprite(x, y, this, letter);
	    this.sprite.anchor.set(0.5, 0.5);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	fall: function() {
	    this.body.gravityScale = 1;
	    var force = 1;
	    var angle = Math.PI;
	    this.body.velocity[0] = Math.sin(angle) * force;
	    this.body.velocity[1] = Math.cos(angle) * force;
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	update: function() {
	    if (this.body !== null) {
	        this.sprite.updatePos(
	            this.body.position[0] * game.scene.world.ratio,
	            this.body.position[1] * game.scene.world.ratio,
	            this.body.angle
	        );
	    }
	},

	contactBegin: function(contactObject) {
	    if (game.scene.obj[contactObject.id].isPhoneme !== "undefined" &&
	        game.scene.obj[contactObject.id].isPhoneme === true
	    ) {
	        var soundName = Math.random() > 0.5 ? "popwood1" : "popwood2";
	        game.audio.playSound(soundName);
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
	    wallShape.sensor = true;
	    wallShape.collisionGroup = SCENE;
	    wallShape.collisionMask  = PHONEME_THROW | PHONEME_INGAME;
	    this.body = new game.Body({
	        position: [x, y]
	    });
	    this.body.addShape(wallShape);
	    game.scene.world.addBody(this.body);
	},

	contactBegin: function(contactObject) {
	    game.scene.obj[contactObject.id].remove();
	    game.scene.obj[contactObject.id] = null;
	    delete game.scene.obj[contactObject.id];
	},

	contactEnd: function(contactObject) {
	    //nothing
	}
});

game.AnswerSprite = game.Sprite.extend({
	interactive: true,
	offset: { x: 0, y: 0 },
	attachObject: null,
	text: null,
	letter: null,
	active: false,
	tween: null,

	init: function(x, y, bodyAttach, letter) {
	    this._super("circle-blue2.png", x, y);
	    this.createText(x, y, letter);
	    this.attachObject = bodyAttach;
	},

	createText: function(x, y, letter) {
	    this.letter = letter;
	    this.text = new game.BitmapText("", {font:'HelveticaNeue'});
	    this.text.position.set(x, y);
	    this.text.pivot = new game.Point(this.text.textWidth/2, this.text.textHeight/2);
	},

	addStage: function(){
	    game.scene.stage.addChild(this);
	    game.scene.stage.addChild(this.text);
	},

	removeStage: function(){
	    if (game.scene.current == this) {
	        this.mouseup();
	    }
	    game.scene.stage.removeChild(this.text);
	    game.scene.stage.removeChild(this);
	},

	updatePos: function(x, y, rotation) {
	    this.position.x = x;
	    this.position.y = y;
	    this.rotation = rotation;
	    
	    this.text.position.x = x;
	    this.text.position.y = y;
	    this.text.rotation = rotation;
	},

	createTween: function() {
	    this.tween = new game.Tween(this.scale);
	    this.tween.easing(game.Tween.Easing.Back.InOut);
	},

	click: function(e) {
	    this.active = !this.active;
	    this.createTween();
	    if (this.active) {
	        this.tween.to({x:1.2, y:1.2}, 300);
	    } else {
	        this.tween.to({x:1, y:1}, 300);
	    }
	    this.tween.start();
	}
});

game.AnswerObject = game.Class.extend({
	size: 70,
	body: null,
	sprite: null,
	isFind: false,

	init: function(x, y, letter) {
	    // Add body and shape
	    var shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    shape.sensor = true;
	    shape.collisionGroup = ANSWER;
	    shape.collisionMask  = PHONEME_INGAME;
	    this.body = new game.Body({
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ]
	    });
	    this.body.addShape(shape);

	    this.sprite = new game.AnswerSprite(x, y ,this, letter);
	    this.sprite.anchor.set(0.5, 0.5);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	find: function(letter) {
	    if (this.isFind === false &&
	        this.sprite.letter === letter
	    ) {
	        game.scene.victoryCurrent += 1;
	        this.isFind = true;
	        return true;
	    }
	    return false;
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	contactBegin: function(contactObject) {
	    if (game.scene.obj[contactObject.id].sprite !== game.scene.current) {
	        return;
	    }
	    if (game.scene.obj[contactObject.id].answerHover !== null) {
	        game.scene.obj[contactObject.id].answerHover.sprite.scale.x = 1;
	        game.scene.obj[contactObject.id].answerHover.sprite.scale.y = 1;
	        game.scene.obj[contactObject.id].answerHover.sprite.alpha = 1;
	    }

	    game.scene.obj[contactObject.id].cptContact += 1;
	    game.scene.obj[contactObject.id].answerHover = this;

	    this.sprite.scale.x = 1.3;
	    this.sprite.scale.y = 1.3;
	    this.sprite.alpha = 0.8;
	},

	contactEnd: function(contactObject) {
	    if (game.scene.obj[contactObject.id].sprite !== game.scene.current) {
	        return;
	    }
	    game.scene.obj[contactObject.id].cptContact -= 1;
	    if (game.scene.obj[contactObject.id].cptContact === 0) {
	        game.scene.obj[contactObject.id].answerHover = null;
	        this.sprite.scale.x = 1;
	        this.sprite.scale.y = 1;
	        this.sprite.alpha = 1;
	    }
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

});