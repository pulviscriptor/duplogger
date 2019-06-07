// Server will create new user for every new connection
const config = require('./config.js');

function User(id, socket, server) {
	this.id = id;
	this.server = server;
	this.log = server.log.child('User(' + id + ')');
	this.debug = config.user.debug;

	// We need buffer to append to it all received bytes and then check if we received \n before parsing
	// If you will use this code in your project, please add some checks for buffer size otherwise somebody
	// can send you tons of data
	this.buffer = '';

	this.socket = socket;
	this.authorized = false;
	this.username = null;
	this.role = null;

	if(this.debug >= 1)
		this.log.info('User connected');

	this.attachEvents();
}

User.prototype.attachEvents = function () {
	this.socket.on('data', this.onData.bind(this));
	this.socket.on('close', this.onClose.bind(this));
};

// Beware that onData may be called with only part of string of 2 strings of data
// So we will add \n after each packet and store received data in some buffer and check if we have \n in it before parsing
User.prototype.onData = function (data) {
	if(this.debug >= 3)
		this.log.info('RECV: ' + (data.replace(/\n/, this.log.invert('blueLight', '\\n'))));

	// TODO: Please add checks for buffer size if you planning to use this code
	this.buffer += data;
	this.checkBuffer();
};

User.prototype.onClose = function () {
	this.log.info('Disconnected');

	// TODO: Add code to remove client from Server.clients if you planning to use this code
};

User.prototype.checkBuffer = function () {
	let newLinePos = this.buffer.indexOf('\n');
	if(newLinePos < 0) return;

	// Here we cut out data to \n and save remains back to buffer
	let data = this.buffer.substr(0, newLinePos);
	this.buffer = this.buffer.substr(newLinePos+1);

	this.processData(data);

	// There may be more \n symbols. Happened to me before. And it will not be processed until new onData call
	// So we check out buffer again in case there is more data to process
	this.checkBuffer();
};

User.prototype.processData = function (data) {
	let obj;
	try {
		obj = JSON.parse(data);
	} catch(e) {
		if(this.debug >= 2)
			this.log.warn('Failed to JSON parse data: ' + data);
		return this.disconnect('Invalid data');
	}

	if(!obj.cmd) return this.disconnect('Missing obj.cmd in packet: ' + data);
	const processor = this.processors[obj.cmd];
	if(!processor) return this.disconnect('Unknown processor: ' + obj.cmd + ' in packet: ' + data);

	// If this is comment we will output it directly to logger
	if(obj.cmd === 'comment') {
		return this.log('Comment: ' + obj.msg);
	}

	// Check if user is authorized
	if(!this.authorized && obj.cmd !== 'auth') {
		return this.disconnect('Unauthorized user sent packet: ' + data);
	}

	if(this.debug >= 2)
		this.log.info('Processing packet: ' + data);

	try {
		processor.call(this, obj);
	} catch(e) {
		if(this.debug >= 1)
			this.log.error(e);
		return this.disconnect('Processor crashed');
	}
};

User.prototype.send = function (data) {
	// TODO: check if user is still connected if you planning to use this code
	let str = JSON.stringify(data);

	if(this.debug >= 3)
		this.log.info('SEND: ' + str);

	this.socket.send(str + '\n');
};

User.prototype.disconnect = function (reason) {
	if(reason) {
		if(this.debug >= 1)
			this.log.info('Disconnecting user. Reason: ' + reason);
	}

	this.socket.end();
};

// This is just how I process packets from users
User.prototype.processors = {
	auth: function (opt) {
		if(this.authorized) {
			if(this.debug >= 2)
				this.log.info('Already authorized, ignoring packet');
			return;
		}

		if(!opt.username || !opt.password) {
			return this.disconnect('Missing username and/or password');
		}

		if(!config.users[opt.username] || config.users[opt.username].password !== opt.password) {
			return this.disconnect('Invalid username/password');
		}

		if(this.debug >= 1)
			this.log.info('User ' + this.log.invert(opt.username) + ' authorized');

		this.authorized = true;
		this.username = opt.username;
		this.role = config.users[opt.username].role;
		this.log = this.server.log.child('User(' + this.username + ')');

		if(config.users[opt.username].debug) {
			if(this.debug >= 1)
				this.log.info('Changing user debug level from ' + this.log.invert(this.debug) + ' to ' +
					this.log.invert(config.users[opt.username].debug));

			this.debug = config.users[opt.username].debug;
		}
	},
	
	delete_user: function () {
		if(this.role !== 'admin') {
			if(this.debug >= 1)
				this.log.warn('Attempted to delete user, but role is ' + this.log.invert(this.role));
			return this.disconnect('Admin role missing');
		}

		// Pretend we removed user. We will not delete anything in demo
	},

	echo: function (opt) {
		this.log.info('User says: ' + this.log.invert('cyan', opt.msg));
	},
	
	crash_server: function () {
		this.log.error('Fake error. Pretending it crashed server. Demo is finished.');
		process.exit(0);
	}
};


module.exports = User;