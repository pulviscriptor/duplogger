# Duplogger

A minimalist logger for Node.JS with color schemes.  
Execute `node ./node_modules/duplogger/test.js` to run the demo:  

![screenshot](https://raw.githubusercontent.com/pulviscriptor/duplogger/master/demo/screen_colors.png)


## Yet another logger

The search "logger" yields more than `5000` results on NPM so it's likely there are similar modules. It is a set of features I find useful. In order to maintain and deploy the module, I decided to publish it on NPM.  


## Installation

`$ npm install duplogger`


## How to use

The following approach is my preferred way of calling the API. If you don't like it, you may skip to Configuring.  
  
I don't like loggers with logging levels like:
```javascript
otherLogger.log(3, 'Dump users: ' + users.dumpUserList()); // 3 is the log level
```
I find it to be flawed because `users.dumpUserList()` will execute regardless of the logging level. If the logging level equals or less than `2`, the call will simply waste the resources and produce no results.  
Instead, I advice to check the logging level beforehand:
```javascript
if(debug >= 3)
    logger.log('Dump users: ' + users.dumpUserList());
```
That way the call `users.dumpUserList()` will only trigger if the log level equals or higher than 3.  
Check `test.js` for example code.  
Also you may want to check the `duplogger.js` where the source code is located. It's a small file.  


## Configuring

```javascript
const Duplogger = require('duplogger');
```
After that you can change some variables. Once you change something it will be used for all instances of logger in all files.  

 - `Duplogger.colors` - colors that available for `log.colorize` and rotation array. You can delete/add/modify colors. Check `duplogger.js`
 - `Duplogger.colors_rotate` - array of color names for rotation. Every instance of `Duplogger` will use new color from list.
 - `Duplogger.stdout` - `function(text)` - you can create your own function that will receive `stdout` so you can save/send it somewhere.
 - `Duplogger.stderr` - same as `Duplogger.stdout` but for `stderr`
 - `Duplogger.getNewColor(id)` - function that rotates color. You can replace it with your own to generate colors based on `id`. Return color name.
 - `Duplogger.in_tty` - `true/false` - enable/disable colors. Check more detailed explanation below.
 
##### Duplogger.in_tty

When you `require('duplogger')` for first time it tries to detect are you running in `tty` (terminal/console) or you pipe output somewhere using Node.JS's [isatty](https://nodejs.org/api/tty.html#tty_tty_isatty_fd) like `node app.js > file.log`  
If `duplogger` detects that you are not `tty` then colors will be disabled and all errors will be duplicated to `stdout`. So running `node app.js > file.log` will log errors both to `strout` and `stderr`.  
You can force enable/disable colors using `Duplogger.in_tty = true or false;`  
Duplogger without colors looks like this:   

![screenshot](https://raw.githubusercontent.com/pulviscriptor/duplogger/master/demo/screen_no_colors.png)


## Logger API

After you did `const Duplogger = require('duplogger')` you can create loggers like `let log = new Duplogger(id)`.  
`id` can be any string you want. Like `Webserver` or `User(somename)` or what you think is best to debug your app.  

 - `log.id` - `string` - id of current logger. You can change it any time
 - `log.color_name` - `string` - name of color that `Duplogger.getNewColor` generated for us. You can change it any time
 - `log.info(text)` - log text to `stdout`
 - `log.warn(text)` - log text to `stderr` with yellow **WARNING** inverted text
 - `log.error` - log error
   - `log.error(text)` - log text to `stderr` with red **ERROR** inverted text and stack trace
   - `log.error(e)` - log text to `stderr` with red **ERROR** inverted text and stack trace of **e** where **e** is instance of [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 - `log.colorize` - add colors to text
   - `log.colorize(text)` - change color of text to curent color of instance of `duplogger`
   - `log.colorize(color, text)` - change color of text to selected color like `red`/`green`/`redLight`/`greenLight`. Check `duplogger.js` for list of colors of add yours modifying `Duplogger.colors`
   - `log.colorize(opt, text)` - apply object of options to text
     - `opt.color` - name of color to paint text (by default current color of instance of duplogger)
     - `opt.light` - `true/false` - light version of color (work only for dark colors like `red`, `green` but not `redLight` or `greenLight` since they already lighted `red` and `green`)
     - `opt.invert` - `true/false` - invert colors around text (create colored box around text)
     - `opt.underline` - `true/false` - underline text. (**May not work**. Depends on fonts that you use in your terminal. I never use it anyway) 
     - `opt.blink` - `true/false` - blinking text. (**May not work**. Depends on fonts that you use in your terminal. I never use it anyway) 
 - `log.light` - change color of text to light version of color
    - `log.light(text)` - alias for `log.colorize({light: true}, text)` (Change color of text to light version of current color of current instance of `duplogger`)
    - `log.light(color, text)` - alias for `log.colorize({color: color, light: true}, text)` or `log.colorize('colornameLight', text)`
 - `log.invert` - invert color of text (create colored box around text)
    - `log.invert(text)` - alias for `log.colorize({invert: true}, text)` (Create colored box around text using color of current instance of `duplogger`)
    - `log.invert(color, text)` - alias for `log.colorize({color: color, invert: true}, text)`
 - `log.underline` - underline text. (**May not work**. Depends on fonts that you use in your terminal. I never use it anyway) 
   - `log.underline(text)` - alias for `log.colorize({underline: true}, text)`
   - `log.underline(color, text)` - alias for `log.colorize({color: color, underline: true}, text)`
 - `log.blink` - blinking text. (**May not work**. Depends on fonts that you use in your terminal. I never use it anyway) 
   - `log.blink(text)` - alias for `log.colorize({blink: true}, text)`
   - `log.blink(color, text)` - alias for `log.colorize({color: color, blink: true}, text)`
 - `log.child(id)` - creates new instance from current instance. Will add parent `id`. If we have `log.id = 'Server'` then `child('IncommingConnection')` will create new logger with `log.id = 'Server>IncommingConnection'`.   
     Run `node ./node_modules/duplogger/test.js` to see how it works.

#### Good luck!

And I recommend to look at source code of `test.js` and `duplogger.js` to see how I use duplogger and source of it to check color names and other stuff.
