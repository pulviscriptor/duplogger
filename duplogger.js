const tty = require('tty');

Duplogger.colors = {
	black: [30],
	red: [31],
	green: [32],
	yellow: [33],
	blue: [34],
	magenta: [35],
	cyan: [36],
	white: [37],

	blackLight: [30, 1],
	redLight: [31, 1],
	greenLight: [32, 1],
	yellowLight: [33, 1],
	blueLight: [34, 1],
	magentaLight: [35, 1],
	cyanLight: [36, 1],
	whiteLight: [37, 1]
};

Duplogger.colors_rotate = ['cyan', 'green', 'yellow', 'blue', 'magenta', 'red'];
Duplogger.use_color_id = 0;
Duplogger.last = process.hrtime();
Duplogger.in_tty = tty.isatty(process.stdout.fd);
Duplogger.stdout = console.log.bind(console);
Duplogger.stderr = console.error.bind(console);

function Duplogger(id) {
	this.id = id;
	this.color_name = Duplogger.getNewColor(id);
}

Duplogger.prototype.info = function(text) {
	let msg = this.formatToLog(1, text);

	Duplogger.stdout(msg);
};

Duplogger.prototype.warn = function(text) {
	let msg =  this.formatToLog(3, text);

	if(!Duplogger.in_tty)
		Duplogger.stdout(msg);
	Duplogger.stderr(msg);
};

Duplogger.prototype.error = function(e) {
	let logger = this;
	let msg;

	if(!(e instanceof Error)) {
		e = new Error(e);
	}

	msg = logger.formatToLog(2, e.stack);
	if(!Duplogger.in_tty)
		Duplogger.stdout(msg);
	Duplogger.stderr(msg);
};

Duplogger.prototype.formatToLog = function(type, text) {
	let out = '';

	if(Duplogger.in_tty)
		out += ' ';

	out += this.colorize({color: 'blackLight'}, this.getDate());
	out += ' ';

	out += this.colorize({light: true}, this.id);
	out += ' ';

	if(type === 2)
		out += this.colorize({color: 'redLight', invert: true}, 'ERROR') + ' ';

	if(type === 3)
		out += this.colorize({color: 'yellowLight', invert: true}, 'WARNING') + ' ';

	out += text;
	out += ' ' + this.colorize(false, Duplogger.delta());

	return out;
};

Duplogger.prototype.colorize = function() {
	let text;
	let opt;
	let color = Duplogger.colors[ this.color_name ];

	if(arguments.length === 2) {
		text = arguments[1];
		if((typeof arguments[0]) === 'string') {
			opt = {color: arguments[0]};
		}else{
			opt = arguments[0];
		}
	}else{
		opt = {};
		text = arguments[0];
	}

	if(!Duplogger.in_tty) return text;

	// set color
	if(opt.color) {
		if(!Duplogger.colors[opt.color]) {
			this.error('Invalid color ' + this.inverse(opt.color) + ' passed to logger. Please check your code!');
		}else{
			color = Duplogger.colors[opt.color];
		}
	}

	// process opt
	let light 		= opt['light'] === undefined ? ( color[1] || false ) : opt['light'];
	let invert 		= opt['invert'] || false;
	let underline 	= opt['underline'] || false;
	let blink	 	= opt['blink'] || false;

	// append reset after text
	let ret = text + '\u001b[0m';

	// prepend color before text
	if(light) {
		ret = '\u001b[' + color[0] + ';1m' + ret;
	}else{
		ret = '\u001b[' + color[0] + ';m' + ret;
	}

	if(invert) 		ret = '\u001b[7m' + ret;
	if(underline) 	ret = '\u001b[4m' + ret;
	if(blink)	 	ret = '\u001b[5m' + ret;

	return ret;
};

Duplogger.prototype.light = function () {
	if(arguments.length === 2) {
		return this.colorize({light: true, color: arguments[0]}, arguments[1]);
	}else{
		return this.colorize({light: true}, arguments[0]);
	}
};

Duplogger.prototype.invert = function () {
	if(arguments.length === 2) {
		return this.colorize({invert: true, color: arguments[0]}, arguments[1]);
	}else{
		return this.colorize({invert: true}, arguments[0]);
	}
};

Duplogger.prototype.underline = function () {
	if(arguments.length === 2) {
		return this.colorize({underline: true, color: arguments[0]}, arguments[1]);
	}else{
		return this.colorize({underline: true}, arguments[0]);
	}
};

Duplogger.prototype.blink = function () {
	if(arguments.length === 2) {
		return this.colorize({blink: true, color: arguments[0]}, arguments[1]);
	}else{
		return this.colorize({blink: true}, arguments[0]);
	}
};

Duplogger.prototype.child = function (id) {
	return new Duplogger(this.id + '>' + id);
};

Duplogger.prototype.getDate = function() {
	let d = new Date();
	return (
		("00" + (d.getDate())).slice(-2) + "." +
		("00" + (d.getMonth() + 1)).slice(-2) + "." +
		d.getFullYear() + " " +
		("00" + d.getHours()).slice(-2) + ":" +
		("00" + d.getMinutes()).slice(-2) + ":" +
		("00" + d.getSeconds()).slice(-2)
	);
};

// You can replace this function with your own that will generate color depending on ID
// Return color name
Duplogger.getNewColor = function(id) {
	let ret = Duplogger.colors_rotate[Duplogger.use_color_id];

	Duplogger.use_color_id++;
	if(Duplogger.use_color_id === Duplogger.colors_rotate.length) {
		Duplogger.use_color_id = 0;
	}
	return ret;
};

Duplogger.delta = function() {
	let diff = process.hrtime(Duplogger.last);
	let ret = '+' + ((diff[0] * 1e9 + diff[1])/1e6).toFixed(3) + 'ms';
	Duplogger.last = process.hrtime();

	return ret;
};

module.exports = Duplogger;
