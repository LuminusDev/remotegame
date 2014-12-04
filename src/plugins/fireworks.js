game.module(
    'plugins.fireworks'
)
.require(
    'engine.debug'
)
.body(function() {

var soundsBoom = ["boom1","boom2","boom3","boom4"];
var soundsPop = ["pop1","pop2","pop3","pop4","pop5","pop6"];

// get a random number within a range
function random( min, max ) {
	return Math.random() * ( max - min ) + min;
}

// calculate the distance between two points
function calculateDistance( p1x, p1y, p2x, p2y ) {
	var xDistance = p1x - p2x,
			yDistance = p1y - p2y;
	return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
}

// create firework
function Firework(sx, sy, tx, ty, ctx) {
	this.ctx = ctx;
	this.particles = [];
	this.hue = random(0,359);
	// actual coordinates
	this.x = sx;
	this.y = sy;
	// starting coordinates
	this.sx = sx;
	this.sy = sy;
	// target coordinates
	this.tx = tx;
	this.ty = ty;
	// distance from starting point to target
	this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
	this.distanceTraveled = 0;
	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 1;
	// populate initial coordinate collection with the current coordinates
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	this.angle = Math.atan2( ty - sy, tx - sx );
	this.speed = 2;
	this.acceleration = 1.05;
	this.brightness = random( 50, 70 );
	// circle target indicator radius
	this.targetRadius = 1;
}

// update firework
// return death info if we can delete it
Firework.prototype.update = function() {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift( [ this.x, this.y ] );
	
	// speed up the firework
	this.speed *= this.acceleration;
	
	// get the current velocities based on angle and speed
	var vx = Math.cos( this.angle ) * this.speed,
		vy = Math.sin( this.angle ) * this.speed;
	// how far will the firework have traveled with velocities applied?
	this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );
	
	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
	if( this.distanceTraveled >= this.distanceToTarget ) {
		// must be delete so return death info
		return {
			x: this.tx,
			y: this.ty, 
			hue: this.hue,
			decay: random(0.01,0.02)
		};
	} else {
		// target not reached, keep traveling
		this.x += vx;
		this.y += vy;
	}
	return true;
}

// draw firework
Firework.prototype.draw = function() {
	this.ctx.beginPath();
	// move to the last tracked coordinate in the set, then draw a line to the current x and y
	this.ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
	this.ctx.lineTo( this.x, this.y );
	this.ctx.strokeStyle = 'hsl(' + this.hue + ', 100%, ' + this.brightness + '%)';
	this.ctx.stroke();
}

// create particle
function Particle(x, y, hue, decay, ctx) {
	this.ctx = ctx;
	this.x = x;
	this.y = y;
	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while( this.coordinateCount-- ) {
		this.coordinates.push( [ this.x, this.y ] );
	}
	// set a random angle in all possible directions, in radians
	this.angle = random( 0, Math.PI * 2 );
	this.speed = random( 1, 10 );
	// friction will slow the particle down
	this.friction = 0.95;
	// gravity will be applied and pull the particle down
	this.gravity = 1;
	// set the hue to a random number +-20 of the overall hue variable
	this.hue = random( hue - 20, hue + 20 );
	this.brightness = random( 40, 70 );
	this.alpha = 1;
	// set how fast the particle fades out
	this.decay = decay;
}

// update particle
// return death info if we can delete it
Particle.prototype.update = function() {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift([this.x, this.y]);
	// slow down the particle
	this.speed *= this.friction;
	// apply velocity
	this.x += Math.cos( this.angle ) * this.speed;
	this.y += Math.sin( this.angle ) * this.speed + this.gravity;
	// fade out the particle
	this.alpha -= this.decay;
	
	// remove the particle once the alpha is low enough, based on the passed in index
	if( this.alpha <= this.decay ) {
		return {
			x: this.x,
			y: this.y
		};
	}
	return true;
}

// draw particle
Particle.prototype.draw = function() {
	this.ctx. beginPath();
	// move to the last tracked coordinates in the set, then draw a line to the current x and y
	this.ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
	this.ctx.lineTo( this.x, this.y );
	this.ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
	this.ctx.lineWidth = 2;
	this.ctx.stroke();
}

game.Fireworks = game.Class.extend({

	canvas: null,
	canvasGameStyle: null,
	ctx: null,
	// full screen dimensions
	cw: null,
	ch: null,
	cfw: null,
	// collection firework
	fireworks: [],
	particles: [],
	// starting hue
	hue: 120,
	// this will time the auto launches of fireworks, one launch per 30 loop ticks
	// we launch a firework right now
	timerTotal: 30,
	timerTick: 30,

	loop: function() {
		this.ctx.clearRect(0,0,this.cfw,this.ch);
		
		var update;
		var i = this.fireworks.length;
		while (i--) {
			// fireworks[ i ].draw();
			update = this.fireworks[i].update();
			if (update !==  true) { // delete
				// create particles
				var particleCount = 30;
				while (particleCount--) {
					this.particles.push(new Particle(update.x, update.y, update.hue, update.decay, this.ctx));
				}
				this.fireworks.splice(i, 1);
				game.audio.playSound(soundsPop[Math.floor(Math.random()*soundsPop.length)]);
			}
		}

		i = this.particles.length;
		while (i--) {
			this.particles[i].draw();
			update = this.particles[i].update();
			if (update !==  true) { // delete
				this.particles.splice(i, 1);
			}
		}
		
		if( this.timerTick >= this.timerTotal ) {
			this.fireworks.push(new Firework(this.cfw / 2, this.ch, random(0, this.cfw), random(0, this.ch / 2), this.ctx));
			this.timerTick = Math.floor(random(0, this.timerTotal));
			// game.audio.playSound(soundsBoom[Math.floor(Math.random()*soundsBoom.length)]);
		} else {
			this.timerTick++;
		}
	},

	init: function() {
		this.canvas = document.createElement('canvas');
		this.canvasGameStyle = document.getElementById('canvas').style;

		this.cw = this.canvasGameStyle.width.slice(0,-2);
		this.ch = this.canvasGameStyle.height.slice(0,-2);

		this.canvas.width = this.cfw = game.system.width;
		this.canvas.height = game.system.height;
		this.canvas.style.width = this.cw+"px";
		this.canvas.style.height = this.ch+"px";

		this.canvas.style.position = "absolute";
		this.canvas.style.left = "0";
		this.canvas.style.right = "0";
		this.canvas.style.bottom = "0";
		this.canvas.style.top = "0";
		this.canvas.style.margin = "auto";
		this.canvas.style.zIndex = "9999";

		document.getElementsByTagName('body')[0].appendChild(this.canvas);

		this.ctx = this.canvas.getContext('2d');

		this.cw = Math.floor(this.cw)+1;
		this.ch = Math.floor(this.ch)+1;

		game.audio.setSoundVolume(0.5);

		window.addEventListener('resize', this.resizeFirework.bind(this), false);

		game.setGameLoop(this.loop.bind(this), this.canvas);
	},

	resizeFirework: function() {
		if (this.canvasGameStyle !== undefined) {
			this.cw = this.canvasGameStyle.width.slice(0,-2);
			this.ch = this.canvasGameStyle.height.slice(0,-2);

			this.canvas.width = this.cfw = game.system.width;
			this.canvas.height = game.system.height;
			this.canvas.style.width  = this.cw+"px";
			this.canvas.style.height = this.ch+"px";

			this.cw = Math.floor(this.cw)+1;
			this.ch = Math.floor(this.ch)+1;
		}
	}

});

});