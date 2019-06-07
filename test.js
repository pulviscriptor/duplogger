//const Duplogger = require('duplogger'); // use this in your code
const Duplogger = require('./duplogger.js'); // not this

let log = new Duplogger('Duplogger');

// Check if colors is enabled
// Colors will be disabled if STDOUT is redirected somewhere like `node app.js > file.log`
// We don't want to have colors in file but will force them for test
if(!Duplogger.in_tty) {
	Duplogger.in_tty = true;
	log.warn('Colors disabled by `in_tty=false`, forced it to `true`');
	log.warn('Looks like `tty.isatty()` says STDOUT is redirected somewhere');
}

log.info('Info log text. Testing ' + log.invert('inverted') 				+ ' text');
log.info('Info log text. Testing ' + log.light('light') 					+ ' text');
log.info('Info log text. Testing ' + log.underline('underline') 			+ ' text');
log.info('Info log text. Testing ' + log.blink('blink') 					+ ' text');
log.info('Info log text. Testing ' + log.colorize('red', 'colored')			+ ' text');
log.info('Info log text. Testing ' + log.invert('green', 'inverted colored')+ ' text');
log.info('Info log text. Testing ' + log.colorize({invert: true, light: true}, 'inverted light') + ' text');

log.warn('Testing warn text with ' + log.invert('some') + ' example invert');
log.error('Testing error');
log.info('Demo server will start in 5000ms, ' + log.colorize({invert:true,light:true}, 'press Ctrl+C') + ' to stop demo right now');


// Here we will setup some example server with users and send some packets
const config = require('./demo/config.js');
const Server = require('./demo/server.js'); // example server
const FakeRemoteClient = require('./demo/fake_remote_client.js'); // Pretend that this is remote client

// Demo app
function DemoApp() {
	this.log = new Duplogger('DemoApp');
	this.debug = config.app.debug;

	this.server = null;

	this.start();
}

DemoApp.prototype.start = function () {
	if(this.debug >= 1)
		this.log.info('Starting demo');

	// Start server and call this.webServerReady when ready
	this.server = new Server('Server', this, config.server);
	this.server.start(this.serverReady.bind(this));
};

DemoApp.prototype.serverReady = function () {
	if(this.debug >= 1)
		this.log.info('Server started, starting demo');

	// Create tasks for client
	let client = new FakeRemoteClient(this);
	client.addTask('connect', '127.0.0.1', this.server.port);
	client.addTask('comment', 'Authorizing as legit user');
	client.addTask('send', {cmd: "auth", username: "legitUser", password: "p4ssw0rd"});
	client.addTask('send', {cmd: "echo", msg: "Hello from the other side!"});

	client.addTask('reconnect');
	client.addTask('comment', 'Sending garbage');
	client.addTask('send', 'Hello?');

	client.addTask('reconnect');
	client.addTask('comment', 'Attempting to login with wrong password');
	client.addTask('send', {cmd: "auth", username: "appAdmin", password: "123456"});

	client.addTask('reconnect');
	client.addTask('comment', 'Attempting to delete user without admin rights');
	client.addTask('send', {cmd: "auth", username: "legitUser", password: "p4ssw0rd"});
	client.addTask('send', {cmd: "delete_user", username: "admin"});

	client.addTask('reconnect');
	client.addTask('comment', 'Authorizing as admin and it should set our debug level to 3');
	client.addTask('send', {cmd: "auth", username: "appAdmin", password: "DEADBEEF"});
	client.addTask('send_raw', "{\"cmd\":\"echo\",");
	client.addTask('send_raw', "\"msg\":\"Testing ");
	client.addTask('send_raw', "chunked packets with");
	client.addTask('send_raw', "debug level 3\"}\n");

	client.addTask('reconnect');
	client.addTask('comment', 'Demo is finished, crashing server');
	client.addTask('send', {cmd: "auth", username: "legitUser", password: "p4ssw0rd"});
	client.addTask('send', {cmd: "crash_server"});

	client.start();
};

// We are ready to start our demo
setTimeout(function () {
	new DemoApp();
}, 5000);
