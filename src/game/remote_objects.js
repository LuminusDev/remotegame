game.module(
    'game.remote_objects'
)
.require(
	'engine.core',
    'game.remote_assets',
    'plugins.p2'
)
.body(function(){

var SCENE          = Math.pow(2,1),
	BALL		   = Math.pow(2,2);

game.BallSprite = game.Sprite.extend({
	interactive: false,
	offset: { x: 0, y: 0 },
	attachObject: null,

	init: function(x, y, bodyAttach) {
	    this._super("circle.png", x, y);
	    this.attachObject = bodyAttach;
	    this.scale.x = 2;
	    this.scale.y = 2;
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
	}
});

game.BallObject = game.Class.extend({
	size: 140,
	body: null,
	sprite: null,
	shape: null,
	isPaused: false,
	initialPosition: [],
	acc: null,

	init: function(x, y) {

		this.initialPosition[0] = x / game.scene.world.ratio;
		this.initialPosition[1] = y / game.scene.world.ratio;
	    // Add body and shape
	    this.shape = new game.Circle(this.size / 2 / game.scene.world.ratio);
	    this.shape.collisionGroup = BALL;
	    this.shape.collisionMask  = SCENE;
	    this.body = new game.Body({
	        mass: 1,
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ],
	        angularVelocity: 0,
	    });
	    this.body.damping = 1;
	    this.body.velocity[0] = 0;
	    this.body.velocity[1] = 0;
	    this.body.gravityScale = 0;
	    this.body.addShape(this.shape);

	    var b = new game.Body({
	        mass: 0,
	        position: [
	            x / game.scene.world.ratio,
	            y / game.scene.world.ratio
	        ],
	        angularVelocity: 0,
	    });
	    var constraint = new game.DistanceConstraint(this.body, b, {
	    	distance: this.size / game.scene.world.ratio
	    });
	    constraint.upperLimitEnabled = true;
	    constraint.lowerLimitEnabled = true;
	    constraint.lowerLimit = -1;
	    constraint.upperLimit = 2;
	    game.scene.world.addBody(b);
	    game.scene.world.addConstraint(constraint);

	    this.sprite = new game.BallSprite(x, y, this);
	    this.sprite.anchor.set(0.5, 0.5);

	    game.scene.addObject(this);
	    this.sprite.addStage();
	    game.scene.world.addBody(this.body);
	},

	pause: function() {
		this.isPaused = true;
		this.body.sleep();
	},

	resume: function() {
		this.isPaused = false;
		this.body.wakeUp();
	},

	remove: function() {
	    game.scene.removeObject(this);
	    this.sprite.removeStage();
	    game.scene.world.removeBody(this.body);
	},

	update: function() {
		if (!this.isPaused) {
			if (game.accelerometer) {
				// var msg = {
				// 	dataGame: {
				// 		accx: game.accelerometer.x,
				// 		accy: game.accelerometer.y
				// 	}
				// };
				// game.websocket.send(JSON.stringify(msg));

				var alpha = 0.4,
					decimal = 10;
				var accx = Math.round(game.accelerometer.x * decimal) / decimal;
				var accy = Math.round(game.accelerometer.y * decimal) / decimal;
				if (this.acc === null) {
					this.acc = [accx, accy];
				} else { // Low-pass filter
					this.acc[0] += alpha * (accx - this.acc[0]);
					this.acc[1] += alpha * (accy - this.acc[1]);
				}

				// Retrieve position with accelerometer
				var pos = [];
				pos[0] = -this.body.position[0] + this.initialPosition[0] + this.acc[1] * game.system.delta * 70;
				pos[1] = -this.body.position[1] + this.initialPosition[1] + this.acc[0] * game.system.delta * 70;
				pos[0] *= 300;
				pos[1] *= 300;
				this.body.setZeroForce();
				this.body.applyForce(pos, this.body.position);
	        }
	        this.sprite.updatePos(
	            this.body.position[0] * game.scene.world.ratio,
	            this.body.position[1] * game.scene.world.ratio,
	            this.body.angle
	        );
		}
	}
});

game.WallObject = game.Class.extend({
	body: null,

	init: function(x, y, w, h) {
	    var wallShape = new game.Rectangle(w, h);
	    wallShape.collisionGroup = SCENE;
	    wallShape.collisionMask  = BALL;
	    this.body = new game.Body({
	        position: [x, y]
	    });
	    this.body.addShape(wallShape);
	    game.scene.world.addBody(this.body);
	}
});

game.ButtonSprite = game.Class.extend({
	spriteInButton: null,
    spriteOutButton: null,
	spriteText: null,
	text: null,
	fontsize: 20,
    colorInButton: 0xDFDFDF,
    colorOutButton: 0x5B5B5B,
    active: false,
    actionReady: function(){},
    actionComplete: function(){},

	init: function(text, x, y, w, h, fontsize) {
	    var border = 10;
	    var shift = [10, 15];
        var outButton = new game.Graphics();
        var inButton = new game.Graphics();
        this.fontsize = fontsize || this.fontsize;
		this.text = new game.BitmapText(text, {font: this.fontsize+' HelveticaNeue'});

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
	    this.spriteOutButton.click = this.spriteOutButton.tap = this.adclick.bind(this);
	},

	changeText: function(text) {
		this.text = new game.BitmapText(text, {font: this.fontsize+' HelveticaNeue'});
		this.spriteText.setTexture(this.text.generateTexture(false));
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

	adclick: function() {
        if (this.active === false) {
            this.active = true;

            var group = new game.TweenGroup();
            var tween = new game.Tween(this.spriteInButton.scale);
            tween.easing(game.Tween.Easing.Bounce.InOut);
            tween.to({x:0.8, y:0.8}, 100);
            var tween2 = new game.Tween(this.spriteInButton.scale);
            tween2.easing(game.Tween.Easing.Bounce.InOut);
            tween2.to({x:1.15, y:1.15}, 100);
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