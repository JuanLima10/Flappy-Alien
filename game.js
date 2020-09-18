function loadImage(address){
	let img = new Image();
	img.src = address;
	return img;
}
let COLLIDING_FALSE = 0;
let COLLIDING_FLOOR = 1;
let COLLIDING_PIPE = 2;
let COLLIDING_TOP = 3;
class GameElement {
	constructor(parent) {
		this.parent = parent;
	}
	update(){
		
	}
	render(){

	}
}
class Score extends GameElement {
	constructor(parent) {
		super(parent);
	}
	render(){
		let ctx = this.parent.context;
		ctx.font = "24px Arial";
		ctx.fillText("Placar: "+this.parent.score, 20, 690);
	}
}
class Pipe extends GameElement {
	//positionX;
	//positionY;
	//resetXOffset;
	//id;
	constructor(parent, id){
		super(parent);
		this.positionX = -12800;
		this.id = id;
		this.resetXOffset = 0;
		this.positionY = -(150+Math.random()*(400-150)); //max: -400, min: -150
	}
	update(){
		if(this.parent.started) {
			this.resetXOffset = 0;
			this.positionX-=2;
			if(this.positionX<=-12800) this.positionX = 1280+(this.id*320);
			if(this.positionX+this.parent.assets.pipeNorth.width==this.parent.player.positionX) this.parent.score++;
			if(this.positionX<-320) this.positionX+= 1280+320;
		} else {
			if(this.positionX<-320) {
				this.positionX = -12800;
			} else {
				this.resetXOffset+=0.1;
				this.positionX-=this.resetXOffset;
				if(this.positionX<this.parent.player.positionX+this.parent.assets.player.width) {
					this.parent.player.positionX = this.positionX;
				}
			}
		}
	}
	render(){
		let ctx = this.parent.context;
		let pipeNSkin = this.parent.assets.pipeNorth;
		let pipeSSkin = this.parent.assets.pipeSouth;
		ctx.drawImage(pipeNSkin, this.positionX, this.positionY, 52*2, 242*2);
		ctx.drawImage(pipeSSkin, this.positionX, this.positionY+484+250, 52*2, 378*2);
	}
	isColliding(xa, xb, xc, xd, ya, yb, yc, yd){
		let txa = this.positionX;
		let txb = this.positionX+this.parent.assets.pipeNorth.width;
		if(xb>txa&&xa<txb) {
			if(ya>this.positionY+484&&yd<this.positionY+484+250){
				return false;
			}
			return true;
		}
		return false;
	}
	canStart(){
		return this.positionX<=-12800;
	}
}
class PipeList extends GameElement {
	//pipeList;
	constructor(parent){
		super(parent);
		this.pipeList = [];
		for(let i=0; i<5; i++) {
			this.pipeList.push(new Pipe(this.parent, i));
		}
	}
	update(){
		let pipeList = this.pipeList;
		for(let i=0; i<pipeList.length; i++) pipeList[i].update();
	}
	render(){
		let pipeList = this.pipeList;
		for(let i=0; i<pipeList.length; i++) pipeList[i].render();
	}
	isColliding(xa, xb, xc, xd, ya, yb, yc, yd) {
		let pipeList = this.pipeList;
		for(let i=0; i<pipeList.length; i++)
			if(pipeList[i].isColliding(xa, xb, xc, xd, ya, yb, yc, yd)) return true;
		return false;
	}
	canStart(){
		for(let i=0; i<this.pipeList.length; i++)
			if(!this.pipeList[i].canStart())
				return false;
		return true;
	}
}
class Foreground extends GameElement {
	//foregroundPosition;
	constructor(parent){
		super(parent);
		this.foregroundPosition = 0;
	}
	update(){
		this.foregroundPosition-=2;
		if(this.foregroundPosition<-210) this.foregroundPosition+=210;
	}
	render(){
		let ctx = this.parent.context;
		let fgImg = this.parent.assets.foreground;
		for(let i=0; i<5; i++) ctx.drawImage(fgImg, fgImg.width*i+this.foregroundPosition, 720+20-fgImg.height);
	}
}
class Background extends GameElement {
	//backgroundPosition;
	constructor(parent){
		super(parent)
		this.backgroundPosition = 0;
	}
	update(){
		this.backgroundPosition--;
		if(this.backgroundPosition<-400) this.backgroundPosition+=400
	}
	render(){
		let ctx = this.parent.context;
		let bgImg = this.parent.assets.background;
		for(let i=0; i<5; i++) ctx.drawImage(bgImg, 405*i-i*4+this.backgroundPosition, 0, 405, 720);
	}
}
class Player extends GameElement {
	//positionX;
	//positionY;
	//gravityOffsetY;
	constructor(parent) {
		super(parent);
		this.positionX = 0;
		this.positionY = 720;
		this.gravityOffsetY = 0;
	}
	update(){
		let keyIsDown = this.parent.keyIsDown;
		let collide = this.isColliding();
		switch(collide) {
			case COLLIDING_FLOOR:
				this.parent.started = false;
				break;
			case COLLIDING_TOP:
				this.positionY = 0;
				break;
			case COLLIDING_PIPE:
				this.parent.started = false;
				break;
			case COLLIDING_FALSE:
			default:
				break;
		}
		if(collide!=COLLIDING_FLOOR) {
			this.gravityOffsetY+=0.3;
			this.positionY+=this.gravityOffsetY;
		}
		if(!this.parent.started) {
			this.positionX-=2;
		} else {
			this.positionX = 150;
			if(keyIsDown){
				keyIsDown = false;
				this.gravityOffsetY = -7.5;
			}
		}
	}
	render(){
		let ctx = this.parent.context;
		let playerSkin = this.parent.assets.player;
		ctx.save();
		ctx.translate(this.positionX, this.positionY);
		let rad = this.gravityOffsetY*0.1;
		if(rad>1.5) rad = 1.5;
		ctx.rotate(rad);
		ctx.drawImage(playerSkin, -38*0.75, -26*0.75, 38*1.5, 26*1.5);
		ctx.restore();
	}
	isColliding(){
		let x = 150
		let y = this.positionY;
		let w = 38*1.5;
		let h = 26*1.5;
		let xa = x;
		let xb = x+w;
		let xc = xb;
		let xd = xa;
		let ya = y;
		let yb = ya;
		let yc = y+h;
		let yd = yc;
		//is colliding with floor (foreground)
		if(yd>720-this.parent.assets.foreground.height+20) {
			return COLLIDING_FLOOR;
		}
		//is colliding with top of screen
		if(ya<0) {
			return COLLIDING_TOP;
		}
		//is colliding with pipes
		if(this.parent.pipeList.isColliding(xa, xb, xc, xd, ya, yb, yc, yd)) {
			return COLLIDING_PIPE;
		}
		return COLLIDING_FALSE;
	}
}
class Game extends GameElement {
	//context;
	//assets;
	//keyIsDown;
	//pipeList;
	//started;
	//player;
	//score;
	constructor(canvas){
		super(null);
		this.context = canvas.getContext("2d");
		this.assets = {};
		this.elements = [];
		this.keyIsDown = false;
		this.started = false;
		this.player = new Player(this);
		this.pipeList = new PipeList(this);
		this.score = 0;
		this.setup();
		this.loop(this);
	}
	setup(){
		let assets = this.assets;
		assets.background = loadImage("assets/background.png");
		assets.player = loadImage("assets/nave.gif");
		assets.foreground = loadImage("assets/foreground.png");
		assets.pipeNorth = loadImage("assets/pipe-north.png");
		assets.pipeSouth = loadImage("assets/pipe-south.png");
		let elements = this.elements;
		elements.push(new Background(this));
		elements.push(this.player);
		elements.push(this.pipeList);
		elements.push(new Foreground(this));
		elements.push(new Score(this));
	}
	update(){
		let elements = this.elements;
		for(let i=0; i<elements.length; i++) elements[i].update();
	}
	render(){
		let elements = this.elements;
		for(let i=0; i<elements.length; i++) elements[i].render();
	}
	keydown(e){
		this.keyIsDown = true;
		if(!this.started) {
			if(this.canStart()) {
				this.score = 0;
				this.started = true;
				this.player.positionX = 150;
				this.player.positionY = 50;
				this.player.gravityOffsetY = 0;
			}
		}
	}
	canStart(){
		return(this.player.positionX+this.assets.player.width<0&&this.pipeList.canStart())
	}
	keyup(){
		this.keyIsDown = false;
	}
	loop(){
		this.update();
		this.render();
		requestAnimationFrame(this.loop.bind(this));
	}
}
let game = new Game(document.querySelector("#game"));
document.addEventListener("keydown", game.keydown.bind(game));
document.addEventListener("keyup", game.keyup.bind(game));
