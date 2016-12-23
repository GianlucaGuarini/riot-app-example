require('reify/repl') // enablr the es6 modules also in node
global.IS_SERVER = true
global.IS_CLIENT = false
require('./app')