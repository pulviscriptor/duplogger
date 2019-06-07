# Duplogger

Small logger for Node.JS with colors.  
Run `node ./node_modules/duplogger/test.js` to see demo:  

<todo: img>


## Another logger?

There is over `5000` "logger" search result on NPM so probably this logger already exists out there.  
But I made this logger long time ago with features that I need and got tired of copy-pasting .js file into different projects.  
When I change something, I have to update .js file in all my projects.  
So I finally decided to publish it on NPM for myself. But what if someone would like to use it too, then I need to make nice README.  
So that's why you read this.  

## Installation

`$ npm install duplogger`


## How to use

I will describe how I use it. You may disagree with mine approach and use your own.  
I don't like loggers with logging levels like:  
```javascript
logger.log(3, 'Dump users: ' + users.dumpUserList()); // 3 is log level
```
That way `users.dumpUserList()` will execute even if we have logging level set to `2` or lower. We will just waste CPU resources for nothing.  
Instead, I like to do: 
```javascript
if(debug >= 3)
    logger.log('Dump users: ' + users.dumpUserList());
```
That way `users.dumpUserList()` will be called only if we have log level `3` or higher.  
Check `test.js` for example code.  
Also you may want to loot at `duplogger.js` just to see code of `duplogger`. Its small file.  


### Configuring

```javascript
const Duplogger = require('duplogger');
```
After that you can change some variables. Once you change something it will be used for all instances of logger in all files.  

 - `Duplogger.colors` - colors that available for `log.colorize` and rotation array. You can delete/add/modify colors. Check `duplogger.js`
 - `Duplogger.colors_rotate` - array of color names for rotation. Every instance of `Duplogger` will use new color from list.
 - `Duplogger.stdout` - `function(text)` - you can create your oun function that will receive `stdout` so you can save/send it somewhere.
 - `Duplogger.stderr` - same as `Duplogger.stdout` but for `stderr`
 - `Duplogger.getNewColor(id)` - function that rotates color. You can replace it with your own to generate colors based on `id`. Return color name.
 - `Duplogger.in_tty` - `true/false` - enable/disable colors. Check more detailed explanation below.
 
##### Duplogger.in_tty

When you `require('duplogger')` for first time it tries to detect are you running in `tty` (terminal/console) or you pipe output somewhere using Node.JS's [isatty](https://nodejs.org/api/tty.html#tty_tty_isatty_fd) like `node app.js > file.log`  
If `duplogger` detects that you are not `tty` then colors will be disabled and all errors will be duplicated to `stdout`. So running `node app.js > file.log` will log errors both to `strout` and `stderr`.  
You can force enable/disable colors using `Duplogger.in_tty = true or false;`  
Duplogger without colors looks like this:   

<TODO: image>


### Logger API

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
