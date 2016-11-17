'use strict'

var util = require('util')

var levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']
var noop = function () {}

function indent (s, padding) {
  return s.split("\n").map(function (s) {return (padding || "\t") + s;}).join("\n");
}

function stringify (anything) {
  var p, key_values = [];
  if (anything instanceof Array) {
    return "[" + anything.map(stringify).join(", ") + "]";
  }
  if (anything instanceof Date) {
    return anything.toString();
  }
  if (typeof anything === "object") {
    for (p in anything) {
      if (anything.hasOwnProperty(p)) {
        key_values.push(p + ": " + stringify(anything[p]));
      }
    }
    return "{\n" + indent(key_values.join(",\n"), "    ") + "\n}";
  }
  if (typeof anything === "string") {
    return '"' + anything + '"';
  }
  return anything.toString();
}



module.exports = function (opts) {
  opts = opts || {}
  opts.level = opts.level || 'info'

  var logger = {}

  var shouldLog = function (level) {
    return levels.indexOf(level) >= levels.indexOf(opts.level)
  }

  levels.forEach(function (level) {
    logger[level] = shouldLog(level) ? log : noop

    function log () {
      var prefix = opts.prefix
      var normalizedLevel

      switch (level) {
        case 'trace': normalizedLevel = 'info'; break
        case 'debug': normalizedLevel = 'info'; break
        case 'fatal': normalizedLevel = 'error'; break
        default: normalizedLevel = level
      }

      if (prefix) {
        if (typeof prefix === 'function') prefix = prefix()
        arguments[0] = util.format(prefix, stringify(arguments[0]))
      }

      console[normalizedLevel](util.format.apply(util, arguments))
    }
  })

  return logger
}
