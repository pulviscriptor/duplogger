// Some config for our app

module.exports = {
	// Delay between function calls to make demo run slower
	demo_delay: 500,

	app: {
		// Debug level of app (0-3)
		debug: 3,
	},

	server: {
		// Debug level of server (0-3)
		debug: 2,

		// Port to listen on. I hope this port is not used on your system
		listen_port: 62483,

		// IP of interface to listen on. We will use 127.0.0.1
		listen_host: '127.0.0.1'
	},

	user: {
		// Debug level of users (0-3)
		// You can make your code to set debug level of some user to different level to debug code while server is
		// loaded with other users. Example is below in "users"
		debug: 2
	},

	// Users for our app
	// Users will have login, password and role
	users: {
		legitUser: {
			password: 'p4ssw0rd',
			role: 'user'
		},

		appAdmin: {
			password: 'DEADBEEF',
			role: 'admin',
			debug: 3 // We will change debug level of user admin
		}
	}
};