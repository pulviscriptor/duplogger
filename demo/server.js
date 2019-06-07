// Example server

const net = require('net');
const config = require('./config.js');
const User = require('./user.js');

function Server(id, app, config) {
	this.id = id;
	this.app = app;
	this.log = this.app.log.child(id); // Create duplogger child
	this.debug = config.debug; // Will be set inside Server.start()

	this.port = config.listen_port;
	this.host = config.listen_host;

	this.server = null;
	this.cb = null;
	this.clients = [];

	if(this.debug >= 3)
		this.log.info('Server created with config ' + JSON.stringify(config));
}

Server.prototype.start = function (cb) {
	if(this.debug >= 3)
		this.log.info('Server.start()');

	if(this.debug >= 1)
		this.log.info('Starting server on ' + this.log.invert(this.host + ':' + this.port));

	this.cb = cb;
	this.server = net.createServer();
	this.server.on('connection', this.onConnection.bind(this));
	this.server.on('error', this.onError.bind(this));
	this.server.on('listening', this.onListening.bind(this));
	this.server.listen(this.port, this.host);
};

Server.prototype.onConnection = function (socket) {
	if(this.debug >= 2)
		this.log.info('Incoming connection from ' + this.log.invert(socket.remoteAddress + ':' + socket.remotePort));

	socket.setEncoding('utf8');
	this.clients.push(new User('Guest:' + socket.remoteAddress + ':' + socket.remotePort, socket, this));
};

Server.prototype.onError = function (e) {
	this.log.error(e);
	this.log.warn('Failed to start server, will crash immediately');
	process.exit(0);
};

Server.prototype.onListening = function () {
	if(this.debug >= 1)
		this.log.info('Listening for connections on ' + this.log.invert(this.host + ':' + this.port));

	this.cb();
};


module.exports = Server;