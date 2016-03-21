(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('http')) :
    typeof define === 'function' && define.amd ? define(['http'], factory) :
    (factory(global.http));
}(this, function (http) { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers;


    var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

    var riot = __commonjs(function (module, exports) {
    /* Riot v2.3.17, @license MIT */

    ;(function (window, undefined) {
      'use strict';

      var riot = { version: 'v2.3.17', settings: {} },

      // be aware, internal usage
      // ATTENTION: prefix the global dynamic variables with `__`

      // counter to give a unique id to all the Tag instances
      __uid = 0,

      // tags instances cache
      __virtualDom = [],

      // tags implementation cache
      __tagImpl = {},


      /**
       * Const
       */
      GLOBAL_MIXIN = '__global_mixin',


      // riot specific prefixes
      RIOT_PREFIX = 'riot-',
          RIOT_TAG = RIOT_PREFIX + 'tag',
          RIOT_TAG_IS = 'data-is',


      // for typeof == '' comparisons
      T_STRING = 'string',
          T_OBJECT = 'object',
          T_UNDEF = 'undefined',
          T_BOOL = 'boolean',
          T_FUNCTION = 'function',

      // special native tags that cannot be treated like the others
      SPECIAL_TAGS_REGEX = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
          RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],


      // version# for IE 8-11, 0 for others
      IE_VERSION = (window && window.document || {}).documentMode | 0;
      /* istanbul ignore next */
      riot.observable = function (el) {

        /**
         * Extend the original object or create a new empty one
         * @type { Object }
         */

        el = el || {};

        /**
         * Private variables and methods
         */
        var callbacks = {},
            slice = Array.prototype.slice,
            onEachEvent = function onEachEvent(e, fn) {
          e.replace(/\S+/g, fn);
        };

        // extend the object adding the observable methods
        Object.defineProperties(el, {
          /**
           * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
           * @param  { String } events - events ids
           * @param  { Function } fn - callback function
           * @returns { Object } el
           */
          on: {
            value: function value(events, fn) {
              if (typeof fn != 'function') return el;

              onEachEvent(events, function (name, pos) {
                (callbacks[name] = callbacks[name] || []).push(fn);
                fn.typed = pos > 0;
              });

              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Removes the given space separated list of `events` listeners
           * @param   { String } events - events ids
           * @param   { Function } fn - callback function
           * @returns { Object } el
           */
          off: {
            value: function value(events, fn) {
              if (events == '*' && !fn) callbacks = {};else {
                onEachEvent(events, function (name) {
                  if (fn) {
                    var arr = callbacks[name];
                    for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                      if (cb == fn) arr.splice(i--, 1);
                    }
                  } else delete callbacks[name];
                });
              }
              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Listen to the given space separated list of `events` and execute the `callback` at most once
           * @param   { String } events - events ids
           * @param   { Function } fn - callback function
           * @returns { Object } el
           */
          one: {
            value: function value(events, fn) {
              function on() {
                el.off(events, on);
                fn.apply(el, arguments);
              }
              return el.on(events, on);
            },
            enumerable: false,
            writable: false,
            configurable: false
          },

          /**
           * Execute all callback functions that listen to the given space separated list of `events`
           * @param   { String } events - events ids
           * @returns { Object } el
           */
          trigger: {
            value: function value(events) {

              // getting the arguments
              var arglen = arguments.length - 1,
                  args = new Array(arglen),
                  fns;

              for (var i = 0; i < arglen; i++) {
                args[i] = arguments[i + 1]; // skip first argument
              }

              onEachEvent(events, function (name) {

                fns = slice.call(callbacks[name] || [], 0);

                for (var i = 0, fn; fn = fns[i]; ++i) {
                  if (fn.busy) return;
                  fn.busy = 1;
                  fn.apply(el, fn.typed ? [name].concat(args) : args);
                  if (fns[i] !== fn) {
                    i--;
                  }
                  fn.busy = 0;
                }

                if (callbacks['*'] && name != '*') el.trigger.apply(el, ['*', name].concat(args));
              });

              return el;
            },
            enumerable: false,
            writable: false,
            configurable: false
          }
        });

        return el;
      }
      /* istanbul ignore next */
      ;(function (riot) {

        /**
         * Simple client-side router
         * @module riot-route
         */

        var RE_ORIGIN = /^.+?\/+[^\/]+/,
            EVENT_LISTENER = 'EventListener',
            REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
            ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
            HAS_ATTRIBUTE = 'hasAttribute',
            REPLACE = 'replace',
            POPSTATE = 'popstate',
            HASHCHANGE = 'hashchange',
            TRIGGER = 'trigger',
            MAX_EMIT_STACK_LEVEL = 3,
            win = typeof window != 'undefined' && window,
            doc = typeof document != 'undefined' && document,
            hist = win && history,
            loc = win && (hist.location || win.location),
            // see html5-history-api
        prot = Router.prototype,
            // to minify more
        clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
            started = false,
            central = riot.observable(),
            routeFound = false,
            debouncedEmit,
            base,
            current,
            parser,
            secondParser,
            emitStack = [],
            emitStackLevel = 0;

        /**
         * Default parser. You can replace it via router.parser method.
         * @param {string} path - current path (normalized)
         * @returns {array} array
         */
        function DEFAULT_PARSER(path) {
          return path.split(/[/?#]/);
        }

        /**
         * Default parser (second). You can replace it via router.parser method.
         * @param {string} path - current path (normalized)
         * @param {string} filter - filter string (normalized)
         * @returns {array} array
         */
        function DEFAULT_SECOND_PARSER(path, filter) {
          var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
              args = path.match(re);

          if (args) return args.slice(1);
        }

        /**
         * Simple/cheap debounce implementation
         * @param   {function} fn - callback
         * @param   {number} delay - delay in seconds
         * @returns {function} debounced function
         */
        function debounce(fn, delay) {
          var t;
          return function () {
            clearTimeout(t);
            t = setTimeout(fn, delay);
          };
        }

        /**
         * Set the window listeners to trigger the routes
         * @param {boolean} autoExec - see route.start
         */
        function start(autoExec) {
          debouncedEmit = debounce(emit, 1);
          win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit);
          win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
          doc[ADD_EVENT_LISTENER](clickEvent, click);
          if (autoExec) emit(true);
        }

        /**
         * Router class
         */
        function Router() {
          this.$ = [];
          riot.observable(this); // make it observable
          central.on('stop', this.s.bind(this));
          central.on('emit', this.e.bind(this));
        }

        function normalize(path) {
          return path[REPLACE](/^\/|\/$/, '');
        }

        function isString(str) {
          return typeof str == 'string';
        }

        /**
         * Get the part after domain name
         * @param {string} href - fullpath
         * @returns {string} path from root
         */
        function getPathFromRoot(href) {
          return (href || loc.href || '')[REPLACE](RE_ORIGIN, '');
        }

        /**
         * Get the part after base
         * @param {string} href - fullpath
         * @returns {string} path from base
         */
        function getPathFromBase(href) {
          return base[0] == '#' ? (href || loc.href || '').split(base)[1] || '' : getPathFromRoot(href)[REPLACE](base, '');
        }

        function emit(force) {
          // the stack is needed for redirections
          var isRoot = emitStackLevel == 0;
          if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return;

          emitStackLevel++;
          emitStack.push(function () {
            var path = getPathFromBase();
            if (force || path != current) {
              central[TRIGGER]('emit', path);
              current = path;
            }
          });
          if (isRoot) {
            while (emitStack.length) {
              emitStack[0]();
              emitStack.shift();
            }
            emitStackLevel = 0;
          }
        }

        function click(e) {
          if (e.which != 1 // not left click
           || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
           || e.defaultPrevented // or default prevented
          ) return;

          var el = e.target;
          while (el && el.nodeName != 'A') {
            el = el.parentNode;
          }if (!el || el.nodeName != 'A' // not A tag
           || el[HAS_ATTRIBUTE]('download') // has download attr
           || !el[HAS_ATTRIBUTE]('href') // has no href attr
           || el.target && el.target != '_self' // another window or frame
           || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
          ) return;

          if (el.href != loc.href) {
            if (el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
             || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
             || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
            ) return;
          }

          e.preventDefault();
        }

        /**
         * Go to the path
         * @param {string} path - destination path
         * @param {string} title - page title
         * @param {boolean} shouldReplace - use replaceState or pushState
         * @returns {boolean} - route not found flag
         */
        function go(path, title, shouldReplace) {
          if (hist) {
            // if a browser
            path = base + normalize(path);
            title = title || doc.title;
            // browsers ignores the second parameter `title`
            shouldReplace ? hist.replaceState(null, title, path) : hist.pushState(null, title, path);
            // so we need to set it manually
            doc.title = title;
            routeFound = false;
            emit();
            return routeFound;
          }

          // Server-side usage: directly execute handlers for the path
          return central[TRIGGER]('emit', getPathFromBase(path));
        }

        /**
         * Go to path or set action
         * a single string:                go there
         * two strings:                    go there with setting a title
         * two strings and boolean:        replace history with setting a title
         * a single function:              set an action on the default route
         * a string/RegExp and a function: set an action on the route
         * @param {(string|function)} first - path / action / filter
         * @param {(string|RegExp|function)} second - title / action
         * @param {boolean} third - replace flag
         */
        prot.m = function (first, second, third) {
          if (isString(first) && (!second || isString(second))) go(first, second, third || false);else if (second) this.r(first, second);else this.r('@', first);
        };

        /**
         * Stop routing
         */
        prot.s = function () {
          this.off('*');
          this.$ = [];
        };

        /**
         * Emit
         * @param {string} path - path
         */
        prot.e = function (path) {
          this.$.concat('@').some(function (filter) {
            var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter));
            if (typeof args != 'undefined') {
              this[TRIGGER].apply(null, [filter].concat(args));
              return routeFound = true; // exit from loop
            }
          }, this);
        };

        /**
         * Register route
         * @param {string} filter - filter for matching to url
         * @param {function} action - action to register
         */
        prot.r = function (filter, action) {
          if (filter != '@') {
            filter = '/' + normalize(filter);
            this.$.push(filter);
          }
          this.on(filter, action);
        };

        var mainRouter = new Router();
        var route = mainRouter.m.bind(mainRouter);

        /**
         * Create a sub router
         * @returns {function} the method of a new Router object
         */
        route.create = function () {
          var newSubRouter = new Router();
          // stop only this sub-router
          newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter);
          // return sub-router's main method
          return newSubRouter.m.bind(newSubRouter);
        };

        /**
         * Set the base of url
         * @param {(str|RegExp)} arg - a new base or '#' or '#!'
         */
        route.base = function (arg) {
          base = arg || '#';
          current = getPathFromBase(); // recalculate current path
        };

        /** Exec routing right now **/
        route.exec = function () {
          emit(true);
        };

        /**
         * Replace the default router to yours
         * @param {function} fn - your parser function
         * @param {function} fn2 - your secondParser function
         */
        route.parser = function (fn, fn2) {
          if (!fn && !fn2) {
            // reset parser for testing...
            parser = DEFAULT_PARSER;
            secondParser = DEFAULT_SECOND_PARSER;
          }
          if (fn) parser = fn;
          if (fn2) secondParser = fn2;
        };

        /**
         * Helper function to get url query as an object
         * @returns {object} parsed query
         */
        route.query = function () {
          var q = {};
          var href = loc.href || current;
          href[REPLACE](/[?&](.+?)=([^&]*)/g, function (_, k, v) {
            q[k] = v;
          });
          return q;
        };

        /** Stop routing **/
        route.stop = function () {
          if (started) {
            if (win) {
              win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit);
              win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit);
              doc[REMOVE_EVENT_LISTENER](clickEvent, click);
            }
            central[TRIGGER]('stop');
            started = false;
          }
        };

        /**
         * Start routing
         * @param {boolean} autoExec - automatically exec after starting if true
         */
        route.start = function (autoExec) {
          if (!started) {
            if (win) {
              if (document.readyState == 'complete') start(autoExec);
              // the timeout is needed to solve
              // a weird safari bug https://github.com/riot/route/issues/33
              else win[ADD_EVENT_LISTENER]('load', function () {
                  setTimeout(function () {
                    start(autoExec);
                  }, 1);
                });
            }
            started = true;
          }
        };

        /** Prepare the router **/
        route.base();
        route.parser();

        riot.route = route;
      })(riot);
      /* istanbul ignore next */

      /**
       * The riot template engine
       * @version v2.3.21
       */

      /**
       * riot.util.brackets
       *
       * - `brackets    ` - Returns a string or regex based on its parameter
       * - `brackets.set` - Change the current riot brackets
       *
       * @module
       */

      var brackets = function (UNDEF) {

        var REGLOB = 'g',
            R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
            R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,
            S_QBLOCKS = R_STRINGS.source + '|' + /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' + /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,
            FINDBRACES = {
          '(': RegExp('([()])|' + S_QBLOCKS, REGLOB),
          '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
          '{': RegExp('([{}])|' + S_QBLOCKS, REGLOB)
        },
            DEFAULT = '{ }';

        var _pairs = ['{', '}', '{', '}', /{[^}]*}/, /\\([{}])/g, /\\({)|{/g, RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB), DEFAULT, /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/, /(^|[^\\]){=[\S\s]*?}/];

        var cachedBrackets = UNDEF,
            _regex,
            _cache = [],
            _settings;

        function _loopback(re) {
          return re;
        }

        function _rewrite(re, bp) {
          if (!bp) bp = _cache;
          return new RegExp(re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : '');
        }

        function _create(pair) {
          if (pair === DEFAULT) return _pairs;

          var arr = pair.split(' ');

          if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
            throw new Error('Unsupported brackets "' + pair + '"');
          }
          arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '));

          arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr);
          arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr);
          arr[6] = _rewrite(_pairs[6], arr);
          arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB);
          arr[8] = pair;
          return arr;
        }

        function _brackets(reOrIdx) {
          return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx];
        }

        _brackets.split = function split(str, tmpl, _bp) {
          // istanbul ignore next: _bp is for the compiler
          if (!_bp) _bp = _cache;

          var parts = [],
              match,
              isexpr,
              start,
              pos,
              re = _bp[6];

          isexpr = start = re.lastIndex = 0;

          while (match = re.exec(str)) {

            pos = match.index;

            if (isexpr) {

              if (match[2]) {
                re.lastIndex = skipBraces(str, match[2], re.lastIndex);
                continue;
              }
              if (!match[3]) continue;
            }

            if (!match[1]) {
              unescapeStr(str.slice(start, pos));
              start = re.lastIndex;
              re = _bp[6 + (isexpr ^= 1)];
              re.lastIndex = start;
            }
          }

          if (str && start < str.length) {
            unescapeStr(str.slice(start));
          }

          return parts;

          function unescapeStr(s) {
            if (tmpl || isexpr) parts.push(s && s.replace(_bp[5], '$1'));else parts.push(s);
          }

          function skipBraces(s, ch, ix) {
            var match,
                recch = FINDBRACES[ch];

            recch.lastIndex = ix;
            ix = 1;
            while (match = recch.exec(s)) {
              if (match[1] && !(match[1] === ch ? ++ix : --ix)) break;
            }
            return ix ? s.length : recch.lastIndex;
          }
        };

        _brackets.hasExpr = function hasExpr(str) {
          return _cache[4].test(str);
        };

        _brackets.loopKeys = function loopKeys(expr) {
          var m = expr.match(_cache[9]);
          return m ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] } : { val: expr.trim() };
        };

        _brackets.hasRaw = function (src) {
          return _cache[10].test(src);
        };

        _brackets.array = function array(pair) {
          return pair ? _create(pair) : _cache;
        };

        function _reset(pair) {
          if ((pair || (pair = DEFAULT)) !== _cache[8]) {
            _cache = _create(pair);
            _regex = pair === DEFAULT ? _loopback : _rewrite;
            _cache[9] = _regex(_pairs[9]);
            _cache[10] = _regex(_pairs[10]);
          }
          cachedBrackets = pair;
        }

        function _setSettings(o) {
          var b;
          o = o || {};
          b = o.brackets;
          Object.defineProperty(o, 'brackets', {
            set: _reset,
            get: function get() {
              return cachedBrackets;
            },
            enumerable: true
          });
          _settings = o;
          _reset(b);
        }

        Object.defineProperty(_brackets, 'settings', {
          set: _setSettings,
          get: function get() {
            return _settings;
          }
        });

        /* istanbul ignore next: in the browser riot is always in the scope */
        _brackets.settings = typeof riot !== 'undefined' && riot.settings || {};
        _brackets.set = _reset;

        _brackets.R_STRINGS = R_STRINGS;
        _brackets.R_MLCOMMS = R_MLCOMMS;
        _brackets.S_QBLOCKS = S_QBLOCKS;

        return _brackets;
      }();

      /**
       * @module tmpl
       *
       * tmpl          - Root function, returns the template value, render with data
       * tmpl.hasExpr  - Test the existence of a expression inside a string
       * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
       */

      var tmpl = function () {

        var _cache = {};

        function _tmpl(str, data) {
          if (!str) return str;

          return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr);
        }

        _tmpl.haveRaw = brackets.hasRaw;

        _tmpl.hasExpr = brackets.hasExpr;

        _tmpl.loopKeys = brackets.loopKeys;

        _tmpl.errorHandler = null;

        function _logErr(err, ctx) {

          if (_tmpl.errorHandler) {

            err.riotData = {
              tagName: ctx && ctx.root && ctx.root.tagName,
              _riot_id: ctx && ctx._riot_id //eslint-disable-line camelcase
            };
            _tmpl.errorHandler(err);
          }
        }

        function _create(str) {

          var expr = _getTmpl(str);
          if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr;

          return new Function('E', expr + ';');
        }

        var RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
            RE_QBMARK = /\x01(\d+)~/g;

        function _getTmpl(str) {
          var qstr = [],
              expr,
              parts = brackets.split(str.replace(/\u2057/g, '"'), 1);

          if (parts.length > 2 || parts[0]) {
            var i,
                j,
                list = [];

            for (i = j = 0; i < parts.length; ++i) {

              expr = parts[i];

              if (expr && (expr = i & 1 ? _parseExpr(expr, 1, qstr) : '"' + expr.replace(/\\/g, '\\\\').replace(/\r\n?|\n/g, '\\n').replace(/"/g, '\\"') + '"')) list[j++] = expr;
            }

            expr = j < 2 ? list[0] : '[' + list.join(',') + '].join("")';
          } else {

            expr = _parseExpr(parts[1], 0, qstr);
          }

          if (qstr[0]) expr = expr.replace(RE_QBMARK, function (_, pos) {
            return qstr[pos].replace(/\r/g, '\\r').replace(/\n/g, '\\n');
          });

          return expr;
        }

        var RE_BREND = {
          '(': /[()]/g,
          '[': /[[\]]/g,
          '{': /[{}]/g
        },
            CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/;

        function _parseExpr(expr, asText, qstr) {

          if (expr[0] === '=') expr = expr.slice(1);

          expr = expr.replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s;
          }).replace(/\s+/g, ' ').trim().replace(/\ ?([[\({},?\.:])\ ?/g, '$1');

          if (expr) {
            var list = [],
                cnt = 0,
                match;

            while (expr && (match = expr.match(CS_IDENT)) && !match.index) {
              var key,
                  jsb,
                  re = /,|([[{(])|$/g;

              expr = RegExp.rightContext;
              key = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1];

              while (jsb = (match = re.exec(expr))[1]) {
                skipBraces(jsb, re);
              }jsb = expr.slice(0, match.index);
              expr = RegExp.rightContext;

              list[cnt++] = _wrapExpr(jsb, 1, key);
            }

            expr = !cnt ? _wrapExpr(expr, asText) : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0];
          }
          return expr;

          function skipBraces(ch, re) {
            var mm,
                lv = 1,
                ir = RE_BREND[ch];

            ir.lastIndex = re.lastIndex;
            while (mm = ir.exec(expr)) {
              if (mm[0] === ch) ++lv;else if (! --lv) break;
            }
            re.lastIndex = lv ? expr.length : ir.lastIndex;
          }
        }

        // istanbul ignore next: not both
        var JS_CONTEXT = '"in this?this:' + ((typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)) !== 'object' ? 'global' : 'window') + ').',
            JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
            JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/;

        function _wrapExpr(expr, asText, key) {
          var tb;

          expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
            if (mvar) {
              pos = tb ? 0 : pos + match.length;

              if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
                match = p + '("' + mvar + JS_CONTEXT + mvar;
                if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '[';
              } else if (pos) {
                tb = !JS_NOPROPS.test(s.slice(pos));
              }
            }
            return match;
          });

          if (tb) {
            expr = 'try{return ' + expr + '}catch(e){E(e,this)}';
          }

          if (key) {

            expr = (tb ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')') + '?"' + key + '":""';
          } else if (asText) {

            expr = 'function(v){' + (tb ? expr.replace('return ', 'v=') : 'v=(' + expr + ')') + ';return v||v===0?v:""}.call(this)';
          }

          return expr;
        }

        // istanbul ignore next: compatibility fix for beta versions
        _tmpl.parse = function (s) {
          return s;
        };

        _tmpl.version = brackets.version = 'v2.3.21';

        return _tmpl;
      }();

      /*
        lib/browser/tag/mkdom.js
      
        Includes hacks needed for the Internet Explorer version 9 and below
        See: http://kangax.github.io/compat-table/es5/#ie8
             http://codeplanet.io/dropping-ie8/
      */
      var mkdom = function _mkdom() {
        var reHasYield = /<yield\b/i,
            reYieldAll = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig,
            reYieldSrc = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig,
            reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig;
        var rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
            tblTags = IE_VERSION && IE_VERSION < 10 ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/;

        /**
         * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
         * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
         *
         * @param   {string} templ  - The template coming from the custom tag definition
         * @param   {string} [html] - HTML content that comes from the DOM element where you
         *           will mount the tag, mostly the original tag in the page
         * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
         */
        function _mkdom(templ, html) {
          var match = templ && templ.match(/^\s*<([-\w]+)/),
              tagName = match && match[1].toLowerCase(),
              el = mkEl('div');

          // replace all the yield tags with the tag inner html
          templ = replaceYield(templ, html);

          /* istanbul ignore next */
          if (tblTags.test(tagName)) el = specialTags(el, templ, tagName);else el.innerHTML = templ;

          el.stub = true;

          return el;
        }

        /*
          Creates the root element for table or select child elements:
          tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
        */
        function specialTags(el, templ, tagName) {
          var select = tagName[0] === 'o',
              parent = select ? 'select>' : 'table>';

          // trim() is important here, this ensures we don't have artifacts,
          // so we can check if we have only one element inside the parent
          el.innerHTML = '<' + parent + templ.trim() + '</' + parent;
          parent = el.firstChild;

          // returns the immediate parent if tr/th/td/col is the only element, if not
          // returns the whole tree, as this can include additional elements
          if (select) {
            parent.selectedIndex = -1; // for IE9, compatible w/current riot behavior
          } else {
              // avoids insertion of cointainer inside container (ex: tbody inside tbody)
              var tname = rootEls[tagName];
              if (tname && parent.childElementCount === 1) parent = $(tname, parent);
            }
          return parent;
        }

        /*
          Replace the yield tag from any tag template with the innerHTML of the
          original tag in the page
        */
        function replaceYield(templ, html) {
          // do nothing if no yield
          if (!reHasYield.test(templ)) return templ;

          // be careful with #1343 - string on the source having `$1`
          var src = {};

          html = html && html.replace(reYieldSrc, function (_, ref, text) {
            src[ref] = src[ref] || text; // preserve first definition
            return '';
          }).trim();

          return templ.replace(reYieldDest, function (_, ref, def) {
            // yield with from - to attrs
            return src[ref] || def || '';
          }).replace(reYieldAll, function (_, def) {
            // yield without any "from"
            return html || def || '';
          });
        }

        return _mkdom;
      }();

      /**
       * Convert the item looped into an object used to extend the child tag properties
       * @param   { Object } expr - object containing the keys used to extend the children tags
       * @param   { * } key - value to assign to the new object returned
       * @param   { * } val - value containing the position of the item in the array
       * @returns { Object } - new object containing the values of the original item
       *
       * The variables 'key' and 'val' are arbitrary.
       * They depend on the collection type looped (Array, Object)
       * and on the expression used on the each tag
       *
       */
      function mkitem(expr, key, val) {
        var item = {};
        item[expr.key] = key;
        if (expr.pos) item[expr.pos] = val;
        return item;
      }

      /**
       * Unmount the redundant tags
       * @param   { Array } items - array containing the current items to loop
       * @param   { Array } tags - array containing all the children tags
       */
      function unmountRedundant(items, tags) {

        var i = tags.length,
            j = items.length,
            t;

        while (i > j) {
          t = tags[--i];
          tags.splice(i, 1);
          t.unmount();
        }
      }

      /**
       * Move the nested custom tags in non custom loop tags
       * @param   { Object } child - non custom loop tag
       * @param   { Number } i - current position of the loop tag
       */
      function moveNestedTags(child, i) {
        Object.keys(child.tags).forEach(function (tagName) {
          var tag = child.tags[tagName];
          if (isArray(tag)) each(tag, function (t) {
            moveChildTag(t, tagName, i);
          });else moveChildTag(tag, tagName, i);
        });
      }

      /**
       * Adds the elements for a virtual tag
       * @param { Tag } tag - the tag whose root's children will be inserted or appended
       * @param { Node } src - the node that will do the inserting or appending
       * @param { Tag } target - only if inserting, insert before this tag's first child
       */
      function addVirtual(tag, src, target) {
        var el = tag._root,
            sib;
        tag._virts = [];
        while (el) {
          sib = el.nextSibling;
          if (target) src.insertBefore(el, target._root);else src.appendChild(el);

          tag._virts.push(el); // hold for unmounting
          el = sib;
        }
      }

      /**
       * Move virtual tag and all child nodes
       * @param { Tag } tag - first child reference used to start move
       * @param { Node } src  - the node that will do the inserting
       * @param { Tag } target - insert before this tag's first child
       * @param { Number } len - how many child nodes to move
       */
      function moveVirtual(tag, src, target, len) {
        var el = tag._root,
            sib,
            i = 0;
        for (; i < len; i++) {
          sib = el.nextSibling;
          src.insertBefore(el, target._root);
          el = sib;
        }
      }

      /**
       * Manage tags having the 'each'
       * @param   { Object } dom - DOM node we need to loop
       * @param   { Tag } parent - parent tag instance where the dom node is contained
       * @param   { String } expr - string contained in the 'each' attribute
       */
      function _each(dom, parent, expr) {

        // remove the each property from the original tag
        remAttr(dom, 'each');

        var mustReorder = babelHelpers.typeof(getAttr(dom, 'no-reorder')) !== T_STRING || remAttr(dom, 'no-reorder'),
            tagName = getTagName(dom),
            impl = __tagImpl[tagName] || { tmpl: dom.outerHTML },
            useRoot = SPECIAL_TAGS_REGEX.test(tagName),
            root = dom.parentNode,
            ref = document.createTextNode(''),
            child = getTag(dom),
            isOption = tagName.toLowerCase() === 'option',
            // the option tags must be treated differently
        tags = [],
            oldItems = [],
            hasKeys,
            isVirtual = dom.tagName == 'VIRTUAL';

        // parse the each expression
        expr = tmpl.loopKeys(expr);

        // insert a marked where the loop tags will be injected
        root.insertBefore(ref, dom);

        // clean template code
        parent.one('before-mount', function () {

          // remove the original DOM node
          dom.parentNode.removeChild(dom);
          if (root.stub) root = parent.root;
        }).on('update', function () {
          // get the new items collection
          var items = tmpl(expr.val, parent),

          // create a fragment to hold the new DOM nodes to inject in the parent tag
          frag = document.createDocumentFragment();

          // object loop. any changes cause full redraw
          if (!isArray(items)) {
            hasKeys = items || false;
            items = hasKeys ? Object.keys(items).map(function (key) {
              return mkitem(expr, key, items[key]);
            }) : [];
          }

          // loop all the new items
          var i = 0,
              itemsLength = items.length;

          for (; i < itemsLength; i++) {
            // reorder only if the items are objects
            var item = items[i],
                _mustReorder = mustReorder && item instanceof Object && !hasKeys,
                oldPos = oldItems.indexOf(item),
                pos = ~oldPos && _mustReorder ? oldPos : i,

            // does a tag exist in this position?
            tag = tags[pos];

            item = !hasKeys && expr.key ? mkitem(expr, item, i) : item;

            // new tag
            if (!_mustReorder && !tag // with no-reorder we just update the old tags
             || _mustReorder && ! ~oldPos || !tag // by default we always try to reorder the DOM elements
            ) {

                tag = new Tag(impl, {
                  parent: parent,
                  isLoop: true,
                  hasImpl: !!__tagImpl[tagName],
                  root: useRoot ? root : dom.cloneNode(),
                  item: item
                }, dom.innerHTML);

                tag.mount();

                if (isVirtual) tag._root = tag.root.firstChild; // save reference for further moves or inserts
                // this tag must be appended
                if (i == tags.length || !tags[i]) {
                  // fix 1581
                  if (isVirtual) addVirtual(tag, frag);else frag.appendChild(tag.root);
                }
                // this tag must be insert
                else {
                    if (isVirtual) addVirtual(tag, root, tags[i]);else root.insertBefore(tag.root, tags[i].root); // #1374 some browsers reset selected here
                    oldItems.splice(i, 0, item);
                  }

                tags.splice(i, 0, tag);
                pos = i; // handled here so no move
              } else tag.update(item, true);

            // reorder the tag if it's not located in its previous position
            if (pos !== i && _mustReorder && tags[i] // fix 1581 unable to reproduce it in a test!
            ) {
                // update the DOM
                if (isVirtual) moveVirtual(tag, root, tags[i], dom.childNodes.length);else root.insertBefore(tag.root, tags[i].root);
                // update the position attribute if it exists
                if (expr.pos) tag[expr.pos] = i;
                // move the old tag instance
                tags.splice(i, 0, tags.splice(pos, 1)[0]);
                // move the old item
                oldItems.splice(i, 0, oldItems.splice(pos, 1)[0]);
                // if the loop tags are not custom
                // we need to move all their custom tags into the right position
                if (!child && tag.tags) moveNestedTags(tag, i);
              }

            // cache the original item to use it in the events bound to this node
            // and its children
            tag._item = item;
            // cache the real parent tag internally
            defineProperty(tag, '_parent', parent);
          }

          // remove the redundant tags
          unmountRedundant(items, tags);

          // insert the new nodes
          if (isOption) {
            root.appendChild(frag);

            // #1374 <select> <option selected={true}> </select>
            if (root.length) {
              var si,
                  op = root.options;

              root.selectedIndex = si = -1;
              for (i = 0; i < op.length; i++) {
                if (op[i].selected = op[i].__selected) {
                  if (si < 0) root.selectedIndex = si = i;
                }
              }
            }
          } else root.insertBefore(frag, ref);

          // set the 'tags' property of the parent tag
          // if child is 'undefined' it means that we don't need to set this property
          // for example:
          // we don't need store the `myTag.tags['div']` property if we are looping a div tag
          // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
          if (child) parent.tags[tagName] = tags;

          // clone the items array
          oldItems = items.slice();
        });
      }
      /**
       * Object that will be used to inject and manage the css of every tag instance
       */
      var styleManager = function (_riot) {

        if (!window) return { // skip injection on the server
          add: function add() {},
          inject: function inject() {}
        };

        var styleNode = function () {
          // create a new style element with the correct type
          var newNode = mkEl('style');
          setAttr(newNode, 'type', 'text/css');

          // replace any user node or insert the new one into the head
          var userNode = $('style[type=riot]');
          if (userNode) {
            if (userNode.id) newNode.id = userNode.id;
            userNode.parentNode.replaceChild(newNode, userNode);
          } else document.getElementsByTagName('head')[0].appendChild(newNode);

          return newNode;
        }();

        // Create cache and shortcut to the correct property
        var cssTextProp = styleNode.styleSheet,
            stylesToInject = '';

        // Expose the style node in a non-modificable property
        Object.defineProperty(_riot, 'styleNode', {
          value: styleNode,
          writable: true
        });

        /**
         * Public api
         */
        return {
          /**
           * Save a tag style to be later injected into DOM
           * @param   { String } css [description]
           */
          add: function add(css) {
            stylesToInject += css;
          },
          /**
           * Inject all previously saved tag styles into DOM
           * innerHTML seems slow: http://jsperf.com/riot-insert-style
           */
          inject: function inject() {
            if (stylesToInject) {
              if (cssTextProp) cssTextProp.cssText += stylesToInject;else styleNode.innerHTML += stylesToInject;
              stylesToInject = '';
            }
          }
        };
      }(riot);

      function parseNamedElements(root, tag, childTags, forceParsingNamed) {

        walk(root, function (dom) {
          if (dom.nodeType == 1) {
            dom.isLoop = dom.isLoop || dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each') ? 1 : 0;

            // custom child tag
            if (childTags) {
              var child = getTag(dom);

              if (child && !dom.isLoop) childTags.push(initChildTag(child, { root: dom, parent: tag }, dom.innerHTML, tag));
            }

            if (!dom.isLoop || forceParsingNamed) setNamed(dom, tag, []);
          }
        });
      }

      function parseExpressions(root, tag, expressions) {

        function addExpr(dom, val, extra) {
          if (tmpl.hasExpr(val)) {
            expressions.push(extend({ dom: dom, expr: val }, extra));
          }
        }

        walk(root, function (dom) {
          var type = dom.nodeType,
              attr;

          // text node
          if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue);
          if (type != 1) return;

          /* element */

          // loop
          attr = getAttr(dom, 'each');

          if (attr) {
            _each(dom, tag, attr);return false;
          }

          // attribute expressions
          each(dom.attributes, function (attr) {
            var name = attr.name,
                bool = name.split('__')[1];

            addExpr(dom, attr.value, { attr: bool || name, bool: bool });
            if (bool) {
              remAttr(dom, name);return false;
            }
          });

          // skip custom tags
          if (getTag(dom)) return false;
        });
      }
      function Tag(impl, conf, innerHTML) {

        var self = riot.observable(this),
            opts = inherit(conf.opts) || {},
            parent = conf.parent,
            isLoop = conf.isLoop,
            hasImpl = conf.hasImpl,
            item = cleanUpData(conf.item),
            expressions = [],
            childTags = [],
            root = conf.root,
            tagName = root.tagName.toLowerCase(),
            attr = {},
            implAttr = {},
            propsInSyncWithParent = [],
            dom;

        // only call unmount if we have a valid __tagImpl (has name property)
        if (impl.name && root._tag) root._tag.unmount(true);

        // not yet mounted
        this.isMounted = false;
        root.isLoop = isLoop;

        // keep a reference to the tag just created
        // so we will be able to mount this tag multiple times
        root._tag = this;

        // create a unique id to this tag
        // it could be handy to use it also to improve the virtual dom rendering speed
        defineProperty(this, '_riot_id', ++__uid); // base 1 allows test !t._riot_id

        extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item);

        // grab attributes
        each(root.attributes, function (el) {
          var val = el.value;
          // remember attributes with expressions only
          if (tmpl.hasExpr(val)) attr[el.name] = val;
        });

        dom = mkdom(impl.tmpl, innerHTML);

        // options
        function updateOpts() {
          var ctx = hasImpl && isLoop ? self : parent || self;

          // update opts from current DOM attributes
          each(root.attributes, function (el) {
            var val = el.value;
            opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val;
          });
          // recover those with expressions
          each(Object.keys(attr), function (name) {
            opts[toCamel(name)] = tmpl(attr[name], ctx);
          });
        }

        function normalizeData(data) {
          for (var key in item) {
            if (babelHelpers.typeof(self[key]) !== T_UNDEF && isWritable(self, key)) self[key] = data[key];
          }
        }

        function inheritFromParent() {
          if (!self.parent || !isLoop) return;
          each(Object.keys(self.parent), function (k) {
            // some properties must be always in sync with the parent tag
            var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k);
            if (babelHelpers.typeof(self[k]) === T_UNDEF || mustSync) {
              // track the property to keep in sync
              // so we can keep it updated
              if (!mustSync) propsInSyncWithParent.push(k);
              self[k] = self.parent[k];
            }
          });
        }

        /**
         * Update the tag expressions and options
         * @param   { * }  data - data we want to use to extend the tag properties
         * @param   { Boolean } isInherited - is this update coming from a parent tag?
         * @returns { self }
         */
        defineProperty(this, 'update', function (data, isInherited) {

          // make sure the data passed will not override
          // the component core methods
          data = cleanUpData(data);
          // inherit properties from the parent
          inheritFromParent();
          // normalize the tag properties in case an item object was initially passed
          if (data && isObject(item)) {
            normalizeData(data);
            item = data;
          }
          extend(self, data);
          updateOpts();
          self.trigger('update', data);
          update(expressions, self);

          // the updated event will be triggered
          // once the DOM will be ready and all the re-flows are completed
          // this is useful if you want to get the "real" root properties
          // 4 ex: root.offsetWidth ...
          if (isInherited && self.parent)
            // closes #1599
            self.parent.one('updated', function () {
              self.trigger('updated');
            });else rAF(function () {
            self.trigger('updated');
          });

          return this;
        });

        defineProperty(this, 'mixin', function () {
          each(arguments, function (mix) {
            var instance;

            mix = (typeof mix === 'undefined' ? 'undefined' : babelHelpers.typeof(mix)) === T_STRING ? riot.mixin(mix) : mix;

            // check if the mixin is a function
            if (isFunction(mix)) {
              // create the new mixin instance
              instance = new mix();
              // save the prototype to loop it afterwards
              mix = mix.prototype;
            } else instance = mix;

            // loop the keys in the function prototype or the all object keys
            each(Object.getOwnPropertyNames(mix), function (key) {
              // bind methods to self
              if (key != 'init') self[key] = isFunction(instance[key]) ? instance[key].bind(self) : instance[key];
            });

            // init method will be called automatically
            if (instance.init) instance.init.bind(self)();
          });
          return this;
        });

        defineProperty(this, 'mount', function () {

          updateOpts();

          // add global mixin
          var globalMixin = riot.mixin(GLOBAL_MIXIN);
          if (globalMixin) self.mixin(globalMixin);

          // initialiation
          if (impl.fn) impl.fn.call(self, opts);

          // parse layout after init. fn may calculate args for nested custom tags
          parseExpressions(dom, self, expressions);

          // mount the child tags
          toggle(true);

          // update the root adding custom attributes coming from the compiler
          // it fixes also #1087
          if (impl.attrs) walkAttributes(impl.attrs, function (k, v) {
            setAttr(root, k, v);
          });
          if (impl.attrs || hasImpl) parseExpressions(self.root, self, expressions);

          if (!self.parent || isLoop) self.update(item);

          // internal use only, fixes #403
          self.trigger('before-mount');

          if (isLoop && !hasImpl) {
            // update the root attribute for the looped elements
            root = dom.firstChild;
          } else {
            while (dom.firstChild) {
              root.appendChild(dom.firstChild);
            }if (root.stub) root = parent.root;
          }

          defineProperty(self, 'root', root);

          // parse the named dom nodes in the looped child
          // adding them to the parent as well
          if (isLoop) parseNamedElements(self.root, self.parent, null, true);

          // if it's not a child tag we can trigger its mount event
          if (!self.parent || self.parent.isMounted) {
            self.isMounted = true;
            self.trigger('mount');
          }
          // otherwise we need to wait that the parent event gets triggered
          else self.parent.one('mount', function () {
              // avoid to trigger the `mount` event for the tags
              // not visible included in an if statement
              if (!isInStub(self.root)) {
                self.parent.isMounted = self.isMounted = true;
                self.trigger('mount');
              }
            });
        });

        defineProperty(this, 'unmount', function (keepRootTag) {
          var el = root,
              p = el.parentNode,
              ptag,
              tagIndex = __virtualDom.indexOf(self);

          self.trigger('before-unmount');

          // remove this tag instance from the global virtualDom variable
          if (~tagIndex) __virtualDom.splice(tagIndex, 1);

          if (this._virts) {
            each(this._virts, function (v) {
              if (v.parentNode) v.parentNode.removeChild(v);
            });
          }

          if (p) {

            if (parent) {
              ptag = getImmediateCustomParentTag(parent);
              // remove this tag from the parent tags object
              // if there are multiple nested tags with same name..
              // remove this element form the array
              if (isArray(ptag.tags[tagName])) each(ptag.tags[tagName], function (tag, i) {
                if (tag._riot_id == self._riot_id) ptag.tags[tagName].splice(i, 1);
              });else
                // otherwise just delete the tag instance
                ptag.tags[tagName] = undefined;
            } else while (el.firstChild) {
              el.removeChild(el.firstChild);
            }if (!keepRootTag) p.removeChild(el);else
              // the riot-tag attribute isn't needed anymore, remove it
              remAttr(p, 'riot-tag');
          }

          self.trigger('unmount');
          toggle();
          self.off('*');
          self.isMounted = false;
          delete root._tag;
        });

        // proxy function to bind updates
        // dispatched from a parent tag
        function onChildUpdate(data) {
          self.update(data, true);
        }

        function toggle(isMount) {

          // mount/unmount children
          each(childTags, function (child) {
            child[isMount ? 'mount' : 'unmount']();
          });

          // listen/unlisten parent (events flow one way from parent to children)
          if (!parent) return;
          var evt = isMount ? 'on' : 'off';

          // the loop tags will be always in sync with the parent automatically
          if (isLoop) parent[evt]('unmount', self.unmount);else {
            parent[evt]('update', onChildUpdate)[evt]('unmount', self.unmount);
          }
        }

        // named elements available for fn
        parseNamedElements(dom, this, childTags);
      }
      /**
       * Attach an event to a DOM node
       * @param { String } name - event name
       * @param { Function } handler - event callback
       * @param { Object } dom - dom node
       * @param { Tag } tag - tag instance
       */
      function setEventHandler(name, handler, dom, tag) {

        dom[name] = function (e) {

          var ptag = tag._parent,
              item = tag._item,
              el;

          if (!item) while (ptag && !item) {
            item = ptag._item;
            ptag = ptag._parent;
          }

          // cross browser event fix
          e = e || window.event;

          // override the event properties
          if (isWritable(e, 'currentTarget')) e.currentTarget = dom;
          if (isWritable(e, 'target')) e.target = e.srcElement;
          if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode;

          e.item = item;

          // prevent default behaviour (by default)
          if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
            if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
          }

          if (!e.preventUpdate) {
            el = item ? getImmediateCustomParentTag(ptag) : tag;
            el.update();
          }
        };
      }

      /**
       * Insert a DOM node replacing another one (used by if- attribute)
       * @param   { Object } root - parent node
       * @param   { Object } node - node replaced
       * @param   { Object } before - node added
       */
      function insertTo(root, node, before) {
        if (!root) return;
        root.insertBefore(before, node);
        root.removeChild(node);
      }

      /**
       * Update the expressions in a Tag instance
       * @param   { Array } expressions - expression that must be re evaluated
       * @param   { Tag } tag - tag instance
       */
      function update(expressions, tag) {

        each(expressions, function (expr, i) {

          var dom = expr.dom,
              attrName = expr.attr,
              value = tmpl(expr.expr, tag),
              parent = expr.dom.parentNode;

          if (expr.bool) {
            value = !!value;
            if (attrName === 'selected') dom.__selected = value; // #1374
          } else if (value == null) value = '';

          // #1638: regression of #1612, update the dom only if the value of the
          // expression was changed
          if (expr.value === value) {
            return;
          }
          expr.value = value;

          // textarea and text nodes has no attribute name
          if (!attrName) {
            // about #815 w/o replace: the browser converts the value to a string,
            // the comparison by "==" does too, but not in the server
            value += '';
            // test for parent avoids error with invalid assignment to nodeValue
            if (parent) {
              if (parent.tagName === 'TEXTAREA') {
                parent.value = value; // #1113
                if (!IE_VERSION) dom.nodeValue = value; // #1625 IE throws here, nodeValue
              } // will be available on 'updated'
              else dom.nodeValue = value;
            }
            return;
          }

          // ~~#1612: look for changes in dom.value when updating the value~~
          if (attrName === 'value') {
            dom.value = value;
            return;
          }

          // remove original attribute
          remAttr(dom, attrName);

          // event handler
          if (isFunction(value)) {
            setEventHandler(attrName, value, dom, tag);

            // if- conditional
          } else if (attrName == 'if') {
              var stub = expr.stub,
                  add = function add() {
                insertTo(stub.parentNode, stub, dom);
              },
                  remove = function remove() {
                insertTo(dom.parentNode, dom, stub);
              };

              // add to DOM
              if (value) {
                if (stub) {
                  add();
                  dom.inStub = false;
                  // avoid to trigger the mount event if the tags is not visible yet
                  // maybe we can optimize this avoiding to mount the tag at all
                  if (!isInStub(dom)) {
                    walk(dom, function (el) {
                      if (el._tag && !el._tag.isMounted) el._tag.isMounted = !!el._tag.trigger('mount');
                    });
                  }
                }
                // remove from DOM
              } else {
                  stub = expr.stub = stub || document.createTextNode('');
                  // if the parentNode is defined we can easily replace the tag
                  if (dom.parentNode) remove();
                  // otherwise we need to wait the updated event
                  else (tag.parent || tag).one('updated', remove);

                  dom.inStub = true;
                }
              // show / hide
            } else if (attrName === 'show') {
                dom.style.display = value ? '' : 'none';
              } else if (attrName === 'hide') {
                dom.style.display = value ? 'none' : '';
              } else if (expr.bool) {
                dom[attrName] = value;
                if (value) setAttr(dom, attrName, attrName);
              } else if (value === 0 || value && (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) !== T_OBJECT) {
                // <img src="{ expr }">
                if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
                  attrName = attrName.slice(RIOT_PREFIX.length);
                }
                setAttr(dom, attrName, value);
              }
        });
      }
      /**
       * Specialized function for looping an array-like collection with `each={}`
       * @param   { Array } els - collection of items
       * @param   {Function} fn - callback function
       * @returns { Array } the array looped
       */
      function each(els, fn) {
        var len = els ? els.length : 0;

        for (var i = 0, el; i < len; i++) {
          el = els[i];
          // return false -> current item was removed by fn during the loop
          if (el != null && fn(el, i) === false) i--;
        }
        return els;
      }

      /**
       * Detect if the argument passed is a function
       * @param   { * } v - whatever you want to pass to this function
       * @returns { Boolean } -
       */
      function isFunction(v) {
        return (typeof v === 'undefined' ? 'undefined' : babelHelpers.typeof(v)) === T_FUNCTION || false; // avoid IE problems
      }

      /**
       * Detect if the argument passed is an object, exclude null.
       * NOTE: Use isObject(x) && !isArray(x) to excludes arrays.
       * @param   { * } v - whatever you want to pass to this function
       * @returns { Boolean } -
       */
      function isObject(v) {
        return v && (typeof v === 'undefined' ? 'undefined' : babelHelpers.typeof(v)) === T_OBJECT; // typeof null is 'object'
      }

      /**
       * Remove any DOM attribute from a node
       * @param   { Object } dom - DOM node we want to update
       * @param   { String } name - name of the property we want to remove
       */
      function remAttr(dom, name) {
        dom.removeAttribute(name);
      }

      /**
       * Convert a string containing dashes to camel case
       * @param   { String } string - input string
       * @returns { String } my-string -> myString
       */
      function toCamel(string) {
        return string.replace(/-(\w)/g, function (_, c) {
          return c.toUpperCase();
        });
      }

      /**
       * Get the value of any DOM attribute on a node
       * @param   { Object } dom - DOM node we want to parse
       * @param   { String } name - name of the attribute we want to get
       * @returns { String | undefined } name of the node attribute whether it exists
       */
      function getAttr(dom, name) {
        return dom.getAttribute(name);
      }

      /**
       * Set any DOM attribute
       * @param { Object } dom - DOM node we want to update
       * @param { String } name - name of the property we want to set
       * @param { String } val - value of the property we want to set
       */
      function setAttr(dom, name, val) {
        dom.setAttribute(name, val);
      }

      /**
       * Detect the tag implementation by a DOM node
       * @param   { Object } dom - DOM node we need to parse to get its tag implementation
       * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
       */
      function getTag(dom) {
        return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG_IS) || getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()];
      }
      /**
       * Add a child tag to its parent into the `tags` object
       * @param   { Object } tag - child tag instance
       * @param   { String } tagName - key where the new tag will be stored
       * @param   { Object } parent - tag instance where the new child tag will be included
       */
      function addChildTag(tag, tagName, parent) {
        var cachedTag = parent.tags[tagName];

        // if there are multiple children tags having the same name
        if (cachedTag) {
          // if the parent tags property is not yet an array
          // create it adding the first cached tag
          if (!isArray(cachedTag))
            // don't add the same tag twice
            if (cachedTag !== tag) parent.tags[tagName] = [cachedTag];
          // add the new nested tag to the array
          if (!contains(parent.tags[tagName], tag)) parent.tags[tagName].push(tag);
        } else {
          parent.tags[tagName] = tag;
        }
      }

      /**
       * Move the position of a custom tag in its parent tag
       * @param   { Object } tag - child tag instance
       * @param   { String } tagName - key where the tag was stored
       * @param   { Number } newPos - index where the new tag will be stored
       */
      function moveChildTag(tag, tagName, newPos) {
        var parent = tag.parent,
            tags;
        // no parent no move
        if (!parent) return;

        tags = parent.tags[tagName];

        if (isArray(tags)) tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0]);else addChildTag(tag, tagName, parent);
      }

      /**
       * Create a new child tag including it correctly into its parent
       * @param   { Object } child - child tag implementation
       * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
       * @param   { String } innerHTML - inner html of the child node
       * @param   { Object } parent - instance of the parent tag including the child custom tag
       * @returns { Object } instance of the new child tag just created
       */
      function initChildTag(child, opts, innerHTML, parent) {
        var tag = new Tag(child, opts, innerHTML),
            tagName = getTagName(opts.root),
            ptag = getImmediateCustomParentTag(parent);
        // fix for the parent attribute in the looped elements
        tag.parent = ptag;
        // store the real parent tag
        // in some cases this could be different from the custom parent tag
        // for example in nested loops
        tag._parent = parent;

        // add this tag to the custom parent tag
        addChildTag(tag, tagName, ptag);
        // and also to the real parent tag
        if (ptag !== parent) addChildTag(tag, tagName, parent);
        // empty the child node once we got its template
        // to avoid that its children get compiled multiple times
        opts.root.innerHTML = '';

        return tag;
      }

      /**
       * Loop backward all the parents tree to detect the first custom parent tag
       * @param   { Object } tag - a Tag instance
       * @returns { Object } the instance of the first custom parent tag found
       */
      function getImmediateCustomParentTag(tag) {
        var ptag = tag;
        while (!getTag(ptag.root)) {
          if (!ptag.parent) break;
          ptag = ptag.parent;
        }
        return ptag;
      }

      /**
       * Helper function to set an immutable property
       * @param   { Object } el - object where the new property will be set
       * @param   { String } key - object key where the new property will be stored
       * @param   { * } value - value of the new property
      * @param   { Object } options - set the propery overriding the default options
       * @returns { Object } - the initial object
       */
      function defineProperty(el, key, value, options) {
        Object.defineProperty(el, key, extend({
          value: value,
          enumerable: false,
          writable: false,
          configurable: false
        }, options));
        return el;
      }

      /**
       * Get the tag name of any DOM node
       * @param   { Object } dom - DOM node we want to parse
       * @returns { String } name to identify this dom node in riot
       */
      function getTagName(dom) {
        var child = getTag(dom),
            namedTag = getAttr(dom, 'name'),
            tagName = namedTag && !tmpl.hasExpr(namedTag) ? namedTag : child ? child.name : dom.tagName.toLowerCase();

        return tagName;
      }

      /**
       * Extend any object with other properties
       * @param   { Object } src - source object
       * @returns { Object } the resulting extended object
       *
       * var obj = { foo: 'baz' }
       * extend(obj, {bar: 'bar', foo: 'bar'})
       * console.log(obj) => {bar: 'bar', foo: 'bar'}
       *
       */
      function extend(src) {
        var obj,
            args = arguments;
        for (var i = 1; i < args.length; ++i) {
          if (obj = args[i]) {
            for (var key in obj) {
              // check if this property of the source object could be overridden
              if (isWritable(src, key)) src[key] = obj[key];
            }
          }
        }
        return src;
      }

      /**
       * Check whether an array contains an item
       * @param   { Array } arr - target array
       * @param   { * } item - item to test
       * @returns { Boolean } Does 'arr' contain 'item'?
       */
      function contains(arr, item) {
        return ~arr.indexOf(item);
      }

      /**
       * Check whether an object is a kind of array
       * @param   { * } a - anything
       * @returns {Boolean} is 'a' an array?
       */
      function isArray(a) {
        return Array.isArray(a) || a instanceof Array;
      }

      /**
       * Detect whether a property of an object could be overridden
       * @param   { Object }  obj - source object
       * @param   { String }  key - object property
       * @returns { Boolean } is this property writable?
       */
      function isWritable(obj, key) {
        var props = Object.getOwnPropertyDescriptor(obj, key);
        return babelHelpers.typeof(obj[key]) === T_UNDEF || props && props.writable;
      }

      /**
       * With this function we avoid that the internal Tag methods get overridden
       * @param   { Object } data - options we want to use to extend the tag instance
       * @returns { Object } clean object without containing the riot internal reserved words
       */
      function cleanUpData(data) {
        if (!(data instanceof Tag) && !(data && babelHelpers.typeof(data.trigger) == T_FUNCTION)) return data;

        var o = {};
        for (var key in data) {
          if (!contains(RESERVED_WORDS_BLACKLIST, key)) o[key] = data[key];
        }
        return o;
      }

      /**
       * Walk down recursively all the children tags starting dom node
       * @param   { Object }   dom - starting node where we will start the recursion
       * @param   { Function } fn - callback to transform the child node just found
       */
      function walk(dom, fn) {
        if (dom) {
          // stop the recursion
          if (fn(dom) === false) return;else {
            dom = dom.firstChild;

            while (dom) {
              walk(dom, fn);
              dom = dom.nextSibling;
            }
          }
        }
      }

      /**
       * Minimize risk: only zero or one _space_ between attr & value
       * @param   { String }   html - html string we want to parse
       * @param   { Function } fn - callback function to apply on any attribute found
       */
      function walkAttributes(html, fn) {
        var m,
            re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g;

        while (m = re.exec(html)) {
          fn(m[1].toLowerCase(), m[2] || m[3] || m[4]);
        }
      }

      /**
       * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
       * @param   { Object }  dom - DOM node we want to parse
       * @returns { Boolean } -
       */
      function isInStub(dom) {
        while (dom) {
          if (dom.inStub) return true;
          dom = dom.parentNode;
        }
        return false;
      }

      /**
       * Create a generic DOM node
       * @param   { String } name - name of the DOM node we want to create
       * @returns { Object } DOM node just created
       */
      function mkEl(name) {
        return document.createElement(name);
      }

      /**
       * Shorter and fast way to select multiple nodes in the DOM
       * @param   { String } selector - DOM selector
       * @param   { Object } ctx - DOM node where the targets of our search will is located
       * @returns { Object } dom nodes found
       */
      function $$(selector, ctx) {
        return (ctx || document).querySelectorAll(selector);
      }

      /**
       * Shorter and fast way to select a single node in the DOM
       * @param   { String } selector - unique dom selector
       * @param   { Object } ctx - DOM node where the target of our search will is located
       * @returns { Object } dom node found
       */
      function $(selector, ctx) {
        return (ctx || document).querySelector(selector);
      }

      /**
       * Simple object prototypal inheritance
       * @param   { Object } parent - parent object
       * @returns { Object } child instance
       */
      function inherit(parent) {
        function Child() {}
        Child.prototype = parent;
        return new Child();
      }

      /**
       * Get the name property needed to identify a DOM node in riot
       * @param   { Object } dom - DOM node we need to parse
       * @returns { String | undefined } give us back a string to identify this dom node
       */
      function getNamedKey(dom) {
        return getAttr(dom, 'id') || getAttr(dom, 'name');
      }

      /**
       * Set the named properties of a tag element
       * @param { Object } dom - DOM node we need to parse
       * @param { Object } parent - tag instance where the named dom element will be eventually added
       * @param { Array } keys - list of all the tag instance properties
       */
      function setNamed(dom, parent, keys) {
        // get the key value we want to add to the tag instance
        var key = getNamedKey(dom),
            isArr,

        // add the node detected to a tag instance using the named property
        add = function add(value) {
          // avoid to override the tag properties already set
          if (contains(keys, key)) return;
          // check whether this value is an array
          isArr = isArray(value);
          // if the key was never set
          if (!value)
            // set it once on the tag instance
            parent[key] = dom;
            // if it was an array and not yet set
          else if (!isArr || isArr && !contains(value, dom)) {
              // add the dom node into the array
              if (isArr) value.push(dom);else parent[key] = [value, dom];
            }
        };

        // skip the elements with no named properties
        if (!key) return;

        // check whether this key has been already evaluated
        if (tmpl.hasExpr(key))
          // wait the first updated event only once
          parent.one('mount', function () {
            key = getNamedKey(dom);
            add(parent[key]);
          });else add(parent[key]);
      }

      /**
       * Faster String startsWith alternative
       * @param   { String } src - source string
       * @param   { String } str - test string
       * @returns { Boolean } -
       */
      function startsWith(src, str) {
        return src.slice(0, str.length) === str;
      }

      /**
       * requestAnimationFrame function
       * Adapted from https://gist.github.com/paulirish/1579671, license MIT
       */
      var rAF = function (w) {
        var raf = w.requestAnimationFrame || w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame;

        if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {
          // buggy iOS6
          var lastTime = 0;

          raf = function raf(cb) {
            var nowtime = Date.now(),
                timeout = Math.max(16 - (nowtime - lastTime), 0);
            setTimeout(function () {
              cb(lastTime = nowtime + timeout);
            }, timeout);
          };
        }
        return raf;
      }(window || {});

      /**
       * Mount a tag creating new Tag instance
       * @param   { Object } root - dom node where the tag will be mounted
       * @param   { String } tagName - name of the riot tag we want to mount
       * @param   { Object } opts - options to pass to the Tag instance
       * @returns { Tag } a new Tag instance
       */
      function mountTo(root, tagName, opts) {
        var tag = __tagImpl[tagName],

        // cache the inner HTML to fix #855
        innerHTML = root._innerHTML = root._innerHTML || root.innerHTML;

        // clear the inner html
        root.innerHTML = '';

        if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML);

        if (tag && tag.mount) {
          tag.mount();
          // add this tag to the virtualDom variable
          if (!contains(__virtualDom, tag)) __virtualDom.push(tag);
        }

        return tag;
      }
      /**
       * Riot public api
       */

      // share methods for other riot parts, e.g. compiler
      riot.util = { brackets: brackets, tmpl: tmpl };

      /**
       * Create a mixin that could be globally shared across all the tags
       */
      riot.mixin = function () {
        var mixins = {};

        /**
         * Create/Return a mixin by its name
         * @param   { String } name - mixin name (global mixin if missing)
         * @param   { Object } mixin - mixin logic
         * @returns { Object } the mixin logic
         */
        return function (name, mixin) {
          if (isObject(name)) {
            mixin = name;
            mixins[GLOBAL_MIXIN] = extend(mixins[GLOBAL_MIXIN] || {}, mixin);
            return;
          }

          if (!mixin) return mixins[name];
          mixins[name] = mixin;
        };
      }();

      /**
       * Create a new riot tag implementation
       * @param   { String }   name - name/id of the new riot tag
       * @param   { String }   html - tag template
       * @param   { String }   css - custom tag css
       * @param   { String }   attrs - root tag attributes
       * @param   { Function } fn - user function
       * @returns { String } name/id of the tag just created
       */
      riot.tag = function (name, html, css, attrs, fn) {
        if (isFunction(attrs)) {
          fn = attrs;
          if (/^[\w\-]+\s?=/.test(css)) {
            attrs = css;
            css = '';
          } else attrs = '';
        }
        if (css) {
          if (isFunction(css)) fn = css;else styleManager.add(css);
        }
        name = name.toLowerCase();
        __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn };
        return name;
      };

      /**
       * Create a new riot tag implementation (for use by the compiler)
       * @param   { String }   name - name/id of the new riot tag
       * @param   { String }   html - tag template
       * @param   { String }   css - custom tag css
       * @param   { String }   attrs - root tag attributes
       * @param   { Function } fn - user function
       * @returns { String } name/id of the tag just created
       */
      riot.tag2 = function (name, html, css, attrs, fn) {
        if (css) styleManager.add(css);
        //if (bpair) riot.settings.brackets = bpair
        __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn };
        return name;
      };

      /**
       * Mount a tag using a specific tag implementation
       * @param   { String } selector - tag DOM selector
       * @param   { String } tagName - tag implementation name
       * @param   { Object } opts - tag logic
       * @returns { Array } new tags instances
       */
      riot.mount = function (selector, tagName, opts) {

        var els,
            allTags,
            tags = [];

        // helper functions

        function addRiotTags(arr) {
          var list = '';
          each(arr, function (e) {
            if (!/[^-\w]/.test(e)) {
              e = e.trim().toLowerCase();
              list += ',[' + RIOT_TAG_IS + '="' + e + '"],[' + RIOT_TAG + '="' + e + '"]';
            }
          });
          return list;
        }

        function selectAllTags() {
          var keys = Object.keys(__tagImpl);
          return keys + addRiotTags(keys);
        }

        function pushTags(root) {
          if (root.tagName) {
            var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG);

            // have tagName? force riot-tag to be the same
            if (tagName && riotTag !== tagName) {
              riotTag = tagName;
              setAttr(root, RIOT_TAG_IS, tagName);
            }
            var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts);

            if (tag) tags.push(tag);
          } else if (root.length) {
            each(root, pushTags); // assume nodeList
          }
        }

        // ----- mount code -----

        // inject styles into DOM
        styleManager.inject();

        if (isObject(tagName)) {
          opts = tagName;
          tagName = 0;
        }

        // crawl the DOM to find the tag
        if ((typeof selector === 'undefined' ? 'undefined' : babelHelpers.typeof(selector)) === T_STRING) {
          if (selector === '*')
            // select all the tags registered
            // and also the tags found with the riot-tag attribute set
            selector = allTags = selectAllTags();else
            // or just the ones named like the selector
            selector += addRiotTags(selector.split(/, */));

          // make sure to pass always a selector
          // to the querySelectorAll function
          els = selector ? $$(selector) : [];
        } else
          // probably you have passed already a tag or a NodeList
          els = selector;

        // select all the registered and mount them inside their root elements
        if (tagName === '*') {
          // get all custom tags
          tagName = allTags || selectAllTags();
          // if the root els it's just a single tag
          if (els.tagName) els = $$(tagName, els);else {
            // select all the children for all the different root elements
            var nodeList = [];
            each(els, function (_el) {
              nodeList.push($$(tagName, _el));
            });
            els = nodeList;
          }
          // get rid of the tagName
          tagName = 0;
        }

        pushTags(els);

        return tags;
      };

      /**
       * Update all the tags instances created
       * @returns { Array } all the tags instances
       */
      riot.update = function () {
        return each(__virtualDom, function (tag) {
          tag.update();
        });
      };

      /**
       * Export the Tag constructor
       */
      riot.Tag = Tag;
      // support CommonJS, AMD & browser
      /* istanbul ignore next */
      if ((typeof exports === 'undefined' ? 'undefined' : babelHelpers.typeof(exports)) === T_OBJECT) module.exports = riot;else if ((typeof define === 'undefined' ? 'undefined' : babelHelpers.typeof(define)) === T_FUNCTION && babelHelpers.typeof(define.amd) !== T_UNDEF) define(function () {
        return riot;
      });else window.riot = riot;
    })(typeof window != 'undefined' ? window : void 0);
    });

    var riot$1 = (riot && typeof riot === 'object' && 'default' in riot ? riot['default'] : riot);

    riot$1.tag2('app', '<main name="main"> </main> <sidebar state="{state}"> <user-status state="{state}"> </user-status> </sidebar>', '', '', function (opts) {
      var _this = this;

      this.state = riot$1.observable({
        user: opts.user,
        view: null
      });

      this.mountSubview = function (data) {

        if (data.view == _this.state.view) return;

        var mount = function mount() {
          return riot$1.mount(_this.main, data.view, data);
        };

        _this.state.view = data.view;

        data.state = _this.state;

        if (IS_CLIENT) _this.moveOut(_this.main).then(function () {
          var tag = mount()[0];
          _this.moveIn(tag.root).then(function () {
            return tag.trigger('animation-completed');
          });
        });else mount();

        _this.state.trigger('view::changed', _this.state.view);
      };

      if (IS_CLIENT) {
        this.mixin('animation-features');
        this.mixin('alert');
      }

      if (opts.view) this.mountSubview(opts);

      this.state.on('user::error', function (err) {
        return _this.alert('Login error', err);
      });

      this.state.on('user::logged', function (err) {
        _this.alert('Well done!', 'You are logged in dear ' + _this.state.user.name + '!', 'success');
      });
    });
    riot$1.tag2('sidebar', '<nav> <ul> <li class="{active: state.view == \'index\'}"> <a href="/">Home</a> </li> <li class="{active: state.view == \'feed\'}"> <a href="/feed">Feed</a> </li> <li class="{active: state.view == \'gallery\'}"> <a href="/gallery">Gallery</a> </li> <li class="{active: state.view == \'login\'}"> <a href="/login">Login</a> </li> </ul> </nav> <footer> <yield></yield> </footer>', '', '', function (opts) {
      var _this2 = this;

      this.state = opts.state;
      this.state.on('view::changed', function () {
        return _this2.update();
      });
    });
    riot$1.tag2('user-status', '<small if="{user.isLogged}"> User: {user.name} </small> <small if="{!user.isLogged}"> You are not<br> logged! </small>', '', '', function (opts) {
      this.state = opts.state;
      this.user = this.state.user;

      this.state.on('user::logged', this.update);
    });
    riot$1.tag2('feed', '<h1>{opts.data.title}</h1> <p>{opts.data.message}</p> <p if="{!news.length}">Loading the news... ( new news any 3 seconds )</p> <ul> <li each="{news}"> <img width="100%" riot-src="{image}"> <h2>{title}</h2> <p>{description}</p> </li> </ul>', '', '', function (opts) {
      var _this3 = this;

      var onNewsPublished = function onNewsPublished(news) {
        _this3.news.push(news);
        _this3.update();
      };

      this.gateway = opts.gateway;
      this.news = opts.data.news;

      this.gateway.listen();
      this.gateway.on('news::published', onNewsPublished);

      this.on('unmount', function () {
        _this3.gateway.socket.disconnect();
        _this3.gateway.off('news::published', onNewsPublished);
      });
    });
    riot$1.tag2('gallery', '<h1>{opts.data.title}</h1> <p>{opts.data.message}</p> <article class="swiper-container" name="swiper-container"> <div class="swiper-wrapper"> <div each="{image in opts.data.images}" class="swiper-slide"> <img class="swiper-lazy" width="100%" data-src="{image}"> <div class="swiper-lazy-preloader"></div> </div> </div> <div class="swiper-pagination" name="swiper-pagination"></div> <div class="swiper-button-next" name="swiper-button-next"></div> <div class="swiper-button-prev" name="swiper-button-prev"></div> </article>', '', '', function (opts) {
      var _this4 = this;

      var onSlideChanged = function onSlideChanged(id) {
        riot$1.route('gallery/' + _this4.gateway.slideId);
        _this4.swiper.slideTo(id);
      };

      this.state = opts.state;
      this.gateway = opts.gateway;

      if (IS_CLIENT) {
        this.mixin('swiper');
        this.one('animation-completed', function () {
          _this4.swiper = new _this4.Swiper(_this4['swiper-container'], {
            pagination: _this4['swiper-pagination'],
            nextButton: _this4['swiper-button-next'],
            prevButton: _this4['swiper-button-prev'],
            initialSlide: _this4.gateway.slideId - 1,
            paginationClickable: true,
            setWrapperSize: true,
            lazyLoading: true,
            preloadImages: false,
            centeredSlides: true,
            keyboardControl: true,
            loop: true
          });

          _this4.swiper.on('slideChangeEnd', function () {
            _this4.gateway.slideId = _this4.swiper.activeIndex;
          });

          _this4.gateway.on('slide::changed', onSlideChanged);
        });
      }

      this.on('unmount', function () {
        _this4.gateway.off('slide::changed', onSlideChanged);
        _this4.swiper.destroy();
      });
    });
    riot$1.tag2('index', '<h1>{opts.data.title}</h1> <p>{opts.data.message}</p>', '', '', function (opts) {});
    riot$1.tag2('login', '<h1>{opts.data.title}</h1> <p>{opts.data.message}</p> <form name="form" onsubmit="{tryLogin}" if="{!user.isLogged}"> <label> Email: <input name="email" placeholder="my@email.com" type="email"> </label> <label> Password: <input name="password" type="password" placeholder="12345"> </label> <button type="submit"> Login! </button> </form> <p name="user-message" if="{user.isLogged}"> Welcome dear <b>{user.name}</b> </p>', '', '', function (opts) {
      var _this5 = this;

      var onUserLogged = function onUserLogged(user) {
        _this5.user = user;
        _this5.moveOut(_this5.form).then(function () {
          return _this5.update();
        });
      };

      this.state = opts.state;
      this.user = this.state.user;

      if (this.state.isClient) this.mixin('animation-features');

      this.tryLogin = function () {
        var res = this.user.authenticate(this.email.value, this.password.value);

        if (res == true) this.state.trigger('user::logged', this.user);else this.state.trigger('user::error', res);
      }.bind(this);

      this.state.on('user::logged', onUserLogged);

      this.on('unmount', function () {
        _this5.state.off('user::logged', onUserLogged);
      });
    });

    var velocity = __commonjs(function (module) {
    /*! VelocityJS.org (1.2.3). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License */ /*************************
       Velocity jQuery Shim
    *************************/ /*! VelocityJS.org jQuery Shim (1.0.1). (C) 2014 The jQuery Foundation. MIT @license: en.wikipedia.org/wiki/MIT_License. */ /* This file contains the jQuery functions that Velocity relies on, thereby removing Velocity's dependency on a full copy of jQuery, and allowing it to work in any environment. */ /* These shimmed functions are only used if jQuery isn't present. If both this shim and jQuery are loaded, Velocity defaults to jQuery proper. */ /* Browser support: Using this shim instead of jQuery proper removes support for IE8. */;(function(window){ /***************
             Setup
        ***************/ /* If jQuery is already loaded, there's no point in loading this shim. */if(window.jQuery){return;} /* jQuery base. */var $=function $(selector,context){return new $.fn.init(selector,context);}; /********************
           Private Methods
        ********************/ /* jQuery */$.isWindow=function(obj){ /* jshint eqeqeq: false */return obj!=null&&obj==obj.window;}; /* jQuery */$.type=function(obj){if(obj==null){return obj+"";}return (typeof obj==="undefined"?"undefined":babelHelpers.typeof(obj))==="object"||typeof obj==="function"?class2type[toString.call(obj)]||"object":typeof obj==="undefined"?"undefined":babelHelpers.typeof(obj);}; /* jQuery */$.isArray=Array.isArray||function(obj){return $.type(obj)==="array";}; /* jQuery */function isArraylike(obj){var length=obj.length,type=$.type(obj);if(type==="function"||$.isWindow(obj)){return false;}if(obj.nodeType===1&&length){return true;}return type==="array"||length===0||typeof length==="number"&&length>0&&length-1 in obj;} /***************
           $ Methods
        ***************/ /* jQuery: Support removed for IE<9. */$.isPlainObject=function(obj){var key;if(!obj||$.type(obj)!=="object"||obj.nodeType||$.isWindow(obj)){return false;}try{if(obj.constructor&&!hasOwn.call(obj,"constructor")&&!hasOwn.call(obj.constructor.prototype,"isPrototypeOf")){return false;}}catch(e){return false;}for(key in obj){}return key===undefined||hasOwn.call(obj,key);}; /* jQuery */$.each=function(obj,callback,args){var value,i=0,length=obj.length,isArray=isArraylike(obj);if(args){if(isArray){for(;i<length;i++){value=callback.apply(obj[i],args);if(value===false){break;}}}else {for(i in obj){value=callback.apply(obj[i],args);if(value===false){break;}}}}else {if(isArray){for(;i<length;i++){value=callback.call(obj[i],i,obj[i]);if(value===false){break;}}}else {for(i in obj){value=callback.call(obj[i],i,obj[i]);if(value===false){break;}}}}return obj;}; /* Custom */$.data=function(node,key,value){ /* $.getData() */if(value===undefined){var id=node[$.expando],store=id&&cache[id];if(key===undefined){return store;}else if(store){if(key in store){return store[key];}} /* $.setData() */}else if(key!==undefined){var id=node[$.expando]||(node[$.expando]=++$.uuid);cache[id]=cache[id]||{};cache[id][key]=value;return value;}}; /* Custom */$.removeData=function(node,keys){var id=node[$.expando],store=id&&cache[id];if(store){$.each(keys,function(_,key){delete store[key];});}}; /* jQuery */$.extend=function(){var src,copyIsArray,copy,name,options,clone,target=arguments[0]||{},i=1,length=arguments.length,deep=false;if(typeof target==="boolean"){deep=target;target=arguments[i]||{};i++;}if((typeof target==="undefined"?"undefined":babelHelpers.typeof(target))!=="object"&&$.type(target)!=="function"){target={};}if(i===length){target=this;i--;}for(;i<length;i++){if((options=arguments[i])!=null){for(name in options){src=target[name];copy=options[name];if(target===copy){continue;}if(deep&&copy&&($.isPlainObject(copy)||(copyIsArray=$.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&$.isArray(src)?src:[];}else {clone=src&&$.isPlainObject(src)?src:{};}target[name]=$.extend(deep,clone,copy);}else if(copy!==undefined){target[name]=copy;}}}}return target;}; /* jQuery 1.4.3 */$.queue=function(elem,type,data){function $makeArray(arr,results){var ret=results||[];if(arr!=null){if(isArraylike(Object(arr))){ /* $.merge */(function(first,second){var len=+second.length,j=0,i=first.length;while(j<len){first[i++]=second[j++];}if(len!==len){while(second[j]!==undefined){first[i++]=second[j++];}}first.length=i;return first;})(ret,typeof arr==="string"?[arr]:arr);}else {[].push.call(ret,arr);}}return ret;}if(!elem){return;}type=(type||"fx")+"queue";var q=$.data(elem,type);if(!data){return q||[];}if(!q||$.isArray(data)){q=$.data(elem,type,$makeArray(data));}else {q.push(data);}return q;}; /* jQuery 1.4.3 */$.dequeue=function(elems,type){ /* Custom: Embed element iteration. */$.each(elems.nodeType?[elems]:elems,function(i,elem){type=type||"fx";var queue=$.queue(elem,type),fn=queue.shift();if(fn==="inprogress"){fn=queue.shift();}if(fn){if(type==="fx"){queue.unshift("inprogress");}fn.call(elem,function(){$.dequeue(elem,type);});}});}; /******************
           $.fn Methods
        ******************/ /* jQuery */$.fn=$.prototype={init:function init(selector){ /* Just return the element wrapped inside an array; don't proceed with the actual jQuery node wrapping process. */if(selector.nodeType){this[0]=selector;return this;}else {throw new Error("Not a DOM node.");}},offset:function offset(){ /* jQuery altered code: Dropped disconnected DOM node checking. */var box=this[0].getBoundingClientRect?this[0].getBoundingClientRect():{top:0,left:0};return {top:box.top+(window.pageYOffset||document.scrollTop||0)-(document.clientTop||0),left:box.left+(window.pageXOffset||document.scrollLeft||0)-(document.clientLeft||0)};},position:function position(){ /* jQuery */function offsetParent(){var offsetParent=this.offsetParent||document;while(offsetParent&&!offsetParent.nodeType.toLowerCase==="html"&&offsetParent.style.position==="static"){offsetParent=offsetParent.offsetParent;}return offsetParent||document;} /* Zepto */var elem=this[0],offsetParent=offsetParent.apply(elem),offset=this.offset(),parentOffset=/^(?:body|html)$/i.test(offsetParent.nodeName)?{top:0,left:0}:$(offsetParent).offset();offset.top-=parseFloat(elem.style.marginTop)||0;offset.left-=parseFloat(elem.style.marginLeft)||0;if(offsetParent.style){parentOffset.top+=parseFloat(offsetParent.style.borderTopWidth)||0;parentOffset.left+=parseFloat(offsetParent.style.borderLeftWidth)||0;}return {top:offset.top-parentOffset.top,left:offset.left-parentOffset.left};}}; /**********************
           Private Variables
        **********************/ /* For $.data() */var cache={};$.expando="velocity"+new Date().getTime();$.uuid=0; /* For $.queue() */var class2type={},hasOwn=class2type.hasOwnProperty,toString=class2type.toString;var types="Boolean Number String Function Array Date RegExp Object Error".split(" ");for(var i=0;i<types.length;i++){class2type["[object "+types[i]+"]"]=types[i].toLowerCase();} /* Makes $(node) possible, without having to call init. */$.fn.init.prototype=$.fn; /* Globalize Velocity onto the window, and assign its Utilities property. */window.Velocity={Utilities:$};})(window); /******************
        Velocity.js
    ******************/;(function(factory){ /* CommonJS module. */if((typeof module==="undefined"?"undefined":babelHelpers.typeof(module))==="object"&&babelHelpers.typeof(module.exports)==="object"){module.exports=factory(); /* AMD module. */}else if(typeof define==="function"&&define.amd){define(factory); /* Browser globals. */}else {factory();}})(function(){return function(global,window,document,undefined){ /***************
            Summary
        ***************/ /*
        - CSS: CSS stack that works independently from the rest of Velocity.
        - animate(): Core animation method that iterates over the targeted elements and queues the incoming call onto each element individually.
          - Pre-Queueing: Prepare the element for animation by instantiating its data cache and processing the call's options.
          - Queueing: The logic that runs once the call has reached its point of execution in the element's $.queue() stack.
                      Most logic is placed here to avoid risking it becoming stale (if the element's properties have changed).
          - Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
        - tick(): The single requestAnimationFrame loop responsible for tweening all in-progress calls.
        - completeCall(): Handles the cleanup process for each Velocity call.
        */ /*********************
           Helper Functions
        *********************/ /* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */var IE=function(){if(document.documentMode){return document.documentMode;}else {for(var i=7;i>4;i--){var div=document.createElement("div");div.innerHTML="<!--[if IE "+i+"]><span></span><![endif]-->";if(div.getElementsByTagName("span").length){div=null;return i;}}}return undefined;}(); /* rAF shim. Gist: https://gist.github.com/julianshapiro/9497513 */var rAFShim=function(){var timeLast=0;return window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback){var timeCurrent=new Date().getTime(),timeDelta; /* Dynamically set delay on a per-tick basis to match 60fps. */ /* Technique by Erik Moller. MIT license: https://gist.github.com/paulirish/1579671 */timeDelta=Math.max(0,16-(timeCurrent-timeLast));timeLast=timeCurrent+timeDelta;return setTimeout(function(){callback(timeCurrent+timeDelta);},timeDelta);};}(); /* Array compacting. Copyright Lo-Dash. MIT License: https://github.com/lodash/lodash/blob/master/LICENSE.txt */function compactSparseArray(array){var index=-1,length=array?array.length:0,result=[];while(++index<length){var value=array[index];if(value){result.push(value);}}return result;}function sanitizeElements(elements){ /* Unwrap jQuery/Zepto objects. */if(Type.isWrapped(elements)){elements=[].slice.call(elements); /* Wrap a single element in an array so that $.each() can iterate with the element instead of its node's children. */}else if(Type.isNode(elements)){elements=[elements];}return elements;}var Type={isString:function isString(variable){return typeof variable==="string";},isArray:Array.isArray||function(variable){return Object.prototype.toString.call(variable)==="[object Array]";},isFunction:function isFunction(variable){return Object.prototype.toString.call(variable)==="[object Function]";},isNode:function isNode(variable){return variable&&variable.nodeType;}, /* Copyright Martin Bohm. MIT License: https://gist.github.com/Tomalak/818a78a226a0738eaade */isNodeList:function isNodeList(variable){return (typeof variable==="undefined"?"undefined":babelHelpers.typeof(variable))==="object"&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(variable))&&variable.length!==undefined&&(variable.length===0||babelHelpers.typeof(variable[0])==="object"&&variable[0].nodeType>0);}, /* Determine if variable is a wrapped jQuery or Zepto element. */isWrapped:function isWrapped(variable){return variable&&(variable.jquery||window.Zepto&&window.Zepto.zepto.isZ(variable));},isSVG:function isSVG(variable){return window.SVGElement&&variable instanceof window.SVGElement;},isEmptyObject:function isEmptyObject(variable){for(var name in variable){return false;}return true;}}; /*****************
           Dependencies
        *****************/var $,isJQuery=false;if(global.fn&&global.fn.jquery){$=global;isJQuery=true;}else {$=window.Velocity.Utilities;}if(IE<=8&&!isJQuery){throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");}else if(IE<=7){ /* Revert to jQuery's $.animate(), and lose Velocity's extra features. */jQuery.fn.velocity=jQuery.fn.animate; /* Now that $.fn.velocity is aliased, abort this Velocity declaration. */return;} /*****************
            Constants
        *****************/var DURATION_DEFAULT=400,EASING_DEFAULT="swing"; /*************
            State
        *************/var Velocity={ /* Container for page-wide Velocity state data. */State:{ /* Detect mobile devices to determine if mobileHA should be turned on. */isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), /* The mobileHA option's behavior changes on older Android devices (Gingerbread, versions 2.3.3-2.3.7). */isAndroid:/Android/i.test(navigator.userAgent),isGingerbread:/Android 2\.3\.[3-7]/i.test(navigator.userAgent),isChrome:window.chrome,isFirefox:/Firefox/i.test(navigator.userAgent), /* Create a cached element for re-use when checking for CSS property prefixes. */prefixElement:document.createElement("div"), /* Cache every prefix match to avoid repeating lookups. */prefixMatches:{}, /* Cache the anchor used for animating window scrolling. */scrollAnchor:null, /* Cache the browser-specific property names associated with the scroll anchor. */scrollPropertyLeft:null,scrollPropertyTop:null, /* Keep track of whether our RAF tick is running. */isTicking:false, /* Container for every in-progress call to Velocity. */calls:[]}, /* Velocity's custom CSS stack. Made global for unit testing. */CSS:{ /* Defined below. */}, /* A shim of the jQuery utility functions used by Velocity -- provided by Velocity's optional jQuery shim. */Utilities:$, /* Container for the user's custom animation redirects that are referenced by name in place of the properties map argument. */Redirects:{ /* Manually registered by the user. */},Easings:{ /* Defined below. */}, /* Attempt to use ES6 Promises by default. Users can override this with a third-party promises library. */Promise:window.Promise, /* Velocity option defaults, which can be overriden by the user. */defaults:{queue:"",duration:DURATION_DEFAULT,easing:EASING_DEFAULT,begin:undefined,complete:undefined,progress:undefined,display:undefined,visibility:undefined,loop:false,delay:false,mobileHA:true, /* Advanced: Set to false to prevent property values from being cached between consecutive Velocity-initiated chain calls. */_cacheValues:true}, /* A design goal of Velocity is to cache data wherever possible in order to avoid DOM requerying. Accordingly, each element has a data cache. */init:function init(element){$.data(element,"velocity",{ /* Store whether this is an SVG element, since its properties are retrieved and updated differently than standard HTML elements. */isSVG:Type.isSVG(element), /* Keep track of whether the element is currently being animated by Velocity.
                       This is used to ensure that property values are not transferred between non-consecutive (stale) calls. */isAnimating:false, /* A reference to the element's live computedStyle object. Learn more here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */computedStyle:null, /* Tween data is cached for each animation on the element so that data can be passed across calls --
                       in particular, end values are used as subsequent start values in consecutive Velocity calls. */tweensContainer:null, /* The full root property values of each CSS hook being animated on this element are cached so that:
                       1) Concurrently-animating hooks sharing the same root can have their root values' merged into one while tweening.
                       2) Post-hook-injection root values can be transferred over to consecutively chained Velocity calls as starting root values. */rootPropertyValueCache:{}, /* A cache for transform updates, which must be manually flushed via CSS.flushTransformCache(). */transformCache:{}});}, /* A parallel to jQuery's $.css(), used for getting/setting Velocity's hooked CSS properties. */hook:null, /* Defined below. */ /* Velocity-wide animation time remapping for testing purposes. */mock:false,version:{major:1,minor:2,patch:2}, /* Set to 1 or 2 (most verbose) to output debug info to console. */debug:false}; /* Retrieve the appropriate scroll anchor and property name for the browser: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY */if(window.pageYOffset!==undefined){Velocity.State.scrollAnchor=window;Velocity.State.scrollPropertyLeft="pageXOffset";Velocity.State.scrollPropertyTop="pageYOffset";}else {Velocity.State.scrollAnchor=document.documentElement||document.body.parentNode||document.body;Velocity.State.scrollPropertyLeft="scrollLeft";Velocity.State.scrollPropertyTop="scrollTop";} /* Shorthand alias for jQuery's $.data() utility. */function Data(element){ /* Hardcode a reference to the plugin name. */var response=$.data(element,"velocity"); /* jQuery <=1.4.2 returns null instead of undefined when no match is found. We normalize this behavior. */return response===null?undefined:response;}; /**************
            Easing
        **************/ /* Step easing generator. */function generateStep(steps){return function(p){return Math.round(p*steps)*(1/steps);};} /* Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License */function generateBezier(mX1,mY1,mX2,mY2){var NEWTON_ITERATIONS=4,NEWTON_MIN_SLOPE=0.001,SUBDIVISION_PRECISION=0.0000001,SUBDIVISION_MAX_ITERATIONS=10,kSplineTableSize=11,kSampleStepSize=1.0/(kSplineTableSize-1.0),float32ArraySupported="Float32Array" in window; /* Must contain four arguments. */if(arguments.length!==4){return false;} /* Arguments must be numbers. */for(var i=0;i<4;++i){if(typeof arguments[i]!=="number"||isNaN(arguments[i])||!isFinite(arguments[i])){return false;}} /* X values must be in the [0, 1] range. */mX1=Math.min(mX1,1);mX2=Math.min(mX2,1);mX1=Math.max(mX1,0);mX2=Math.max(mX2,0);var mSampleValues=float32ArraySupported?new Float32Array(kSplineTableSize):new Array(kSplineTableSize);function A(aA1,aA2){return 1.0-3.0*aA2+3.0*aA1;}function B(aA1,aA2){return 3.0*aA2-6.0*aA1;}function C(aA1){return 3.0*aA1;}function calcBezier(aT,aA1,aA2){return ((A(aA1,aA2)*aT+B(aA1,aA2))*aT+C(aA1))*aT;}function getSlope(aT,aA1,aA2){return 3.0*A(aA1,aA2)*aT*aT+2.0*B(aA1,aA2)*aT+C(aA1);}function newtonRaphsonIterate(aX,aGuessT){for(var i=0;i<NEWTON_ITERATIONS;++i){var currentSlope=getSlope(aGuessT,mX1,mX2);if(currentSlope===0.0)return aGuessT;var currentX=calcBezier(aGuessT,mX1,mX2)-aX;aGuessT-=currentX/currentSlope;}return aGuessT;}function calcSampleValues(){for(var i=0;i<kSplineTableSize;++i){mSampleValues[i]=calcBezier(i*kSampleStepSize,mX1,mX2);}}function binarySubdivide(aX,aA,aB){var currentX,currentT,i=0;do {currentT=aA+(aB-aA)/2.0;currentX=calcBezier(currentT,mX1,mX2)-aX;if(currentX>0.0){aB=currentT;}else {aA=currentT;}}while(Math.abs(currentX)>SUBDIVISION_PRECISION&&++i<SUBDIVISION_MAX_ITERATIONS);return currentT;}function getTForX(aX){var intervalStart=0.0,currentSample=1,lastSample=kSplineTableSize-1;for(;currentSample!=lastSample&&mSampleValues[currentSample]<=aX;++currentSample){intervalStart+=kSampleStepSize;}--currentSample;var dist=(aX-mSampleValues[currentSample])/(mSampleValues[currentSample+1]-mSampleValues[currentSample]),guessForT=intervalStart+dist*kSampleStepSize,initialSlope=getSlope(guessForT,mX1,mX2);if(initialSlope>=NEWTON_MIN_SLOPE){return newtonRaphsonIterate(aX,guessForT);}else if(initialSlope==0.0){return guessForT;}else {return binarySubdivide(aX,intervalStart,intervalStart+kSampleStepSize);}}var _precomputed=false;function precompute(){_precomputed=true;if(mX1!=mY1||mX2!=mY2)calcSampleValues();}var f=function f(aX){if(!_precomputed)precompute();if(mX1===mY1&&mX2===mY2)return aX;if(aX===0)return 0;if(aX===1)return 1;return calcBezier(getTForX(aX),mY1,mY2);};f.getControlPoints=function(){return [{x:mX1,y:mY1},{x:mX2,y:mY2}];};var str="generateBezier("+[mX1,mY1,mX2,mY2]+")";f.toString=function(){return str;};return f;} /* Runge-Kutta spring physics function generator. Adapted from Framer.js, copyright Koen Bok. MIT License: http://en.wikipedia.org/wiki/MIT_License */ /* Given a tension, friction, and duration, a simulation at 60FPS will first run without a defined duration in order to calculate the full path. A second pass
           then adjusts the time delta -- using the relation between actual time and duration -- to calculate the path for the duration-constrained animation. */var generateSpringRK4=function(){function springAccelerationForState(state){return -state.tension*state.x-state.friction*state.v;}function springEvaluateStateWithDerivative(initialState,dt,derivative){var state={x:initialState.x+derivative.dx*dt,v:initialState.v+derivative.dv*dt,tension:initialState.tension,friction:initialState.friction};return {dx:state.v,dv:springAccelerationForState(state)};}function springIntegrateState(state,dt){var a={dx:state.v,dv:springAccelerationForState(state)},b=springEvaluateStateWithDerivative(state,dt*0.5,a),c=springEvaluateStateWithDerivative(state,dt*0.5,b),d=springEvaluateStateWithDerivative(state,dt,c),dxdt=1.0/6.0*(a.dx+2.0*(b.dx+c.dx)+d.dx),dvdt=1.0/6.0*(a.dv+2.0*(b.dv+c.dv)+d.dv);state.x=state.x+dxdt*dt;state.v=state.v+dvdt*dt;return state;}return function springRK4Factory(tension,friction,duration){var initState={x:-1,v:0,tension:null,friction:null},path=[0],time_lapsed=0,tolerance=1/10000,DT=16/1000,have_duration,dt,last_state;tension=parseFloat(tension)||500;friction=parseFloat(friction)||20;duration=duration||null;initState.tension=tension;initState.friction=friction;have_duration=duration!==null; /* Calculate the actual time it takes for this animation to complete with the provided conditions. */if(have_duration){ /* Run the simulation without a duration. */time_lapsed=springRK4Factory(tension,friction); /* Compute the adjusted time delta. */dt=time_lapsed/duration*DT;}else {dt=DT;}while(true){ /* Next/step function .*/last_state=springIntegrateState(last_state||initState,dt); /* Store the position. */path.push(1+last_state.x);time_lapsed+=16; /* If the change threshold is reached, break. */if(!(Math.abs(last_state.x)>tolerance&&Math.abs(last_state.v)>tolerance)){break;}} /* If duration is not defined, return the actual time required for completing this animation. Otherwise, return a closure that holds the
                   computed path and returns a snapshot of the position according to a given percentComplete. */return !have_duration?time_lapsed:function(percentComplete){return path[percentComplete*(path.length-1)|0];};};}(); /* jQuery easings. */Velocity.Easings={linear:function linear(p){return p;},swing:function swing(p){return 0.5-Math.cos(p*Math.PI)/2;}, /* Bonus "spring" easing, which is a less exaggerated version of easeInOutElastic. */spring:function spring(p){return 1-Math.cos(p*4.5*Math.PI)*Math.exp(-p*6);}}; /* CSS3 and Robert Penner easings. */$.each([["ease",[0.25,0.1,0.25,1.0]],["ease-in",[0.42,0.0,1.00,1.0]],["ease-out",[0.00,0.0,0.58,1.0]],["ease-in-out",[0.42,0.0,0.58,1.0]],["easeInSine",[0.47,0,0.745,0.715]],["easeOutSine",[0.39,0.575,0.565,1]],["easeInOutSine",[0.445,0.05,0.55,0.95]],["easeInQuad",[0.55,0.085,0.68,0.53]],["easeOutQuad",[0.25,0.46,0.45,0.94]],["easeInOutQuad",[0.455,0.03,0.515,0.955]],["easeInCubic",[0.55,0.055,0.675,0.19]],["easeOutCubic",[0.215,0.61,0.355,1]],["easeInOutCubic",[0.645,0.045,0.355,1]],["easeInQuart",[0.895,0.03,0.685,0.22]],["easeOutQuart",[0.165,0.84,0.44,1]],["easeInOutQuart",[0.77,0,0.175,1]],["easeInQuint",[0.755,0.05,0.855,0.06]],["easeOutQuint",[0.23,1,0.32,1]],["easeInOutQuint",[0.86,0,0.07,1]],["easeInExpo",[0.95,0.05,0.795,0.035]],["easeOutExpo",[0.19,1,0.22,1]],["easeInOutExpo",[1,0,0,1]],["easeInCirc",[0.6,0.04,0.98,0.335]],["easeOutCirc",[0.075,0.82,0.165,1]],["easeInOutCirc",[0.785,0.135,0.15,0.86]]],function(i,easingArray){Velocity.Easings[easingArray[0]]=generateBezier.apply(null,easingArray[1]);}); /* Determine the appropriate easing type given an easing input. */function getEasing(value,duration){var easing=value; /* The easing option can either be a string that references a pre-registered easing,
               or it can be a two-/four-item array of integers to be converted into a bezier/spring function. */if(Type.isString(value)){ /* Ensure that the easing has been assigned to jQuery's Velocity.Easings object. */if(!Velocity.Easings[value]){easing=false;}}else if(Type.isArray(value)&&value.length===1){easing=generateStep.apply(null,value);}else if(Type.isArray(value)&&value.length===2){ /* springRK4 must be passed the animation's duration. */ /* Note: If the springRK4 array contains non-numbers, generateSpringRK4() returns an easing
                   function generated with default tension and friction values. */easing=generateSpringRK4.apply(null,value.concat([duration]));}else if(Type.isArray(value)&&value.length===4){ /* Note: If the bezier array contains non-numbers, generateBezier() returns false. */easing=generateBezier.apply(null,value);}else {easing=false;} /* Revert to the Velocity-wide default easing type, or fall back to "swing" (which is also jQuery's default)
               if the Velocity-wide default has been incorrectly modified. */if(easing===false){if(Velocity.Easings[Velocity.defaults.easing]){easing=Velocity.defaults.easing;}else {easing=EASING_DEFAULT;}}return easing;} /*****************
            CSS Stack
        *****************/ /* The CSS object is a highly condensed and performant CSS stack that fully replaces jQuery's.
           It handles the validation, getting, and setting of both standard CSS properties and CSS property hooks. */ /* Note: A "CSS" shorthand is aliased so that our code is easier to read. */var CSS=Velocity.CSS={ /*************
                RegEx
            *************/RegEx:{isHex:/^#([A-f\d]{3}){1,2}$/i, /* Unwrap a property value's surrounding text, e.g. "rgba(4, 3, 2, 1)" ==> "4, 3, 2, 1" and "rect(4px 3px 2px 1px)" ==> "4px 3px 2px 1px". */valueUnwrap:/^[A-z]+\((.*)\)$/i,wrappedValueAlreadyExtracted:/[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/, /* Split a multi-value property into an array of subvalues, e.g. "rgba(4, 3, 2, 1) 4px 3px 2px 1px" ==> [ "rgba(4, 3, 2, 1)", "4px", "3px", "2px", "1px" ]. */valueSplit:/([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/ig}, /************
                Lists
            ************/Lists:{colors:["fill","stroke","stopColor","color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","outlineColor"],transformsBase:["translateX","translateY","scale","scaleX","scaleY","skewX","skewY","rotateZ"],transforms3D:["transformPerspective","translateZ","scaleZ","rotateX","rotateY"]}, /************
                Hooks
            ************/ /* Hooks allow a subproperty (e.g. "boxShadowBlur") of a compound-value CSS property
               (e.g. "boxShadow: X Y Blur Spread Color") to be animated as if it were a discrete property. */ /* Note: Beyond enabling fine-grained property animation, hooking is necessary since Velocity only
               tweens properties with single numeric values; unlike CSS transitions, Velocity does not interpolate compound-values. */Hooks:{ /********************
                    Registration
                ********************/ /* Templates are a concise way of indicating which subproperties must be individually registered for each compound-value CSS property. */ /* Each template consists of the compound-value's base name, its constituent subproperty names, and those subproperties' default values. */templates:{"textShadow":["Color X Y Blur","black 0px 0px 0px"],"boxShadow":["Color X Y Blur Spread","black 0px 0px 0px 0px"],"clip":["Top Right Bottom Left","0px 0px 0px 0px"],"backgroundPosition":["X Y","0% 0%"],"transformOrigin":["X Y Z","50% 50% 0px"],"perspectiveOrigin":["X Y","50% 50%"]}, /* A "registered" hook is one that has been converted from its template form into a live,
                   tweenable property. It contains data to associate it with its root property. */registered:{ /* Note: A registered hook looks like this ==> textShadowBlur: [ "textShadow", 3 ],
                       which consists of the subproperty's name, the associated root property's name,
                       and the subproperty's position in the root's value. */}, /* Convert the templates into individual hooks then append them to the registered object above. */register:function register(){ /* Color hooks registration: Colors are defaulted to white -- as opposed to black -- since colors that are
                       currently set to "transparent" default to their respective template below when color-animated,
                       and white is typically a closer match to transparent than black is. An exception is made for text ("color"),
                       which is almost always set closer to black than white. */for(var i=0;i<CSS.Lists.colors.length;i++){var rgbComponents=CSS.Lists.colors[i]==="color"?"0 0 0 1":"255 255 255 1";CSS.Hooks.templates[CSS.Lists.colors[i]]=["Red Green Blue Alpha",rgbComponents];}var rootProperty,hookTemplate,hookNames; /* In IE, color values inside compound-value properties are positioned at the end the value instead of at the beginning.
                       Thus, we re-arrange the templates accordingly. */if(IE){for(rootProperty in CSS.Hooks.templates){hookTemplate=CSS.Hooks.templates[rootProperty];hookNames=hookTemplate[0].split(" ");var defaultValues=hookTemplate[1].match(CSS.RegEx.valueSplit);if(hookNames[0]==="Color"){ /* Reposition both the hook's name and its default value to the end of their respective strings. */hookNames.push(hookNames.shift());defaultValues.push(defaultValues.shift()); /* Replace the existing template for the hook's root property. */CSS.Hooks.templates[rootProperty]=[hookNames.join(" "),defaultValues.join(" ")];}}} /* Hook registration. */for(rootProperty in CSS.Hooks.templates){hookTemplate=CSS.Hooks.templates[rootProperty];hookNames=hookTemplate[0].split(" ");for(var i in hookNames){var fullHookName=rootProperty+hookNames[i],hookPosition=i; /* For each hook, register its full name (e.g. textShadowBlur) with its root property (e.g. textShadow)
                               and the hook's position in its template's default value string. */CSS.Hooks.registered[fullHookName]=[rootProperty,hookPosition];}}}, /*****************************
                   Injection and Extraction
                *****************************/ /* Look up the root property associated with the hook (e.g. return "textShadow" for "textShadowBlur"). */ /* Since a hook cannot be set directly (the browser won't recognize it), style updating for hooks is routed through the hook's root property. */getRoot:function getRoot(property){var hookData=CSS.Hooks.registered[property];if(hookData){return hookData[0];}else { /* If there was no hook match, return the property name untouched. */return property;}}, /* Convert any rootPropertyValue, null or otherwise, into a space-delimited list of hook values so that
                   the targeted hook can be injected or extracted at its standard position. */cleanRootPropertyValue:function cleanRootPropertyValue(rootProperty,rootPropertyValue){ /* If the rootPropertyValue is wrapped with "rgb()", "clip()", etc., remove the wrapping to normalize the value before manipulation. */if(CSS.RegEx.valueUnwrap.test(rootPropertyValue)){rootPropertyValue=rootPropertyValue.match(CSS.RegEx.valueUnwrap)[1];} /* If rootPropertyValue is a CSS null-value (from which there's inherently no hook value to extract),
                       default to the root's default value as defined in CSS.Hooks.templates. */ /* Note: CSS null-values include "none", "auto", and "transparent". They must be converted into their
                       zero-values (e.g. textShadow: "none" ==> textShadow: "0px 0px 0px black") for hook manipulation to proceed. */if(CSS.Values.isCSSNullValue(rootPropertyValue)){rootPropertyValue=CSS.Hooks.templates[rootProperty][1];}return rootPropertyValue;}, /* Extracted the hook's value from its root property's value. This is used to get the starting value of an animating hook. */extractValue:function extractValue(fullHookName,rootPropertyValue){var hookData=CSS.Hooks.registered[fullHookName];if(hookData){var hookRoot=hookData[0],hookPosition=hookData[1];rootPropertyValue=CSS.Hooks.cleanRootPropertyValue(hookRoot,rootPropertyValue); /* Split rootPropertyValue into its constituent hook values then grab the desired hook at its standard position. */return rootPropertyValue.toString().match(CSS.RegEx.valueSplit)[hookPosition];}else { /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */return rootPropertyValue;}}, /* Inject the hook's value into its root property's value. This is used to piece back together the root property
                   once Velocity has updated one of its individually hooked values through tweening. */injectValue:function injectValue(fullHookName,hookValue,rootPropertyValue){var hookData=CSS.Hooks.registered[fullHookName];if(hookData){var hookRoot=hookData[0],hookPosition=hookData[1],rootPropertyValueParts,rootPropertyValueUpdated;rootPropertyValue=CSS.Hooks.cleanRootPropertyValue(hookRoot,rootPropertyValue); /* Split rootPropertyValue into its individual hook values, replace the targeted value with hookValue,
                           then reconstruct the rootPropertyValue string. */rootPropertyValueParts=rootPropertyValue.toString().match(CSS.RegEx.valueSplit);rootPropertyValueParts[hookPosition]=hookValue;rootPropertyValueUpdated=rootPropertyValueParts.join(" ");return rootPropertyValueUpdated;}else { /* If the provided fullHookName isn't a registered hook, return the rootPropertyValue that was passed in. */return rootPropertyValue;}}}, /*******************
               Normalizations
            *******************/ /* Normalizations standardize CSS property manipulation by pollyfilling browser-specific implementations (e.g. opacity)
               and reformatting special properties (e.g. clip, rgba) to look like standard ones. */Normalizations:{ /* Normalizations are passed a normalization target (either the property's name, its extracted value, or its injected value),
                   the targeted element (which may need to be queried), and the targeted property value. */registered:{clip:function clip(type,element,propertyValue){switch(type){case "name":return "clip"; /* Clip needs to be unwrapped and stripped of its commas during extraction. */case "extract":var extracted; /* If Velocity also extracted this value, skip extraction. */if(CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)){extracted=propertyValue;}else { /* Remove the "rect()" wrapper. */extracted=propertyValue.toString().match(CSS.RegEx.valueUnwrap); /* Strip off commas. */extracted=extracted?extracted[1].replace(/,(\s+)?/g," "):propertyValue;}return extracted; /* Clip needs to be re-wrapped during injection. */case "inject":return "rect("+propertyValue+")";}},blur:function blur(type,element,propertyValue){switch(type){case "name":return Velocity.State.isFirefox?"filter":"-webkit-filter";case "extract":var extracted=parseFloat(propertyValue); /* If extracted is NaN, meaning the value isn't already extracted. */if(!(extracted||extracted===0)){var blurComponent=propertyValue.toString().match(/blur\(([0-9]+[A-z]+)\)/i); /* If the filter string had a blur component, return just the blur value and unit type. */if(blurComponent){extracted=blurComponent[1]; /* If the component doesn't exist, default blur to 0. */}else {extracted=0;}}return extracted; /* Blur needs to be re-wrapped during injection. */case "inject": /* For the blur effect to be fully de-applied, it needs to be set to "none" instead of 0. */if(!parseFloat(propertyValue)){return "none";}else {return "blur("+propertyValue+")";}}}, /* <=IE8 do not support the standard opacity property. They use filter:alpha(opacity=INT) instead. */opacity:function opacity(type,element,propertyValue){if(IE<=8){switch(type){case "name":return "filter";case "extract": /* <=IE8 return a "filter" value of "alpha(opacity=\d{1,3})".
                                       Extract the value and convert it to a decimal value to match the standard CSS opacity property's formatting. */var extracted=propertyValue.toString().match(/alpha\(opacity=(.*)\)/i);if(extracted){ /* Convert to decimal value. */propertyValue=extracted[1]/100;}else { /* When extracting opacity, default to 1 since a null value means opacity hasn't been set. */propertyValue=1;}return propertyValue;case "inject": /* Opacified elements are required to have their zoom property set to a non-zero value. */element.style.zoom=1; /* Setting the filter property on elements with certain font property combinations can result in a
                                       highly unappealing ultra-bolding effect. There's no way to remedy this throughout a tween, but dropping the
                                       value altogether (when opacity hits 1) at leasts ensures that the glitch is gone post-tweening. */if(parseFloat(propertyValue)>=1){return "";}else { /* As per the filter property's spec, convert the decimal value to a whole number and wrap the value. */return "alpha(opacity="+parseInt(parseFloat(propertyValue)*100,10)+")";}} /* With all other browsers, normalization is not required; return the same values that were passed in. */}else {switch(type){case "name":return "opacity";case "extract":return propertyValue;case "inject":return propertyValue;}}}}, /*****************************
                    Batched Registrations
                *****************************/ /* Note: Batched normalizations extend the CSS.Normalizations.registered object. */register:function register(){ /*****************
                        Transforms
                    *****************/ /* Transforms are the subproperties contained by the CSS "transform" property. Transforms must undergo normalization
                       so that they can be referenced in a properties map by their individual names. */ /* Note: When transforms are "set", they are actually assigned to a per-element transformCache. When all transform
                       setting is complete complete, CSS.flushTransformCache() must be manually called to flush the values to the DOM.
                       Transform setting is batched in this way to improve performance: the transform style only needs to be updated
                       once when multiple transform subproperties are being animated simultaneously. */ /* Note: IE9 and Android Gingerbread have support for 2D -- but not 3D -- transforms. Since animating unsupported
                       transform properties results in the browser ignoring the *entire* transform string, we prevent these 3D values
                       from being normalized for these browsers so that tweening skips these properties altogether
                       (since it will ignore them as being unsupported by the browser.) */if(!(IE<=9)&&!Velocity.State.isGingerbread){ /* Note: Since the standalone CSS "perspective" property and the CSS transform "perspective" subproperty
                        share the same name, the latter is given a unique token within Velocity: "transformPerspective". */CSS.Lists.transformsBase=CSS.Lists.transformsBase.concat(CSS.Lists.transforms3D);}for(var i=0;i<CSS.Lists.transformsBase.length;i++){ /* Wrap the dynamically generated normalization function in a new scope so that transformName's value is
                        paired with its respective function. (Otherwise, all functions would take the final for loop's transformName.) */(function(){var transformName=CSS.Lists.transformsBase[i];CSS.Normalizations.registered[transformName]=function(type,element,propertyValue){switch(type){ /* The normalized property name is the parent "transform" property -- the property that is actually set in CSS. */case "name":return "transform"; /* Transform values are cached onto a per-element transformCache object. */case "extract": /* If this transform has yet to be assigned a value, return its null value. */if(Data(element)===undefined||Data(element).transformCache[transformName]===undefined){ /* Scale CSS.Lists.transformsBase default to 1 whereas all other transform properties default to 0. */return (/^scale/i.test(transformName)?1:0); /* When transform values are set, they are wrapped in parentheses as per the CSS spec.
                                           Thus, when extracting their values (for tween calculations), we strip off the parentheses. */}else {return Data(element).transformCache[transformName].replace(/[()]/g,"");}case "inject":var invalid=false; /* If an individual transform property contains an unsupported unit type, the browser ignores the *entire* transform property.
                                           Thus, protect users from themselves by skipping setting for transform values supplied with invalid unit types. */ /* Switch on the base transform type; ignore the axis by removing the last letter from the transform's name. */switch(transformName.substr(0,transformName.length-1)){ /* Whitelist unit types for each transform. */case "translate":invalid=!/(%|px|em|rem|vw|vh|\d)$/i.test(propertyValue);break; /* Since an axis-free "scale" property is supported as well, a little hack is used here to detect it by chopping off its last letter. */case "scal":case "scale": /* Chrome on Android has a bug in which scaled elements blur if their initial scale
                                                   value is below 1 (which can happen with forcefeeding). Thus, we detect a yet-unset scale property
                                                   and ensure that its first value is always 1. More info: http://stackoverflow.com/questions/10417890/css3-animations-with-transform-causes-blurred-elements-on-webkit/10417962#10417962 */if(Velocity.State.isAndroid&&Data(element).transformCache[transformName]===undefined&&propertyValue<1){propertyValue=1;}invalid=!/(\d)$/i.test(propertyValue);break;case "skew":invalid=!/(deg|\d)$/i.test(propertyValue);break;case "rotate":invalid=!/(deg|\d)$/i.test(propertyValue);break;}if(!invalid){ /* As per the CSS spec, wrap the value in parentheses. */Data(element).transformCache[transformName]="("+propertyValue+")";} /* Although the value is set on the transformCache object, return the newly-updated value for the calling code to process as normal. */return Data(element).transformCache[transformName];}};})();} /*************
                        Colors
                    *************/ /* Since Velocity only animates a single numeric value per property, color animation is achieved by hooking the individual RGBA components of CSS color properties.
                       Accordingly, color values must be normalized (e.g. "#ff0000", "red", and "rgb(255, 0, 0)" ==> "255 0 0 1") so that their components can be injected/extracted by CSS.Hooks logic. */for(var i=0;i<CSS.Lists.colors.length;i++){ /* Wrap the dynamically generated normalization function in a new scope so that colorName's value is paired with its respective function.
                           (Otherwise, all functions would take the final for loop's colorName.) */(function(){var colorName=CSS.Lists.colors[i]; /* Note: In IE<=8, which support rgb but not rgba, color properties are reverted to rgb by stripping off the alpha component. */CSS.Normalizations.registered[colorName]=function(type,element,propertyValue){switch(type){case "name":return colorName; /* Convert all color values into the rgb format. (Old IE can return hex values and color names instead of rgb/rgba.) */case "extract":var extracted; /* If the color is already in its hookable form (e.g. "255 255 255 1") due to having been previously extracted, skip extraction. */if(CSS.RegEx.wrappedValueAlreadyExtracted.test(propertyValue)){extracted=propertyValue;}else {var converted,colorNames={black:"rgb(0, 0, 0)",blue:"rgb(0, 0, 255)",gray:"rgb(128, 128, 128)",green:"rgb(0, 128, 0)",red:"rgb(255, 0, 0)",white:"rgb(255, 255, 255)"}; /* Convert color names to rgb. */if(/^[A-z]+$/i.test(propertyValue)){if(colorNames[propertyValue]!==undefined){converted=colorNames[propertyValue];}else { /* If an unmatched color name is provided, default to black. */converted=colorNames.black;} /* Convert hex values to rgb. */}else if(CSS.RegEx.isHex.test(propertyValue)){converted="rgb("+CSS.Values.hexToRgb(propertyValue).join(" ")+")"; /* If the provided color doesn't match any of the accepted color formats, default to black. */}else if(!/^rgba?\(/i.test(propertyValue)){converted=colorNames.black;} /* Remove the surrounding "rgb/rgba()" string then replace commas with spaces and strip
                                               repeated spaces (in case the value included spaces to begin with). */extracted=(converted||propertyValue).toString().match(CSS.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g," ");} /* So long as this isn't <=IE8, add a fourth (alpha) component if it's missing and default it to 1 (visible). */if(!(IE<=8)&&extracted.split(" ").length===3){extracted+=" 1";}return extracted;case "inject": /* If this is IE<=8 and an alpha component exists, strip it off. */if(IE<=8){if(propertyValue.split(" ").length===4){propertyValue=propertyValue.split(/\s+/).slice(0,3).join(" ");} /* Otherwise, add a fourth (alpha) component if it's missing and default it to 1 (visible). */}else if(propertyValue.split(" ").length===3){propertyValue+=" 1";} /* Re-insert the browser-appropriate wrapper("rgb/rgba()"), insert commas, and strip off decimal units
                                           on all values but the fourth (R, G, and B only accept whole numbers). */return (IE<=8?"rgb":"rgba")+"("+propertyValue.replace(/\s+/g,",").replace(/\.(\d)+(?=,)/g,"")+")";}};})();}}}, /************************
               CSS Property Names
            ************************/Names:{ /* Camelcase a property name into its JavaScript notation (e.g. "background-color" ==> "backgroundColor").
                   Camelcasing is used to normalize property names between and across calls. */camelCase:function camelCase(property){return property.replace(/-(\w)/g,function(match,subMatch){return subMatch.toUpperCase();});}, /* For SVG elements, some properties (namely, dimensional ones) are GET/SET via the element's HTML attributes (instead of via CSS styles). */SVGAttribute:function SVGAttribute(property){var SVGAttributes="width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2"; /* Certain browsers require an SVG transform to be applied as an attribute. (Otherwise, application via CSS is preferable due to 3D support.) */if(IE||Velocity.State.isAndroid&&!Velocity.State.isChrome){SVGAttributes+="|transform";}return new RegExp("^("+SVGAttributes+")$","i").test(property);}, /* Determine whether a property should be set with a vendor prefix. */ /* If a prefixed version of the property exists, return it. Otherwise, return the original property name.
                   If the property is not at all supported by the browser, return a false flag. */prefixCheck:function prefixCheck(property){ /* If this property has already been checked, return the cached value. */if(Velocity.State.prefixMatches[property]){return [Velocity.State.prefixMatches[property],true];}else {var vendors=["","Webkit","Moz","ms","O"];for(var i=0,vendorsLength=vendors.length;i<vendorsLength;i++){var propertyPrefixed;if(i===0){propertyPrefixed=property;}else { /* Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter). */propertyPrefixed=vendors[i]+property.replace(/^\w/,function(match){return match.toUpperCase();});} /* Check if the browser supports this property as prefixed. */if(Type.isString(Velocity.State.prefixElement.style[propertyPrefixed])){ /* Cache the match. */Velocity.State.prefixMatches[property]=propertyPrefixed;return [propertyPrefixed,true];}} /* If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed. */return [property,false];}}}, /************************
               CSS Property Values
            ************************/Values:{ /* Hex to RGB conversion. Copyright Tim Down: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */hexToRgb:function hexToRgb(hex){var shortformRegex=/^#?([a-f\d])([a-f\d])([a-f\d])$/i,longformRegex=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,rgbParts;hex=hex.replace(shortformRegex,function(m,r,g,b){return r+r+g+g+b+b;});rgbParts=longformRegex.exec(hex);return rgbParts?[parseInt(rgbParts[1],16),parseInt(rgbParts[2],16),parseInt(rgbParts[3],16)]:[0,0,0];},isCSSNullValue:function isCSSNullValue(value){ /* The browser defaults CSS values that have not been set to either 0 or one of several possible null-value strings.
                       Thus, we check for both falsiness and these special strings. */ /* Null-value checking is performed to default the special strings to 0 (for the sake of tweening) or their hook
                       templates as defined as CSS.Hooks (for the sake of hook injection/extraction). */ /* Note: Chrome returns "rgba(0, 0, 0, 0)" for an undefined color whereas IE returns "transparent". */return value==0||/^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(value);}, /* Retrieve a property's default unit type. Used for assigning a unit type when one is not supplied by the user. */getUnitType:function getUnitType(property){if(/^(rotate|skew)/i.test(property)){return "deg";}else if(/(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(property)){ /* The above properties are unitless. */return "";}else { /* Default to px for all other properties. */return "px";}}, /* HTML elements default to an associated display type when they're not set to display:none. */ /* Note: This function is used for correctly setting the non-"none" display value in certain Velocity redirects, such as fadeIn/Out. */getDisplayType:function getDisplayType(element){var tagName=element&&element.tagName.toString().toLowerCase();if(/^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(tagName)){return "inline";}else if(/^(li)$/i.test(tagName)){return "list-item";}else if(/^(tr)$/i.test(tagName)){return "table-row";}else if(/^(table)$/i.test(tagName)){return "table";}else if(/^(tbody)$/i.test(tagName)){return "table-row-group"; /* Default to "block" when no match is found. */}else {return "block";}}, /* The class add/remove functions are used to temporarily apply a "velocity-animating" class to elements while they're animating. */addClass:function addClass(element,className){if(element.classList){element.classList.add(className);}else {element.className+=(element.className.length?" ":"")+className;}},removeClass:function removeClass(element,className){if(element.classList){element.classList.remove(className);}else {element.className=element.className.toString().replace(new RegExp("(^|\\s)"+className.split(" ").join("|")+"(\\s|$)","gi")," ");}}}, /****************************
               Style Getting & Setting
            ****************************/ /* The singular getPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */getPropertyValue:function getPropertyValue(element,property,rootPropertyValue,forceStyleLookup){ /* Get an element's computed property value. */ /* Note: Retrieving the value of a CSS property cannot simply be performed by checking an element's
                   style attribute (which only reflects user-defined values). Instead, the browser must be queried for a property's
                   *computed* value. You can read more about getComputedStyle here: https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle */function computePropertyValue(element,property){ /* When box-sizing isn't set to border-box, height and width style values are incorrectly computed when an
                       element's scrollbars are visible (which expands the element's dimensions). Thus, we defer to the more accurate
                       offsetHeight/Width property, which includes the total dimensions for interior, border, padding, and scrollbar.
                       We subtract border and padding to get the sum of interior + scrollbar. */var computedValue=0; /* IE<=8 doesn't support window.getComputedStyle, thus we defer to jQuery, which has an extensive array
                       of hacks to accurately retrieve IE8 property values. Re-implementing that logic here is not worth bloating the
                       codebase for a dying browser. The performance repercussions of using jQuery here are minimal since
                       Velocity is optimized to rarely (and sometimes never) query the DOM. Further, the $.css() codepath isn't that slow. */if(IE<=8){computedValue=$.css(element,property); /* GET */ /* All other browsers support getComputedStyle. The returned live object reference is cached onto its
                       associated element so that it does not need to be refetched upon every GET. */}else {var revertDisplay=function revertDisplay(){if(toggleDisplay){CSS.setPropertyValue(element,"display","none");}}; /* Browsers do not return height and width values for elements that are set to display:"none". Thus, we temporarily
                           toggle display to the element type's default value. */var toggleDisplay=false;if(/^(width|height)$/.test(property)&&CSS.getPropertyValue(element,"display")===0){toggleDisplay=true;CSS.setPropertyValue(element,"display",CSS.Values.getDisplayType(element));}if(!forceStyleLookup){if(property==="height"&&CSS.getPropertyValue(element,"boxSizing").toString().toLowerCase()!=="border-box"){var contentBoxHeight=element.offsetHeight-(parseFloat(CSS.getPropertyValue(element,"borderTopWidth"))||0)-(parseFloat(CSS.getPropertyValue(element,"borderBottomWidth"))||0)-(parseFloat(CSS.getPropertyValue(element,"paddingTop"))||0)-(parseFloat(CSS.getPropertyValue(element,"paddingBottom"))||0);revertDisplay();return contentBoxHeight;}else if(property==="width"&&CSS.getPropertyValue(element,"boxSizing").toString().toLowerCase()!=="border-box"){var contentBoxWidth=element.offsetWidth-(parseFloat(CSS.getPropertyValue(element,"borderLeftWidth"))||0)-(parseFloat(CSS.getPropertyValue(element,"borderRightWidth"))||0)-(parseFloat(CSS.getPropertyValue(element,"paddingLeft"))||0)-(parseFloat(CSS.getPropertyValue(element,"paddingRight"))||0);revertDisplay();return contentBoxWidth;}}var computedStyle; /* For elements that Velocity hasn't been called on directly (e.g. when Velocity queries the DOM on behalf
                           of a parent of an element its animating), perform a direct getComputedStyle lookup since the object isn't cached. */if(Data(element)===undefined){computedStyle=window.getComputedStyle(element,null); /* GET */ /* If the computedStyle object has yet to be cached, do so now. */}else if(!Data(element).computedStyle){computedStyle=Data(element).computedStyle=window.getComputedStyle(element,null); /* GET */ /* If computedStyle is cached, use it. */}else {computedStyle=Data(element).computedStyle;} /* IE and Firefox do not return a value for the generic borderColor -- they only return individual values for each border side's color.
                           Also, in all browsers, when border colors aren't all the same, a compound value is returned that Velocity isn't setup to parse.
                           So, as a polyfill for querying individual border side colors, we just return the top border's color and animate all borders from that value. */if(property==="borderColor"){property="borderTopColor";} /* IE9 has a bug in which the "filter" property must be accessed from computedStyle using the getPropertyValue method
                           instead of a direct property lookup. The getPropertyValue method is slower than a direct lookup, which is why we avoid it by default. */if(IE===9&&property==="filter"){computedValue=computedStyle.getPropertyValue(property); /* GET */}else {computedValue=computedStyle[property];} /* Fall back to the property's style value (if defined) when computedValue returns nothing,
                           which can happen when the element hasn't been painted. */if(computedValue===""||computedValue===null){computedValue=element.style[property];}revertDisplay();} /* For top, right, bottom, and left (TRBL) values that are set to "auto" on elements of "fixed" or "absolute" position,
                       defer to jQuery for converting "auto" to a numeric value. (For elements with a "static" or "relative" position, "auto" has the same
                       effect as being set to 0, so no conversion is necessary.) */ /* An example of why numeric conversion is necessary: When an element with "position:absolute" has an untouched "left"
                       property, which reverts to "auto", left's value is 0 relative to its parent element, but is often non-zero relative
                       to its *containing* (not parent) element, which is the nearest "position:relative" ancestor or the viewport (and always the viewport in the case of "position:fixed"). */if(computedValue==="auto"&&/^(top|right|bottom|left)$/i.test(property)){var position=computePropertyValue(element,"position"); /* GET */ /* For absolute positioning, jQuery's $.position() only returns values for top and left;
                           right and bottom will have their "auto" value reverted to 0. */ /* Note: A jQuery object must be created here since jQuery doesn't have a low-level alias for $.position().
                           Not a big deal since we're currently in a GET batch anyway. */if(position==="fixed"||position==="absolute"&&/top|left/i.test(property)){ /* Note: jQuery strips the pixel unit from its returned values; we re-add it here to conform with computePropertyValue's behavior. */computedValue=$(element).position()[property]+"px"; /* GET */}}return computedValue;}var propertyValue; /* If this is a hooked property (e.g. "clipLeft" instead of the root property of "clip"),
                   extract the hook's value from a normalized rootPropertyValue using CSS.Hooks.extractValue(). */if(CSS.Hooks.registered[property]){var hook=property,hookRoot=CSS.Hooks.getRoot(hook); /* If a cached rootPropertyValue wasn't passed in (which Velocity always attempts to do in order to avoid requerying the DOM),
                       query the DOM for the root property's value. */if(rootPropertyValue===undefined){ /* Since the browser is now being directly queried, use the official post-prefixing property name for this lookup. */rootPropertyValue=CSS.getPropertyValue(element,CSS.Names.prefixCheck(hookRoot)[0]); /* GET */} /* If this root has a normalization registered, peform the associated normalization extraction. */if(CSS.Normalizations.registered[hookRoot]){rootPropertyValue=CSS.Normalizations.registered[hookRoot]("extract",element,rootPropertyValue);} /* Extract the hook's value. */propertyValue=CSS.Hooks.extractValue(hook,rootPropertyValue); /* If this is a normalized property (e.g. "opacity" becomes "filter" in <=IE8) or "translateX" becomes "transform"),
                   normalize the property's name and value, and handle the special case of transforms. */ /* Note: Normalizing a property is mutually exclusive from hooking a property since hook-extracted values are strictly
                   numerical and therefore do not require normalization extraction. */}else if(CSS.Normalizations.registered[property]){var normalizedPropertyName,normalizedPropertyValue;normalizedPropertyName=CSS.Normalizations.registered[property]("name",element); /* Transform values are calculated via normalization extraction (see below), which checks against the element's transformCache.
                       At no point do transform GETs ever actually query the DOM; initial stylesheet values are never processed.
                       This is because parsing 3D transform matrices is not always accurate and would bloat our codebase;
                       thus, normalization extraction defaults initial transform values to their zero-values (e.g. 1 for scaleX and 0 for translateX). */if(normalizedPropertyName!=="transform"){normalizedPropertyValue=computePropertyValue(element,CSS.Names.prefixCheck(normalizedPropertyName)[0]); /* GET */ /* If the value is a CSS null-value and this property has a hook template, use that zero-value template so that hooks can be extracted from it. */if(CSS.Values.isCSSNullValue(normalizedPropertyValue)&&CSS.Hooks.templates[property]){normalizedPropertyValue=CSS.Hooks.templates[property][1];}}propertyValue=CSS.Normalizations.registered[property]("extract",element,normalizedPropertyValue);} /* If a (numeric) value wasn't produced via hook extraction or normalization, query the DOM. */if(!/^[\d-]/.test(propertyValue)){ /* For SVG elements, dimensional properties (which SVGAttribute() detects) are tweened via
                       their HTML attribute values instead of their CSS style values. */if(Data(element)&&Data(element).isSVG&&CSS.Names.SVGAttribute(property)){ /* Since the height/width attribute values must be set manually, they don't reflect computed values.
                           Thus, we use use getBBox() to ensure we always get values for elements with undefined height/width attributes. */if(/^(height|width)$/i.test(property)){ /* Firefox throws an error if .getBBox() is called on an SVG that isn't attached to the DOM. */try{propertyValue=element.getBBox()[property];}catch(error){propertyValue=0;} /* Otherwise, access the attribute value directly. */}else {propertyValue=element.getAttribute(property);}}else {propertyValue=computePropertyValue(element,CSS.Names.prefixCheck(property)[0]); /* GET */}} /* Since property lookups are for animation purposes (which entails computing the numeric delta between start and end values),
                   convert CSS null-values to an integer of value 0. */if(CSS.Values.isCSSNullValue(propertyValue)){propertyValue=0;}if(Velocity.debug>=2)console.log("Get "+property+": "+propertyValue);return propertyValue;}, /* The singular setPropertyValue, which routes the logic for all normalizations, hooks, and standard CSS properties. */setPropertyValue:function setPropertyValue(element,property,propertyValue,rootPropertyValue,scrollData){var propertyName=property; /* In order to be subjected to call options and element queueing, scroll animation is routed through Velocity as if it were a standard CSS property. */if(property==="scroll"){ /* If a container option is present, scroll the container instead of the browser window. */if(scrollData.container){scrollData.container["scroll"+scrollData.direction]=propertyValue; /* Otherwise, Velocity defaults to scrolling the browser window. */}else {if(scrollData.direction==="Left"){window.scrollTo(propertyValue,scrollData.alternateValue);}else {window.scrollTo(scrollData.alternateValue,propertyValue);}}}else { /* Transforms (translateX, rotateZ, etc.) are applied to a per-element transformCache object, which is manually flushed via flushTransformCache().
                       Thus, for now, we merely cache transforms being SET. */if(CSS.Normalizations.registered[property]&&CSS.Normalizations.registered[property]("name",element)==="transform"){ /* Perform a normalization injection. */ /* Note: The normalization logic handles the transformCache updating. */CSS.Normalizations.registered[property]("inject",element,propertyValue);propertyName="transform";propertyValue=Data(element).transformCache[property];}else { /* Inject hooks. */if(CSS.Hooks.registered[property]){var hookName=property,hookRoot=CSS.Hooks.getRoot(property); /* If a cached rootPropertyValue was not provided, query the DOM for the hookRoot's current value. */rootPropertyValue=rootPropertyValue||CSS.getPropertyValue(element,hookRoot); /* GET */propertyValue=CSS.Hooks.injectValue(hookName,propertyValue,rootPropertyValue);property=hookRoot;} /* Normalize names and values. */if(CSS.Normalizations.registered[property]){propertyValue=CSS.Normalizations.registered[property]("inject",element,propertyValue);property=CSS.Normalizations.registered[property]("name",element);} /* Assign the appropriate vendor prefix before performing an official style update. */propertyName=CSS.Names.prefixCheck(property)[0]; /* A try/catch is used for IE<=8, which throws an error when "invalid" CSS values are set, e.g. a negative width.
                           Try/catch is avoided for other browsers since it incurs a performance overhead. */if(IE<=8){try{element.style[propertyName]=propertyValue;}catch(error){if(Velocity.debug)console.log("Browser does not support ["+propertyValue+"] for ["+propertyName+"]");} /* SVG elements have their dimensional properties (width, height, x, y, cx, etc.) applied directly as attributes instead of as styles. */ /* Note: IE8 does not support SVG elements, so it's okay that we skip it for SVG animation. */}else if(Data(element)&&Data(element).isSVG&&CSS.Names.SVGAttribute(property)){ /* Note: For SVG attributes, vendor-prefixed property names are never used. */ /* Note: Not all CSS properties can be animated via attributes, but the browser won't throw an error for unsupported properties. */element.setAttribute(property,propertyValue);}else {element.style[propertyName]=propertyValue;}if(Velocity.debug>=2)console.log("Set "+property+" ("+propertyName+"): "+propertyValue);}} /* Return the normalized property name and value in case the caller wants to know how these values were modified before being applied to the DOM. */return [propertyName,propertyValue];}, /* To increase performance by batching transform updates into a single SET, transforms are not directly applied to an element until flushTransformCache() is called. */ /* Note: Velocity applies transform properties in the same order that they are chronogically introduced to the element's CSS styles. */flushTransformCache:function flushTransformCache(element){var transformString=""; /* Certain browsers require that SVG transforms be applied as an attribute. However, the SVG transform attribute takes a modified version of CSS's transform string
                   (units are dropped and, except for skewX/Y, subproperties are merged into their master property -- e.g. scaleX and scaleY are merged into scale(X Y). */if((IE||Velocity.State.isAndroid&&!Velocity.State.isChrome)&&Data(element).isSVG){ /* Since transform values are stored in their parentheses-wrapped form, we use a helper function to strip out their numeric values.
                       Further, SVG transform properties only take unitless (representing pixels) values, so it's okay that parseFloat() strips the unit suffixed to the float value. */var getTransformFloat=function getTransformFloat(transformProperty){return parseFloat(CSS.getPropertyValue(element,transformProperty));}; /* Create an object to organize all the transforms that we'll apply to the SVG element. To keep the logic simple,
                       we process *all* transform properties -- even those that may not be explicitly applied (since they default to their zero-values anyway). */var SVGTransforms={translate:[getTransformFloat("translateX"),getTransformFloat("translateY")],skewX:[getTransformFloat("skewX")],skewY:[getTransformFloat("skewY")], /* If the scale property is set (non-1), use that value for the scaleX and scaleY values
                           (this behavior mimics the result of animating all these properties at once on HTML elements). */scale:getTransformFloat("scale")!==1?[getTransformFloat("scale"),getTransformFloat("scale")]:[getTransformFloat("scaleX"),getTransformFloat("scaleY")], /* Note: SVG's rotate transform takes three values: rotation degrees followed by the X and Y values
                           defining the rotation's origin point. We ignore the origin values (default them to 0). */rotate:[getTransformFloat("rotateZ"),0,0]}; /* Iterate through the transform properties in the user-defined property map order.
                       (This mimics the behavior of non-SVG transform animation.) */$.each(Data(element).transformCache,function(transformName){ /* Except for with skewX/Y, revert the axis-specific transform subproperties to their axis-free master
                           properties so that they match up with SVG's accepted transform properties. */if(/^translate/i.test(transformName)){transformName="translate";}else if(/^scale/i.test(transformName)){transformName="scale";}else if(/^rotate/i.test(transformName)){transformName="rotate";} /* Check that we haven't yet deleted the property from the SVGTransforms container. */if(SVGTransforms[transformName]){ /* Append the transform property in the SVG-supported transform format. As per the spec, surround the space-delimited values in parentheses. */transformString+=transformName+"("+SVGTransforms[transformName].join(" ")+")"+" "; /* After processing an SVG transform property, delete it from the SVGTransforms container so we don't
                               re-insert the same master property if we encounter another one of its axis-specific properties. */delete SVGTransforms[transformName];}});}else {var transformValue,perspective; /* Transform properties are stored as members of the transformCache object. Concatenate all the members into a string. */$.each(Data(element).transformCache,function(transformName){transformValue=Data(element).transformCache[transformName]; /* Transform's perspective subproperty must be set first in order to take effect. Store it temporarily. */if(transformName==="transformPerspective"){perspective=transformValue;return true;} /* IE9 only supports one rotation type, rotateZ, which it refers to as "rotate". */if(IE===9&&transformName==="rotateZ"){transformName="rotate";}transformString+=transformName+transformValue+" ";}); /* If present, set the perspective subproperty first. */if(perspective){transformString="perspective"+perspective+" "+transformString;}}CSS.setPropertyValue(element,"transform",transformString);}}; /* Register hooks and normalizations. */CSS.Hooks.register();CSS.Normalizations.register(); /* Allow hook setting in the same fashion as jQuery's $.css(). */Velocity.hook=function(elements,arg2,arg3){var value=undefined;elements=sanitizeElements(elements);$.each(elements,function(i,element){ /* Initialize Velocity's per-element data cache if this element hasn't previously been animated. */if(Data(element)===undefined){Velocity.init(element);} /* Get property value. If an element set was passed in, only return the value for the first element. */if(arg3===undefined){if(value===undefined){value=Velocity.CSS.getPropertyValue(element,arg2);} /* Set property value. */}else { /* sPV returns an array of the normalized propertyName/propertyValue pair used to update the DOM. */var adjustedSet=Velocity.CSS.setPropertyValue(element,arg2,arg3); /* Transform properties don't automatically set. They have to be flushed to the DOM. */if(adjustedSet[0]==="transform"){Velocity.CSS.flushTransformCache(element);}value=adjustedSet;}});return value;}; /*****************
            Animation
        *****************/var animate=function animate(){ /******************
                Call Chain
            ******************/ /* Logic for determining what to return to the call stack when exiting out of Velocity. */function getChain(){ /* If we are using the utility function, attempt to return this call's promise. If no promise library was detected,
                   default to null instead of returning the targeted elements so that utility function's return value is standardized. */if(isUtility){return promiseData.promise||null; /* Otherwise, if we're using $.fn, return the jQuery-/Zepto-wrapped element set. */}else {return elementsWrapped;}} /*************************
               Arguments Assignment
            *************************/ /* To allow for expressive CoffeeScript code, Velocity supports an alternative syntax in which "elements" (or "e"), "properties" (or "p"), and "options" (or "o")
               objects are defined on a container object that's passed in as Velocity's sole argument. */ /* Note: Some browsers automatically populate arguments with a "properties" object. We detect it by checking for its default "names" property. */var syntacticSugar=arguments[0]&&(arguments[0].p||$.isPlainObject(arguments[0].properties)&&!arguments[0].properties.names||Type.isString(arguments[0].properties)), /* Whether Velocity was called via the utility function (as opposed to on a jQuery/Zepto object). */isUtility, /* When Velocity is called via the utility function ($.Velocity()/Velocity()), elements are explicitly
                   passed in as the first parameter. Thus, argument positioning varies. We normalize them here. */elementsWrapped,argumentIndex;var elements,propertiesMap,options; /* Detect jQuery/Zepto elements being animated via the $.fn method. */if(Type.isWrapped(this)){isUtility=false;argumentIndex=0;elements=this;elementsWrapped=this; /* Otherwise, raw elements are being animated via the utility function. */}else {isUtility=true;argumentIndex=1;elements=syntacticSugar?arguments[0].elements||arguments[0].e:arguments[0];}elements=sanitizeElements(elements);if(!elements){return;}if(syntacticSugar){propertiesMap=arguments[0].properties||arguments[0].p;options=arguments[0].options||arguments[0].o;}else {propertiesMap=arguments[argumentIndex];options=arguments[argumentIndex+1];} /* The length of the element set (in the form of a nodeList or an array of elements) is defaulted to 1 in case a
               single raw DOM element is passed in (which doesn't contain a length property). */var elementsLength=elements.length,elementsIndex=0; /***************************
                Argument Overloading
            ***************************/ /* Support is included for jQuery's argument overloading: $.animate(propertyMap [, duration] [, easing] [, complete]).
               Overloading is detected by checking for the absence of an object being passed into options. */ /* Note: The stop and finish actions do not accept animation options, and are therefore excluded from this check. */if(!/^(stop|finish|finishAll)$/i.test(propertiesMap)&&!$.isPlainObject(options)){ /* The utility function shifts all arguments one position to the right, so we adjust for that offset. */var startingArgumentPosition=argumentIndex+1;options={}; /* Iterate through all options arguments */for(var i=startingArgumentPosition;i<arguments.length;i++){ /* Treat a number as a duration. Parse it out. */ /* Note: The following RegEx will return true if passed an array with a number as its first item.
                       Thus, arrays are skipped from this check. */if(!Type.isArray(arguments[i])&&(/^(fast|normal|slow)$/i.test(arguments[i])||/^\d/.test(arguments[i]))){options.duration=arguments[i]; /* Treat strings and arrays as easings. */}else if(Type.isString(arguments[i])||Type.isArray(arguments[i])){options.easing=arguments[i]; /* Treat a function as a complete callback. */}else if(Type.isFunction(arguments[i])){options.complete=arguments[i];}}} /***************
                Promises
            ***************/var promiseData={promise:null,resolver:null,rejecter:null}; /* If this call was made via the utility function (which is the default method of invocation when jQuery/Zepto are not being used), and if
               promise support was detected, create a promise object for this call and store references to its resolver and rejecter methods. The resolve
               method is used when a call completes naturally or is prematurely stopped by the user. In both cases, completeCall() handles the associated
               call cleanup and promise resolving logic. The reject method is used when an invalid set of arguments is passed into a Velocity call. */ /* Note: Velocity employs a call-based queueing architecture, which means that stopping an animating element actually stops the full call that
               triggered it -- not that one element exclusively. Similarly, there is one promise per call, and all elements targeted by a Velocity call are
               grouped together for the purposes of resolving and rejecting a promise. */if(isUtility&&Velocity.Promise){promiseData.promise=new Velocity.Promise(function(resolve,reject){promiseData.resolver=resolve;promiseData.rejecter=reject;});} /*********************
               Action Detection
            *********************/ /* Velocity's behavior is categorized into "actions": Elements can either be specially scrolled into view,
               or they can be started, stopped, or reversed. If a literal or referenced properties map is passed in as Velocity's
               first argument, the associated action is "start". Alternatively, "scroll", "reverse", or "stop" can be passed in instead of a properties map. */var action;switch(propertiesMap){case "scroll":action="scroll";break;case "reverse":action="reverse";break;case "finish":case "finishAll":case "stop": /*******************
                        Action: Stop
                    *******************/ /* Clear the currently-active delay on each targeted element. */$.each(elements,function(i,element){if(Data(element)&&Data(element).delayTimer){ /* Stop the timer from triggering its cached next() function. */clearTimeout(Data(element).delayTimer.setTimeout); /* Manually call the next() function so that the subsequent queue items can progress. */if(Data(element).delayTimer.next){Data(element).delayTimer.next();}delete Data(element).delayTimer;} /* If we want to finish everything in the queue, we have to iterate through it
                           and call each function. This will make them active calls below, which will
                           cause them to be applied via the duration setting. */if(propertiesMap==="finishAll"&&(options===true||Type.isString(options))){ /* Iterate through the items in the element's queue. */$.each($.queue(element,Type.isString(options)?options:""),function(_,item){ /* The queue array can contain an "inprogress" string, which we skip. */if(Type.isFunction(item)){item();}}); /* Clearing the $.queue() array is achieved by resetting it to []. */$.queue(element,Type.isString(options)?options:"",[]);}});var callsToStop=[]; /* When the stop action is triggered, the elements' currently active call is immediately stopped. The active call might have
                       been applied to multiple elements, in which case all of the call's elements will be stopped. When an element
                       is stopped, the next item in its animation queue is immediately triggered. */ /* An additional argument may be passed in to clear an element's remaining queued calls. Either true (which defaults to the "fx" queue)
                       or a custom queue string can be passed in. */ /* Note: The stop command runs prior to Velocity's Queueing phase since its behavior is intended to take effect *immediately*,
                       regardless of the element's current queue state. */ /* Iterate through every active call. */$.each(Velocity.State.calls,function(i,activeCall){ /* Inactive calls are set to false by the logic inside completeCall(). Skip them. */if(activeCall){ /* Iterate through the active call's targeted elements. */$.each(activeCall[1],function(k,activeElement){ /* If true was passed in as a secondary argument, clear absolutely all calls on this element. Otherwise, only
                                   clear calls associated with the relevant queue. */ /* Call stopping logic works as follows:
                                   - options === true --> stop current default queue calls (and queue:false calls), including remaining queued ones.
                                   - options === undefined --> stop current queue:"" call and all queue:false calls.
                                   - options === false --> stop only queue:false calls.
                                   - options === "custom" --> stop current queue:"custom" call, including remaining queued ones (there is no functionality to only clear the currently-running queue:"custom" call). */var queueName=options===undefined?"":options;if(queueName!==true&&activeCall[2].queue!==queueName&&!(options===undefined&&activeCall[2].queue===false)){return true;} /* Iterate through the calls targeted by the stop command. */$.each(elements,function(l,element){ /* Check that this call was applied to the target element. */if(element===activeElement){ /* Optionally clear the remaining queued calls. If we're doing "finishAll" this won't find anything,
                                           due to the queue-clearing above. */if(options===true||Type.isString(options)){ /* Iterate through the items in the element's queue. */$.each($.queue(element,Type.isString(options)?options:""),function(_,item){ /* The queue array can contain an "inprogress" string, which we skip. */if(Type.isFunction(item)){ /* Pass the item's callback a flag indicating that we want to abort from the queue call.
                                                       (Specifically, the queue will resolve the call's associated promise then abort.)  */item(null,true);}}); /* Clearing the $.queue() array is achieved by resetting it to []. */$.queue(element,Type.isString(options)?options:"",[]);}if(propertiesMap==="stop"){ /* Since "reverse" uses cached start values (the previous call's endValues), these values must be
                                               changed to reflect the final value that the elements were actually tweened to. */ /* Note: If only queue:false animations are currently running on an element, it won't have a tweensContainer
                                               object. Also, queue:false animations can't be reversed. */if(Data(element)&&Data(element).tweensContainer&&queueName!==false){$.each(Data(element).tweensContainer,function(m,activeTween){activeTween.endValue=activeTween.currentValue;});}callsToStop.push(i);}else if(propertiesMap==="finish"||propertiesMap==="finishAll"){ /* To get active tweens to finish immediately, we forcefully shorten their durations to 1ms so that
                                            they finish upon the next rAf tick then proceed with normal call completion logic. */activeCall[2].duration=1;}}});});}}); /* Prematurely call completeCall() on each matched active call. Pass an additional flag for "stop" to indicate
                       that the complete callback and display:none setting should be skipped since we're completing prematurely. */if(propertiesMap==="stop"){$.each(callsToStop,function(i,j){completeCall(j,true);});if(promiseData.promise){ /* Immediately resolve the promise associated with this stop call since stop runs synchronously. */promiseData.resolver(elements);}} /* Since we're stopping, and not proceeding with queueing, exit out of Velocity. */return getChain();default: /* Treat a non-empty plain object as a literal properties map. */if($.isPlainObject(propertiesMap)&&!Type.isEmptyObject(propertiesMap)){action="start"; /****************
                        Redirects
                    ****************/ /* Check if a string matches a registered redirect (see Redirects above). */}else if(Type.isString(propertiesMap)&&Velocity.Redirects[propertiesMap]){var opts=$.extend({},options),durationOriginal=opts.duration,delayOriginal=opts.delay||0; /* If the backwards option was passed in, reverse the element set so that elements animate from the last to the first. */if(opts.backwards===true){elements=$.extend(true,[],elements).reverse();} /* Individually trigger the redirect for each element in the set to prevent users from having to handle iteration logic in their redirect. */$.each(elements,function(elementIndex,element){ /* If the stagger option was passed in, successively delay each element by the stagger value (in ms). Retain the original delay value. */if(parseFloat(opts.stagger)){opts.delay=delayOriginal+parseFloat(opts.stagger)*elementIndex;}else if(Type.isFunction(opts.stagger)){opts.delay=delayOriginal+opts.stagger.call(element,elementIndex,elementsLength);} /* If the drag option was passed in, successively increase/decrease (depending on the presense of opts.backwards)
                               the duration of each element's animation, using floors to prevent producing very short durations. */if(opts.drag){ /* Default the duration of UI pack effects (callouts and transitions) to 1000ms instead of the usual default duration of 400ms. */opts.duration=parseFloat(durationOriginal)||(/^(callout|transition)/.test(propertiesMap)?1000:DURATION_DEFAULT); /* For each element, take the greater duration of: A) animation completion percentage relative to the original duration,
                                   B) 75% of the original duration, or C) a 200ms fallback (in case duration is already set to a low value).
                                   The end result is a baseline of 75% of the redirect's duration that increases/decreases as the end of the element set is approached. */opts.duration=Math.max(opts.duration*(opts.backwards?1-elementIndex/elementsLength:(elementIndex+1)/elementsLength),opts.duration*0.75,200);} /* Pass in the call's opts object so that the redirect can optionally extend it. It defaults to an empty object instead of null to
                               reduce the opts checking logic required inside the redirect. */Velocity.Redirects[propertiesMap].call(element,element,opts||{},elementIndex,elementsLength,elements,promiseData.promise?promiseData:undefined);}); /* Since the animation logic resides within the redirect's own code, abort the remainder of this call.
                           (The performance overhead up to this point is virtually non-existant.) */ /* Note: The jQuery call chain is kept intact by returning the complete element set. */return getChain();}else {var abortError="Velocity: First argument ("+propertiesMap+") was not a property map, a known action, or a registered redirect. Aborting.";if(promiseData.promise){promiseData.rejecter(new Error(abortError));}else {console.log(abortError);}return getChain();}} /**************************
                Call-Wide Variables
            **************************/ /* A container for CSS unit conversion ratios (e.g. %, rem, and em ==> px) that is used to cache ratios across all elements
               being animated in a single Velocity call. Calculating unit ratios necessitates DOM querying and updating, and is therefore
               avoided (via caching) wherever possible. This container is call-wide instead of page-wide to avoid the risk of using stale
               conversion metrics across Velocity animations that are not immediately consecutively chained. */var callUnitConversionData={lastParent:null,lastPosition:null,lastFontSize:null,lastPercentToPxWidth:null,lastPercentToPxHeight:null,lastEmToPx:null,remToPx:null,vwToPx:null,vhToPx:null}; /* A container for all the ensuing tween data and metadata associated with this call. This container gets pushed to the page-wide
               Velocity.State.calls array that is processed during animation ticking. */var call=[]; /************************
               Element Processing
            ************************/ /* Element processing consists of three parts -- data processing that cannot go stale and data processing that *can* go stale (i.e. third-party style modifications):
               1) Pre-Queueing: Element-wide variables, including the element's data storage, are instantiated. Call options are prepared. If triggered, the Stop action is executed.
               2) Queueing: The logic that runs once this call has reached its point of execution in the element's $.queue() stack. Most logic is placed here to avoid risking it becoming stale.
               3) Pushing: Consolidation of the tween data followed by its push onto the global in-progress calls container.
            */function processElement(){ /*************************
                   Part I: Pre-Queueing
                *************************/ /***************************
                   Element-Wide Variables
                ***************************/var element=this, /* The runtime opts object is the extension of the current call's options and Velocity's page-wide option defaults. */opts=$.extend({},Velocity.defaults,options), /* A container for the processed data associated with each property in the propertyMap.
                       (Each property in the map produces its own "tween".) */tweensContainer={},elementUnitConversionData; /******************
                   Element Init
                ******************/if(Data(element)===undefined){Velocity.init(element);} /******************
                   Option: Delay
                ******************/ /* Since queue:false doesn't respect the item's existing queue, we avoid injecting its delay here (it's set later on). */ /* Note: Velocity rolls its own delay function since jQuery doesn't have a utility alias for $.fn.delay()
                   (and thus requires jQuery element creation, which we avoid since its overhead includes DOM querying). */if(parseFloat(opts.delay)&&opts.queue!==false){$.queue(element,opts.queue,function(next){ /* This is a flag used to indicate to the upcoming completeCall() function that this queue entry was initiated by Velocity. See completeCall() for further details. */Velocity.velocityQueueEntryFlag=true; /* The ensuing queue item (which is assigned to the "next" argument that $.queue() automatically passes in) will be triggered after a setTimeout delay.
                           The setTimeout is stored so that it can be subjected to clearTimeout() if this animation is prematurely stopped via Velocity's "stop" command. */Data(element).delayTimer={setTimeout:setTimeout(next,parseFloat(opts.delay)),next:next};});} /*********************
                   Option: Duration
                *********************/ /* Support for jQuery's named durations. */switch(opts.duration.toString().toLowerCase()){case "fast":opts.duration=200;break;case "normal":opts.duration=DURATION_DEFAULT;break;case "slow":opts.duration=600;break;default: /* Remove the potential "ms" suffix and default to 1 if the user is attempting to set a duration of 0 (in order to produce an immediate style change). */opts.duration=parseFloat(opts.duration)||1;} /************************
                   Global Option: Mock
                ************************/if(Velocity.mock!==false){ /* In mock mode, all animations are forced to 1ms so that they occur immediately upon the next rAF tick.
                       Alternatively, a multiplier can be passed in to time remap all delays and durations. */if(Velocity.mock===true){opts.duration=opts.delay=1;}else {opts.duration*=parseFloat(Velocity.mock)||1;opts.delay*=parseFloat(Velocity.mock)||1;}} /*******************
                   Option: Easing
                *******************/opts.easing=getEasing(opts.easing,opts.duration); /**********************
                   Option: Callbacks
                **********************/ /* Callbacks must functions. Otherwise, default to null. */if(opts.begin&&!Type.isFunction(opts.begin)){opts.begin=null;}if(opts.progress&&!Type.isFunction(opts.progress)){opts.progress=null;}if(opts.complete&&!Type.isFunction(opts.complete)){opts.complete=null;} /*********************************
                   Option: Display & Visibility
                *********************************/ /* Refer to Velocity's documentation (VelocityJS.org/#displayAndVisibility) for a description of the display and visibility options' behavior. */ /* Note: We strictly check for undefined instead of falsiness because display accepts an empty string value. */if(opts.display!==undefined&&opts.display!==null){opts.display=opts.display.toString().toLowerCase(); /* Users can pass in a special "auto" value to instruct Velocity to set the element to its default display value. */if(opts.display==="auto"){opts.display=Velocity.CSS.Values.getDisplayType(element);}}if(opts.visibility!==undefined&&opts.visibility!==null){opts.visibility=opts.visibility.toString().toLowerCase();} /**********************
                   Option: mobileHA
                **********************/ /* When set to true, and if this is a mobile device, mobileHA automatically enables hardware acceleration (via a null transform hack)
                   on animating elements. HA is removed from the element at the completion of its animation. */ /* Note: Android Gingerbread doesn't support HA. If a null transform hack (mobileHA) is in fact set, it will prevent other tranform subproperties from taking effect. */ /* Note: You can read more about the use of mobileHA in Velocity's documentation: VelocityJS.org/#mobileHA. */opts.mobileHA=opts.mobileHA&&Velocity.State.isMobile&&!Velocity.State.isGingerbread; /***********************
                   Part II: Queueing
                ***********************/ /* When a set of elements is targeted by a Velocity call, the set is broken up and each element has the current Velocity call individually queued onto it.
                   In this way, each element's existing queue is respected; some elements may already be animating and accordingly should not have this current Velocity call triggered immediately. */ /* In each queue, tween data is processed for each animating property then pushed onto the call-wide calls array. When the last element in the set has had its tweens processed,
                   the call array is pushed to Velocity.State.calls for live processing by the requestAnimationFrame tick. */function buildQueue(next){ /*******************
                       Option: Begin
                    *******************/ /* The begin callback is fired once per call -- not once per elemenet -- and is passed the full raw DOM element set as both its context and its first argument. */if(opts.begin&&elementsIndex===0){ /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */try{opts.begin.call(elements,elements);}catch(error){setTimeout(function(){throw error;},1);}} /*****************************************
                       Tween Data Construction (for Scroll)
                    *****************************************/ /* Note: In order to be subjected to chaining and animation options, scroll's tweening is routed through Velocity as if it were a standard CSS property animation. */if(action==="scroll"){ /* The scroll action uniquely takes an optional "offset" option -- specified in pixels -- that offsets the targeted scroll position. */var scrollDirection=/^x$/i.test(opts.axis)?"Left":"Top",scrollOffset=parseFloat(opts.offset)||0,scrollPositionCurrent,scrollPositionCurrentAlternate,scrollPositionEnd; /* Scroll also uniquely takes an optional "container" option, which indicates the parent element that should be scrolled --
                           as opposed to the browser window itself. This is useful for scrolling toward an element that's inside an overflowing parent element. */if(opts.container){ /* Ensure that either a jQuery object or a raw DOM element was passed in. */if(Type.isWrapped(opts.container)||Type.isNode(opts.container)){ /* Extract the raw DOM element from the jQuery wrapper. */opts.container=opts.container[0]||opts.container; /* Note: Unlike other properties in Velocity, the browser's scroll position is never cached since it so frequently changes
                                   (due to the user's natural interaction with the page). */scrollPositionCurrent=opts.container["scroll"+scrollDirection]; /* GET */ /* $.position() values are relative to the container's currently viewable area (without taking into account the container's true dimensions
                                   -- say, for example, if the container was not overflowing). Thus, the scroll end value is the sum of the child element's position *and*
                                   the scroll container's current scroll position. */scrollPositionEnd=scrollPositionCurrent+$(element).position()[scrollDirection.toLowerCase()]+scrollOffset; /* GET */ /* If a value other than a jQuery object or a raw DOM element was passed in, default to null so that this option is ignored. */}else {opts.container=null;}}else { /* If the window itself is being scrolled -- not a containing element -- perform a live scroll position lookup using
                               the appropriate cached property names (which differ based on browser type). */scrollPositionCurrent=Velocity.State.scrollAnchor[Velocity.State["scrollProperty"+scrollDirection]]; /* GET */ /* When scrolling the browser window, cache the alternate axis's current value since window.scrollTo() doesn't let us change only one value at a time. */scrollPositionCurrentAlternate=Velocity.State.scrollAnchor[Velocity.State["scrollProperty"+(scrollDirection==="Left"?"Top":"Left")]]; /* GET */ /* Unlike $.position(), $.offset() values are relative to the browser window's true dimensions -- not merely its currently viewable area --
                               and therefore end values do not need to be compounded onto current values. */scrollPositionEnd=$(element).offset()[scrollDirection.toLowerCase()]+scrollOffset; /* GET */} /* Since there's only one format that scroll's associated tweensContainer can take, we create it manually. */tweensContainer={scroll:{rootPropertyValue:false,startValue:scrollPositionCurrent,currentValue:scrollPositionCurrent,endValue:scrollPositionEnd,unitType:"",easing:opts.easing,scrollData:{container:opts.container,direction:scrollDirection,alternateValue:scrollPositionCurrentAlternate}},element:element};if(Velocity.debug)console.log("tweensContainer (scroll): ",tweensContainer.scroll,element); /******************************************
                       Tween Data Construction (for Reverse)
                    ******************************************/ /* Reverse acts like a "start" action in that a property map is animated toward. The only difference is
                       that the property map used for reverse is the inverse of the map used in the previous call. Thus, we manipulate
                       the previous call to construct our new map: use the previous map's end values as our new map's start values. Copy over all other data. */ /* Note: Reverse can be directly called via the "reverse" parameter, or it can be indirectly triggered via the loop option. (Loops are composed of multiple reverses.) */ /* Note: Reverse calls do not need to be consecutively chained onto a currently-animating element in order to operate on cached values;
                       there is no harm to reverse being called on a potentially stale data cache since reverse's behavior is simply defined
                       as reverting to the element's values as they were prior to the previous *Velocity* call. */}else if(action==="reverse"){ /* Abort if there is no prior animation data to reverse to. */if(!Data(element).tweensContainer){ /* Dequeue the element so that this queue entry releases itself immediately, allowing subsequent queue entries to run. */$.dequeue(element,opts.queue);return;}else { /*********************
                               Options Parsing
                            *********************/ /* If the element was hidden via the display option in the previous call,
                               revert display to "auto" prior to reversal so that the element is visible again. */if(Data(element).opts.display==="none"){Data(element).opts.display="auto";}if(Data(element).opts.visibility==="hidden"){Data(element).opts.visibility="visible";} /* If the loop option was set in the previous call, disable it so that "reverse" calls aren't recursively generated.
                               Further, remove the previous call's callback options; typically, users do not want these to be refired. */Data(element).opts.loop=false;Data(element).opts.begin=null;Data(element).opts.complete=null; /* Since we're extending an opts object that has already been extended with the defaults options object,
                               we remove non-explicitly-defined properties that are auto-assigned values. */if(!options.easing){delete opts.easing;}if(!options.duration){delete opts.duration;} /* The opts object used for reversal is an extension of the options object optionally passed into this
                               reverse call plus the options used in the previous Velocity call. */opts=$.extend({},Data(element).opts,opts); /*************************************
                               Tweens Container Reconstruction
                            *************************************/ /* Create a deepy copy (indicated via the true flag) of the previous call's tweensContainer. */var lastTweensContainer=$.extend(true,{},Data(element).tweensContainer); /* Manipulate the previous tweensContainer by replacing its end values and currentValues with its start values. */for(var lastTween in lastTweensContainer){ /* In addition to tween data, tweensContainers contain an element property that we ignore here. */if(lastTween!=="element"){var lastStartValue=lastTweensContainer[lastTween].startValue;lastTweensContainer[lastTween].startValue=lastTweensContainer[lastTween].currentValue=lastTweensContainer[lastTween].endValue;lastTweensContainer[lastTween].endValue=lastStartValue; /* Easing is the only option that embeds into the individual tween data (since it can be defined on a per-property basis).
                                       Accordingly, every property's easing value must be updated when an options object is passed in with a reverse call.
                                       The side effect of this extensibility is that all per-property easing values are forcefully reset to the new value. */if(!Type.isEmptyObject(options)){lastTweensContainer[lastTween].easing=opts.easing;}if(Velocity.debug)console.log("reverse tweensContainer ("+lastTween+"): "+JSON.stringify(lastTweensContainer[lastTween]),element);}}tweensContainer=lastTweensContainer;} /*****************************************
                       Tween Data Construction (for Start)
                    *****************************************/}else if(action==="start"){var lastTweensContainer;var property;var valueData,endValue,easing,startValue;var rootProperty,rootPropertyValue;var separatedValue,endValueUnitType,startValueUnitType,operator;var axis;(function(){ /***************************
                           Tween Data Calculation
                        ***************************/ /* This function parses property data and defaults endValue, easing, and startValue as appropriate. */ /* Property map values can either take the form of 1) a single value representing the end value,
                           or 2) an array in the form of [ endValue, [, easing] [, startValue] ].
                           The optional third parameter is a forcefed startValue to be used instead of querying the DOM for
                           the element's current value. Read Velocity's docmentation to learn more about forcefeeding: VelocityJS.org/#forcefeeding */var parsePropertyValue=function parsePropertyValue(valueData,skipResolvingEasing){var endValue=undefined,easing=undefined,startValue=undefined; /* Handle the array format, which can be structured as one of three potential overloads:
                               A) [ endValue, easing, startValue ], B) [ endValue, easing ], or C) [ endValue, startValue ] */if(Type.isArray(valueData)){ /* endValue is always the first item in the array. Don't bother validating endValue's value now
                                   since the ensuing property cycling logic does that. */endValue=valueData[0]; /* Two-item array format: If the second item is a number, function, or hex string, treat it as a
                                   start value since easings can only be non-hex strings or arrays. */if(!Type.isArray(valueData[1])&&/^[\d-]/.test(valueData[1])||Type.isFunction(valueData[1])||CSS.RegEx.isHex.test(valueData[1])){startValue=valueData[1]; /* Two or three-item array: If the second item is a non-hex string or an array, treat it as an easing. */}else if(Type.isString(valueData[1])&&!CSS.RegEx.isHex.test(valueData[1])||Type.isArray(valueData[1])){easing=skipResolvingEasing?valueData[1]:getEasing(valueData[1],opts.duration); /* Don't bother validating startValue's value now since the ensuing property cycling logic inherently does that. */if(valueData[2]!==undefined){startValue=valueData[2];}} /* Handle the single-value format. */}else {endValue=valueData;} /* Default to the call's easing if a per-property easing type was not defined. */if(!skipResolvingEasing){easing=easing||opts.easing;} /* If functions were passed in as values, pass the function the current element as its context,
                               plus the element's index and the element set's size as arguments. Then, assign the returned value. */if(Type.isFunction(endValue)){endValue=endValue.call(element,elementsIndex,elementsLength);}if(Type.isFunction(startValue)){startValue=startValue.call(element,elementsIndex,elementsLength);} /* Allow startValue to be left as undefined to indicate to the ensuing code that its value was not forcefed. */return [endValue||0,easing,startValue];}; /* Cycle through each property in the map, looking for shorthand color properties (e.g. "color" as opposed to "colorRed"). Inject the corresponding
                           colorRed, colorGreen, and colorBlue RGB component tweens into the propertiesMap (which Velocity understands) and remove the shorthand property. */ /* The per-element isAnimating flag is used to indicate whether it's safe (i.e. the data isn't stale)
                           to transfer over end values to use as start values. If it's set to true and there is a previous
                           Velocity call to pull values from, do so. */if(Data(element).tweensContainer&&Data(element).isAnimating===true){lastTweensContainer=Data(element).tweensContainer;}$.each(propertiesMap,function(property,value){ /* Find shorthand color properties that have been passed a hex string. */if(RegExp("^"+CSS.Lists.colors.join("$|^")+"$").test(property)){ /* Parse the value data for each shorthand. */var valueData=parsePropertyValue(value,true),endValue=valueData[0],easing=valueData[1],startValue=valueData[2];if(CSS.RegEx.isHex.test(endValue)){ /* Convert the hex strings into their RGB component arrays. */var colorComponents=["Red","Green","Blue"],endValueRGB=CSS.Values.hexToRgb(endValue),startValueRGB=startValue?CSS.Values.hexToRgb(startValue):undefined; /* Inject the RGB component tweens into propertiesMap. */for(var i=0;i<colorComponents.length;i++){var dataArray=[endValueRGB[i]];if(easing){dataArray.push(easing);}if(startValueRGB!==undefined){dataArray.push(startValueRGB[i]);}propertiesMap[property+colorComponents[i]]=dataArray;} /* Remove the intermediary shorthand property entry now that we've processed it. */delete propertiesMap[property];}}}); /* Create a tween out of each property, and append its associated data to tweensContainer. */var _loop=function _loop(){ /**************************
                               Start Value Sourcing
                            **************************/ /* Parse out endValue, easing, and startValue from the property's data. */valueData=parsePropertyValue(propertiesMap[property]);endValue=valueData[0];easing=valueData[1];startValue=valueData[2]; /* Now that the original property name's format has been used for the parsePropertyValue() lookup above,
                               we force the property to its camelCase styling to normalize it for manipulation. */property=CSS.Names.camelCase(property); /* In case this property is a hook, there are circumstances where we will intend to work on the hook's root property and not the hooked subproperty. */rootProperty=CSS.Hooks.getRoot(property);rootPropertyValue=false; /* Other than for the dummy tween property, properties that are not supported by the browser (and do not have an associated normalization) will
                               inherently produce no style changes when set, so they are skipped in order to decrease animation tick overhead.
                               Property support is determined via prefixCheck(), which returns a false flag when no supported is detected. */ /* Note: Since SVG elements have some of their properties directly applied as HTML attributes,
                               there is no way to check for their explicit browser support, and so we skip skip this check for them. */if(!Data(element).isSVG&&rootProperty!=="tween"&&CSS.Names.prefixCheck(rootProperty)[1]===false&&CSS.Normalizations.registered[rootProperty]===undefined){if(Velocity.debug)console.log("Skipping ["+rootProperty+"] due to a lack of browser support.");return "continue";} /* If the display option is being set to a non-"none" (e.g. "block") and opacity (filter on IE<=8) is being
                               animated to an endValue of non-zero, the user's intention is to fade in from invisible, thus we forcefeed opacity
                               a startValue of 0 if its startValue hasn't already been sourced by value transferring or prior forcefeeding. */if((opts.display!==undefined&&opts.display!==null&&opts.display!=="none"||opts.visibility!==undefined&&opts.visibility!=="hidden")&&/opacity|filter/.test(property)&&!startValue&&endValue!==0){startValue=0;} /* If values have been transferred from the previous Velocity call, extract the endValue and rootPropertyValue
                               for all of the current call's properties that were *also* animated in the previous call. */ /* Note: Value transferring can optionally be disabled by the user via the _cacheValues option. */if(opts._cacheValues&&lastTweensContainer&&lastTweensContainer[property]){if(startValue===undefined){startValue=lastTweensContainer[property].endValue+lastTweensContainer[property].unitType;} /* The previous call's rootPropertyValue is extracted from the element's data cache since that's the
                                   instance of rootPropertyValue that gets freshly updated by the tweening process, whereas the rootPropertyValue
                                   attached to the incoming lastTweensContainer is equal to the root property's value prior to any tweening. */rootPropertyValue=Data(element).rootPropertyValueCache[rootProperty]; /* If values were not transferred from a previous Velocity call, query the DOM as needed. */}else { /* Handle hooked properties. */if(CSS.Hooks.registered[property]){if(startValue===undefined){rootPropertyValue=CSS.getPropertyValue(element,rootProperty); /* GET */ /* Note: The following getPropertyValue() call does not actually trigger a DOM query;
                                           getPropertyValue() will extract the hook from rootPropertyValue. */startValue=CSS.getPropertyValue(element,property,rootPropertyValue); /* If startValue is already defined via forcefeeding, do not query the DOM for the root property's value;
                                       just grab rootProperty's zero-value template from CSS.Hooks. This overwrites the element's actual
                                       root property value (if one is set), but this is acceptable since the primary reason users forcefeed is
                                       to avoid DOM queries, and thus we likewise avoid querying the DOM for the root property's value. */}else { /* Grab this hook's zero-value template, e.g. "0px 0px 0px black". */rootPropertyValue=CSS.Hooks.templates[rootProperty][1];} /* Handle non-hooked properties that haven't already been defined via forcefeeding. */}else if(startValue===undefined){startValue=CSS.getPropertyValue(element,property); /* GET */}} /**************************
                               Value Data Extraction
                            **************************/operator=false; /* Separates a property value into its numeric value and its unit type. */function separateValue(property,value){var unitType,numericValue;numericValue=(value||"0").toString().toLowerCase() /* Match the unit type at the end of the value. */.replace(/[%A-z]+$/,function(match){ /* Grab the unit type. */unitType=match; /* Strip the unit type off of value. */return "";}); /* If no unit type was supplied, assign one that is appropriate for this property (e.g. "deg" for rotateZ or "px" for width). */if(!unitType){unitType=CSS.Values.getUnitType(property);}return [numericValue,unitType];} /* Separate startValue. */separatedValue=separateValue(property,startValue);startValue=separatedValue[0];startValueUnitType=separatedValue[1]; /* Separate endValue, and extract a value operator (e.g. "+=", "-=") if one exists. */separatedValue=separateValue(property,endValue);endValue=separatedValue[0].replace(/^([+-\/*])=/,function(match,subMatch){operator=subMatch; /* Strip the operator off of the value. */return "";});endValueUnitType=separatedValue[1]; /* Parse float values from endValue and startValue. Default to 0 if NaN is returned. */startValue=parseFloat(startValue)||0;endValue=parseFloat(endValue)||0; /***************************************
                               Property-Specific Value Conversion
                            ***************************************/ /* Custom support for properties that don't actually accept the % unit type, but where pollyfilling is trivial and relatively foolproof. */if(endValueUnitType==="%"){ /* A %-value fontSize/lineHeight is relative to the parent's fontSize (as opposed to the parent's dimensions),
                                   which is identical to the em unit's behavior, so we piggyback off of that. */if(/^(fontSize|lineHeight)$/.test(property)){ /* Convert % into an em decimal value. */endValue=endValue/100;endValueUnitType="em"; /* For scaleX and scaleY, convert the value into its decimal format and strip off the unit type. */}else if(/^scale/.test(property)){endValue=endValue/100;endValueUnitType=""; /* For RGB components, take the defined percentage of 255 and strip off the unit type. */}else if(/(Red|Green|Blue)$/i.test(property)){endValue=endValue/100*255;endValueUnitType="";}} /***************************
                               Unit Ratio Calculation
                            ***************************/ /* When queried, the browser returns (most) CSS property values in pixels. Therefore, if an endValue with a unit type of
                               %, em, or rem is animated toward, startValue must be converted from pixels into the same unit type as endValue in order
                               for value manipulation logic (increment/decrement) to proceed. Further, if the startValue was forcefed or transferred
                               from a previous call, startValue may also not be in pixels. Unit conversion logic therefore consists of two steps:
                               1) Calculating the ratio of %/em/rem/vh/vw relative to pixels
                               2) Converting startValue into the same unit of measurement as endValue based on these ratios. */ /* Unit conversion ratios are calculated by inserting a sibling node next to the target node, copying over its position property,
                               setting values with the target unit type then comparing the returned pixel value. */ /* Note: Even if only one of these unit types is being animated, all unit ratios are calculated at once since the overhead
                               of batching the SETs and GETs together upfront outweights the potential overhead
                               of layout thrashing caused by re-querying for uncalculated ratios for subsequently-processed properties. */ /* Todo: Shift this logic into the calls' first tick instance so that it's synced with RAF. */function calculateUnitRatios(){ /************************
                                    Same Ratio Checks
                                ************************/ /* The properties below are used to determine whether the element differs sufficiently from this call's
                                   previously iterated element to also differ in its unit conversion ratios. If the properties match up with those
                                   of the prior element, the prior element's conversion ratios are used. Like most optimizations in Velocity,
                                   this is done to minimize DOM querying. */var sameRatioIndicators={myParent:element.parentNode||document.body, /* GET */position:CSS.getPropertyValue(element,"position"), /* GET */fontSize:CSS.getPropertyValue(element,"fontSize") /* GET */}, /* Determine if the same % ratio can be used. % is based on the element's position value and its parent's width and height dimensions. */samePercentRatio=sameRatioIndicators.position===callUnitConversionData.lastPosition&&sameRatioIndicators.myParent===callUnitConversionData.lastParent, /* Determine if the same em ratio can be used. em is relative to the element's fontSize. */sameEmRatio=sameRatioIndicators.fontSize===callUnitConversionData.lastFontSize; /* Store these ratio indicators call-wide for the next element to compare against. */callUnitConversionData.lastParent=sameRatioIndicators.myParent;callUnitConversionData.lastPosition=sameRatioIndicators.position;callUnitConversionData.lastFontSize=sameRatioIndicators.fontSize; /***************************
                                   Element-Specific Units
                                ***************************/ /* Note: IE8 rounds to the nearest pixel when returning CSS values, thus we perform conversions using a measurement
                                   of 100 (instead of 1) to give our ratios a precision of at least 2 decimal values. */var measurement=100,unitRatios={};if(!sameEmRatio||!samePercentRatio){var dummy=Data(element).isSVG?document.createElementNS("http://www.w3.org/2000/svg","rect"):document.createElement("div");Velocity.init(dummy);sameRatioIndicators.myParent.appendChild(dummy); /* To accurately and consistently calculate conversion ratios, the element's cascaded overflow and box-sizing are stripped.
                                       Similarly, since width/height can be artificially constrained by their min-/max- equivalents, these are controlled for as well. */ /* Note: Overflow must be also be controlled for per-axis since the overflow property overwrites its per-axis values. */$.each(["overflow","overflowX","overflowY"],function(i,property){Velocity.CSS.setPropertyValue(dummy,property,"hidden");});Velocity.CSS.setPropertyValue(dummy,"position",sameRatioIndicators.position);Velocity.CSS.setPropertyValue(dummy,"fontSize",sameRatioIndicators.fontSize);Velocity.CSS.setPropertyValue(dummy,"boxSizing","content-box"); /* width and height act as our proxy properties for measuring the horizontal and vertical % ratios. */$.each(["minWidth","maxWidth","width","minHeight","maxHeight","height"],function(i,property){Velocity.CSS.setPropertyValue(dummy,property,measurement+"%");}); /* paddingLeft arbitrarily acts as our proxy property for the em ratio. */Velocity.CSS.setPropertyValue(dummy,"paddingLeft",measurement+"em"); /* Divide the returned value by the measurement to get the ratio between 1% and 1px. Default to 1 since working with 0 can produce Infinite. */unitRatios.percentToPxWidth=callUnitConversionData.lastPercentToPxWidth=(parseFloat(CSS.getPropertyValue(dummy,"width",null,true))||1)/measurement; /* GET */unitRatios.percentToPxHeight=callUnitConversionData.lastPercentToPxHeight=(parseFloat(CSS.getPropertyValue(dummy,"height",null,true))||1)/measurement; /* GET */unitRatios.emToPx=callUnitConversionData.lastEmToPx=(parseFloat(CSS.getPropertyValue(dummy,"paddingLeft"))||1)/measurement; /* GET */sameRatioIndicators.myParent.removeChild(dummy);}else {unitRatios.emToPx=callUnitConversionData.lastEmToPx;unitRatios.percentToPxWidth=callUnitConversionData.lastPercentToPxWidth;unitRatios.percentToPxHeight=callUnitConversionData.lastPercentToPxHeight;} /***************************
                                   Element-Agnostic Units
                                ***************************/ /* Whereas % and em ratios are determined on a per-element basis, the rem unit only needs to be checked
                                   once per call since it's exclusively dependant upon document.body's fontSize. If this is the first time
                                   that calculateUnitRatios() is being run during this call, remToPx will still be set to its default value of null,
                                   so we calculate it now. */if(callUnitConversionData.remToPx===null){ /* Default to browsers' default fontSize of 16px in the case of 0. */callUnitConversionData.remToPx=parseFloat(CSS.getPropertyValue(document.body,"fontSize"))||16; /* GET */} /* Similarly, viewport units are %-relative to the window's inner dimensions. */if(callUnitConversionData.vwToPx===null){callUnitConversionData.vwToPx=parseFloat(window.innerWidth)/100; /* GET */callUnitConversionData.vhToPx=parseFloat(window.innerHeight)/100; /* GET */}unitRatios.remToPx=callUnitConversionData.remToPx;unitRatios.vwToPx=callUnitConversionData.vwToPx;unitRatios.vhToPx=callUnitConversionData.vhToPx;if(Velocity.debug>=1)console.log("Unit ratios: "+JSON.stringify(unitRatios),element);return unitRatios;} /********************
                               Unit Conversion
                            ********************/ /* The * and / operators, which are not passed in with an associated unit, inherently use startValue's unit. Skip value and unit conversion. */if(/[\/*]/.test(operator)){endValueUnitType=startValueUnitType; /* If startValue and endValue differ in unit type, convert startValue into the same unit type as endValue so that if endValueUnitType
                               is a relative unit (%, em, rem), the values set during tweening will continue to be accurately relative even if the metrics they depend
                               on are dynamically changing during the course of the animation. Conversely, if we always normalized into px and used px for setting values, the px ratio
                               would become stale if the original unit being animated toward was relative and the underlying metrics change during the animation. */ /* Since 0 is 0 in any unit type, no conversion is necessary when startValue is 0 -- we just start at 0 with endValueUnitType. */}else if(startValueUnitType!==endValueUnitType&&startValue!==0){ /* Unit conversion is also skipped when endValue is 0, but *startValueUnitType* must be used for tween values to remain accurate. */ /* Note: Skipping unit conversion here means that if endValueUnitType was originally a relative unit, the animation won't relatively
                                   match the underlying metrics if they change, but this is acceptable since we're animating toward invisibility instead of toward visibility,
                                   which remains past the point of the animation's completion. */if(endValue===0){endValueUnitType=startValueUnitType;}else { /* By this point, we cannot avoid unit conversion (it's undesirable since it causes layout thrashing).
                                       If we haven't already, we trigger calculateUnitRatios(), which runs once per element per call. */elementUnitConversionData=elementUnitConversionData||calculateUnitRatios(); /* The following RegEx matches CSS properties that have their % values measured relative to the x-axis. */ /* Note: W3C spec mandates that all of margin and padding's properties (even top and bottom) are %-relative to the *width* of the parent element. */axis=/margin|padding|left|right|width|text|word|letter/i.test(property)||/X$/.test(property)||property==="x"?"x":"y"; /* In order to avoid generating n^2 bespoke conversion functions, unit conversion is a two-step process:
                                       1) Convert startValue into pixels. 2) Convert this new pixel value into endValue's unit type. */switch(startValueUnitType){case "%": /* Note: translateX and translateY are the only properties that are %-relative to an element's own dimensions -- not its parent's dimensions.
                                               Velocity does not include a special conversion process to account for this behavior. Therefore, animating translateX/Y from a % value
                                               to a non-% value will produce an incorrect start value. Fortunately, this sort of cross-unit conversion is rarely done by users in practice. */startValue*=axis==="x"?elementUnitConversionData.percentToPxWidth:elementUnitConversionData.percentToPxHeight;break;case "px": /* px acts as our midpoint in the unit conversion process; do nothing. */break;default:startValue*=elementUnitConversionData[startValueUnitType+"ToPx"];} /* Invert the px ratios to convert into to the target unit. */switch(endValueUnitType){case "%":startValue*=1/(axis==="x"?elementUnitConversionData.percentToPxWidth:elementUnitConversionData.percentToPxHeight);break;case "px": /* startValue is already in px, do nothing; we're done. */break;default:startValue*=1/elementUnitConversionData[endValueUnitType+"ToPx"];}}} /*********************
                               Relative Values
                            *********************/ /* Operator logic must be performed last since it requires unit-normalized start and end values. */ /* Note: Relative *percent values* do not behave how most people think; while one would expect "+=50%"
                               to increase the property 1.5x its current value, it in fact increases the percent units in absolute terms:
                               50 points is added on top of the current % value. */switch(operator){case "+":endValue=startValue+endValue;break;case "-":endValue=startValue-endValue;break;case "*":endValue=startValue*endValue;break;case "/":endValue=startValue/endValue;break;} /**************************
                               tweensContainer Push
                            **************************/ /* Construct the per-property tween object, and push it to the element's tweensContainer. */tweensContainer[property]={rootPropertyValue:rootPropertyValue,startValue:startValue,currentValue:startValue,endValue:endValue,unitType:endValueUnitType,easing:easing};if(Velocity.debug)console.log("tweensContainer ("+property+"): "+JSON.stringify(tweensContainer[property]),element);};for(property in propertiesMap){var _ret2=_loop();if(_ret2==="continue")continue;} /* Along with its property data, store a reference to the element itself onto tweensContainer. */tweensContainer.element=element;})();} /*****************
                        Call Push
                    *****************/ /* Note: tweensContainer can be empty if all of the properties in this call's property map were skipped due to not
                       being supported by the browser. The element property is used for checking that the tweensContainer has been appended to. */if(tweensContainer.element){ /* Apply the "velocity-animating" indicator class. */CSS.Values.addClass(element,"velocity-animating"); /* The call array houses the tweensContainers for each element being animated in the current call. */call.push(tweensContainer); /* Store the tweensContainer and options if we're working on the default effects queue, so that they can be used by the reverse command. */if(opts.queue===""){Data(element).tweensContainer=tweensContainer;Data(element).opts=opts;} /* Switch on the element's animating flag. */Data(element).isAnimating=true; /* Once the final element in this call's element set has been processed, push the call array onto
                           Velocity.State.calls for the animation tick to immediately begin processing. */if(elementsIndex===elementsLength-1){ /* Add the current call plus its associated metadata (the element set and the call's options) onto the global call container.
                               Anything on this call container is subjected to tick() processing. */Velocity.State.calls.push([call,elements,opts,null,promiseData.resolver]); /* If the animation tick isn't running, start it. (Velocity shuts it off when there are no active calls to process.) */if(Velocity.State.isTicking===false){Velocity.State.isTicking=true; /* Start the tick loop. */tick();}}else {elementsIndex++;}}} /* When the queue option is set to false, the call skips the element's queue and fires immediately. */if(opts.queue===false){ /* Since this buildQueue call doesn't respect the element's existing queue (which is where a delay option would have been appended),
                       we manually inject the delay property here with an explicit setTimeout. */if(opts.delay){setTimeout(buildQueue,opts.delay);}else {buildQueue();} /* Otherwise, the call undergoes element queueing as normal. */ /* Note: To interoperate with jQuery, Velocity uses jQuery's own $.queue() stack for queuing logic. */}else {$.queue(element,opts.queue,function(next,clearQueue){ /* If the clearQueue flag was passed in by the stop command, resolve this call's promise. (Promises can only be resolved once,
                           so it's fine if this is repeatedly triggered for each element in the associated call.) */if(clearQueue===true){if(promiseData.promise){promiseData.resolver(elements);} /* Do not continue with animation queueing. */return true;} /* This flag indicates to the upcoming completeCall() function that this queue entry was initiated by Velocity.
                           See completeCall() for further details. */Velocity.velocityQueueEntryFlag=true;buildQueue(next);});} /*********************
                    Auto-Dequeuing
                *********************/ /* As per jQuery's $.queue() behavior, to fire the first non-custom-queue entry on an element, the element
                   must be dequeued if its queue stack consists *solely* of the current call. (This can be determined by checking
                   for the "inprogress" item that jQuery prepends to active queue stack arrays.) Regardless, whenever the element's
                   queue is further appended with additional items -- including $.delay()'s or even $.animate() calls, the queue's
                   first entry is automatically fired. This behavior contrasts that of custom queues, which never auto-fire. */ /* Note: When an element set is being subjected to a non-parallel Velocity call, the animation will not begin until
                   each one of the elements in the set has reached the end of its individually pre-existing queue chain. */ /* Note: Unfortunately, most people don't fully grasp jQuery's powerful, yet quirky, $.queue() function.
                   Lean more here: http://stackoverflow.com/questions/1058158/can-somebody-explain-jquery-queue-to-me */if((opts.queue===""||opts.queue==="fx")&&$.queue(element)[0]!=="inprogress"){$.dequeue(element);}} /**************************
               Element Set Iteration
            **************************/ /* If the "nodeType" property exists on the elements variable, we're animating a single element.
               Place it in an array so that $.each() can iterate over it. */$.each(elements,function(i,element){ /* Ensure each element in a set has a nodeType (is a real element) to avoid throwing errors. */if(Type.isNode(element)){processElement.call(element);}}); /******************
               Option: Loop
            ******************/ /* The loop option accepts an integer indicating how many times the element should loop between the values in the
               current call's properties map and the element's property values prior to this call. */ /* Note: The loop option's logic is performed here -- after element processing -- because the current call needs
               to undergo its queue insertion prior to the loop option generating its series of constituent "reverse" calls,
               which chain after the current call. Two reverse calls (two "alternations") constitute one loop. */var opts=$.extend({},Velocity.defaults,options),reverseCallsCount;opts.loop=parseInt(opts.loop);reverseCallsCount=opts.loop*2-1;if(opts.loop){ /* Double the loop count to convert it into its appropriate number of "reverse" calls.
                   Subtract 1 from the resulting value since the current call is included in the total alternation count. */for(var x=0;x<reverseCallsCount;x++){ /* Since the logic for the reverse action occurs inside Queueing and therefore this call's options object
                       isn't parsed until then as well, the current call's delay option must be explicitly passed into the reverse
                       call so that the delay logic that occurs inside *Pre-Queueing* can process it. */var reverseOptions={delay:opts.delay,progress:opts.progress}; /* If a complete callback was passed into this call, transfer it to the loop redirect's final "reverse" call
                       so that it's triggered when the entire redirect is complete (and not when the very first animation is complete). */if(x===reverseCallsCount-1){reverseOptions.display=opts.display;reverseOptions.visibility=opts.visibility;reverseOptions.complete=opts.complete;}animate(elements,"reverse",reverseOptions);}} /***************
                Chaining
            ***************/ /* Return the elements back to the call chain, with wrapped elements taking precedence in case Velocity was called via the $.fn. extension. */return getChain();}; /* Turn Velocity into the animation function, extended with the pre-existing Velocity object. */Velocity=$.extend(animate,Velocity); /* For legacy support, also expose the literal animate method. */Velocity.animate=animate; /**************
            Timing
        **************/ /* Ticker function. */var ticker=window.requestAnimationFrame||rAFShim; /* Inactive browser tabs pause rAF, which results in all active animations immediately sprinting to their completion states when the tab refocuses.
           To get around this, we dynamically switch rAF to setTimeout (which the browser *doesn't* pause) when the tab loses focus. We skip this for mobile
           devices to avoid wasting battery power on inactive tabs. */ /* Note: Tab focus detection doesn't work on older versions of IE, but that's okay since they don't support rAF to begin with. */if(!Velocity.State.isMobile&&document.hidden!==undefined){document.addEventListener("visibilitychange",function(){ /* Reassign the rAF function (which the global tick() function uses) based on the tab's focus state. */if(document.hidden){ticker=function ticker(callback){ /* The tick function needs a truthy first argument in order to pass its internal timestamp check. */return setTimeout(function(){callback(true);},16);}; /* The rAF loop has been paused by the browser, so we manually restart the tick. */tick();}else {ticker=window.requestAnimationFrame||rAFShim;}});} /************
            Tick
        ************/ /* Note: All calls to Velocity are pushed to the Velocity.State.calls array, which is fully iterated through upon each tick. */function tick(timestamp){ /* An empty timestamp argument indicates that this is the first tick occurence since ticking was turned on.
               We leverage this metadata to fully ignore the first tick pass since RAF's initial pass is fired whenever
               the browser's next tick sync time occurs, which results in the first elements subjected to Velocity
               calls being animated out of sync with any elements animated immediately thereafter. In short, we ignore
               the first RAF tick pass so that elements being immediately consecutively animated -- instead of simultaneously animated
               by the same Velocity call -- are properly batched into the same initial RAF tick and consequently remain in sync thereafter. */if(timestamp){ /* We ignore RAF's high resolution timestamp since it can be significantly offset when the browser is
                   under high stress; we opt for choppiness over allowing the browser to drop huge chunks of frames. */var timeCurrent=new Date().getTime(); /********************
                   Call Iteration
                ********************/var callsLength=Velocity.State.calls.length; /* To speed up iterating over this array, it is compacted (falsey items -- calls that have completed -- are removed)
                   when its length has ballooned to a point that can impact tick performance. This only becomes necessary when animation
                   has been continuous with many elements over a long period of time; whenever all active calls are completed, completeCall() clears Velocity.State.calls. */if(callsLength>10000){Velocity.State.calls=compactSparseArray(Velocity.State.calls);} /* Iterate through each active call. */for(var i=0;i<callsLength;i++){ /* When a Velocity call is completed, its Velocity.State.calls entry is set to false. Continue on to the next call. */if(!Velocity.State.calls[i]){continue;} /************************
                       Call-Wide Variables
                    ************************/var callContainer=Velocity.State.calls[i],call=callContainer[0],opts=callContainer[2],timeStart=callContainer[3],firstTick=!!timeStart,tweenDummyValue=null; /* If timeStart is undefined, then this is the first time that this call has been processed by tick().
                       We assign timeStart now so that its value is as close to the real animation start time as possible.
                       (Conversely, had timeStart been defined when this call was added to Velocity.State.calls, the delay
                       between that time and now would cause the first few frames of the tween to be skipped since
                       percentComplete is calculated relative to timeStart.) */ /* Further, subtract 16ms (the approximate resolution of RAF) from the current time value so that the
                       first tick iteration isn't wasted by animating at 0% tween completion, which would produce the
                       same style value as the element's current value. */if(!timeStart){timeStart=Velocity.State.calls[i][3]=timeCurrent-16;} /* The tween's completion percentage is relative to the tween's start time, not the tween's start value
                       (which would result in unpredictable tween durations since JavaScript's timers are not particularly accurate).
                       Accordingly, we ensure that percentComplete does not exceed 1. */var percentComplete=Math.min((timeCurrent-timeStart)/opts.duration,1); /**********************
                       Element Iteration
                    **********************/ /* For every call, iterate through each of the elements in its set. */for(var j=0,callLength=call.length;j<callLength;j++){var tweensContainer=call[j],element=tweensContainer.element; /* Check to see if this element has been deleted midway through the animation by checking for the
                           continued existence of its data cache. If it's gone, skip animating this element. */if(!Data(element)){continue;}var transformPropertyExists=false; /**********************************
                           Display & Visibility Toggling
                        **********************************/ /* If the display option is set to non-"none", set it upfront so that the element can become visible before tweening begins.
                           (Otherwise, display's "none" value is set in completeCall() once the animation has completed.) */if(opts.display!==undefined&&opts.display!==null&&opts.display!=="none"){if(opts.display==="flex"){var flexValues=["-webkit-box","-moz-box","-ms-flexbox","-webkit-flex"];$.each(flexValues,function(i,flexValue){CSS.setPropertyValue(element,"display",flexValue);});}CSS.setPropertyValue(element,"display",opts.display);} /* Same goes with the visibility option, but its "none" equivalent is "hidden". */if(opts.visibility!==undefined&&opts.visibility!=="hidden"){CSS.setPropertyValue(element,"visibility",opts.visibility);} /************************
                           Property Iteration
                        ************************/ /* For every element, iterate through each property. */for(var property in tweensContainer){ /* Note: In addition to property tween data, tweensContainer contains a reference to its associated element. */if(property!=="element"){var tween=tweensContainer[property],currentValue, /* Easing can either be a pre-genereated function or a string that references a pre-registered easing
                                       on the Velocity.Easings object. In either case, return the appropriate easing *function*. */easing=Type.isString(tween.easing)?Velocity.Easings[tween.easing]:tween.easing; /******************************
                                   Current Value Calculation
                                ******************************/ /* If this is the last tick pass (if we've reached 100% completion for this tween),
                                   ensure that currentValue is explicitly set to its target endValue so that it's not subjected to any rounding. */if(percentComplete===1){currentValue=tween.endValue; /* Otherwise, calculate currentValue based on the current delta from startValue. */}else {var tweenDelta=tween.endValue-tween.startValue;currentValue=tween.startValue+tweenDelta*easing(percentComplete,opts,tweenDelta); /* If no value change is occurring, don't proceed with DOM updating. */if(!firstTick&&currentValue===tween.currentValue){continue;}}tween.currentValue=currentValue; /* If we're tweening a fake 'tween' property in order to log transition values, update the one-per-call variable so that
                                   it can be passed into the progress callback. */if(property==="tween"){tweenDummyValue=currentValue;}else { /******************
                                       Hooks: Part I
                                    ******************/ /* For hooked properties, the newly-updated rootPropertyValueCache is cached onto the element so that it can be used
                                       for subsequent hooks in this call that are associated with the same root property. If we didn't cache the updated
                                       rootPropertyValue, each subsequent update to the root property in this tick pass would reset the previous hook's
                                       updates to rootPropertyValue prior to injection. A nice performance byproduct of rootPropertyValue caching is that
                                       subsequently chained animations using the same hookRoot but a different hook can use this cached rootPropertyValue. */if(CSS.Hooks.registered[property]){var hookRoot=CSS.Hooks.getRoot(property),rootPropertyValueCache=Data(element).rootPropertyValueCache[hookRoot];if(rootPropertyValueCache){tween.rootPropertyValue=rootPropertyValueCache;}} /*****************
                                        DOM Update
                                    *****************/ /* setPropertyValue() returns an array of the property name and property value post any normalization that may have been performed. */ /* Note: To solve an IE<=8 positioning bug, the unit type is dropped when setting a property value of 0. */var adjustedSetData=CSS.setPropertyValue(element, /* SET */property,tween.currentValue+(parseFloat(currentValue)===0?"":tween.unitType),tween.rootPropertyValue,tween.scrollData); /*******************
                                       Hooks: Part II
                                    *******************/ /* Now that we have the hook's updated rootPropertyValue (the post-processed value provided by adjustedSetData), cache it onto the element. */if(CSS.Hooks.registered[property]){ /* Since adjustedSetData contains normalized data ready for DOM updating, the rootPropertyValue needs to be re-extracted from its normalized form. ?? */if(CSS.Normalizations.registered[hookRoot]){Data(element).rootPropertyValueCache[hookRoot]=CSS.Normalizations.registered[hookRoot]("extract",null,adjustedSetData[1]);}else {Data(element).rootPropertyValueCache[hookRoot]=adjustedSetData[1];}} /***************
                                       Transforms
                                    ***************/ /* Flag whether a transform property is being animated so that flushTransformCache() can be triggered once this tick pass is complete. */if(adjustedSetData[0]==="transform"){transformPropertyExists=true;}}}} /****************
                            mobileHA
                        ****************/ /* If mobileHA is enabled, set the translate3d transform to null to force hardware acceleration.
                           It's safe to override this property since Velocity doesn't actually support its animation (hooks are used in its place). */if(opts.mobileHA){ /* Don't set the null transform hack if we've already done so. */if(Data(element).transformCache.translate3d===undefined){ /* All entries on the transformCache object are later concatenated into a single transform string via flushTransformCache(). */Data(element).transformCache.translate3d="(0px, 0px, 0px)";transformPropertyExists=true;}}if(transformPropertyExists){CSS.flushTransformCache(element);}} /* The non-"none" display value is only applied to an element once -- when its associated call is first ticked through.
                       Accordingly, it's set to false so that it isn't re-processed by this call in the next tick. */if(opts.display!==undefined&&opts.display!=="none"){Velocity.State.calls[i][2].display=false;}if(opts.visibility!==undefined&&opts.visibility!=="hidden"){Velocity.State.calls[i][2].visibility=false;} /* Pass the elements and the timing data (percentComplete, msRemaining, timeStart, tweenDummyValue) into the progress callback. */if(opts.progress){opts.progress.call(callContainer[1],callContainer[1],percentComplete,Math.max(0,timeStart+opts.duration-timeCurrent),timeStart,tweenDummyValue);} /* If this call has finished tweening, pass its index to completeCall() to handle call cleanup. */if(percentComplete===1){completeCall(i);}}} /* Note: completeCall() sets the isTicking flag to false when the last call on Velocity.State.calls has completed. */if(Velocity.State.isTicking){ticker(tick);}} /**********************
            Call Completion
        **********************/ /* Note: Unlike tick(), which processes all active calls at once, call completion is handled on a per-call basis. */function completeCall(callIndex,isStopped){ /* Ensure the call exists. */if(!Velocity.State.calls[callIndex]){return false;} /* Pull the metadata from the call. */var call=Velocity.State.calls[callIndex][0],elements=Velocity.State.calls[callIndex][1],opts=Velocity.State.calls[callIndex][2],resolver=Velocity.State.calls[callIndex][4];var remainingCallsExist=false; /*************************
               Element Finalization
            *************************/for(var i=0,callLength=call.length;i<callLength;i++){var element=call[i].element; /* If the user set display to "none" (intending to hide the element), set it now that the animation has completed. */ /* Note: display:none isn't set when calls are manually stopped (via Velocity("stop"). */ /* Note: Display gets ignored with "reverse" calls and infinite loops, since this behavior would be undesirable. */if(!isStopped&&!opts.loop){if(opts.display==="none"){CSS.setPropertyValue(element,"display",opts.display);}if(opts.visibility==="hidden"){CSS.setPropertyValue(element,"visibility",opts.visibility);}} /* If the element's queue is empty (if only the "inprogress" item is left at position 0) or if its queue is about to run
                   a non-Velocity-initiated entry, turn off the isAnimating flag. A non-Velocity-initiatied queue entry's logic might alter
                   an element's CSS values and thereby cause Velocity's cached value data to go stale. To detect if a queue entry was initiated by Velocity,
                   we check for the existence of our special Velocity.queueEntryFlag declaration, which minifiers won't rename since the flag
                   is assigned to jQuery's global $ object and thus exists out of Velocity's own scope. */if(opts.loop!==true&&($.queue(element)[1]===undefined||!/\.velocityQueueEntryFlag/i.test($.queue(element)[1]))){ /* The element may have been deleted. Ensure that its data cache still exists before acting on it. */if(Data(element)){Data(element).isAnimating=false; /* Clear the element's rootPropertyValueCache, which will become stale. */Data(element).rootPropertyValueCache={};var transformHAPropertyExists=false; /* If any 3D transform subproperty is at its default value (regardless of unit type), remove it. */$.each(CSS.Lists.transforms3D,function(i,transformName){var defaultValue=/^scale/.test(transformName)?1:0,currentValue=Data(element).transformCache[transformName];if(Data(element).transformCache[transformName]!==undefined&&new RegExp("^\\("+defaultValue+"[^.]").test(currentValue)){transformHAPropertyExists=true;delete Data(element).transformCache[transformName];}}); /* Mobile devices have hardware acceleration removed at the end of the animation in order to avoid hogging the GPU's memory. */if(opts.mobileHA){transformHAPropertyExists=true;delete Data(element).transformCache.translate3d;} /* Flush the subproperty removals to the DOM. */if(transformHAPropertyExists){CSS.flushTransformCache(element);} /* Remove the "velocity-animating" indicator class. */CSS.Values.removeClass(element,"velocity-animating");}} /*********************
                   Option: Complete
                *********************/ /* Complete is fired once per call (not once per element) and is passed the full raw DOM element set as both its context and its first argument. */ /* Note: Callbacks aren't fired when calls are manually stopped (via Velocity("stop"). */if(!isStopped&&opts.complete&&!opts.loop&&i===callLength-1){ /* We throw callbacks in a setTimeout so that thrown errors don't halt the execution of Velocity itself. */try{opts.complete.call(elements,elements);}catch(error){setTimeout(function(){throw error;},1);}} /**********************
                   Promise Resolving
                **********************/ /* Note: Infinite loops don't return promises. */if(resolver&&opts.loop!==true){resolver(elements);} /****************************
                   Option: Loop (Infinite)
                ****************************/if(Data(element)&&opts.loop===true&&!isStopped){ /* If a rotateX/Y/Z property is being animated to 360 deg with loop:true, swap tween start/end values to enable
                       continuous iterative rotation looping. (Otherise, the element would just rotate back and forth.) */$.each(Data(element).tweensContainer,function(propertyName,tweenContainer){if(/^rotate/.test(propertyName)&&parseFloat(tweenContainer.endValue)===360){tweenContainer.endValue=0;tweenContainer.startValue=360;}if(/^backgroundPosition/.test(propertyName)&&parseFloat(tweenContainer.endValue)===100&&tweenContainer.unitType==="%"){tweenContainer.endValue=0;tweenContainer.startValue=100;}});Velocity(element,"reverse",{loop:true,delay:opts.delay});} /***************
                   Dequeueing
                ***************/ /* Fire the next call in the queue so long as this call's queue wasn't set to false (to trigger a parallel animation),
                   which would have already caused the next call to fire. Note: Even if the end of the animation queue has been reached,
                   $.dequeue() must still be called in order to completely clear jQuery's animation queue. */if(opts.queue!==false){$.dequeue(element,opts.queue);}} /************************
               Calls Array Cleanup
            ************************/ /* Since this call is complete, set it to false so that the rAF tick skips it. This array is later compacted via compactSparseArray().
              (For performance reasons, the call is set to false instead of being deleted from the array: http://www.html5rocks.com/en/tutorials/speed/v8/) */Velocity.State.calls[callIndex]=false; /* Iterate through the calls array to determine if this was the final in-progress animation.
               If so, set a flag to end ticking and clear the calls array. */for(var j=0,callsLength=Velocity.State.calls.length;j<callsLength;j++){if(Velocity.State.calls[j]!==false){remainingCallsExist=true;break;}}if(remainingCallsExist===false){ /* tick() will detect this flag upon its next iteration and subsequently turn itself off. */Velocity.State.isTicking=false; /* Clear the calls array so that its length is reset. */delete Velocity.State.calls;Velocity.State.calls=[];}} /******************
            Frameworks
        ******************/ /* Both jQuery and Zepto allow their $.fn object to be extended to allow wrapped elements to be subjected to plugin calls.
           If either framework is loaded, register a "velocity" extension pointing to Velocity's core animate() method.  Velocity
           also registers itself onto a global container (window.jQuery || window.Zepto || window) so that certain features are
           accessible beyond just a per-element scope. This master object contains an .animate() method, which is later assigned to $.fn
           (if jQuery or Zepto are present). Accordingly, Velocity can both act on wrapped DOM elements and stand alone for targeting raw DOM elements. */global.Velocity=Velocity;if(global!==window){ /* Assign the element function to Velocity's core animate() method. */global.fn.velocity=animate; /* Assign the object function's defaults to Velocity's global defaults object. */global.fn.velocity.defaults=Velocity.defaults;} /***********************
           Packaged Redirects
        ***********************/ /* slideUp, slideDown */$.each(["Down","Up"],function(i,direction){Velocity.Redirects["slide"+direction]=function(element,options,elementsIndex,elementsSize,elements,promiseData){var opts=$.extend({},options),begin=opts.begin,complete=opts.complete,computedValues={height:"",marginTop:"",marginBottom:"",paddingTop:"",paddingBottom:""},inlineValues={};if(opts.display===undefined){ /* Show the element before slideDown begins and hide the element after slideUp completes. */ /* Note: Inline elements cannot have dimensions animated, so they're reverted to inline-block. */opts.display=direction==="Down"?Velocity.CSS.Values.getDisplayType(element)==="inline"?"inline-block":"block":"none";}opts.begin=function(){ /* If the user passed in a begin callback, fire it now. */begin&&begin.call(elements,elements); /* Cache the elements' original vertical dimensional property values so that we can animate back to them. */for(var property in computedValues){inlineValues[property]=element.style[property]; /* For slideDown, use forcefeeding to animate all vertical properties from 0. For slideUp,
                           use forcefeeding to start from computed values and animate down to 0. */var propertyValue=Velocity.CSS.getPropertyValue(element,property);computedValues[property]=direction==="Down"?[propertyValue,0]:[0,propertyValue];} /* Force vertical overflow content to clip so that sliding works as expected. */inlineValues.overflow=element.style.overflow;element.style.overflow="hidden";};opts.complete=function(){ /* Reset element to its pre-slide inline values once its slide animation is complete. */for(var property in inlineValues){element.style[property]=inlineValues[property];} /* If the user passed in a complete callback, fire it now. */complete&&complete.call(elements,elements);promiseData&&promiseData.resolver(elements);};Velocity(element,computedValues,opts);};}); /* fadeIn, fadeOut */$.each(["In","Out"],function(i,direction){Velocity.Redirects["fade"+direction]=function(element,options,elementsIndex,elementsSize,elements,promiseData){var opts=$.extend({},options),propertiesMap={opacity:direction==="In"?1:0},originalComplete=opts.complete; /* Since redirects are triggered individually for each element in the animated set, avoid repeatedly triggering
                   callbacks by firing them only when the final element has been reached. */if(elementsIndex!==elementsSize-1){opts.complete=opts.begin=null;}else {opts.complete=function(){if(originalComplete){originalComplete.call(elements,elements);}promiseData&&promiseData.resolver(elements);};} /* If a display was passed in, use it. Otherwise, default to "none" for fadeOut or the element-specific default for fadeIn. */ /* Note: We allow users to pass in "null" to skip display setting altogether. */if(opts.display===undefined){opts.display=direction==="In"?"auto":"none";}Velocity(this,propertiesMap,opts);};});return Velocity;}(window.jQuery||window.Zepto||window,window,document);}); /******************
       Known Issues
    ******************/ /* The CSS spec mandates that the translateX/Y/Z transforms are %-relative to the element itself -- not its parent.
    Velocity, however, doesn't make this distinction. Thus, converting to or from the % unit with these subproperties
    will produce an inaccurate conversion value. The same issue exists with the cx/cy attributes of SVG circles and ellipses. */
    });

    var Velocity = (velocity && typeof velocity === 'object' && 'default' in velocity ? velocity['default'] : velocity);

    var velocity_ui = __commonjs(function (module, exports) {
    /**********************
       Velocity UI Pack
    **********************/

    /* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

    ;(function (factory) {
        /* CommonJS module. */
        if (typeof require === "function" && (typeof exports === "undefined" ? "undefined" : babelHelpers.typeof(exports)) === "object") {
            module.exports = factory();
            /* AMD module. */
        } else if (typeof define === "function" && define.amd) {
                define(["velocity"], factory);
                /* Browser globals. */
            } else {
                    factory();
                }
    })(function () {
        return function (global, window, document, undefined) {

            /*************
                Checks
            *************/

            if (!global.Velocity || !global.Velocity.Utilities) {
                window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
                return;
            } else {
                var Velocity = global.Velocity,
                    $ = Velocity.Utilities;
            }

            var velocityVersion = Velocity.version,
                requiredVersion = { major: 1, minor: 1, patch: 0 };

            function greaterSemver(primary, secondary) {
                var versionInts = [];

                if (!primary || !secondary) {
                    return false;
                }

                $.each([primary, secondary], function (i, versionObject) {
                    var versionIntsComponents = [];

                    $.each(versionObject, function (component, value) {
                        while (value.toString().length < 5) {
                            value = "0" + value;
                        }
                        versionIntsComponents.push(value);
                    });

                    versionInts.push(versionIntsComponents.join(""));
                });

                return parseFloat(versionInts[0]) > parseFloat(versionInts[1]);
            }

            if (greaterSemver(requiredVersion, velocityVersion)) {
                var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
                alert(abortError);
                throw new Error(abortError);
            }

            /************************
               Effect Registration
            ************************/

            /* Note: RegisterUI is a legacy name. */
            Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
                /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
                function animateParentHeight(elements, direction, totalDuration, stagger) {
                    var totalHeightDelta = 0,
                        parentNode;

                    /* Sum the total height (including padding and margin) of all targeted elements. */
                    $.each(elements.nodeType ? [elements] : elements, function (i, element) {
                        if (stagger) {
                            /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                            totalDuration += i * stagger;
                        }

                        parentNode = element.parentNode;

                        $.each(["height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function (i, property) {
                            totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                        });
                    });

                    /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
                    Velocity.animate(parentNode, { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta }, { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) });
                }

                /* Register a custom redirect for each effect. */
                Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
                    var finalElement = elementsIndex === elementsSize - 1;

                    if (typeof properties.defaultDuration === "function") {
                        properties.defaultDuration = properties.defaultDuration.call(elements, elements);
                    } else {
                        properties.defaultDuration = parseFloat(properties.defaultDuration);
                    }

                    /* Iterate through each effect's call array. */
                    for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                        var call = properties.calls[callIndex],
                            propertyMap = call[0],
                            redirectDuration = redirectOptions.duration || properties.defaultDuration || 1000,
                            durationPercentage = call[1],
                            callOptions = call[2] || {},
                            opts = {};

                        /* Assign the whitelisted per-call options. */
                        opts.duration = redirectDuration * (durationPercentage || 1);
                        opts.queue = redirectOptions.queue || "";
                        opts.easing = callOptions.easing || "ease";
                        opts.delay = parseFloat(callOptions.delay) || 0;
                        opts._cacheValues = callOptions._cacheValues || true;

                        /* Special processing for the first effect call. */
                        if (callIndex === 0) {
                            /* If a delay was passed into the redirect, combine it with the first call's delay. */
                            opts.delay += parseFloat(redirectOptions.delay) || 0;

                            if (elementsIndex === 0) {
                                opts.begin = function () {
                                    /* Only trigger a begin callback on the first effect call with the first element in the set. */
                                    redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                                    var direction = effectName.match(/(In|Out)$/);

                                    /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                                       and the first RAF tick. */
                                    if (direction && direction[0] === "In" && propertyMap.opacity !== undefined) {
                                        $.each(elements.nodeType ? [elements] : elements, function (i, element) {
                                            Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                        });
                                    }

                                    /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                                    if (redirectOptions.animateParentHeight && direction) {
                                        animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                                    }
                                };
                            }

                            /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                            if (redirectOptions.display !== null) {
                                if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                                    opts.display = redirectOptions.display;
                                } else if (/In$/.test(effectName)) {
                                    /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                                    var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                                    opts.display = defaultDisplay === "inline" ? "inline-block" : defaultDisplay;
                                }
                            }

                            if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                                opts.visibility = redirectOptions.visibility;
                            }
                        }

                        /* Special processing for the last effect call. */
                        if (callIndex === properties.calls.length - 1) {
                            (function () {
                                /* Append promise resolving onto the user's redirect callback. */

                                var injectFinalCallbacks = function injectFinalCallbacks() {
                                    if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                                        $.each(elements.nodeType ? [elements] : elements, function (i, element) {
                                            Velocity.CSS.setPropertyValue(element, "display", "none");
                                        });
                                    }

                                    redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                                    if (promiseData) {
                                        promiseData.resolver(elements || element);
                                    }
                                };

                                opts.complete = function () {
                                    if (properties.reset) {
                                        for (var resetProperty in properties.reset) {
                                            var resetValue = properties.reset[resetProperty];

                                            /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                               immediately and DOM querying is avoided (via forcefeeding). */
                                            /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                            if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                                properties.reset[resetProperty] = [properties.reset[resetProperty], properties.reset[resetProperty]];
                                            }
                                        }

                                        /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                                        var resetOptions = { duration: 0, queue: false };

                                        /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                                        if (finalElement) {
                                            resetOptions.complete = injectFinalCallbacks;
                                        }

                                        Velocity.animate(element, properties.reset, resetOptions);
                                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                                    } else if (finalElement) {
                                            injectFinalCallbacks();
                                        }
                                };

                                if (redirectOptions.visibility === "hidden") {
                                    opts.visibility = redirectOptions.visibility;
                                }
                            })();
                        }

                        Velocity.animate(element, propertyMap, opts);
                    }
                };

                /* Return the Velocity object so that RegisterUI calls can be chained. */
                return Velocity;
            };

            /*********************
               Packaged Effects
            *********************/

            /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
            /* Support: <=IE8: Callouts will have no effect, and transitions will simply fade in/out. IE9/Android 2.3: Most effects are fully supported, the rest fade in/out. All other browsers: full support. */
            Velocity.RegisterEffect.packagedEffects = {
                /* Animate.css */
                "callout.bounce": {
                    defaultDuration: 550,
                    calls: [[{ translateY: -30 }, 0.25], [{ translateY: 0 }, 0.125], [{ translateY: -15 }, 0.125], [{ translateY: 0 }, 0.25]]
                },
                /* Animate.css */
                "callout.shake": {
                    defaultDuration: 800,
                    calls: [[{ translateX: -11 }, 0.125], [{ translateX: 11 }, 0.125], [{ translateX: -11 }, 0.125], [{ translateX: 11 }, 0.125], [{ translateX: -11 }, 0.125], [{ translateX: 11 }, 0.125], [{ translateX: -11 }, 0.125], [{ translateX: 0 }, 0.125]]
                },
                /* Animate.css */
                "callout.flash": {
                    defaultDuration: 1100,
                    calls: [[{ opacity: [0, "easeInOutQuad", 1] }, 0.25], [{ opacity: [1, "easeInOutQuad"] }, 0.25], [{ opacity: [0, "easeInOutQuad"] }, 0.25], [{ opacity: [1, "easeInOutQuad"] }, 0.25]]
                },
                /* Animate.css */
                "callout.pulse": {
                    defaultDuration: 825,
                    calls: [[{ scaleX: 1.1, scaleY: 1.1 }, 0.50, { easing: "easeInExpo" }], [{ scaleX: 1, scaleY: 1 }, 0.50]]
                },
                /* Animate.css */
                "callout.swing": {
                    defaultDuration: 950,
                    calls: [[{ rotateZ: 15 }, 0.20], [{ rotateZ: -10 }, 0.20], [{ rotateZ: 5 }, 0.20], [{ rotateZ: -5 }, 0.20], [{ rotateZ: 0 }, 0.20]]
                },
                /* Animate.css */
                "callout.tada": {
                    defaultDuration: 1000,
                    calls: [[{ scaleX: 0.9, scaleY: 0.9, rotateZ: -3 }, 0.10], [{ scaleX: 1.1, scaleY: 1.1, rotateZ: 3 }, 0.10], [{ scaleX: 1.1, scaleY: 1.1, rotateZ: -3 }, 0.10], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], ["reverse", 0.125], [{ scaleX: 1, scaleY: 1, rotateZ: 0 }, 0.20]]
                },
                "transition.fadeIn": {
                    defaultDuration: 500,
                    calls: [[{ opacity: [1, 0] }]]
                },
                "transition.fadeOut": {
                    defaultDuration: 500,
                    calls: [[{ opacity: [0, 1] }]]
                },
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipXIn": {
                    defaultDuration: 700,
                    calls: [[{ opacity: [1, 0], transformPerspective: [800, 800], rotateY: [0, -55] }]],
                    reset: { transformPerspective: 0 }
                },
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipXOut": {
                    defaultDuration: 700,
                    calls: [[{ opacity: [0, 1], transformPerspective: [800, 800], rotateY: 55 }]],
                    reset: { transformPerspective: 0, rotateY: 0 }
                },
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipYIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], transformPerspective: [800, 800], rotateX: [0, -45] }]],
                    reset: { transformPerspective: 0 }
                },
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipYOut": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [0, 1], transformPerspective: [800, 800], rotateX: 25 }]],
                    reset: { transformPerspective: 0, rotateX: 0 }
                },
                /* Animate.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipBounceXIn": {
                    defaultDuration: 900,
                    calls: [[{ opacity: [0.725, 0], transformPerspective: [400, 400], rotateY: [-10, 90] }, 0.50], [{ opacity: 0.80, rotateY: 10 }, 0.25], [{ opacity: 1, rotateY: 0 }, 0.25]],
                    reset: { transformPerspective: 0 }
                },
                /* Animate.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipBounceXOut": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [0.9, 1], transformPerspective: [400, 400], rotateY: -10 }, 0.50], [{ opacity: 0, rotateY: 90 }, 0.50]],
                    reset: { transformPerspective: 0, rotateY: 0 }
                },
                /* Animate.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipBounceYIn": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [0.725, 0], transformPerspective: [400, 400], rotateX: [-10, 90] }, 0.50], [{ opacity: 0.80, rotateX: 10 }, 0.25], [{ opacity: 1, rotateX: 0 }, 0.25]],
                    reset: { transformPerspective: 0 }
                },
                /* Animate.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.flipBounceYOut": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [0.9, 1], transformPerspective: [400, 400], rotateX: -15 }, 0.50], [{ opacity: 0, rotateX: 90 }, 0.50]],
                    reset: { transformPerspective: 0, rotateX: 0 }
                },
                /* Magic.css */
                "transition.swoopIn": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [1, 0], transformOriginX: ["100%", "50%"], transformOriginY: ["100%", "100%"], scaleX: [1, 0], scaleY: [1, 0], translateX: [0, -700], translateZ: 0 }]],
                    reset: { transformOriginX: "50%", transformOriginY: "50%" }
                },
                /* Magic.css */
                "transition.swoopOut": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [0, 1], transformOriginX: ["50%", "100%"], transformOriginY: ["100%", "100%"], scaleX: 0, scaleY: 0, translateX: -700, translateZ: 0 }]],
                    reset: { transformOriginX: "50%", transformOriginY: "50%", scaleX: 1, scaleY: 1, translateX: 0 }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
                "transition.whirlIn": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [1, 0], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: [1, 0], scaleY: [1, 0], rotateY: [0, 160] }, 1, { easing: "easeInOutSine" }]]
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3. (Fades and scales only.) */
                "transition.whirlOut": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [0, "easeInOutQuint", 1], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: 0, scaleY: 0, rotateY: 160 }, 1, { easing: "swing" }]],
                    reset: { scaleX: 1, scaleY: 1, rotateY: 0 }
                },
                "transition.shrinkIn": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [1, 0], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: [1, 1.5], scaleY: [1, 1.5], translateZ: 0 }]]
                },
                "transition.shrinkOut": {
                    defaultDuration: 600,
                    calls: [[{ opacity: [0, 1], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: 1.3, scaleY: 1.3, translateZ: 0 }]],
                    reset: { scaleX: 1, scaleY: 1 }
                },
                "transition.expandIn": {
                    defaultDuration: 700,
                    calls: [[{ opacity: [1, 0], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: [1, 0.625], scaleY: [1, 0.625], translateZ: 0 }]]
                },
                "transition.expandOut": {
                    defaultDuration: 700,
                    calls: [[{ opacity: [0, 1], transformOriginX: ["50%", "50%"], transformOriginY: ["50%", "50%"], scaleX: 0.5, scaleY: 0.5, translateZ: 0 }]],
                    reset: { scaleX: 1, scaleY: 1 }
                },
                /* Animate.css */
                "transition.bounceIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], scaleX: [1.05, 0.3], scaleY: [1.05, 0.3] }, 0.40], [{ scaleX: 0.9, scaleY: 0.9, translateZ: 0 }, 0.20], [{ scaleX: 1, scaleY: 1 }, 0.50]]
                },
                /* Animate.css */
                "transition.bounceOut": {
                    defaultDuration: 800,
                    calls: [[{ scaleX: 0.95, scaleY: 0.95 }, 0.35], [{ scaleX: 1.1, scaleY: 1.1, translateZ: 0 }, 0.35], [{ opacity: [0, 1], scaleX: 0.3, scaleY: 0.3 }, 0.30]],
                    reset: { scaleX: 1, scaleY: 1 }
                },
                /* Animate.css */
                "transition.bounceUpIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], translateY: [-30, 1000] }, 0.60, { easing: "easeOutCirc" }], [{ translateY: 10 }, 0.20], [{ translateY: 0 }, 0.20]]
                },
                /* Animate.css */
                "transition.bounceUpOut": {
                    defaultDuration: 1000,
                    calls: [[{ translateY: 20 }, 0.20], [{ opacity: [0, "easeInCirc", 1], translateY: -1000 }, 0.80]],
                    reset: { translateY: 0 }
                },
                /* Animate.css */
                "transition.bounceDownIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], translateY: [30, -1000] }, 0.60, { easing: "easeOutCirc" }], [{ translateY: -10 }, 0.20], [{ translateY: 0 }, 0.20]]
                },
                /* Animate.css */
                "transition.bounceDownOut": {
                    defaultDuration: 1000,
                    calls: [[{ translateY: -20 }, 0.20], [{ opacity: [0, "easeInCirc", 1], translateY: 1000 }, 0.80]],
                    reset: { translateY: 0 }
                },
                /* Animate.css */
                "transition.bounceLeftIn": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [1, 0], translateX: [30, -1250] }, 0.60, { easing: "easeOutCirc" }], [{ translateX: -10 }, 0.20], [{ translateX: 0 }, 0.20]]
                },
                /* Animate.css */
                "transition.bounceLeftOut": {
                    defaultDuration: 750,
                    calls: [[{ translateX: 30 }, 0.20], [{ opacity: [0, "easeInCirc", 1], translateX: -1250 }, 0.80]],
                    reset: { translateX: 0 }
                },
                /* Animate.css */
                "transition.bounceRightIn": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [1, 0], translateX: [-30, 1250] }, 0.60, { easing: "easeOutCirc" }], [{ translateX: 10 }, 0.20], [{ translateX: 0 }, 0.20]]
                },
                /* Animate.css */
                "transition.bounceRightOut": {
                    defaultDuration: 750,
                    calls: [[{ translateX: -30 }, 0.20], [{ opacity: [0, "easeInCirc", 1], translateX: 1250 }, 0.80]],
                    reset: { translateX: 0 }
                },
                "transition.slideUpIn": {
                    defaultDuration: 900,
                    calls: [[{ opacity: [1, 0], translateY: [0, 20], translateZ: 0 }]]
                },
                "transition.slideUpOut": {
                    defaultDuration: 900,
                    calls: [[{ opacity: [0, 1], translateY: -20, translateZ: 0 }]],
                    reset: { translateY: 0 }
                },
                "transition.slideDownIn": {
                    defaultDuration: 900,
                    calls: [[{ opacity: [1, 0], translateY: [0, -20], translateZ: 0 }]]
                },
                "transition.slideDownOut": {
                    defaultDuration: 900,
                    calls: [[{ opacity: [0, 1], translateY: 20, translateZ: 0 }]],
                    reset: { translateY: 0 }
                },
                "transition.slideLeftIn": {
                    defaultDuration: 1000,
                    calls: [[{ opacity: [1, 0], translateX: [0, -20], translateZ: 0 }]]
                },
                "transition.slideLeftOut": {
                    defaultDuration: 1050,
                    calls: [[{ opacity: [0, 1], translateX: -20, translateZ: 0 }]],
                    reset: { translateX: 0 }
                },
                "transition.slideRightIn": {
                    defaultDuration: 1000,
                    calls: [[{ opacity: [1, 0], translateX: [0, 20], translateZ: 0 }]]
                },
                "transition.slideRightOut": {
                    defaultDuration: 1050,
                    calls: [[{ opacity: [0, 1], translateX: 20, translateZ: 0 }]],
                    reset: { translateX: 0 }
                },
                "transition.slideUpBigIn": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [1, 0], translateY: [0, 75], translateZ: 0 }]]
                },
                "transition.slideUpBigOut": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [0, 1], translateY: -75, translateZ: 0 }]],
                    reset: { translateY: 0 }
                },
                "transition.slideDownBigIn": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [1, 0], translateY: [0, -75], translateZ: 0 }]]
                },
                "transition.slideDownBigOut": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [0, 1], translateY: 75, translateZ: 0 }]],
                    reset: { translateY: 0 }
                },
                "transition.slideLeftBigIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], translateX: [0, -75], translateZ: 0 }]]
                },
                "transition.slideLeftBigOut": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [0, 1], translateX: -75, translateZ: 0 }]],
                    reset: { translateX: 0 }
                },
                "transition.slideRightBigIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], translateX: [0, 75], translateZ: 0 }]]
                },
                "transition.slideRightBigOut": {
                    defaultDuration: 750,
                    calls: [[{ opacity: [0, 1], translateX: 75, translateZ: 0 }]],
                    reset: { translateX: 0 }
                },
                /* Magic.css */
                "transition.perspectiveUpIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], transformPerspective: [800, 800], transformOriginX: [0, 0], transformOriginY: ["100%", "100%"], rotateX: [0, -180] }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveUpOut": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [0, 1], transformPerspective: [800, 800], transformOriginX: [0, 0], transformOriginY: ["100%", "100%"], rotateX: -180 }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveDownIn": {
                    defaultDuration: 800,
                    calls: [[{ opacity: [1, 0], transformPerspective: [800, 800], transformOriginX: [0, 0], transformOriginY: [0, 0], rotateX: [0, 180] }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveDownOut": {
                    defaultDuration: 850,
                    calls: [[{ opacity: [0, 1], transformPerspective: [800, 800], transformOriginX: [0, 0], transformOriginY: [0, 0], rotateX: 180 }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateX: 0 }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveLeftIn": {
                    defaultDuration: 950,
                    calls: [[{ opacity: [1, 0], transformPerspective: [2000, 2000], transformOriginX: [0, 0], transformOriginY: [0, 0], rotateY: [0, -180] }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveLeftOut": {
                    defaultDuration: 950,
                    calls: [[{ opacity: [0, 1], transformPerspective: [2000, 2000], transformOriginX: [0, 0], transformOriginY: [0, 0], rotateY: -180 }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveRightIn": {
                    defaultDuration: 950,
                    calls: [[{ opacity: [1, 0], transformPerspective: [2000, 2000], transformOriginX: ["100%", "100%"], transformOriginY: [0, 0], rotateY: [0, 180] }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%" }
                },
                /* Magic.css */
                /* Support: Loses rotation in IE9/Android 2.3 (fades only). */
                "transition.perspectiveRightOut": {
                    defaultDuration: 950,
                    calls: [[{ opacity: [0, 1], transformPerspective: [2000, 2000], transformOriginX: ["100%", "100%"], transformOriginY: [0, 0], rotateY: 180 }]],
                    reset: { transformPerspective: 0, transformOriginX: "50%", transformOriginY: "50%", rotateY: 0 }
                }
            };

            /* Register the packaged effects. */
            for (var effectName in Velocity.RegisterEffect.packagedEffects) {
                Velocity.RegisterEffect(effectName, Velocity.RegisterEffect.packagedEffects[effectName]);
            }

            /*********************
               Sequence Running
            **********************/

            /* Note: Sequence calls must use Velocity's single-object arguments syntax. */
            Velocity.RunSequence = function (originalSequence) {
                var sequence = $.extend(true, [], originalSequence);

                if (sequence.length > 1) {
                    $.each(sequence.reverse(), function (i, currentCall) {
                        var nextCall = sequence[i + 1];

                        if (nextCall) {
                            /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                               in the previous call's begin callback. Otherwise, chained calls are normally triggered
                               in the previous call's complete callback. */
                            var currentCallOptions = currentCall.o || currentCall.options,
                                nextCallOptions = nextCall.o || nextCall.options;

                            var timing = currentCallOptions && currentCallOptions.sequenceQueue === false ? "begin" : "complete",
                                callbackOriginal = nextCallOptions && nextCallOptions[timing],
                                options = {};

                            options[timing] = function () {
                                var nextCallElements = nextCall.e || nextCall.elements;
                                var elements = nextCallElements.nodeType ? [nextCallElements] : nextCallElements;

                                callbackOriginal && callbackOriginal.call(elements, elements);
                                Velocity(currentCall);
                            };

                            if (nextCall.o) {
                                nextCall.o = $.extend({}, nextCallOptions, options);
                            } else {
                                nextCall.options = $.extend({}, nextCallOptions, options);
                            }
                        }
                    });

                    sequence.reverse();
                }

                Velocity(sequence[0]);
            };
        }(window.jQuery || window.Zepto || window, window, document);
    });
    });

    var handleDom = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    var hasClass = function hasClass(elem, className) {
      return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
    };

    var addClass = function addClass(elem, className) {
      if (!hasClass(elem, className)) {
        elem.className += ' ' + className;
      }
    };

    var removeClass = function removeClass(elem, className) {
      var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
      if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0) {
          newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
      }
    };

    var escapeHtml = function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    };

    var _show = function _show(elem) {
      elem.style.opacity = '';
      elem.style.display = 'block';
    };

    var show = function show(elems) {
      if (elems && !elems.length) {
        return _show(elems);
      }
      for (var i = 0; i < elems.length; ++i) {
        _show(elems[i]);
      }
    };

    var _hide = function _hide(elem) {
      elem.style.opacity = '';
      elem.style.display = 'none';
    };

    var hide = function hide(elems) {
      if (elems && !elems.length) {
        return _hide(elems);
      }
      for (var i = 0; i < elems.length; ++i) {
        _hide(elems[i]);
      }
    };

    var isDescendant = function isDescendant(parent, child) {
      var node = child.parentNode;
      while (node !== null) {
        if (node === parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    };

    var getTopMargin = function getTopMargin(elem) {
      elem.style.left = '-9999px';
      elem.style.display = 'block';

      var height = elem.clientHeight,
          padding;
      if (typeof getComputedStyle !== 'undefined') {
        // IE 8
        padding = parseInt(getComputedStyle(elem).getPropertyValue('padding-top'), 10);
      } else {
        padding = parseInt(elem.currentStyle.padding);
      }

      elem.style.left = '';
      elem.style.display = 'none';
      return '-' + parseInt((height + padding) / 2) + 'px';
    };

    var fadeIn = function fadeIn(elem, interval) {
      if (+elem.style.opacity < 1) {
        interval = interval || 16;
        elem.style.opacity = 0;
        elem.style.display = 'block';
        var last = +new Date();
        var tick = function (_tick) {
          function tick() {
            return _tick.apply(this, arguments);
          }

          tick.toString = function () {
            return _tick.toString();
          };

          return tick;
        }(function () {
          elem.style.opacity = +elem.style.opacity + (new Date() - last) / 100;
          last = +new Date();

          if (+elem.style.opacity < 1) {
            setTimeout(tick, interval);
          }
        });
        tick();
      }
      elem.style.display = 'block'; //fallback IE8
    };

    var fadeOut = function fadeOut(elem, interval) {
      interval = interval || 16;
      elem.style.opacity = 1;
      var last = +new Date();
      var tick = function (_tick2) {
        function tick() {
          return _tick2.apply(this, arguments);
        }

        tick.toString = function () {
          return _tick2.toString();
        };

        return tick;
      }(function () {
        elem.style.opacity = +elem.style.opacity - (new Date() - last) / 100;
        last = +new Date();

        if (+elem.style.opacity > 0) {
          setTimeout(tick, interval);
        } else {
          elem.style.display = 'none';
        }
      });
      tick();
    };

    var fireClick = function fireClick(node) {
      // Taken from http://www.nonobtrusive.com/2011/11/29/programatically-fire-crossbrowser-click-event-with-javascript/
      // Then fixed for today's Chrome browser.
      if (typeof MouseEvent === 'function') {
        // Up-to-date approach
        var mevt = new MouseEvent('click', {
          view: window,
          bubbles: false,
          cancelable: true
        });
        node.dispatchEvent(mevt);
      } else if (document.createEvent) {
        // Fallback
        var evt = document.createEvent('MouseEvents');
        evt.initEvent('click', false, false);
        node.dispatchEvent(evt);
      } else if (document.createEventObject) {
        node.fireEvent('onclick');
      } else if (typeof node.onclick === 'function') {
        node.onclick();
      }
    };

    var stopEventPropagation = function stopEventPropagation(e) {
      // In particular, make sure the space bar doesn't scroll the main window.
      if (typeof e.stopPropagation === 'function') {
        e.stopPropagation();
        e.preventDefault();
      } else if (window.event && window.event.hasOwnProperty('cancelBubble')) {
        window.event.cancelBubble = true;
      }
    };

    exports.hasClass = hasClass;
    exports.addClass = addClass;
    exports.removeClass = removeClass;
    exports.escapeHtml = escapeHtml;
    exports._show = _show;
    exports.show = show;
    exports._hide = _hide;
    exports.hide = hide;
    exports.isDescendant = isDescendant;
    exports.getTopMargin = getTopMargin;
    exports.fadeIn = fadeIn;
    exports.fadeOut = fadeOut;
    exports.fireClick = fireClick;
    exports.stopEventPropagation = stopEventPropagation;
    });

    var require$$0$1 = (handleDom && typeof handleDom === 'object' && 'default' in handleDom ? handleDom['default'] : handleDom);

    var injectedHtml = __commonjs(function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var injectedHTML =

    // Dark overlay
    "<div class=\"sweet-overlay\" tabIndex=\"-1\"></div>" +

    // Modal
    "<div class=\"sweet-alert\">" +

    // Error icon
    "<div class=\"sa-icon sa-error\">\n      <span class=\"sa-x-mark\">\n        <span class=\"sa-line sa-left\"></span>\n        <span class=\"sa-line sa-right\"></span>\n      </span>\n    </div>" +

    // Warning icon
    "<div class=\"sa-icon sa-warning\">\n      <span class=\"sa-body\"></span>\n      <span class=\"sa-dot\"></span>\n    </div>" +

    // Info icon
    "<div class=\"sa-icon sa-info\"></div>" +

    // Success icon
    "<div class=\"sa-icon sa-success\">\n      <span class=\"sa-line sa-tip\"></span>\n      <span class=\"sa-line sa-long\"></span>\n\n      <div class=\"sa-placeholder\"></div>\n      <div class=\"sa-fix\"></div>\n    </div>" + "<div class=\"sa-icon sa-custom\"></div>" +

    // Title, text and input
    "<h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type=\"text\" tabIndex=\"3\" />\n      <div class=\"sa-input-error\"></div>\n    </fieldset>" +

    // Input errors
    "<div class=\"sa-error-container\">\n      <div class=\"icon\">!</div>\n      <p>Not valid!</p>\n    </div>" +

    // Cancel and confirm buttons
    "<div class=\"sa-button-container\">\n      <button class=\"cancel\" tabIndex=\"2\">Cancel</button>\n      <div class=\"sa-confirm-button-container\">\n        <button class=\"confirm\" tabIndex=\"1\">OK</button>" +

    // Loading animation
    "<div class=\"la-ball-fall\">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div>" +

    // End of modal
    "</div>";

    exports["default"] = injectedHTML;
    module.exports = exports["default"];
    });

    var require$$0$2 = (injectedHtml && typeof injectedHtml === 'object' && 'default' in injectedHtml ? injectedHtml['default'] : injectedHtml);

    var defaultParams = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    var defaultParams = {
      title: '',
      text: '',
      type: null,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: false,
      closeOnConfirm: true,
      closeOnCancel: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#8CD4F5',
      cancelButtonText: 'Cancel',
      imageUrl: null,
      imageSize: null,
      timer: null,
      customClass: '',
      html: false,
      animation: true,
      allowEscapeKey: true,
      inputType: 'text',
      inputPlaceholder: '',
      inputValue: '',
      showLoaderOnConfirm: false
    };

    exports['default'] = defaultParams;
    module.exports = exports['default'];
    });

    var require$$1$1 = (defaultParams && typeof defaultParams === 'object' && 'default' in defaultParams ? defaultParams['default'] : defaultParams);

    var utils = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    /*
     * Allow user to pass their own params
     */
    var extend = function extend(a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    };

    /*
     * Convert HEX codes to RGB values (#000000 -> rgb(0,0,0))
     */
    var hexToRgb = function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : null;
    };

    /*
     * Check if the user is using Internet Explorer 8 (for fallbacks)
     */
    var isIE8 = function isIE8() {
      return window.attachEvent && !window.addEventListener;
    };

    /*
     * IE compatible logging for developers
     */
    var logStr = function logStr(string) {
      if (window.console) {
        // IE...
        window.console.log('SweetAlert: ' + string);
      }
    };

    /*
     * Set hover, active and focus-states for buttons 
     * (source: http://www.sitepoint.com/javascript-generate-lighter-darker-color)
     */
    var colorLuminance = function colorLuminance(hex, lum) {
      // Validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      lum = lum || 0;

      // Convert to decimal and change luminosity
      var rgb = '#';
      var c;
      var i;

      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ('00' + c).substr(c.length);
      }

      return rgb;
    };

    exports.extend = extend;
    exports.hexToRgb = hexToRgb;
    exports.isIE8 = isIE8;
    exports.logStr = logStr;
    exports.colorLuminance = colorLuminance;
    });

    var require$$2 = (utils && typeof utils === 'object' && 'default' in utils ? utils['default'] : utils);

    var handleSwalDom = __commonjs(function (module, exports) {
    'use strict';

    var _interopRequireWildcard = function _interopRequireWildcard(obj) {
      return obj && obj.__esModule ? obj : { 'default': obj };
    };

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _hexToRgb = require$$2;

    var _removeClass$getTopMargin$fadeIn$show$addClass = require$$0$1;

    var _defaultParams = require$$1$1;

    var _defaultParams2 = _interopRequireWildcard(_defaultParams);

    /*
     * Add modal + overlay to DOM
     */

    var _injectedHTML = require$$0$2;

    var _injectedHTML2 = _interopRequireWildcard(_injectedHTML);

    var modalClass = '.sweet-alert';
    var overlayClass = '.sweet-overlay';

    var sweetAlertInitialize = function sweetAlertInitialize() {
      var sweetWrap = document.createElement('div');
      sweetWrap.innerHTML = _injectedHTML2['default'];

      // Append elements to body
      while (sweetWrap.firstChild) {
        document.body.appendChild(sweetWrap.firstChild);
      }
    };

    /*
     * Get DOM element of modal
     */
    var getModal = function (_getModal) {
      function getModal() {
        return _getModal.apply(this, arguments);
      }

      getModal.toString = function () {
        return _getModal.toString();
      };

      return getModal;
    }(function () {
      var $modal = document.querySelector(modalClass);

      if (!$modal) {
        sweetAlertInitialize();
        $modal = getModal();
      }

      return $modal;
    });

    /*
     * Get DOM element of input (in modal)
     */
    var getInput = function getInput() {
      var $modal = getModal();
      if ($modal) {
        return $modal.querySelector('input');
      }
    };

    /*
     * Get DOM element of overlay
     */
    var getOverlay = function getOverlay() {
      return document.querySelector(overlayClass);
    };

    /*
     * Add box-shadow style to button (depending on its chosen bg-color)
     */
    var setFocusStyle = function setFocusStyle($button, bgColor) {
      var rgbColor = _hexToRgb.hexToRgb(bgColor);
      $button.style.boxShadow = '0 0 2px rgba(' + rgbColor + ', 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)';
    };

    /*
     * Animation when opening modal
     */
    var openModal = function openModal(callback) {
      var $modal = getModal();
      _removeClass$getTopMargin$fadeIn$show$addClass.fadeIn(getOverlay(), 10);
      _removeClass$getTopMargin$fadeIn$show$addClass.show($modal);
      _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'showSweetAlert');
      _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'hideSweetAlert');

      window.previousActiveElement = document.activeElement;
      var $okButton = $modal.querySelector('button.confirm');
      $okButton.focus();

      setTimeout(function () {
        _removeClass$getTopMargin$fadeIn$show$addClass.addClass($modal, 'visible');
      }, 500);

      var timer = $modal.getAttribute('data-timer');

      if (timer !== 'null' && timer !== '') {
        var timerCallback = callback;
        $modal.timeout = setTimeout(function () {
          var doneFunctionExists = (timerCallback || null) && $modal.getAttribute('data-has-done-function') === 'true';
          if (doneFunctionExists) {
            timerCallback(null);
          } else {
            sweetAlert.close();
          }
        }, timer);
      }
    };

    /*
     * Reset the styling of the input
     * (for example if errors have been shown)
     */
    var resetInput = function resetInput() {
      var $modal = getModal();
      var $input = getInput();

      _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($modal, 'show-input');
      $input.value = _defaultParams2['default'].inputValue;
      $input.setAttribute('type', _defaultParams2['default'].inputType);
      $input.setAttribute('placeholder', _defaultParams2['default'].inputPlaceholder);

      resetInputError();
    };

    var resetInputError = function resetInputError(event) {
      // If press enter => ignore
      if (event && event.keyCode === 13) {
        return false;
      }

      var $modal = getModal();

      var $errorIcon = $modal.querySelector('.sa-input-error');
      _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorIcon, 'show');

      var $errorContainer = $modal.querySelector('.sa-error-container');
      _removeClass$getTopMargin$fadeIn$show$addClass.removeClass($errorContainer, 'show');
    };

    /*
     * Set "margin-top"-property on modal based on its computed height
     */
    var fixVerticalPosition = function fixVerticalPosition() {
      var $modal = getModal();
      $modal.style.marginTop = _removeClass$getTopMargin$fadeIn$show$addClass.getTopMargin(getModal());
    };

    exports.sweetAlertInitialize = sweetAlertInitialize;
    exports.getModal = getModal;
    exports.getOverlay = getOverlay;
    exports.getInput = getInput;
    exports.setFocusStyle = setFocusStyle;
    exports.openModal = openModal;
    exports.resetInput = resetInput;
    exports.resetInputError = resetInputError;
    exports.fixVerticalPosition = fixVerticalPosition;
    });

    var require$$1 = (handleSwalDom && typeof handleSwalDom === 'object' && 'default' in handleSwalDom ? handleSwalDom['default'] : handleSwalDom);

    var setParams = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _isIE8 = require$$2;

    var _getModal$getInput$setFocusStyle = require$$1;

    var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide = require$$0$1;

    var alertTypes = ['error', 'warning', 'info', 'success', 'input', 'prompt'];

    /*
     * Set type, text and actions on modal
     */
    var setParameters = function setParameters(params) {
      var modal = _getModal$getInput$setFocusStyle.getModal();

      var $title = modal.querySelector('h2');
      var $text = modal.querySelector('p');
      var $cancelBtn = modal.querySelector('button.cancel');
      var $confirmBtn = modal.querySelector('button.confirm');

      /*
       * Title
       */
      $title.innerHTML = params.html ? params.title : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.title).split('\n').join('<br>');

      /*
       * Text
       */
      $text.innerHTML = params.html ? params.text : _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.text || '').split('\n').join('<br>');
      if (params.text) _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($text);

      /*
       * Custom class
       */
      if (params.customClass) {
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, params.customClass);
        modal.setAttribute('data-custom-class', params.customClass);
      } else {
        // Find previously set classes and remove them
        var customClass = modal.getAttribute('data-custom-class');
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.removeClass(modal, customClass);
        modal.setAttribute('data-custom-class', '');
      }

      /*
       * Icon
       */
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide(modal.querySelectorAll('.sa-icon'));

      if (params.type && !_isIE8.isIE8()) {
        var _ret = function () {

          var validType = false;

          for (var i = 0; i < alertTypes.length; i++) {
            if (params.type === alertTypes[i]) {
              validType = true;
              break;
            }
          }

          if (!validType) {
            logStr('Unknown alert type: ' + params.type);
            return {
              v: false
            };
          }

          var typesWithIcons = ['success', 'error', 'warning', 'info'];
          var $icon = undefined;

          if (typesWithIcons.indexOf(params.type) !== -1) {
            $icon = modal.querySelector('.sa-icon.' + 'sa-' + params.type);
            _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($icon);
          }

          var $input = _getModal$getInput$setFocusStyle.getInput();

          // Animate icon
          switch (params.type) {

            case 'success':
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animate');
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-tip'), 'animateSuccessTip');
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-long'), 'animateSuccessLong');
              break;

            case 'error':
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'animateErrorIcon');
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-x-mark'), 'animateXMark');
              break;

            case 'warning':
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon, 'pulseWarning');
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-body'), 'pulseWarningIns');
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass($icon.querySelector('.sa-dot'), 'pulseWarningIns');
              break;

            case 'input':
            case 'prompt':
              $input.setAttribute('type', params.inputType);
              $input.value = params.inputValue;
              $input.setAttribute('placeholder', params.inputPlaceholder);
              _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.addClass(modal, 'show-input');
              setTimeout(function () {
                $input.focus();
                $input.addEventListener('keyup', swal.resetInputError);
              }, 400);
              break;
          }
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === 'object') {
          return _ret.v;
        }
      }

      /*
       * Custom image
       */
      if (params.imageUrl) {
        var $customIcon = modal.querySelector('.sa-icon.sa-custom');

        $customIcon.style.backgroundImage = 'url(' + params.imageUrl + ')';
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.show($customIcon);

        var _imgWidth = 80;
        var _imgHeight = 80;

        if (params.imageSize) {
          var dimensions = params.imageSize.toString().split('x');
          var imgWidth = dimensions[0];
          var imgHeight = dimensions[1];

          if (!imgWidth || !imgHeight) {
            logStr('Parameter imageSize expects value with format WIDTHxHEIGHT, got ' + params.imageSize);
          } else {
            _imgWidth = imgWidth;
            _imgHeight = imgHeight;
          }
        }

        $customIcon.setAttribute('style', $customIcon.getAttribute('style') + 'width:' + _imgWidth + 'px; height:' + _imgHeight + 'px');
      }

      /*
       * Show cancel button?
       */
      modal.setAttribute('data-has-cancel-button', params.showCancelButton);
      if (params.showCancelButton) {
        $cancelBtn.style.display = 'inline-block';
      } else {
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($cancelBtn);
      }

      /*
       * Show confirm button?
       */
      modal.setAttribute('data-has-confirm-button', params.showConfirmButton);
      if (params.showConfirmButton) {
        $confirmBtn.style.display = 'inline-block';
      } else {
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.hide($confirmBtn);
      }

      /*
       * Custom text on cancel/confirm buttons
       */
      if (params.cancelButtonText) {
        $cancelBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.cancelButtonText);
      }
      if (params.confirmButtonText) {
        $confirmBtn.innerHTML = _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide.escapeHtml(params.confirmButtonText);
      }

      /*
       * Custom color on confirm button
       */
      if (params.confirmButtonColor) {
        // Set confirm button to selected background color
        $confirmBtn.style.backgroundColor = params.confirmButtonColor;

        // Set the confirm button color to the loading ring
        $confirmBtn.style.borderLeftColor = params.confirmLoadingButtonColor;
        $confirmBtn.style.borderRightColor = params.confirmLoadingButtonColor;

        // Set box-shadow to default focused button
        _getModal$getInput$setFocusStyle.setFocusStyle($confirmBtn, params.confirmButtonColor);
      }

      /*
       * Allow outside click
       */
      modal.setAttribute('data-allow-outside-click', params.allowOutsideClick);

      /*
       * Callback function
       */
      var hasDoneFunction = params.doneFunction ? true : false;
      modal.setAttribute('data-has-done-function', hasDoneFunction);

      /*
       * Animation
       */
      if (!params.animation) {
        modal.setAttribute('data-animation', 'none');
      } else if (typeof params.animation === 'string') {
        modal.setAttribute('data-animation', params.animation); // Custom animation
      } else {
          modal.setAttribute('data-animation', 'pop');
        }

      /*
       * Timer
       */
      modal.setAttribute('data-timer', params.timer);
    };

    exports['default'] = setParameters;
    module.exports = exports['default'];
    });

    var require$$0 = (setParams && typeof setParams === 'object' && 'default' in setParams ? setParams['default'] : setParams);

    var handleKey = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _stopEventPropagation$fireClick = require$$0$1;

    var _setFocusStyle = require$$1;

    var handleKeyDown = function handleKeyDown(event, params, modal) {
      var e = event || window.event;
      var keyCode = e.keyCode || e.which;

      var $okButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');
      var $modalButtons = modal.querySelectorAll('button[tabindex]');

      if ([9, 13, 32, 27].indexOf(keyCode) === -1) {
        // Don't do work on keys we don't care about.
        return;
      }

      var $targetElement = e.target || e.srcElement;

      var btnIndex = -1; // Find the button - note, this is a nodelist, not an array.
      for (var i = 0; i < $modalButtons.length; i++) {
        if ($targetElement === $modalButtons[i]) {
          btnIndex = i;
          break;
        }
      }

      if (keyCode === 9) {
        // TAB
        if (btnIndex === -1) {
          // No button focused. Jump to the confirm button.
          $targetElement = $okButton;
        } else {
          // Cycle to the next button
          if (btnIndex === $modalButtons.length - 1) {
            $targetElement = $modalButtons[0];
          } else {
            $targetElement = $modalButtons[btnIndex + 1];
          }
        }

        _stopEventPropagation$fireClick.stopEventPropagation(e);
        $targetElement.focus();

        if (params.confirmButtonColor) {
          _setFocusStyle.setFocusStyle($targetElement, params.confirmButtonColor);
        }
      } else {
        if (keyCode === 13) {
          if ($targetElement.tagName === 'INPUT') {
            $targetElement = $okButton;
            $okButton.focus();
          }

          if (btnIndex === -1) {
            // ENTER/SPACE clicked outside of a button.
            $targetElement = $okButton;
          } else {
            // Do nothing - let the browser handle it.
            $targetElement = undefined;
          }
        } else if (keyCode === 27 && params.allowEscapeKey === true) {
          $targetElement = $cancelButton;
          _stopEventPropagation$fireClick.fireClick($targetElement, e);
        } else {
          // Fallback - let the browser handle it.
          $targetElement = undefined;
        }
      }
    };

    exports['default'] = handleKeyDown;
    module.exports = exports['default'];
    });

    var require$$2$1 = (handleKey && typeof handleKey === 'object' && 'default' in handleKey ? handleKey['default'] : handleKey);

    var handleClick = __commonjs(function (module, exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
      value: true
    });

    var _colorLuminance = require$$2;

    var _getModal = require$$1;

    var _hasClass$isDescendant = require$$0$1;

    /*
     * User clicked on "Confirm"/"OK" or "Cancel"
     */
    var handleButton = function handleButton(event, params, modal) {
      var e = event || window.event;
      var target = e.target || e.srcElement;

      var targetedConfirm = target.className.indexOf('confirm') !== -1;
      var targetedOverlay = target.className.indexOf('sweet-overlay') !== -1;
      var modalIsVisible = _hasClass$isDescendant.hasClass(modal, 'visible');
      var doneFunctionExists = params.doneFunction && modal.getAttribute('data-has-done-function') === 'true';

      // Since the user can change the background-color of the confirm button programmatically,
      // we must calculate what the color should be on hover/active
      var normalColor, hoverColor, activeColor;
      if (targetedConfirm && params.confirmButtonColor) {
        normalColor = params.confirmButtonColor;
        hoverColor = _colorLuminance.colorLuminance(normalColor, -0.04);
        activeColor = _colorLuminance.colorLuminance(normalColor, -0.14);
      }

      function shouldSetConfirmButtonColor(color) {
        if (targetedConfirm && params.confirmButtonColor) {
          target.style.backgroundColor = color;
        }
      }

      switch (e.type) {
        case 'mouseover':
          shouldSetConfirmButtonColor(hoverColor);
          break;

        case 'mouseout':
          shouldSetConfirmButtonColor(normalColor);
          break;

        case 'mousedown':
          shouldSetConfirmButtonColor(activeColor);
          break;

        case 'mouseup':
          shouldSetConfirmButtonColor(hoverColor);
          break;

        case 'focus':
          var $confirmButton = modal.querySelector('button.confirm');
          var $cancelButton = modal.querySelector('button.cancel');

          if (targetedConfirm) {
            $cancelButton.style.boxShadow = 'none';
          } else {
            $confirmButton.style.boxShadow = 'none';
          }
          break;

        case 'click':
          var clickedOnModal = modal === target;
          var clickedOnModalChild = _hasClass$isDescendant.isDescendant(modal, target);

          // Ignore click outside if allowOutsideClick is false
          if (!clickedOnModal && !clickedOnModalChild && modalIsVisible && !params.allowOutsideClick) {
            break;
          }

          if (targetedConfirm && doneFunctionExists && modalIsVisible) {
            handleConfirm(modal, params);
          } else if (doneFunctionExists && modalIsVisible || targetedOverlay) {
            handleCancel(modal, params);
          } else if (_hasClass$isDescendant.isDescendant(modal, target) && target.tagName === 'BUTTON') {
            sweetAlert.close();
          }
          break;
      }
    };

    /*
     *  User clicked on "Confirm"/"OK"
     */
    var handleConfirm = function handleConfirm(modal, params) {
      var callbackValue = true;

      if (_hasClass$isDescendant.hasClass(modal, 'show-input')) {
        callbackValue = modal.querySelector('input').value;

        if (!callbackValue) {
          callbackValue = '';
        }
      }

      params.doneFunction(callbackValue);

      if (params.closeOnConfirm) {
        sweetAlert.close();
      }
      // Disable cancel and confirm button if the parameter is true
      if (params.showLoaderOnConfirm) {
        sweetAlert.disableButtons();
      }
    };

    /*
     *  User clicked on "Cancel"
     */
    var handleCancel = function handleCancel(modal, params) {
      // Check if callback function expects a parameter (to track cancel actions)
      var functionAsStr = String(params.doneFunction).replace(/\s/g, '');
      var functionHandlesCancel = functionAsStr.substring(0, 9) === 'function(' && functionAsStr.substring(9, 10) !== ')';

      if (functionHandlesCancel) {
        params.doneFunction(false);
      }

      if (params.closeOnCancel) {
        sweetAlert.close();
      }
    };

    exports['default'] = {
      handleButton: handleButton,
      handleConfirm: handleConfirm,
      handleCancel: handleCancel
    };
    module.exports = exports['default'];
    });

    var require$$3 = (handleClick && typeof handleClick === 'object' && 'default' in handleClick ? handleClick['default'] : handleClick);

    var sweetalert = __commonjs(function (module, exports) {
    'use strict';

    var _interopRequireWildcard = function _interopRequireWildcard(obj) {
      return obj && obj.__esModule ? obj : { 'default': obj };
    };

    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    // SweetAlert
    // 2014-2015 (c) - Tristan Edwards
    // github.com/t4t5/sweetalert

    /*
     * jQuery-like functions for manipulating the DOM
     */

    var _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation = require$$0$1;

    /*
     * Handy utilities
     */

    var _extend$hexToRgb$isIE8$logStr$colorLuminance = require$$2;

    /*
     *  Handle sweetAlert's DOM elements
     */

    var _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition = require$$1;

    // Handle button events and keyboard events

    var _handleButton$handleConfirm$handleCancel = require$$3;

    var _handleKeyDown = require$$2$1;

    var _handleKeyDown2 = _interopRequireWildcard(_handleKeyDown);

    // Default values

    var _defaultParams = require$$1$1;

    var _defaultParams2 = _interopRequireWildcard(_defaultParams);

    var _setParameters = require$$0;

    var _setParameters2 = _interopRequireWildcard(_setParameters);

    /*
     * Remember state in cases where opening and handling a modal will fiddle with it.
     * (We also use window.previousActiveElement as a global variable)
     */
    var previousWindowKeyDown;
    var lastFocusedButton;

    /*
     * Global sweetAlert function
     * (this is what the user calls)
     */
    var sweetAlert, _swal;

    exports['default'] = sweetAlert = _swal = function swal() {
      var customizations = arguments[0];

      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(document.body, 'stop-scrolling');
      _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.resetInput();

      /*
       * Use argument if defined or default value from params object otherwise.
       * Supports the case where a default value is boolean true and should be
       * overridden by a corresponding explicit argument which is boolean false.
       */
      function argumentOrDefault(key) {
        var args = customizations;
        return args[key] === undefined ? _defaultParams2['default'][key] : args[key];
      }

      if (customizations === undefined) {
        _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert expects at least 1 attribute!');
        return false;
      }

      var params = _extend$hexToRgb$isIE8$logStr$colorLuminance.extend({}, _defaultParams2['default']);

      switch (typeof customizations === 'undefined' ? 'undefined' : babelHelpers.typeof(customizations)) {

        // Ex: swal("Hello", "Just testing", "info");
        case 'string':
          params.title = customizations;
          params.text = arguments[1] || '';
          params.type = arguments[2] || '';
          break;

        // Ex: swal({ title:"Hello", text: "Just testing", type: "info" });
        case 'object':
          if (customizations.title === undefined) {
            _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Missing "title" argument!');
            return false;
          }

          params.title = customizations.title;

          for (var customName in _defaultParams2['default']) {
            params[customName] = argumentOrDefault(customName);
          }

          // Show "Confirm" instead of "OK" if cancel button is visible
          params.confirmButtonText = params.showCancelButton ? 'Confirm' : _defaultParams2['default'].confirmButtonText;
          params.confirmButtonText = argumentOrDefault('confirmButtonText');

          // Callback function when clicking on "OK"/"Cancel"
          params.doneFunction = arguments[1] || null;

          break;

        default:
          _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('Unexpected type of argument! Expected "string" or "object", got ' + (typeof customizations === 'undefined' ? 'undefined' : babelHelpers.typeof(customizations)));
          return false;

      }

      _setParameters2['default'](params);
      _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.fixVerticalPosition();
      _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.openModal(arguments[1]);

      // Modal interactions
      var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

      /*
       * Make sure all modal buttons respond to all events
       */
      var $buttons = modal.querySelectorAll('button');
      var buttonEvents = ['onclick', 'onmouseover', 'onmouseout', 'onmousedown', 'onmouseup', 'onfocus'];
      var onButtonEvent = function onButtonEvent(e) {
        return _handleButton$handleConfirm$handleCancel.handleButton(e, params, modal);
      };

      for (var btnIndex = 0; btnIndex < $buttons.length; btnIndex++) {
        for (var evtIndex = 0; evtIndex < buttonEvents.length; evtIndex++) {
          var btnEvt = buttonEvents[evtIndex];
          $buttons[btnIndex][btnEvt] = onButtonEvent;
        }
      }

      // Clicking outside the modal dismisses it (if allowed by user)
      _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay().onclick = onButtonEvent;

      previousWindowKeyDown = window.onkeydown;

      var onKeyEvent = function onKeyEvent(e) {
        return _handleKeyDown2['default'](e, params, modal);
      };
      window.onkeydown = onKeyEvent;

      window.onfocus = function () {
        // When the user has focused away and focused back from the whole window.
        setTimeout(function () {
          // Put in a timeout to jump out of the event sequence.
          // Calling focus() in the event sequence confuses things.
          if (lastFocusedButton !== undefined) {
            lastFocusedButton.focus();
            lastFocusedButton = undefined;
          }
        }, 0);
      };

      // Show alert with enabled buttons always
      _swal.enableButtons();
    };

    /*
     * Set default params for each popup
     * @param {Object} userParams
     */
    sweetAlert.setDefaults = _swal.setDefaults = function (userParams) {
      if (!userParams) {
        throw new Error('userParams is required');
      }
      if ((typeof userParams === 'undefined' ? 'undefined' : babelHelpers.typeof(userParams)) !== 'object') {
        throw new Error('userParams has to be a object');
      }

      _extend$hexToRgb$isIE8$logStr$colorLuminance.extend(_defaultParams2['default'], userParams);
    };

    /*
     * Animation when closing modal
     */
    sweetAlert.close = _swal.close = function () {
      var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(_sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getOverlay(), 5);
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.fadeOut(modal, 5);
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'showSweetAlert');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass(modal, 'hideSweetAlert');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, 'visible');

      /*
       * Reset icon animations
       */
      var $successIcon = modal.querySelector('.sa-icon.sa-success');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon, 'animate');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-tip'), 'animateSuccessTip');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($successIcon.querySelector('.sa-long'), 'animateSuccessLong');

      var $errorIcon = modal.querySelector('.sa-icon.sa-error');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'animateErrorIcon');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon.querySelector('.sa-x-mark'), 'animateXMark');

      var $warningIcon = modal.querySelector('.sa-icon.sa-warning');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon, 'pulseWarning');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-body'), 'pulseWarningIns');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($warningIcon.querySelector('.sa-dot'), 'pulseWarningIns');

      // Reset custom class (delay so that UI changes aren't visible)
      setTimeout(function () {
        var customClass = modal.getAttribute('data-custom-class');
        _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(modal, customClass);
      }, 300);

      // Make page scrollable again
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass(document.body, 'stop-scrolling');

      // Reset the page to its previous state
      window.onkeydown = previousWindowKeyDown;
      if (window.previousActiveElement) {
        window.previousActiveElement.focus();
      }
      lastFocusedButton = undefined;
      clearTimeout(modal.timeout);

      return true;
    };

    /*
     * Validation of the input field is done by user
     * If something is wrong => call showInputError with errorMessage
     */
    sweetAlert.showInputError = _swal.showInputError = function (errorMessage) {
      var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

      var $errorIcon = modal.querySelector('.sa-input-error');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorIcon, 'show');

      var $errorContainer = modal.querySelector('.sa-error-container');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.addClass($errorContainer, 'show');

      $errorContainer.querySelector('p').innerHTML = errorMessage;

      setTimeout(function () {
        sweetAlert.enableButtons();
      }, 1);

      modal.querySelector('input').focus();
    };

    /*
     * Reset input error DOM elements
     */
    sweetAlert.resetInputError = _swal.resetInputError = function (event) {
      // If press enter => ignore
      if (event && event.keyCode === 13) {
        return false;
      }

      var $modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();

      var $errorIcon = $modal.querySelector('.sa-input-error');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorIcon, 'show');

      var $errorContainer = $modal.querySelector('.sa-error-container');
      _hasClass$addClass$removeClass$escapeHtml$_show$show$_hide$hide$isDescendant$getTopMargin$fadeIn$fadeOut$fireClick$stopEventPropagation.removeClass($errorContainer, 'show');
    };

    /*
     * Disable confirm and cancel buttons
     */
    sweetAlert.disableButtons = _swal.disableButtons = function (event) {
      var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');
      $confirmButton.disabled = true;
      $cancelButton.disabled = true;
    };

    /*
     * Enable confirm and cancel buttons
     */
    sweetAlert.enableButtons = _swal.enableButtons = function (event) {
      var modal = _sweetAlertInitialize$getModal$getOverlay$getInput$setFocusStyle$openModal$resetInput$fixVerticalPosition.getModal();
      var $confirmButton = modal.querySelector('button.confirm');
      var $cancelButton = modal.querySelector('button.cancel');
      $confirmButton.disabled = false;
      $cancelButton.disabled = false;
    };

    if (typeof window !== 'undefined') {
      // The 'handle-click' module requires
      // that 'sweetAlert' was set as global.
      window.sweetAlert = window.swal = sweetAlert;
    } else {
      _extend$hexToRgb$isIE8$logStr$colorLuminance.logStr('SweetAlert is a frontend module!');
    }
    module.exports = exports['default'];
    });

    var swal$1 = (sweetalert && typeof sweetalert === 'object' && 'default' in sweetalert ? sweetalert['default'] : sweetalert);

    var swiper = __commonjs(function (module) {
    /**
     * Swiper 3.3.1
     * Most modern mobile touch slider and framework with hardware accelerated transitions
     * 
     * http://www.idangero.us/swiper/
     * 
     * Copyright 2016, Vladimir Kharlampidi
     * The iDangero.us
     * http://www.idangero.us/
     * 
     * Licensed under MIT
     * 
     * Released on: February 7, 2016
     */(function(){'use strict';var $; /*===========================
        Swiper
        ===========================*/var Swiper=function Swiper(container,params){if(!(this instanceof Swiper))return new Swiper(container,params);var defaults={direction:'horizontal',touchEventsTarget:'container',initialSlide:0,speed:300, // autoplay
    autoplay:false,autoplayDisableOnInteraction:true,autoplayStopOnLast:false, // To support iOS's swipe-to-go-back gesture (when being used in-app, with UIWebView).
    iOSEdgeSwipeDetection:false,iOSEdgeSwipeThreshold:20, // Free mode
    freeMode:false,freeModeMomentum:true,freeModeMomentumRatio:1,freeModeMomentumBounce:true,freeModeMomentumBounceRatio:1,freeModeSticky:false,freeModeMinimumVelocity:0.02, // Autoheight
    autoHeight:false, // Set wrapper width
    setWrapperSize:false, // Virtual Translate
    virtualTranslate:false, // Effects
    effect:'slide', // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
    coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:true},flip:{slideShadows:true,limitRotation:true},cube:{slideShadows:true,shadow:true,shadowOffset:20,shadowScale:0.94},fade:{crossFade:false}, // Parallax
    parallax:false, // Scrollbar
    scrollbar:null,scrollbarHide:true,scrollbarDraggable:false,scrollbarSnapOnRelease:false, // Keyboard Mousewheel
    keyboardControl:false,mousewheelControl:false,mousewheelReleaseOnEdges:false,mousewheelInvert:false,mousewheelForceToAxis:false,mousewheelSensitivity:1, // Hash Navigation
    hashnav:false, // Breakpoints
    breakpoints:undefined, // Slides grid
    spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:'column',slidesPerGroup:1,centeredSlides:false,slidesOffsetBefore:0, // in px
    slidesOffsetAfter:0, // in px
    // Round length
    roundLengths:false, // Touches
    touchRatio:1,touchAngle:45,simulateTouch:true,shortSwipes:true,longSwipes:true,longSwipesRatio:0.5,longSwipesMs:300,followFinger:true,onlyExternal:false,threshold:0,touchMoveStopPropagation:true, // Unique Navigation Elements
    uniqueNavElements:true, // Pagination
    pagination:null,paginationElement:'span',paginationClickable:false,paginationHide:false,paginationBulletRender:null,paginationProgressRender:null,paginationFractionRender:null,paginationCustomRender:null,paginationType:'bullets', // 'bullets' or 'progress' or 'fraction' or 'custom'
    // Resistance
    resistance:true,resistanceRatio:0.85, // Next/prev buttons
    nextButton:null,prevButton:null, // Progress
    watchSlidesProgress:false,watchSlidesVisibility:false, // Cursor
    grabCursor:false, // Clicks
    preventClicks:true,preventClicksPropagation:true,slideToClickedSlide:false, // Lazy Loading
    lazyLoading:false,lazyLoadingInPrevNext:false,lazyLoadingInPrevNextAmount:1,lazyLoadingOnTransitionStart:false, // Images
    preloadImages:true,updateOnImagesReady:true, // loop
    loop:false,loopAdditionalSlides:0,loopedSlides:null, // Control
    control:undefined,controlInverse:false,controlBy:'slide', //or 'container'
    // Swiping/no swiping
    allowSwipeToPrev:true,allowSwipeToNext:true,swipeHandler:null, //'.swipe-handler',
    noSwiping:true,noSwipingClass:'swiper-no-swiping', // NS
    slideClass:'swiper-slide',slideActiveClass:'swiper-slide-active',slideVisibleClass:'swiper-slide-visible',slideDuplicateClass:'swiper-slide-duplicate',slideNextClass:'swiper-slide-next',slidePrevClass:'swiper-slide-prev',wrapperClass:'swiper-wrapper',bulletClass:'swiper-pagination-bullet',bulletActiveClass:'swiper-pagination-bullet-active',buttonDisabledClass:'swiper-button-disabled',paginationCurrentClass:'swiper-pagination-current',paginationTotalClass:'swiper-pagination-total',paginationHiddenClass:'swiper-pagination-hidden',paginationProgressbarClass:'swiper-pagination-progressbar', // Observer
    observer:false,observeParents:false, // Accessibility
    a11y:false,prevSlideMessage:'Previous slide',nextSlideMessage:'Next slide',firstSlideMessage:'This is the first slide',lastSlideMessage:'This is the last slide',paginationBulletMessage:'Go to slide {{index}}', // Callbacks
    runCallbacksOnInit:true /*
                Callbacks:
                onInit: function (swiper)
                onDestroy: function (swiper)
                onClick: function (swiper, e)
                onTap: function (swiper, e)
                onDoubleTap: function (swiper, e)
                onSliderMove: function (swiper, e)
                onSlideChangeStart: function (swiper)
                onSlideChangeEnd: function (swiper)
                onTransitionStart: function (swiper)
                onTransitionEnd: function (swiper)
                onImagesReady: function (swiper)
                onProgress: function (swiper, progress)
                onTouchStart: function (swiper, e)
                onTouchMove: function (swiper, e)
                onTouchMoveOpposite: function (swiper, e)
                onTouchEnd: function (swiper, e)
                onReachBeginning: function (swiper)
                onReachEnd: function (swiper)
                onSetTransition: function (swiper, duration)
                onSetTranslate: function (swiper, translate)
                onAutoplayStart: function (swiper)
                onAutoplayStop: function (swiper),
                onLazyImageLoad: function (swiper, slide, image)
                onLazyImageReady: function (swiper, slide, image)
                */};var initialVirtualTranslate=params&&params.virtualTranslate;params=params||{};var originalParams={};for(var param in params){if(babelHelpers.typeof(params[param])==='object'&&params[param]!==null&&!(params[param].nodeType||params[param]===window||params[param]===document||typeof Dom7!=='undefined'&&params[param] instanceof Dom7||typeof jQuery!=='undefined'&&params[param] instanceof jQuery)){originalParams[param]={};for(var deepParam in params[param]){originalParams[param][deepParam]=params[param][deepParam];}}else {originalParams[param]=params[param];}}for(var def in defaults){if(typeof params[def]==='undefined'){params[def]=defaults[def];}else if(babelHelpers.typeof(params[def])==='object'){for(var deepDef in defaults[def]){if(typeof params[def][deepDef]==='undefined'){params[def][deepDef]=defaults[def][deepDef];}}}} // Swiper
    var s=this; // Params
    s.params=params;s.originalParams=originalParams; // Classname
    s.classNames=[]; /*=========================
              Dom Library and plugins
              ===========================*/if(typeof $!=='undefined'&&typeof Dom7!=='undefined'){$=Dom7;}if(typeof $==='undefined'){if(typeof Dom7==='undefined'){$=window.Dom7||window.Zepto||window.jQuery;}else {$=Dom7;}if(!$)return;} // Export it to Swiper instance
    s.$=$; /*=========================
              Breakpoints
              ===========================*/s.currentBreakpoint=undefined;s.getActiveBreakpoint=function(){ //Get breakpoint for window width
    if(!s.params.breakpoints)return false;var breakpoint=false;var points=[],point;for(point in s.params.breakpoints){if(s.params.breakpoints.hasOwnProperty(point)){points.push(point);}}points.sort(function(a,b){return parseInt(a,10)>parseInt(b,10);});for(var i=0;i<points.length;i++){point=points[i];if(point>=window.innerWidth&&!breakpoint){breakpoint=point;}}return breakpoint||'max';};s.setBreakpoint=function(){ //Set breakpoint for window width and update parameters
    var breakpoint=s.getActiveBreakpoint();if(breakpoint&&s.currentBreakpoint!==breakpoint){var breakPointsParams=breakpoint in s.params.breakpoints?s.params.breakpoints[breakpoint]:s.originalParams;var needsReLoop=s.params.loop&&breakPointsParams.slidesPerView!==s.params.slidesPerView;for(var param in breakPointsParams){s.params[param]=breakPointsParams[param];}s.currentBreakpoint=breakpoint;if(needsReLoop&&s.destroyLoop){s.reLoop(true);}}}; // Set breakpoint on load
    if(s.params.breakpoints){s.setBreakpoint();} /*=========================
              Preparation - Define Container, Wrapper and Pagination
              ===========================*/s.container=$(container);if(s.container.length===0)return;if(s.container.length>1){var swipers=[];s.container.each(function(){var container=this;swipers.push(new Swiper(this,params));});return swipers;} // Save instance in container HTML Element and in data
    s.container[0].swiper=s;s.container.data('swiper',s);s.classNames.push('swiper-container-'+s.params.direction);if(s.params.freeMode){s.classNames.push('swiper-container-free-mode');}if(!s.support.flexbox){s.classNames.push('swiper-container-no-flexbox');s.params.slidesPerColumn=1;}if(s.params.autoHeight){s.classNames.push('swiper-container-autoheight');} // Enable slides progress when required
    if(s.params.parallax||s.params.watchSlidesVisibility){s.params.watchSlidesProgress=true;} // Coverflow / 3D
    if(['cube','coverflow','flip'].indexOf(s.params.effect)>=0){if(s.support.transforms3d){s.params.watchSlidesProgress=true;s.classNames.push('swiper-container-3d');}else {s.params.effect='slide';}}if(s.params.effect!=='slide'){s.classNames.push('swiper-container-'+s.params.effect);}if(s.params.effect==='cube'){s.params.resistanceRatio=0;s.params.slidesPerView=1;s.params.slidesPerColumn=1;s.params.slidesPerGroup=1;s.params.centeredSlides=false;s.params.spaceBetween=0;s.params.virtualTranslate=true;s.params.setWrapperSize=false;}if(s.params.effect==='fade'||s.params.effect==='flip'){s.params.slidesPerView=1;s.params.slidesPerColumn=1;s.params.slidesPerGroup=1;s.params.watchSlidesProgress=true;s.params.spaceBetween=0;s.params.setWrapperSize=false;if(typeof initialVirtualTranslate==='undefined'){s.params.virtualTranslate=true;}} // Grab Cursor
    if(s.params.grabCursor&&s.support.touch){s.params.grabCursor=false;} // Wrapper
    s.wrapper=s.container.children('.'+s.params.wrapperClass); // Pagination
    if(s.params.pagination){s.paginationContainer=$(s.params.pagination);if(s.params.uniqueNavElements&&typeof s.params.pagination==='string'&&s.paginationContainer.length>1&&s.container.find(s.params.pagination).length===1){s.paginationContainer=s.container.find(s.params.pagination);}if(s.params.paginationType==='bullets'&&s.params.paginationClickable){s.paginationContainer.addClass('swiper-pagination-clickable');}else {s.params.paginationClickable=false;}s.paginationContainer.addClass('swiper-pagination-'+s.params.paginationType);} // Next/Prev Buttons
    if(s.params.nextButton||s.params.prevButton){if(s.params.nextButton){s.nextButton=$(s.params.nextButton);if(s.params.uniqueNavElements&&typeof s.params.nextButton==='string'&&s.nextButton.length>1&&s.container.find(s.params.nextButton).length===1){s.nextButton=s.container.find(s.params.nextButton);}}if(s.params.prevButton){s.prevButton=$(s.params.prevButton);if(s.params.uniqueNavElements&&typeof s.params.prevButton==='string'&&s.prevButton.length>1&&s.container.find(s.params.prevButton).length===1){s.prevButton=s.container.find(s.params.prevButton);}}} // Is Horizontal
    s.isHorizontal=function(){return s.params.direction==='horizontal';}; // s.isH = isH;
    // RTL
    s.rtl=s.isHorizontal()&&(s.container[0].dir.toLowerCase()==='rtl'||s.container.css('direction')==='rtl');if(s.rtl){s.classNames.push('swiper-container-rtl');} // Wrong RTL support
    if(s.rtl){s.wrongRTL=s.wrapper.css('display')==='-webkit-box';} // Columns
    if(s.params.slidesPerColumn>1){s.classNames.push('swiper-container-multirow');} // Check for Android
    if(s.device.android){s.classNames.push('swiper-container-android');} // Add classes
    s.container.addClass(s.classNames.join(' ')); // Translate
    s.translate=0; // Progress
    s.progress=0; // Velocity
    s.velocity=0; /*=========================
              Locks, unlocks
              ===========================*/s.lockSwipeToNext=function(){s.params.allowSwipeToNext=false;};s.lockSwipeToPrev=function(){s.params.allowSwipeToPrev=false;};s.lockSwipes=function(){s.params.allowSwipeToNext=s.params.allowSwipeToPrev=false;};s.unlockSwipeToNext=function(){s.params.allowSwipeToNext=true;};s.unlockSwipeToPrev=function(){s.params.allowSwipeToPrev=true;};s.unlockSwipes=function(){s.params.allowSwipeToNext=s.params.allowSwipeToPrev=true;}; /*=========================
              Round helper
              ===========================*/function round(a){return Math.floor(a);} /*=========================
              Set grab cursor
              ===========================*/if(s.params.grabCursor){s.container[0].style.cursor='move';s.container[0].style.cursor='-webkit-grab';s.container[0].style.cursor='-moz-grab';s.container[0].style.cursor='grab';} /*=========================
              Update on Images Ready
              ===========================*/s.imagesToLoad=[];s.imagesLoaded=0;s.loadImage=function(imgElement,src,srcset,checkForComplete,callback){var image;function onReady(){if(callback)callback();}if(!imgElement.complete||!checkForComplete){if(src){image=new window.Image();image.onload=onReady;image.onerror=onReady;if(srcset){image.srcset=srcset;}if(src){image.src=src;}}else {onReady();}}else { //image already loaded...
    onReady();}};s.preloadImages=function(){s.imagesToLoad=s.container.find('img');function _onReady(){if(typeof s==='undefined'||s===null)return;if(s.imagesLoaded!==undefined)s.imagesLoaded++;if(s.imagesLoaded===s.imagesToLoad.length){if(s.params.updateOnImagesReady)s.update();s.emit('onImagesReady',s);}}for(var i=0;i<s.imagesToLoad.length;i++){s.loadImage(s.imagesToLoad[i],s.imagesToLoad[i].currentSrc||s.imagesToLoad[i].getAttribute('src'),s.imagesToLoad[i].srcset||s.imagesToLoad[i].getAttribute('srcset'),true,_onReady);}}; /*=========================
              Autoplay
              ===========================*/s.autoplayTimeoutId=undefined;s.autoplaying=false;s.autoplayPaused=false;function autoplay(){s.autoplayTimeoutId=setTimeout(function(){if(s.params.loop){s.fixLoop();s._slideNext();s.emit('onAutoplay',s);}else {if(!s.isEnd){s._slideNext();s.emit('onAutoplay',s);}else {if(!params.autoplayStopOnLast){s._slideTo(0);s.emit('onAutoplay',s);}else {s.stopAutoplay();}}}},s.params.autoplay);}s.startAutoplay=function(){if(typeof s.autoplayTimeoutId!=='undefined')return false;if(!s.params.autoplay)return false;if(s.autoplaying)return false;s.autoplaying=true;s.emit('onAutoplayStart',s);autoplay();};s.stopAutoplay=function(internal){if(!s.autoplayTimeoutId)return;if(s.autoplayTimeoutId)clearTimeout(s.autoplayTimeoutId);s.autoplaying=false;s.autoplayTimeoutId=undefined;s.emit('onAutoplayStop',s);};s.pauseAutoplay=function(speed){if(s.autoplayPaused)return;if(s.autoplayTimeoutId)clearTimeout(s.autoplayTimeoutId);s.autoplayPaused=true;if(speed===0){s.autoplayPaused=false;autoplay();}else {s.wrapper.transitionEnd(function(){if(!s)return;s.autoplayPaused=false;if(!s.autoplaying){s.stopAutoplay();}else {autoplay();}});}}; /*=========================
              Min/Max Translate
              ===========================*/s.minTranslate=function(){return -s.snapGrid[0];};s.maxTranslate=function(){return -s.snapGrid[s.snapGrid.length-1];}; /*=========================
              Slider/slides sizes
              ===========================*/s.updateAutoHeight=function(){ // Update Height
    var slide=s.slides.eq(s.activeIndex)[0];if(typeof slide!=='undefined'){var newHeight=slide.offsetHeight;if(newHeight)s.wrapper.css('height',newHeight+'px');}};s.updateContainerSize=function(){var width,height;if(typeof s.params.width!=='undefined'){width=s.params.width;}else {width=s.container[0].clientWidth;}if(typeof s.params.height!=='undefined'){height=s.params.height;}else {height=s.container[0].clientHeight;}if(width===0&&s.isHorizontal()||height===0&&!s.isHorizontal()){return;} //Subtract paddings
    width=width-parseInt(s.container.css('padding-left'),10)-parseInt(s.container.css('padding-right'),10);height=height-parseInt(s.container.css('padding-top'),10)-parseInt(s.container.css('padding-bottom'),10); // Store values
    s.width=width;s.height=height;s.size=s.isHorizontal()?s.width:s.height;};s.updateSlidesSize=function(){s.slides=s.wrapper.children('.'+s.params.slideClass);s.snapGrid=[];s.slidesGrid=[];s.slidesSizesGrid=[];var spaceBetween=s.params.spaceBetween,slidePosition=-s.params.slidesOffsetBefore,i,prevSlideSize=0,index=0;if(typeof s.size==='undefined')return;if(typeof spaceBetween==='string'&&spaceBetween.indexOf('%')>=0){spaceBetween=parseFloat(spaceBetween.replace('%',''))/100*s.size;}s.virtualSize=-spaceBetween; // reset margins
    if(s.rtl)s.slides.css({marginLeft:'',marginTop:''});else s.slides.css({marginRight:'',marginBottom:''});var slidesNumberEvenToRows;if(s.params.slidesPerColumn>1){if(Math.floor(s.slides.length/s.params.slidesPerColumn)===s.slides.length/s.params.slidesPerColumn){slidesNumberEvenToRows=s.slides.length;}else {slidesNumberEvenToRows=Math.ceil(s.slides.length/s.params.slidesPerColumn)*s.params.slidesPerColumn;}if(s.params.slidesPerView!=='auto'&&s.params.slidesPerColumnFill==='row'){slidesNumberEvenToRows=Math.max(slidesNumberEvenToRows,s.params.slidesPerView*s.params.slidesPerColumn);}} // Calc slides
    var slideSize;var slidesPerColumn=s.params.slidesPerColumn;var slidesPerRow=slidesNumberEvenToRows/slidesPerColumn;var numFullColumns=slidesPerRow-(s.params.slidesPerColumn*slidesPerRow-s.slides.length);for(i=0;i<s.slides.length;i++){slideSize=0;var slide=s.slides.eq(i);if(s.params.slidesPerColumn>1){ // Set slides order
    var newSlideOrderIndex;var column,row;if(s.params.slidesPerColumnFill==='column'){column=Math.floor(i/slidesPerColumn);row=i-column*slidesPerColumn;if(column>numFullColumns||column===numFullColumns&&row===slidesPerColumn-1){if(++row>=slidesPerColumn){row=0;column++;}}newSlideOrderIndex=column+row*slidesNumberEvenToRows/slidesPerColumn;slide.css({'-webkit-box-ordinal-group':newSlideOrderIndex,'-moz-box-ordinal-group':newSlideOrderIndex,'-ms-flex-order':newSlideOrderIndex,'-webkit-order':newSlideOrderIndex,'order':newSlideOrderIndex});}else {row=Math.floor(i/slidesPerRow);column=i-row*slidesPerRow;}slide.css({'margin-top':row!==0&&s.params.spaceBetween&&s.params.spaceBetween+'px'}).attr('data-swiper-column',column).attr('data-swiper-row',row);}if(slide.css('display')==='none')continue;if(s.params.slidesPerView==='auto'){slideSize=s.isHorizontal()?slide.outerWidth(true):slide.outerHeight(true);if(s.params.roundLengths)slideSize=round(slideSize);}else {slideSize=(s.size-(s.params.slidesPerView-1)*spaceBetween)/s.params.slidesPerView;if(s.params.roundLengths)slideSize=round(slideSize);if(s.isHorizontal()){s.slides[i].style.width=slideSize+'px';}else {s.slides[i].style.height=slideSize+'px';}}s.slides[i].swiperSlideSize=slideSize;s.slidesSizesGrid.push(slideSize);if(s.params.centeredSlides){slidePosition=slidePosition+slideSize/2+prevSlideSize/2+spaceBetween;if(i===0)slidePosition=slidePosition-s.size/2-spaceBetween;if(Math.abs(slidePosition)<1/1000)slidePosition=0;if(index%s.params.slidesPerGroup===0)s.snapGrid.push(slidePosition);s.slidesGrid.push(slidePosition);}else {if(index%s.params.slidesPerGroup===0)s.snapGrid.push(slidePosition);s.slidesGrid.push(slidePosition);slidePosition=slidePosition+slideSize+spaceBetween;}s.virtualSize+=slideSize+spaceBetween;prevSlideSize=slideSize;index++;}s.virtualSize=Math.max(s.virtualSize,s.size)+s.params.slidesOffsetAfter;var newSlidesGrid;if(s.rtl&&s.wrongRTL&&(s.params.effect==='slide'||s.params.effect==='coverflow')){s.wrapper.css({width:s.virtualSize+s.params.spaceBetween+'px'});}if(!s.support.flexbox||s.params.setWrapperSize){if(s.isHorizontal())s.wrapper.css({width:s.virtualSize+s.params.spaceBetween+'px'});else s.wrapper.css({height:s.virtualSize+s.params.spaceBetween+'px'});}if(s.params.slidesPerColumn>1){s.virtualSize=(slideSize+s.params.spaceBetween)*slidesNumberEvenToRows;s.virtualSize=Math.ceil(s.virtualSize/s.params.slidesPerColumn)-s.params.spaceBetween;s.wrapper.css({width:s.virtualSize+s.params.spaceBetween+'px'});if(s.params.centeredSlides){newSlidesGrid=[];for(i=0;i<s.snapGrid.length;i++){if(s.snapGrid[i]<s.virtualSize+s.snapGrid[0])newSlidesGrid.push(s.snapGrid[i]);}s.snapGrid=newSlidesGrid;}} // Remove last grid elements depending on width
    if(!s.params.centeredSlides){newSlidesGrid=[];for(i=0;i<s.snapGrid.length;i++){if(s.snapGrid[i]<=s.virtualSize-s.size){newSlidesGrid.push(s.snapGrid[i]);}}s.snapGrid=newSlidesGrid;if(Math.floor(s.virtualSize-s.size)-Math.floor(s.snapGrid[s.snapGrid.length-1])>1){s.snapGrid.push(s.virtualSize-s.size);}}if(s.snapGrid.length===0)s.snapGrid=[0];if(s.params.spaceBetween!==0){if(s.isHorizontal()){if(s.rtl)s.slides.css({marginLeft:spaceBetween+'px'});else s.slides.css({marginRight:spaceBetween+'px'});}else s.slides.css({marginBottom:spaceBetween+'px'});}if(s.params.watchSlidesProgress){s.updateSlidesOffset();}};s.updateSlidesOffset=function(){for(var i=0;i<s.slides.length;i++){s.slides[i].swiperSlideOffset=s.isHorizontal()?s.slides[i].offsetLeft:s.slides[i].offsetTop;}}; /*=========================
              Slider/slides progress
              ===========================*/s.updateSlidesProgress=function(translate){if(typeof translate==='undefined'){translate=s.translate||0;}if(s.slides.length===0)return;if(typeof s.slides[0].swiperSlideOffset==='undefined')s.updateSlidesOffset();var offsetCenter=-translate;if(s.rtl)offsetCenter=translate; // Visible Slides
    s.slides.removeClass(s.params.slideVisibleClass);for(var i=0;i<s.slides.length;i++){var slide=s.slides[i];var slideProgress=(offsetCenter-slide.swiperSlideOffset)/(slide.swiperSlideSize+s.params.spaceBetween);if(s.params.watchSlidesVisibility){var slideBefore=-(offsetCenter-slide.swiperSlideOffset);var slideAfter=slideBefore+s.slidesSizesGrid[i];var isVisible=slideBefore>=0&&slideBefore<s.size||slideAfter>0&&slideAfter<=s.size||slideBefore<=0&&slideAfter>=s.size;if(isVisible){s.slides.eq(i).addClass(s.params.slideVisibleClass);}}slide.progress=s.rtl?-slideProgress:slideProgress;}};s.updateProgress=function(translate){if(typeof translate==='undefined'){translate=s.translate||0;}var translatesDiff=s.maxTranslate()-s.minTranslate();var wasBeginning=s.isBeginning;var wasEnd=s.isEnd;if(translatesDiff===0){s.progress=0;s.isBeginning=s.isEnd=true;}else {s.progress=(translate-s.minTranslate())/translatesDiff;s.isBeginning=s.progress<=0;s.isEnd=s.progress>=1;}if(s.isBeginning&&!wasBeginning)s.emit('onReachBeginning',s);if(s.isEnd&&!wasEnd)s.emit('onReachEnd',s);if(s.params.watchSlidesProgress)s.updateSlidesProgress(translate);s.emit('onProgress',s,s.progress);};s.updateActiveIndex=function(){var translate=s.rtl?s.translate:-s.translate;var newActiveIndex,i,snapIndex;for(i=0;i<s.slidesGrid.length;i++){if(typeof s.slidesGrid[i+1]!=='undefined'){if(translate>=s.slidesGrid[i]&&translate<s.slidesGrid[i+1]-(s.slidesGrid[i+1]-s.slidesGrid[i])/2){newActiveIndex=i;}else if(translate>=s.slidesGrid[i]&&translate<s.slidesGrid[i+1]){newActiveIndex=i+1;}}else {if(translate>=s.slidesGrid[i]){newActiveIndex=i;}}} // Normalize slideIndex
    if(newActiveIndex<0||typeof newActiveIndex==='undefined')newActiveIndex=0; // for (i = 0; i < s.slidesGrid.length; i++) {
    // if (- translate >= s.slidesGrid[i]) {
    // newActiveIndex = i;
    // }
    // }
    snapIndex=Math.floor(newActiveIndex/s.params.slidesPerGroup);if(snapIndex>=s.snapGrid.length)snapIndex=s.snapGrid.length-1;if(newActiveIndex===s.activeIndex){return;}s.snapIndex=snapIndex;s.previousIndex=s.activeIndex;s.activeIndex=newActiveIndex;s.updateClasses();}; /*=========================
              Classes
              ===========================*/s.updateClasses=function(){s.slides.removeClass(s.params.slideActiveClass+' '+s.params.slideNextClass+' '+s.params.slidePrevClass);var activeSlide=s.slides.eq(s.activeIndex); // Active classes
    activeSlide.addClass(s.params.slideActiveClass); // Next Slide
    var nextSlide=activeSlide.next('.'+s.params.slideClass).addClass(s.params.slideNextClass);if(s.params.loop&&nextSlide.length===0){s.slides.eq(0).addClass(s.params.slideNextClass);} // Prev Slide
    var prevSlide=activeSlide.prev('.'+s.params.slideClass).addClass(s.params.slidePrevClass);if(s.params.loop&&prevSlide.length===0){s.slides.eq(-1).addClass(s.params.slidePrevClass);} // Pagination
    if(s.paginationContainer&&s.paginationContainer.length>0){ // Current/Total
    var current,total=s.params.loop?Math.ceil((s.slides.length-s.loopedSlides*2)/s.params.slidesPerGroup):s.snapGrid.length;if(s.params.loop){current=Math.ceil((s.activeIndex-s.loopedSlides)/s.params.slidesPerGroup);if(current>s.slides.length-1-s.loopedSlides*2){current=current-(s.slides.length-s.loopedSlides*2);}if(current>total-1)current=current-total;if(current<0&&s.params.paginationType!=='bullets')current=total+current;}else {if(typeof s.snapIndex!=='undefined'){current=s.snapIndex;}else {current=s.activeIndex||0;}} // Types
    if(s.params.paginationType==='bullets'&&s.bullets&&s.bullets.length>0){s.bullets.removeClass(s.params.bulletActiveClass);if(s.paginationContainer.length>1){s.bullets.each(function(){if($(this).index()===current)$(this).addClass(s.params.bulletActiveClass);});}else {s.bullets.eq(current).addClass(s.params.bulletActiveClass);}}if(s.params.paginationType==='fraction'){s.paginationContainer.find('.'+s.params.paginationCurrentClass).text(current+1);s.paginationContainer.find('.'+s.params.paginationTotalClass).text(total);}if(s.params.paginationType==='progress'){var scale=(current+1)/total,scaleX=scale,scaleY=1;if(!s.isHorizontal()){scaleY=scale;scaleX=1;}s.paginationContainer.find('.'+s.params.paginationProgressbarClass).transform('translate3d(0,0,0) scaleX('+scaleX+') scaleY('+scaleY+')').transition(s.params.speed);}if(s.params.paginationType==='custom'&&s.params.paginationCustomRender){s.paginationContainer.html(s.params.paginationCustomRender(s,current+1,total));s.emit('onPaginationRendered',s,s.paginationContainer[0]);}} // Next/active buttons
    if(!s.params.loop){if(s.params.prevButton&&s.prevButton&&s.prevButton.length>0){if(s.isBeginning){s.prevButton.addClass(s.params.buttonDisabledClass);if(s.params.a11y&&s.a11y)s.a11y.disable(s.prevButton);}else {s.prevButton.removeClass(s.params.buttonDisabledClass);if(s.params.a11y&&s.a11y)s.a11y.enable(s.prevButton);}}if(s.params.nextButton&&s.nextButton&&s.nextButton.length>0){if(s.isEnd){s.nextButton.addClass(s.params.buttonDisabledClass);if(s.params.a11y&&s.a11y)s.a11y.disable(s.nextButton);}else {s.nextButton.removeClass(s.params.buttonDisabledClass);if(s.params.a11y&&s.a11y)s.a11y.enable(s.nextButton);}}}}; /*=========================
              Pagination
              ===========================*/s.updatePagination=function(){if(!s.params.pagination)return;if(s.paginationContainer&&s.paginationContainer.length>0){var paginationHTML='';if(s.params.paginationType==='bullets'){var numberOfBullets=s.params.loop?Math.ceil((s.slides.length-s.loopedSlides*2)/s.params.slidesPerGroup):s.snapGrid.length;for(var i=0;i<numberOfBullets;i++){if(s.params.paginationBulletRender){paginationHTML+=s.params.paginationBulletRender(i,s.params.bulletClass);}else {paginationHTML+='<'+s.params.paginationElement+' class="'+s.params.bulletClass+'"></'+s.params.paginationElement+'>';}}s.paginationContainer.html(paginationHTML);s.bullets=s.paginationContainer.find('.'+s.params.bulletClass);if(s.params.paginationClickable&&s.params.a11y&&s.a11y){s.a11y.initPagination();}}if(s.params.paginationType==='fraction'){if(s.params.paginationFractionRender){paginationHTML=s.params.paginationFractionRender(s,s.params.paginationCurrentClass,s.params.paginationTotalClass);}else {paginationHTML='<span class="'+s.params.paginationCurrentClass+'"></span>'+' / '+'<span class="'+s.params.paginationTotalClass+'"></span>';}s.paginationContainer.html(paginationHTML);}if(s.params.paginationType==='progress'){if(s.params.paginationProgressRender){paginationHTML=s.params.paginationProgressRender(s,s.params.paginationProgressbarClass);}else {paginationHTML='<span class="'+s.params.paginationProgressbarClass+'"></span>';}s.paginationContainer.html(paginationHTML);}if(s.params.paginationType!=='custom'){s.emit('onPaginationRendered',s,s.paginationContainer[0]);}}}; /*=========================
              Common update method
              ===========================*/s.update=function(updateTranslate){s.updateContainerSize();s.updateSlidesSize();s.updateProgress();s.updatePagination();s.updateClasses();if(s.params.scrollbar&&s.scrollbar){s.scrollbar.set();}function forceSetTranslate(){newTranslate=Math.min(Math.max(s.translate,s.maxTranslate()),s.minTranslate());s.setWrapperTranslate(newTranslate);s.updateActiveIndex();s.updateClasses();}if(updateTranslate){var translated,newTranslate;if(s.controller&&s.controller.spline){s.controller.spline=undefined;}if(s.params.freeMode){forceSetTranslate();if(s.params.autoHeight){s.updateAutoHeight();}}else {if((s.params.slidesPerView==='auto'||s.params.slidesPerView>1)&&s.isEnd&&!s.params.centeredSlides){translated=s.slideTo(s.slides.length-1,0,false,true);}else {translated=s.slideTo(s.activeIndex,0,false,true);}if(!translated){forceSetTranslate();}}}else if(s.params.autoHeight){s.updateAutoHeight();}}; /*=========================
              Resize Handler
              ===========================*/s.onResize=function(forceUpdatePagination){ //Breakpoints
    if(s.params.breakpoints){s.setBreakpoint();} // Disable locks on resize
    var allowSwipeToPrev=s.params.allowSwipeToPrev;var allowSwipeToNext=s.params.allowSwipeToNext;s.params.allowSwipeToPrev=s.params.allowSwipeToNext=true;s.updateContainerSize();s.updateSlidesSize();if(s.params.slidesPerView==='auto'||s.params.freeMode||forceUpdatePagination)s.updatePagination();if(s.params.scrollbar&&s.scrollbar){s.scrollbar.set();}if(s.controller&&s.controller.spline){s.controller.spline=undefined;}var slideChangedBySlideTo=false;if(s.params.freeMode){var newTranslate=Math.min(Math.max(s.translate,s.maxTranslate()),s.minTranslate());s.setWrapperTranslate(newTranslate);s.updateActiveIndex();s.updateClasses();if(s.params.autoHeight){s.updateAutoHeight();}}else {s.updateClasses();if((s.params.slidesPerView==='auto'||s.params.slidesPerView>1)&&s.isEnd&&!s.params.centeredSlides){slideChangedBySlideTo=s.slideTo(s.slides.length-1,0,false,true);}else {slideChangedBySlideTo=s.slideTo(s.activeIndex,0,false,true);}}if(s.params.lazyLoading&&!slideChangedBySlideTo&&s.lazy){s.lazy.load();} // Return locks after resize
    s.params.allowSwipeToPrev=allowSwipeToPrev;s.params.allowSwipeToNext=allowSwipeToNext;}; /*=========================
              Events
              ===========================*/ //Define Touch Events
    var desktopEvents=['mousedown','mousemove','mouseup'];if(window.navigator.pointerEnabled)desktopEvents=['pointerdown','pointermove','pointerup'];else if(window.navigator.msPointerEnabled)desktopEvents=['MSPointerDown','MSPointerMove','MSPointerUp'];s.touchEvents={start:s.support.touch||!s.params.simulateTouch?'touchstart':desktopEvents[0],move:s.support.touch||!s.params.simulateTouch?'touchmove':desktopEvents[1],end:s.support.touch||!s.params.simulateTouch?'touchend':desktopEvents[2]}; // WP8 Touch Events Fix
    if(window.navigator.pointerEnabled||window.navigator.msPointerEnabled){(s.params.touchEventsTarget==='container'?s.container:s.wrapper).addClass('swiper-wp8-'+s.params.direction);} // Attach/detach events
    s.initEvents=function(detach){var actionDom=detach?'off':'on';var action=detach?'removeEventListener':'addEventListener';var touchEventsTarget=s.params.touchEventsTarget==='container'?s.container[0]:s.wrapper[0];var target=s.support.touch?touchEventsTarget:document;var moveCapture=s.params.nested?true:false; //Touch Events
    if(s.browser.ie){touchEventsTarget[action](s.touchEvents.start,s.onTouchStart,false);target[action](s.touchEvents.move,s.onTouchMove,moveCapture);target[action](s.touchEvents.end,s.onTouchEnd,false);}else {if(s.support.touch){touchEventsTarget[action](s.touchEvents.start,s.onTouchStart,false);touchEventsTarget[action](s.touchEvents.move,s.onTouchMove,moveCapture);touchEventsTarget[action](s.touchEvents.end,s.onTouchEnd,false);}if(params.simulateTouch&&!s.device.ios&&!s.device.android){touchEventsTarget[action]('mousedown',s.onTouchStart,false);document[action]('mousemove',s.onTouchMove,moveCapture);document[action]('mouseup',s.onTouchEnd,false);}}window[action]('resize',s.onResize); // Next, Prev, Index
    if(s.params.nextButton&&s.nextButton&&s.nextButton.length>0){s.nextButton[actionDom]('click',s.onClickNext);if(s.params.a11y&&s.a11y)s.nextButton[actionDom]('keydown',s.a11y.onEnterKey);}if(s.params.prevButton&&s.prevButton&&s.prevButton.length>0){s.prevButton[actionDom]('click',s.onClickPrev);if(s.params.a11y&&s.a11y)s.prevButton[actionDom]('keydown',s.a11y.onEnterKey);}if(s.params.pagination&&s.params.paginationClickable){s.paginationContainer[actionDom]('click','.'+s.params.bulletClass,s.onClickIndex);if(s.params.a11y&&s.a11y)s.paginationContainer[actionDom]('keydown','.'+s.params.bulletClass,s.a11y.onEnterKey);} // Prevent Links Clicks
    if(s.params.preventClicks||s.params.preventClicksPropagation)touchEventsTarget[action]('click',s.preventClicks,true);};s.attachEvents=function(){s.initEvents();};s.detachEvents=function(){s.initEvents(true);}; /*=========================
              Handle Clicks
              ===========================*/ // Prevent Clicks
    s.allowClick=true;s.preventClicks=function(e){if(!s.allowClick){if(s.params.preventClicks)e.preventDefault();if(s.params.preventClicksPropagation&&s.animating){e.stopPropagation();e.stopImmediatePropagation();}}}; // Clicks
    s.onClickNext=function(e){e.preventDefault();if(s.isEnd&&!s.params.loop)return;s.slideNext();};s.onClickPrev=function(e){e.preventDefault();if(s.isBeginning&&!s.params.loop)return;s.slidePrev();};s.onClickIndex=function(e){e.preventDefault();var index=$(this).index()*s.params.slidesPerGroup;if(s.params.loop)index=index+s.loopedSlides;s.slideTo(index);}; /*=========================
              Handle Touches
              ===========================*/function findElementInEvent(e,selector){var el=$(e.target);if(!el.is(selector)){if(typeof selector==='string'){el=el.parents(selector);}else if(selector.nodeType){var found;el.parents().each(function(index,_el){if(_el===selector)found=selector;});if(!found)return undefined;else return selector;}}if(el.length===0){return undefined;}return el[0];}s.updateClickedSlide=function(e){var slide=findElementInEvent(e,'.'+s.params.slideClass);var slideFound=false;if(slide){for(var i=0;i<s.slides.length;i++){if(s.slides[i]===slide)slideFound=true;}}if(slide&&slideFound){s.clickedSlide=slide;s.clickedIndex=$(slide).index();}else {s.clickedSlide=undefined;s.clickedIndex=undefined;return;}if(s.params.slideToClickedSlide&&s.clickedIndex!==undefined&&s.clickedIndex!==s.activeIndex){var slideToIndex=s.clickedIndex,realIndex,duplicatedSlides;if(s.params.loop){if(s.animating)return;realIndex=$(s.clickedSlide).attr('data-swiper-slide-index');if(s.params.centeredSlides){if(slideToIndex<s.loopedSlides-s.params.slidesPerView/2||slideToIndex>s.slides.length-s.loopedSlides+s.params.slidesPerView/2){s.fixLoop();slideToIndex=s.wrapper.children('.'+s.params.slideClass+'[data-swiper-slide-index="'+realIndex+'"]:not(.swiper-slide-duplicate)').eq(0).index();setTimeout(function(){s.slideTo(slideToIndex);},0);}else {s.slideTo(slideToIndex);}}else {if(slideToIndex>s.slides.length-s.params.slidesPerView){s.fixLoop();slideToIndex=s.wrapper.children('.'+s.params.slideClass+'[data-swiper-slide-index="'+realIndex+'"]:not(.swiper-slide-duplicate)').eq(0).index();setTimeout(function(){s.slideTo(slideToIndex);},0);}else {s.slideTo(slideToIndex);}}}else {s.slideTo(slideToIndex);}}};var isTouched,isMoved,allowTouchCallbacks,touchStartTime,isScrolling,currentTranslate,startTranslate,allowThresholdMove, // Form elements to match
    formElements='input, select, textarea, button', // Last click time
    lastClickTime=Date.now(),clickTimeout, //Velocities
    velocities=[],allowMomentumBounce; // Animating Flag
    s.animating=false; // Touches information
    s.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0}; // Touch handlers
    var isTouchEvent,startMoving;s.onTouchStart=function(e){if(e.originalEvent)e=e.originalEvent;isTouchEvent=e.type==='touchstart';if(!isTouchEvent&&'which' in e&&e.which===3)return;if(s.params.noSwiping&&findElementInEvent(e,'.'+s.params.noSwipingClass)){s.allowClick=true;return;}if(s.params.swipeHandler){if(!findElementInEvent(e,s.params.swipeHandler))return;}var startX=s.touches.currentX=e.type==='touchstart'?e.targetTouches[0].pageX:e.pageX;var startY=s.touches.currentY=e.type==='touchstart'?e.targetTouches[0].pageY:e.pageY; // Do NOT start if iOS edge swipe is detected. Otherwise iOS app (UIWebView) cannot swipe-to-go-back anymore
    if(s.device.ios&&s.params.iOSEdgeSwipeDetection&&startX<=s.params.iOSEdgeSwipeThreshold){return;}isTouched=true;isMoved=false;allowTouchCallbacks=true;isScrolling=undefined;startMoving=undefined;s.touches.startX=startX;s.touches.startY=startY;touchStartTime=Date.now();s.allowClick=true;s.updateContainerSize();s.swipeDirection=undefined;if(s.params.threshold>0)allowThresholdMove=false;if(e.type!=='touchstart'){var preventDefault=true;if($(e.target).is(formElements))preventDefault=false;if(document.activeElement&&$(document.activeElement).is(formElements)){document.activeElement.blur();}if(preventDefault){e.preventDefault();}}s.emit('onTouchStart',s,e);};s.onTouchMove=function(e){if(e.originalEvent)e=e.originalEvent;if(isTouchEvent&&e.type==='mousemove')return;if(e.preventedByNestedSwiper){s.touches.startX=e.type==='touchmove'?e.targetTouches[0].pageX:e.pageX;s.touches.startY=e.type==='touchmove'?e.targetTouches[0].pageY:e.pageY;return;}if(s.params.onlyExternal){ // isMoved = true;
    s.allowClick=false;if(isTouched){s.touches.startX=s.touches.currentX=e.type==='touchmove'?e.targetTouches[0].pageX:e.pageX;s.touches.startY=s.touches.currentY=e.type==='touchmove'?e.targetTouches[0].pageY:e.pageY;touchStartTime=Date.now();}return;}if(isTouchEvent&&document.activeElement){if(e.target===document.activeElement&&$(e.target).is(formElements)){isMoved=true;s.allowClick=false;return;}}if(allowTouchCallbacks){s.emit('onTouchMove',s,e);}if(e.targetTouches&&e.targetTouches.length>1)return;s.touches.currentX=e.type==='touchmove'?e.targetTouches[0].pageX:e.pageX;s.touches.currentY=e.type==='touchmove'?e.targetTouches[0].pageY:e.pageY;if(typeof isScrolling==='undefined'){var touchAngle=Math.atan2(Math.abs(s.touches.currentY-s.touches.startY),Math.abs(s.touches.currentX-s.touches.startX))*180/Math.PI;isScrolling=s.isHorizontal()?touchAngle>s.params.touchAngle:90-touchAngle>s.params.touchAngle;}if(isScrolling){s.emit('onTouchMoveOpposite',s,e);}if(typeof startMoving==='undefined'&&s.browser.ieTouch){if(s.touches.currentX!==s.touches.startX||s.touches.currentY!==s.touches.startY){startMoving=true;}}if(!isTouched)return;if(isScrolling){isTouched=false;return;}if(!startMoving&&s.browser.ieTouch){return;}s.allowClick=false;s.emit('onSliderMove',s,e);e.preventDefault();if(s.params.touchMoveStopPropagation&&!s.params.nested){e.stopPropagation();}if(!isMoved){if(params.loop){s.fixLoop();}startTranslate=s.getWrapperTranslate();s.setWrapperTransition(0);if(s.animating){s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');}if(s.params.autoplay&&s.autoplaying){if(s.params.autoplayDisableOnInteraction){s.stopAutoplay();}else {s.pauseAutoplay();}}allowMomentumBounce=false; //Grab Cursor
    if(s.params.grabCursor){s.container[0].style.cursor='move';s.container[0].style.cursor='-webkit-grabbing';s.container[0].style.cursor='-moz-grabbin';s.container[0].style.cursor='grabbing';}}isMoved=true;var diff=s.touches.diff=s.isHorizontal()?s.touches.currentX-s.touches.startX:s.touches.currentY-s.touches.startY;diff=diff*s.params.touchRatio;if(s.rtl)diff=-diff;s.swipeDirection=diff>0?'prev':'next';currentTranslate=diff+startTranslate;var disableParentSwiper=true;if(diff>0&&currentTranslate>s.minTranslate()){disableParentSwiper=false;if(s.params.resistance)currentTranslate=s.minTranslate()-1+Math.pow(-s.minTranslate()+startTranslate+diff,s.params.resistanceRatio);}else if(diff<0&&currentTranslate<s.maxTranslate()){disableParentSwiper=false;if(s.params.resistance)currentTranslate=s.maxTranslate()+1-Math.pow(s.maxTranslate()-startTranslate-diff,s.params.resistanceRatio);}if(disableParentSwiper){e.preventedByNestedSwiper=true;} // Directions locks
    if(!s.params.allowSwipeToNext&&s.swipeDirection==='next'&&currentTranslate<startTranslate){currentTranslate=startTranslate;}if(!s.params.allowSwipeToPrev&&s.swipeDirection==='prev'&&currentTranslate>startTranslate){currentTranslate=startTranslate;}if(!s.params.followFinger)return; // Threshold
    if(s.params.threshold>0){if(Math.abs(diff)>s.params.threshold||allowThresholdMove){if(!allowThresholdMove){allowThresholdMove=true;s.touches.startX=s.touches.currentX;s.touches.startY=s.touches.currentY;currentTranslate=startTranslate;s.touches.diff=s.isHorizontal()?s.touches.currentX-s.touches.startX:s.touches.currentY-s.touches.startY;return;}}else {currentTranslate=startTranslate;return;}} // Update active index in free mode
    if(s.params.freeMode||s.params.watchSlidesProgress){s.updateActiveIndex();}if(s.params.freeMode){ //Velocity
    if(velocities.length===0){velocities.push({position:s.touches[s.isHorizontal()?'startX':'startY'],time:touchStartTime});}velocities.push({position:s.touches[s.isHorizontal()?'currentX':'currentY'],time:new window.Date().getTime()});} // Update progress
    s.updateProgress(currentTranslate); // Update translate
    s.setWrapperTranslate(currentTranslate);};s.onTouchEnd=function(e){if(e.originalEvent)e=e.originalEvent;if(allowTouchCallbacks){s.emit('onTouchEnd',s,e);}allowTouchCallbacks=false;if(!isTouched)return; //Return Grab Cursor
    if(s.params.grabCursor&&isMoved&&isTouched){s.container[0].style.cursor='move';s.container[0].style.cursor='-webkit-grab';s.container[0].style.cursor='-moz-grab';s.container[0].style.cursor='grab';} // Time diff
    var touchEndTime=Date.now();var timeDiff=touchEndTime-touchStartTime; // Tap, doubleTap, Click
    if(s.allowClick){s.updateClickedSlide(e);s.emit('onTap',s,e);if(timeDiff<300&&touchEndTime-lastClickTime>300){if(clickTimeout)clearTimeout(clickTimeout);clickTimeout=setTimeout(function(){if(!s)return;if(s.params.paginationHide&&s.paginationContainer.length>0&&!$(e.target).hasClass(s.params.bulletClass)){s.paginationContainer.toggleClass(s.params.paginationHiddenClass);}s.emit('onClick',s,e);},300);}if(timeDiff<300&&touchEndTime-lastClickTime<300){if(clickTimeout)clearTimeout(clickTimeout);s.emit('onDoubleTap',s,e);}}lastClickTime=Date.now();setTimeout(function(){if(s)s.allowClick=true;},0);if(!isTouched||!isMoved||!s.swipeDirection||s.touches.diff===0||currentTranslate===startTranslate){isTouched=isMoved=false;return;}isTouched=isMoved=false;var currentPos;if(s.params.followFinger){currentPos=s.rtl?s.translate:-s.translate;}else {currentPos=-currentTranslate;}if(s.params.freeMode){if(currentPos<-s.minTranslate()){s.slideTo(s.activeIndex);return;}else if(currentPos>-s.maxTranslate()){if(s.slides.length<s.snapGrid.length){s.slideTo(s.snapGrid.length-1);}else {s.slideTo(s.slides.length-1);}return;}if(s.params.freeModeMomentum){if(velocities.length>1){var lastMoveEvent=velocities.pop(),velocityEvent=velocities.pop();var distance=lastMoveEvent.position-velocityEvent.position;var time=lastMoveEvent.time-velocityEvent.time;s.velocity=distance/time;s.velocity=s.velocity/2;if(Math.abs(s.velocity)<s.params.freeModeMinimumVelocity){s.velocity=0;} // this implies that the user stopped moving a finger then released.
    // There would be no events with distance zero, so the last event is stale.
    if(time>150||new window.Date().getTime()-lastMoveEvent.time>300){s.velocity=0;}}else {s.velocity=0;}velocities.length=0;var momentumDuration=1000*s.params.freeModeMomentumRatio;var momentumDistance=s.velocity*momentumDuration;var newPosition=s.translate+momentumDistance;if(s.rtl)newPosition=-newPosition;var doBounce=false;var afterBouncePosition;var bounceAmount=Math.abs(s.velocity)*20*s.params.freeModeMomentumBounceRatio;if(newPosition<s.maxTranslate()){if(s.params.freeModeMomentumBounce){if(newPosition+s.maxTranslate()<-bounceAmount){newPosition=s.maxTranslate()-bounceAmount;}afterBouncePosition=s.maxTranslate();doBounce=true;allowMomentumBounce=true;}else {newPosition=s.maxTranslate();}}else if(newPosition>s.minTranslate()){if(s.params.freeModeMomentumBounce){if(newPosition-s.minTranslate()>bounceAmount){newPosition=s.minTranslate()+bounceAmount;}afterBouncePosition=s.minTranslate();doBounce=true;allowMomentumBounce=true;}else {newPosition=s.minTranslate();}}else if(s.params.freeModeSticky){var j=0,nextSlide;for(j=0;j<s.snapGrid.length;j+=1){if(s.snapGrid[j]>-newPosition){nextSlide=j;break;}}if(Math.abs(s.snapGrid[nextSlide]-newPosition)<Math.abs(s.snapGrid[nextSlide-1]-newPosition)||s.swipeDirection==='next'){newPosition=s.snapGrid[nextSlide];}else {newPosition=s.snapGrid[nextSlide-1];}if(!s.rtl)newPosition=-newPosition;} //Fix duration
    if(s.velocity!==0){if(s.rtl){momentumDuration=Math.abs((-newPosition-s.translate)/s.velocity);}else {momentumDuration=Math.abs((newPosition-s.translate)/s.velocity);}}else if(s.params.freeModeSticky){s.slideReset();return;}if(s.params.freeModeMomentumBounce&&doBounce){s.updateProgress(afterBouncePosition);s.setWrapperTransition(momentumDuration);s.setWrapperTranslate(newPosition);s.onTransitionStart();s.animating=true;s.wrapper.transitionEnd(function(){if(!s||!allowMomentumBounce)return;s.emit('onMomentumBounce',s);s.setWrapperTransition(s.params.speed);s.setWrapperTranslate(afterBouncePosition);s.wrapper.transitionEnd(function(){if(!s)return;s.onTransitionEnd();});});}else if(s.velocity){s.updateProgress(newPosition);s.setWrapperTransition(momentumDuration);s.setWrapperTranslate(newPosition);s.onTransitionStart();if(!s.animating){s.animating=true;s.wrapper.transitionEnd(function(){if(!s)return;s.onTransitionEnd();});}}else {s.updateProgress(newPosition);}s.updateActiveIndex();}if(!s.params.freeModeMomentum||timeDiff>=s.params.longSwipesMs){s.updateProgress();s.updateActiveIndex();}return;} // Find current slide
    var i,stopIndex=0,groupSize=s.slidesSizesGrid[0];for(i=0;i<s.slidesGrid.length;i+=s.params.slidesPerGroup){if(typeof s.slidesGrid[i+s.params.slidesPerGroup]!=='undefined'){if(currentPos>=s.slidesGrid[i]&&currentPos<s.slidesGrid[i+s.params.slidesPerGroup]){stopIndex=i;groupSize=s.slidesGrid[i+s.params.slidesPerGroup]-s.slidesGrid[i];}}else {if(currentPos>=s.slidesGrid[i]){stopIndex=i;groupSize=s.slidesGrid[s.slidesGrid.length-1]-s.slidesGrid[s.slidesGrid.length-2];}}} // Find current slide size
    var ratio=(currentPos-s.slidesGrid[stopIndex])/groupSize;if(timeDiff>s.params.longSwipesMs){ // Long touches
    if(!s.params.longSwipes){s.slideTo(s.activeIndex);return;}if(s.swipeDirection==='next'){if(ratio>=s.params.longSwipesRatio)s.slideTo(stopIndex+s.params.slidesPerGroup);else s.slideTo(stopIndex);}if(s.swipeDirection==='prev'){if(ratio>1-s.params.longSwipesRatio)s.slideTo(stopIndex+s.params.slidesPerGroup);else s.slideTo(stopIndex);}}else { // Short swipes
    if(!s.params.shortSwipes){s.slideTo(s.activeIndex);return;}if(s.swipeDirection==='next'){s.slideTo(stopIndex+s.params.slidesPerGroup);}if(s.swipeDirection==='prev'){s.slideTo(stopIndex);}}}; /*=========================
              Transitions
              ===========================*/s._slideTo=function(slideIndex,speed){return s.slideTo(slideIndex,speed,true,true);};s.slideTo=function(slideIndex,speed,runCallbacks,internal){if(typeof runCallbacks==='undefined')runCallbacks=true;if(typeof slideIndex==='undefined')slideIndex=0;if(slideIndex<0)slideIndex=0;s.snapIndex=Math.floor(slideIndex/s.params.slidesPerGroup);if(s.snapIndex>=s.snapGrid.length)s.snapIndex=s.snapGrid.length-1;var translate=-s.snapGrid[s.snapIndex]; // Stop autoplay
    if(s.params.autoplay&&s.autoplaying){if(internal||!s.params.autoplayDisableOnInteraction){s.pauseAutoplay(speed);}else {s.stopAutoplay();}} // Update progress
    s.updateProgress(translate); // Normalize slideIndex
    for(var i=0;i<s.slidesGrid.length;i++){if(-Math.floor(translate*100)>=Math.floor(s.slidesGrid[i]*100)){slideIndex=i;}} // Directions locks
    if(!s.params.allowSwipeToNext&&translate<s.translate&&translate<s.minTranslate()){return false;}if(!s.params.allowSwipeToPrev&&translate>s.translate&&translate>s.maxTranslate()){if((s.activeIndex||0)!==slideIndex)return false;} // Update Index
    if(typeof speed==='undefined')speed=s.params.speed;s.previousIndex=s.activeIndex||0;s.activeIndex=slideIndex;if(s.rtl&&-translate===s.translate||!s.rtl&&translate===s.translate){ // Update Height
    if(s.params.autoHeight){s.updateAutoHeight();}s.updateClasses();if(s.params.effect!=='slide'){s.setWrapperTranslate(translate);}return false;}s.updateClasses();s.onTransitionStart(runCallbacks);if(speed===0){s.setWrapperTranslate(translate);s.setWrapperTransition(0);s.onTransitionEnd(runCallbacks);}else {s.setWrapperTranslate(translate);s.setWrapperTransition(speed);if(!s.animating){s.animating=true;s.wrapper.transitionEnd(function(){if(!s)return;s.onTransitionEnd(runCallbacks);});}}return true;};s.onTransitionStart=function(runCallbacks){if(typeof runCallbacks==='undefined')runCallbacks=true;if(s.params.autoHeight){s.updateAutoHeight();}if(s.lazy)s.lazy.onTransitionStart();if(runCallbacks){s.emit('onTransitionStart',s);if(s.activeIndex!==s.previousIndex){s.emit('onSlideChangeStart',s);if(s.activeIndex>s.previousIndex){s.emit('onSlideNextStart',s);}else {s.emit('onSlidePrevStart',s);}}}};s.onTransitionEnd=function(runCallbacks){s.animating=false;s.setWrapperTransition(0);if(typeof runCallbacks==='undefined')runCallbacks=true;if(s.lazy)s.lazy.onTransitionEnd();if(runCallbacks){s.emit('onTransitionEnd',s);if(s.activeIndex!==s.previousIndex){s.emit('onSlideChangeEnd',s);if(s.activeIndex>s.previousIndex){s.emit('onSlideNextEnd',s);}else {s.emit('onSlidePrevEnd',s);}}}if(s.params.hashnav&&s.hashnav){s.hashnav.setHash();}};s.slideNext=function(runCallbacks,speed,internal){if(s.params.loop){if(s.animating)return false;s.fixLoop();var clientLeft=s.container[0].clientLeft;return s.slideTo(s.activeIndex+s.params.slidesPerGroup,speed,runCallbacks,internal);}else return s.slideTo(s.activeIndex+s.params.slidesPerGroup,speed,runCallbacks,internal);};s._slideNext=function(speed){return s.slideNext(true,speed,true);};s.slidePrev=function(runCallbacks,speed,internal){if(s.params.loop){if(s.animating)return false;s.fixLoop();var clientLeft=s.container[0].clientLeft;return s.slideTo(s.activeIndex-1,speed,runCallbacks,internal);}else return s.slideTo(s.activeIndex-1,speed,runCallbacks,internal);};s._slidePrev=function(speed){return s.slidePrev(true,speed,true);};s.slideReset=function(runCallbacks,speed,internal){return s.slideTo(s.activeIndex,speed,runCallbacks);}; /*=========================
              Translate/transition helpers
              ===========================*/s.setWrapperTransition=function(duration,byController){s.wrapper.transition(duration);if(s.params.effect!=='slide'&&s.effects[s.params.effect]){s.effects[s.params.effect].setTransition(duration);}if(s.params.parallax&&s.parallax){s.parallax.setTransition(duration);}if(s.params.scrollbar&&s.scrollbar){s.scrollbar.setTransition(duration);}if(s.params.control&&s.controller){s.controller.setTransition(duration,byController);}s.emit('onSetTransition',s,duration);};s.setWrapperTranslate=function(translate,updateActiveIndex,byController){var x=0,y=0,z=0;if(s.isHorizontal()){x=s.rtl?-translate:translate;}else {y=translate;}if(s.params.roundLengths){x=round(x);y=round(y);}if(!s.params.virtualTranslate){if(s.support.transforms3d)s.wrapper.transform('translate3d('+x+'px, '+y+'px, '+z+'px)');else s.wrapper.transform('translate('+x+'px, '+y+'px)');}s.translate=s.isHorizontal()?x:y; // Check if we need to update progress
    var progress;var translatesDiff=s.maxTranslate()-s.minTranslate();if(translatesDiff===0){progress=0;}else {progress=(translate-s.minTranslate())/translatesDiff;}if(progress!==s.progress){s.updateProgress(translate);}if(updateActiveIndex)s.updateActiveIndex();if(s.params.effect!=='slide'&&s.effects[s.params.effect]){s.effects[s.params.effect].setTranslate(s.translate);}if(s.params.parallax&&s.parallax){s.parallax.setTranslate(s.translate);}if(s.params.scrollbar&&s.scrollbar){s.scrollbar.setTranslate(s.translate);}if(s.params.control&&s.controller){s.controller.setTranslate(s.translate,byController);}s.emit('onSetTranslate',s,s.translate);};s.getTranslate=function(el,axis){var matrix,curTransform,curStyle,transformMatrix; // automatic axis detection
    if(typeof axis==='undefined'){axis='x';}if(s.params.virtualTranslate){return s.rtl?-s.translate:s.translate;}curStyle=window.getComputedStyle(el,null);if(window.WebKitCSSMatrix){curTransform=curStyle.transform||curStyle.webkitTransform;if(curTransform.split(',').length>6){curTransform=curTransform.split(', ').map(function(a){return a.replace(',','.');}).join(', ');} // Some old versions of Webkit choke when 'none' is passed; pass
    // empty string instead in this case
    transformMatrix=new window.WebKitCSSMatrix(curTransform==='none'?'':curTransform);}else {transformMatrix=curStyle.MozTransform||curStyle.OTransform||curStyle.MsTransform||curStyle.msTransform||curStyle.transform||curStyle.getPropertyValue('transform').replace('translate(','matrix(1, 0, 0, 1,');matrix=transformMatrix.toString().split(',');}if(axis==='x'){ //Latest Chrome and webkits Fix
    if(window.WebKitCSSMatrix)curTransform=transformMatrix.m41; //Crazy IE10 Matrix
    else if(matrix.length===16)curTransform=parseFloat(matrix[12]); //Normal Browsers
    else curTransform=parseFloat(matrix[4]);}if(axis==='y'){ //Latest Chrome and webkits Fix
    if(window.WebKitCSSMatrix)curTransform=transformMatrix.m42; //Crazy IE10 Matrix
    else if(matrix.length===16)curTransform=parseFloat(matrix[13]); //Normal Browsers
    else curTransform=parseFloat(matrix[5]);}if(s.rtl&&curTransform)curTransform=-curTransform;return curTransform||0;};s.getWrapperTranslate=function(axis){if(typeof axis==='undefined'){axis=s.isHorizontal()?'x':'y';}return s.getTranslate(s.wrapper[0],axis);}; /*=========================
              Observer
              ===========================*/s.observers=[];function initObserver(target,options){options=options||{}; // create an observer instance
    var ObserverFunc=window.MutationObserver||window.WebkitMutationObserver;var observer=new ObserverFunc(function(mutations){mutations.forEach(function(mutation){s.onResize(true);s.emit('onObserverUpdate',s,mutation);});});observer.observe(target,{attributes:typeof options.attributes==='undefined'?true:options.attributes,childList:typeof options.childList==='undefined'?true:options.childList,characterData:typeof options.characterData==='undefined'?true:options.characterData});s.observers.push(observer);}s.initObservers=function(){if(s.params.observeParents){var containerParents=s.container.parents();for(var i=0;i<containerParents.length;i++){initObserver(containerParents[i]);}} // Observe container
    initObserver(s.container[0],{childList:false}); // Observe wrapper
    initObserver(s.wrapper[0],{attributes:false});};s.disconnectObservers=function(){for(var i=0;i<s.observers.length;i++){s.observers[i].disconnect();}s.observers=[];}; /*=========================
              Loop
              ===========================*/ // Create looped slides
    s.createLoop=function(){ // Remove duplicated slides
    s.wrapper.children('.'+s.params.slideClass+'.'+s.params.slideDuplicateClass).remove();var slides=s.wrapper.children('.'+s.params.slideClass);if(s.params.slidesPerView==='auto'&&!s.params.loopedSlides)s.params.loopedSlides=slides.length;s.loopedSlides=parseInt(s.params.loopedSlides||s.params.slidesPerView,10);s.loopedSlides=s.loopedSlides+s.params.loopAdditionalSlides;if(s.loopedSlides>slides.length){s.loopedSlides=slides.length;}var prependSlides=[],appendSlides=[],i;slides.each(function(index,el){var slide=$(this);if(index<s.loopedSlides)appendSlides.push(el);if(index<slides.length&&index>=slides.length-s.loopedSlides)prependSlides.push(el);slide.attr('data-swiper-slide-index',index);});for(i=0;i<appendSlides.length;i++){s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));}for(i=prependSlides.length-1;i>=0;i--){s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));}};s.destroyLoop=function(){s.wrapper.children('.'+s.params.slideClass+'.'+s.params.slideDuplicateClass).remove();s.slides.removeAttr('data-swiper-slide-index');};s.reLoop=function(updatePosition){var oldIndex=s.activeIndex-s.loopedSlides;s.destroyLoop();s.createLoop();s.updateSlidesSize();if(updatePosition){s.slideTo(oldIndex+s.loopedSlides,0,false);}};s.fixLoop=function(){var newIndex; //Fix For Negative Oversliding
    if(s.activeIndex<s.loopedSlides){newIndex=s.slides.length-s.loopedSlides*3+s.activeIndex;newIndex=newIndex+s.loopedSlides;s.slideTo(newIndex,0,false,true);} //Fix For Positive Oversliding
    else if(s.params.slidesPerView==='auto'&&s.activeIndex>=s.loopedSlides*2||s.activeIndex>s.slides.length-s.params.slidesPerView*2){newIndex=-s.slides.length+s.activeIndex+s.loopedSlides;newIndex=newIndex+s.loopedSlides;s.slideTo(newIndex,0,false,true);}}; /*=========================
              Append/Prepend/Remove Slides
              ===========================*/s.appendSlide=function(slides){if(s.params.loop){s.destroyLoop();}if((typeof slides==='undefined'?'undefined':babelHelpers.typeof(slides))==='object'&&slides.length){for(var i=0;i<slides.length;i++){if(slides[i])s.wrapper.append(slides[i]);}}else {s.wrapper.append(slides);}if(s.params.loop){s.createLoop();}if(!(s.params.observer&&s.support.observer)){s.update(true);}};s.prependSlide=function(slides){if(s.params.loop){s.destroyLoop();}var newActiveIndex=s.activeIndex+1;if((typeof slides==='undefined'?'undefined':babelHelpers.typeof(slides))==='object'&&slides.length){for(var i=0;i<slides.length;i++){if(slides[i])s.wrapper.prepend(slides[i]);}newActiveIndex=s.activeIndex+slides.length;}else {s.wrapper.prepend(slides);}if(s.params.loop){s.createLoop();}if(!(s.params.observer&&s.support.observer)){s.update(true);}s.slideTo(newActiveIndex,0,false);};s.removeSlide=function(slidesIndexes){if(s.params.loop){s.destroyLoop();s.slides=s.wrapper.children('.'+s.params.slideClass);}var newActiveIndex=s.activeIndex,indexToRemove;if((typeof slidesIndexes==='undefined'?'undefined':babelHelpers.typeof(slidesIndexes))==='object'&&slidesIndexes.length){for(var i=0;i<slidesIndexes.length;i++){indexToRemove=slidesIndexes[i];if(s.slides[indexToRemove])s.slides.eq(indexToRemove).remove();if(indexToRemove<newActiveIndex)newActiveIndex--;}newActiveIndex=Math.max(newActiveIndex,0);}else {indexToRemove=slidesIndexes;if(s.slides[indexToRemove])s.slides.eq(indexToRemove).remove();if(indexToRemove<newActiveIndex)newActiveIndex--;newActiveIndex=Math.max(newActiveIndex,0);}if(s.params.loop){s.createLoop();}if(!(s.params.observer&&s.support.observer)){s.update(true);}if(s.params.loop){s.slideTo(newActiveIndex+s.loopedSlides,0,false);}else {s.slideTo(newActiveIndex,0,false);}};s.removeAllSlides=function(){var slidesIndexes=[];for(var i=0;i<s.slides.length;i++){slidesIndexes.push(i);}s.removeSlide(slidesIndexes);}; /*=========================
              Effects
              ===========================*/s.effects={fade:{setTranslate:function setTranslate(){for(var i=0;i<s.slides.length;i++){var slide=s.slides.eq(i);var offset=slide[0].swiperSlideOffset;var tx=-offset;if(!s.params.virtualTranslate)tx=tx-s.translate;var ty=0;if(!s.isHorizontal()){ty=tx;tx=0;}var slideOpacity=s.params.fade.crossFade?Math.max(1-Math.abs(slide[0].progress),0):1+Math.min(Math.max(slide[0].progress,-1),0);slide.css({opacity:slideOpacity}).transform('translate3d('+tx+'px, '+ty+'px, 0px)');}},setTransition:function setTransition(duration){s.slides.transition(duration);if(s.params.virtualTranslate&&duration!==0){var eventTriggered=false;s.slides.transitionEnd(function(){if(eventTriggered)return;if(!s)return;eventTriggered=true;s.animating=false;var triggerEvents=['webkitTransitionEnd','transitionend','oTransitionEnd','MSTransitionEnd','msTransitionEnd'];for(var i=0;i<triggerEvents.length;i++){s.wrapper.trigger(triggerEvents[i]);}});}}},flip:{setTranslate:function setTranslate(){for(var i=0;i<s.slides.length;i++){var slide=s.slides.eq(i);var progress=slide[0].progress;if(s.params.flip.limitRotation){progress=Math.max(Math.min(slide[0].progress,1),-1);}var offset=slide[0].swiperSlideOffset;var rotate=-180*progress,rotateY=rotate,rotateX=0,tx=-offset,ty=0;if(!s.isHorizontal()){ty=tx;tx=0;rotateX=-rotateY;rotateY=0;}else if(s.rtl){rotateY=-rotateY;}slide[0].style.zIndex=-Math.abs(Math.round(progress))+s.slides.length;if(s.params.flip.slideShadows){ //Set shadows
    var shadowBefore=s.isHorizontal()?slide.find('.swiper-slide-shadow-left'):slide.find('.swiper-slide-shadow-top');var shadowAfter=s.isHorizontal()?slide.find('.swiper-slide-shadow-right'):slide.find('.swiper-slide-shadow-bottom');if(shadowBefore.length===0){shadowBefore=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'left':'top')+'"></div>');slide.append(shadowBefore);}if(shadowAfter.length===0){shadowAfter=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'right':'bottom')+'"></div>');slide.append(shadowAfter);}if(shadowBefore.length)shadowBefore[0].style.opacity=Math.max(-progress,0);if(shadowAfter.length)shadowAfter[0].style.opacity=Math.max(progress,0);}slide.transform('translate3d('+tx+'px, '+ty+'px, 0px) rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)');}},setTransition:function setTransition(duration){s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);if(s.params.virtualTranslate&&duration!==0){var eventTriggered=false;s.slides.eq(s.activeIndex).transitionEnd(function(){if(eventTriggered)return;if(!s)return;if(!$(this).hasClass(s.params.slideActiveClass))return;eventTriggered=true;s.animating=false;var triggerEvents=['webkitTransitionEnd','transitionend','oTransitionEnd','MSTransitionEnd','msTransitionEnd'];for(var i=0;i<triggerEvents.length;i++){s.wrapper.trigger(triggerEvents[i]);}});}}},cube:{setTranslate:function setTranslate(){var wrapperRotate=0,cubeShadow;if(s.params.cube.shadow){if(s.isHorizontal()){cubeShadow=s.wrapper.find('.swiper-cube-shadow');if(cubeShadow.length===0){cubeShadow=$('<div class="swiper-cube-shadow"></div>');s.wrapper.append(cubeShadow);}cubeShadow.css({height:s.width+'px'});}else {cubeShadow=s.container.find('.swiper-cube-shadow');if(cubeShadow.length===0){cubeShadow=$('<div class="swiper-cube-shadow"></div>');s.container.append(cubeShadow);}}}for(var i=0;i<s.slides.length;i++){var slide=s.slides.eq(i);var slideAngle=i*90;var round=Math.floor(slideAngle/360);if(s.rtl){slideAngle=-slideAngle;round=Math.floor(-slideAngle/360);}var progress=Math.max(Math.min(slide[0].progress,1),-1);var tx=0,ty=0,tz=0;if(i%4===0){tx=-round*4*s.size;tz=0;}else if((i-1)%4===0){tx=0;tz=-round*4*s.size;}else if((i-2)%4===0){tx=s.size+round*4*s.size;tz=s.size;}else if((i-3)%4===0){tx=-s.size;tz=3*s.size+s.size*4*round;}if(s.rtl){tx=-tx;}if(!s.isHorizontal()){ty=tx;tx=0;}var transform='rotateX('+(s.isHorizontal()?0:-slideAngle)+'deg) rotateY('+(s.isHorizontal()?slideAngle:0)+'deg) translate3d('+tx+'px, '+ty+'px, '+tz+'px)';if(progress<=1&&progress>-1){wrapperRotate=i*90+progress*90;if(s.rtl)wrapperRotate=-i*90-progress*90;}slide.transform(transform);if(s.params.cube.slideShadows){ //Set shadows
    var shadowBefore=s.isHorizontal()?slide.find('.swiper-slide-shadow-left'):slide.find('.swiper-slide-shadow-top');var shadowAfter=s.isHorizontal()?slide.find('.swiper-slide-shadow-right'):slide.find('.swiper-slide-shadow-bottom');if(shadowBefore.length===0){shadowBefore=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'left':'top')+'"></div>');slide.append(shadowBefore);}if(shadowAfter.length===0){shadowAfter=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'right':'bottom')+'"></div>');slide.append(shadowAfter);}if(shadowBefore.length)shadowBefore[0].style.opacity=Math.max(-progress,0);if(shadowAfter.length)shadowAfter[0].style.opacity=Math.max(progress,0);}}s.wrapper.css({'-webkit-transform-origin':'50% 50% -'+s.size/2+'px','-moz-transform-origin':'50% 50% -'+s.size/2+'px','-ms-transform-origin':'50% 50% -'+s.size/2+'px','transform-origin':'50% 50% -'+s.size/2+'px'});if(s.params.cube.shadow){if(s.isHorizontal()){cubeShadow.transform('translate3d(0px, '+(s.width/2+s.params.cube.shadowOffset)+'px, '+-s.width/2+'px) rotateX(90deg) rotateZ(0deg) scale('+s.params.cube.shadowScale+')');}else {var shadowAngle=Math.abs(wrapperRotate)-Math.floor(Math.abs(wrapperRotate)/90)*90;var multiplier=1.5-(Math.sin(shadowAngle*2*Math.PI/360)/2+Math.cos(shadowAngle*2*Math.PI/360)/2);var scale1=s.params.cube.shadowScale,scale2=s.params.cube.shadowScale/multiplier,offset=s.params.cube.shadowOffset;cubeShadow.transform('scale3d('+scale1+', 1, '+scale2+') translate3d(0px, '+(s.height/2+offset)+'px, '+-s.height/2/scale2+'px) rotateX(-90deg)');}}var zFactor=s.isSafari||s.isUiWebView?-s.size/2:0;s.wrapper.transform('translate3d(0px,0,'+zFactor+'px) rotateX('+(s.isHorizontal()?0:wrapperRotate)+'deg) rotateY('+(s.isHorizontal()?-wrapperRotate:0)+'deg)');},setTransition:function setTransition(duration){s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);if(s.params.cube.shadow&&!s.isHorizontal()){s.container.find('.swiper-cube-shadow').transition(duration);}}},coverflow:{setTranslate:function setTranslate(){var transform=s.translate;var center=s.isHorizontal()?-transform+s.width/2:-transform+s.height/2;var rotate=s.isHorizontal()?s.params.coverflow.rotate:-s.params.coverflow.rotate;var translate=s.params.coverflow.depth; //Each slide offset from center
    for(var i=0,length=s.slides.length;i<length;i++){var slide=s.slides.eq(i);var slideSize=s.slidesSizesGrid[i];var slideOffset=slide[0].swiperSlideOffset;var offsetMultiplier=(center-slideOffset-slideSize/2)/slideSize*s.params.coverflow.modifier;var rotateY=s.isHorizontal()?rotate*offsetMultiplier:0;var rotateX=s.isHorizontal()?0:rotate*offsetMultiplier; // var rotateZ = 0
    var translateZ=-translate*Math.abs(offsetMultiplier);var translateY=s.isHorizontal()?0:s.params.coverflow.stretch*offsetMultiplier;var translateX=s.isHorizontal()?s.params.coverflow.stretch*offsetMultiplier:0; //Fix for ultra small values
    if(Math.abs(translateX)<0.001)translateX=0;if(Math.abs(translateY)<0.001)translateY=0;if(Math.abs(translateZ)<0.001)translateZ=0;if(Math.abs(rotateY)<0.001)rotateY=0;if(Math.abs(rotateX)<0.001)rotateX=0;var slideTransform='translate3d('+translateX+'px,'+translateY+'px,'+translateZ+'px)  rotateX('+rotateX+'deg) rotateY('+rotateY+'deg)';slide.transform(slideTransform);slide[0].style.zIndex=-Math.abs(Math.round(offsetMultiplier))+1;if(s.params.coverflow.slideShadows){ //Set shadows
    var shadowBefore=s.isHorizontal()?slide.find('.swiper-slide-shadow-left'):slide.find('.swiper-slide-shadow-top');var shadowAfter=s.isHorizontal()?slide.find('.swiper-slide-shadow-right'):slide.find('.swiper-slide-shadow-bottom');if(shadowBefore.length===0){shadowBefore=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'left':'top')+'"></div>');slide.append(shadowBefore);}if(shadowAfter.length===0){shadowAfter=$('<div class="swiper-slide-shadow-'+(s.isHorizontal()?'right':'bottom')+'"></div>');slide.append(shadowAfter);}if(shadowBefore.length)shadowBefore[0].style.opacity=offsetMultiplier>0?offsetMultiplier:0;if(shadowAfter.length)shadowAfter[0].style.opacity=-offsetMultiplier>0?-offsetMultiplier:0;}} //Set correct perspective for IE10
    if(s.browser.ie){var ws=s.wrapper[0].style;ws.perspectiveOrigin=center+'px 50%';}},setTransition:function setTransition(duration){s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);}}}; /*=========================
              Images Lazy Loading
              ===========================*/s.lazy={initialImageLoaded:false,loadImageInSlide:function loadImageInSlide(index,loadInDuplicate){if(typeof index==='undefined')return;if(typeof loadInDuplicate==='undefined')loadInDuplicate=true;if(s.slides.length===0)return;var slide=s.slides.eq(index);var img=slide.find('.swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)');if(slide.hasClass('swiper-lazy')&&!slide.hasClass('swiper-lazy-loaded')&&!slide.hasClass('swiper-lazy-loading')){img=img.add(slide[0]);}if(img.length===0)return;img.each(function(){var _img=$(this);_img.addClass('swiper-lazy-loading');var background=_img.attr('data-background');var src=_img.attr('data-src'),srcset=_img.attr('data-srcset');s.loadImage(_img[0],src||background,srcset,false,function(){if(background){_img.css('background-image','url("'+background+'")');_img.removeAttr('data-background');}else {if(srcset){_img.attr('srcset',srcset);_img.removeAttr('data-srcset');}if(src){_img.attr('src',src);_img.removeAttr('data-src');}}_img.addClass('swiper-lazy-loaded').removeClass('swiper-lazy-loading');slide.find('.swiper-lazy-preloader, .preloader').remove();if(s.params.loop&&loadInDuplicate){var slideOriginalIndex=slide.attr('data-swiper-slide-index');if(slide.hasClass(s.params.slideDuplicateClass)){var originalSlide=s.wrapper.children('[data-swiper-slide-index="'+slideOriginalIndex+'"]:not(.'+s.params.slideDuplicateClass+')');s.lazy.loadImageInSlide(originalSlide.index(),false);}else {var duplicatedSlide=s.wrapper.children('.'+s.params.slideDuplicateClass+'[data-swiper-slide-index="'+slideOriginalIndex+'"]');s.lazy.loadImageInSlide(duplicatedSlide.index(),false);}}s.emit('onLazyImageReady',s,slide[0],_img[0]);});s.emit('onLazyImageLoad',s,slide[0],_img[0]);});},load:function load(){var i;if(s.params.watchSlidesVisibility){s.wrapper.children('.'+s.params.slideVisibleClass).each(function(){s.lazy.loadImageInSlide($(this).index());});}else {if(s.params.slidesPerView>1){for(i=s.activeIndex;i<s.activeIndex+s.params.slidesPerView;i++){if(s.slides[i])s.lazy.loadImageInSlide(i);}}else {s.lazy.loadImageInSlide(s.activeIndex);}}if(s.params.lazyLoadingInPrevNext){if(s.params.slidesPerView>1||s.params.lazyLoadingInPrevNextAmount&&s.params.lazyLoadingInPrevNextAmount>1){var amount=s.params.lazyLoadingInPrevNextAmount;var spv=s.params.slidesPerView;var maxIndex=Math.min(s.activeIndex+spv+Math.max(amount,spv),s.slides.length);var minIndex=Math.max(s.activeIndex-Math.max(spv,amount),0); // Next Slides
    for(i=s.activeIndex+s.params.slidesPerView;i<maxIndex;i++){if(s.slides[i])s.lazy.loadImageInSlide(i);} // Prev Slides
    for(i=minIndex;i<s.activeIndex;i++){if(s.slides[i])s.lazy.loadImageInSlide(i);}}else {var nextSlide=s.wrapper.children('.'+s.params.slideNextClass);if(nextSlide.length>0)s.lazy.loadImageInSlide(nextSlide.index());var prevSlide=s.wrapper.children('.'+s.params.slidePrevClass);if(prevSlide.length>0)s.lazy.loadImageInSlide(prevSlide.index());}}},onTransitionStart:function onTransitionStart(){if(s.params.lazyLoading){if(s.params.lazyLoadingOnTransitionStart||!s.params.lazyLoadingOnTransitionStart&&!s.lazy.initialImageLoaded){s.lazy.load();}}},onTransitionEnd:function onTransitionEnd(){if(s.params.lazyLoading&&!s.params.lazyLoadingOnTransitionStart){s.lazy.load();}}}; /*=========================
              Scrollbar
              ===========================*/s.scrollbar={isTouched:false,setDragPosition:function setDragPosition(e){var sb=s.scrollbar;var x=0,y=0;var translate;var pointerPosition=s.isHorizontal()?e.type==='touchstart'||e.type==='touchmove'?e.targetTouches[0].pageX:e.pageX||e.clientX:e.type==='touchstart'||e.type==='touchmove'?e.targetTouches[0].pageY:e.pageY||e.clientY;var position=pointerPosition-sb.track.offset()[s.isHorizontal()?'left':'top']-sb.dragSize/2;var positionMin=-s.minTranslate()*sb.moveDivider;var positionMax=-s.maxTranslate()*sb.moveDivider;if(position<positionMin){position=positionMin;}else if(position>positionMax){position=positionMax;}position=-position/sb.moveDivider;s.updateProgress(position);s.setWrapperTranslate(position,true);},dragStart:function dragStart(e){var sb=s.scrollbar;sb.isTouched=true;e.preventDefault();e.stopPropagation();sb.setDragPosition(e);clearTimeout(sb.dragTimeout);sb.track.transition(0);if(s.params.scrollbarHide){sb.track.css('opacity',1);}s.wrapper.transition(100);sb.drag.transition(100);s.emit('onScrollbarDragStart',s);},dragMove:function dragMove(e){var sb=s.scrollbar;if(!sb.isTouched)return;if(e.preventDefault)e.preventDefault();else e.returnValue=false;sb.setDragPosition(e);s.wrapper.transition(0);sb.track.transition(0);sb.drag.transition(0);s.emit('onScrollbarDragMove',s);},dragEnd:function dragEnd(e){var sb=s.scrollbar;if(!sb.isTouched)return;sb.isTouched=false;if(s.params.scrollbarHide){clearTimeout(sb.dragTimeout);sb.dragTimeout=setTimeout(function(){sb.track.css('opacity',0);sb.track.transition(400);},1000);}s.emit('onScrollbarDragEnd',s);if(s.params.scrollbarSnapOnRelease){s.slideReset();}},enableDraggable:function enableDraggable(){var sb=s.scrollbar;var target=s.support.touch?sb.track:document;$(sb.track).on(s.touchEvents.start,sb.dragStart);$(target).on(s.touchEvents.move,sb.dragMove);$(target).on(s.touchEvents.end,sb.dragEnd);},disableDraggable:function disableDraggable(){var sb=s.scrollbar;var target=s.support.touch?sb.track:document;$(sb.track).off(s.touchEvents.start,sb.dragStart);$(target).off(s.touchEvents.move,sb.dragMove);$(target).off(s.touchEvents.end,sb.dragEnd);},set:function set(){if(!s.params.scrollbar)return;var sb=s.scrollbar;sb.track=$(s.params.scrollbar);if(s.params.uniqueNavElements&&typeof s.params.scrollbar==='string'&&sb.track.length>1&&s.container.find(s.params.scrollbar).length===1){sb.track=s.container.find(s.params.scrollbar);}sb.drag=sb.track.find('.swiper-scrollbar-drag');if(sb.drag.length===0){sb.drag=$('<div class="swiper-scrollbar-drag"></div>');sb.track.append(sb.drag);}sb.drag[0].style.width='';sb.drag[0].style.height='';sb.trackSize=s.isHorizontal()?sb.track[0].offsetWidth:sb.track[0].offsetHeight;sb.divider=s.size/s.virtualSize;sb.moveDivider=sb.divider*(sb.trackSize/s.size);sb.dragSize=sb.trackSize*sb.divider;if(s.isHorizontal()){sb.drag[0].style.width=sb.dragSize+'px';}else {sb.drag[0].style.height=sb.dragSize+'px';}if(sb.divider>=1){sb.track[0].style.display='none';}else {sb.track[0].style.display='';}if(s.params.scrollbarHide){sb.track[0].style.opacity=0;}},setTranslate:function setTranslate(){if(!s.params.scrollbar)return;var diff;var sb=s.scrollbar;var translate=s.translate||0;var newPos;var newSize=sb.dragSize;newPos=(sb.trackSize-sb.dragSize)*s.progress;if(s.rtl&&s.isHorizontal()){newPos=-newPos;if(newPos>0){newSize=sb.dragSize-newPos;newPos=0;}else if(-newPos+sb.dragSize>sb.trackSize){newSize=sb.trackSize+newPos;}}else {if(newPos<0){newSize=sb.dragSize+newPos;newPos=0;}else if(newPos+sb.dragSize>sb.trackSize){newSize=sb.trackSize-newPos;}}if(s.isHorizontal()){if(s.support.transforms3d){sb.drag.transform('translate3d('+newPos+'px, 0, 0)');}else {sb.drag.transform('translateX('+newPos+'px)');}sb.drag[0].style.width=newSize+'px';}else {if(s.support.transforms3d){sb.drag.transform('translate3d(0px, '+newPos+'px, 0)');}else {sb.drag.transform('translateY('+newPos+'px)');}sb.drag[0].style.height=newSize+'px';}if(s.params.scrollbarHide){clearTimeout(sb.timeout);sb.track[0].style.opacity=1;sb.timeout=setTimeout(function(){sb.track[0].style.opacity=0;sb.track.transition(400);},1000);}},setTransition:function setTransition(duration){if(!s.params.scrollbar)return;s.scrollbar.drag.transition(duration);}}; /*=========================
              Controller
              ===========================*/s.controller={LinearSpline:function LinearSpline(x,y){this.x=x;this.y=y;this.lastIndex=x.length-1; // Given an x value (x2), return the expected y2 value:
    // (x1,y1) is the known point before given value,
    // (x3,y3) is the known point after given value.
    var i1,i3;var l=this.x.length;this.interpolate=function(x2){if(!x2)return 0; // Get the indexes of x1 and x3 (the array indexes before and after given x2):
    i3=binarySearch(this.x,x2);i1=i3-1; // We have our indexes i1 & i3, so we can calculate already:
    // y2 := ((x2−x1) × (y3−y1)) ÷ (x3−x1) + y1
    return (x2-this.x[i1])*(this.y[i3]-this.y[i1])/(this.x[i3]-this.x[i1])+this.y[i1];};var binarySearch=function(){var maxIndex,minIndex,guess;return function(array,val){minIndex=-1;maxIndex=array.length;while(maxIndex-minIndex>1){if(array[guess=maxIndex+minIndex>>1]<=val){minIndex=guess;}else {maxIndex=guess;}}return maxIndex;};}();}, //xxx: for now i will just save one spline function to to
    getInterpolateFunction:function getInterpolateFunction(c){if(!s.controller.spline)s.controller.spline=s.params.loop?new s.controller.LinearSpline(s.slidesGrid,c.slidesGrid):new s.controller.LinearSpline(s.snapGrid,c.snapGrid);},setTranslate:function setTranslate(translate,byController){var controlled=s.params.control;var multiplier,controlledTranslate;function setControlledTranslate(c){ // this will create an Interpolate function based on the snapGrids
    // x is the Grid of the scrolled scroller and y will be the controlled scroller
    // it makes sense to create this only once and recall it for the interpolation
    // the function does a lot of value caching for performance
    translate=c.rtl&&c.params.direction==='horizontal'?-s.translate:s.translate;if(s.params.controlBy==='slide'){s.controller.getInterpolateFunction(c); // i am not sure why the values have to be multiplicated this way, tried to invert the snapGrid
    // but it did not work out
    controlledTranslate=-s.controller.spline.interpolate(-translate);}if(!controlledTranslate||s.params.controlBy==='container'){multiplier=(c.maxTranslate()-c.minTranslate())/(s.maxTranslate()-s.minTranslate());controlledTranslate=(translate-s.minTranslate())*multiplier+c.minTranslate();}if(s.params.controlInverse){controlledTranslate=c.maxTranslate()-controlledTranslate;}c.updateProgress(controlledTranslate);c.setWrapperTranslate(controlledTranslate,false,s);c.updateActiveIndex();}if(s.isArray(controlled)){for(var i=0;i<controlled.length;i++){if(controlled[i]!==byController&&controlled[i] instanceof Swiper){setControlledTranslate(controlled[i]);}}}else if(controlled instanceof Swiper&&byController!==controlled){setControlledTranslate(controlled);}},setTransition:function setTransition(duration,byController){var controlled=s.params.control;var i;function setControlledTransition(c){c.setWrapperTransition(duration,s);if(duration!==0){c.onTransitionStart();c.wrapper.transitionEnd(function(){if(!controlled)return;if(c.params.loop&&s.params.controlBy==='slide'){c.fixLoop();}c.onTransitionEnd();});}}if(s.isArray(controlled)){for(i=0;i<controlled.length;i++){if(controlled[i]!==byController&&controlled[i] instanceof Swiper){setControlledTransition(controlled[i]);}}}else if(controlled instanceof Swiper&&byController!==controlled){setControlledTransition(controlled);}}}; /*=========================
              Hash Navigation
              ===========================*/s.hashnav={init:function init(){if(!s.params.hashnav)return;s.hashnav.initialized=true;var hash=document.location.hash.replace('#','');if(!hash)return;var speed=0;for(var i=0,length=s.slides.length;i<length;i++){var slide=s.slides.eq(i);var slideHash=slide.attr('data-hash');if(slideHash===hash&&!slide.hasClass(s.params.slideDuplicateClass)){var index=slide.index();s.slideTo(index,speed,s.params.runCallbacksOnInit,true);}}},setHash:function setHash(){if(!s.hashnav.initialized||!s.params.hashnav)return;document.location.hash=s.slides.eq(s.activeIndex).attr('data-hash')||'';}}; /*=========================
              Keyboard Control
              ===========================*/function handleKeyboard(e){if(e.originalEvent)e=e.originalEvent; //jquery fix
    var kc=e.keyCode||e.charCode; // Directions locks
    if(!s.params.allowSwipeToNext&&(s.isHorizontal()&&kc===39||!s.isHorizontal()&&kc===40)){return false;}if(!s.params.allowSwipeToPrev&&(s.isHorizontal()&&kc===37||!s.isHorizontal()&&kc===38)){return false;}if(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey){return;}if(document.activeElement&&document.activeElement.nodeName&&(document.activeElement.nodeName.toLowerCase()==='input'||document.activeElement.nodeName.toLowerCase()==='textarea')){return;}if(kc===37||kc===39||kc===38||kc===40){var inView=false; //Check that swiper should be inside of visible area of window
    if(s.container.parents('.swiper-slide').length>0&&s.container.parents('.swiper-slide-active').length===0){return;}var windowScroll={left:window.pageXOffset,top:window.pageYOffset};var windowWidth=window.innerWidth;var windowHeight=window.innerHeight;var swiperOffset=s.container.offset();if(s.rtl)swiperOffset.left=swiperOffset.left-s.container[0].scrollLeft;var swiperCoord=[[swiperOffset.left,swiperOffset.top],[swiperOffset.left+s.width,swiperOffset.top],[swiperOffset.left,swiperOffset.top+s.height],[swiperOffset.left+s.width,swiperOffset.top+s.height]];for(var i=0;i<swiperCoord.length;i++){var point=swiperCoord[i];if(point[0]>=windowScroll.left&&point[0]<=windowScroll.left+windowWidth&&point[1]>=windowScroll.top&&point[1]<=windowScroll.top+windowHeight){inView=true;}}if(!inView)return;}if(s.isHorizontal()){if(kc===37||kc===39){if(e.preventDefault)e.preventDefault();else e.returnValue=false;}if(kc===39&&!s.rtl||kc===37&&s.rtl)s.slideNext();if(kc===37&&!s.rtl||kc===39&&s.rtl)s.slidePrev();}else {if(kc===38||kc===40){if(e.preventDefault)e.preventDefault();else e.returnValue=false;}if(kc===40)s.slideNext();if(kc===38)s.slidePrev();}}s.disableKeyboardControl=function(){s.params.keyboardControl=false;$(document).off('keydown',handleKeyboard);};s.enableKeyboardControl=function(){s.params.keyboardControl=true;$(document).on('keydown',handleKeyboard);}; /*=========================
              Mousewheel Control
              ===========================*/s.mousewheel={event:false,lastScrollTime:new window.Date().getTime()};if(s.params.mousewheelControl){try{new window.WheelEvent('wheel');s.mousewheel.event='wheel';}catch(e){if(window.WheelEvent||s.container[0]&&'wheel' in s.container[0]){s.mousewheel.event='wheel';}}if(!s.mousewheel.event&&window.WheelEvent){}if(!s.mousewheel.event&&document.onmousewheel!==undefined){s.mousewheel.event='mousewheel';}if(!s.mousewheel.event){s.mousewheel.event='DOMMouseScroll';}}function handleMousewheel(e){if(e.originalEvent)e=e.originalEvent; //jquery fix
    var we=s.mousewheel.event;var delta=0;var rtlFactor=s.rtl?-1:1; //WebKits
    if(we==='mousewheel'){if(s.params.mousewheelForceToAxis){if(s.isHorizontal()){if(Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY))delta=e.wheelDeltaX*rtlFactor;else return;}else {if(Math.abs(e.wheelDeltaY)>Math.abs(e.wheelDeltaX))delta=e.wheelDeltaY;else return;}}else {delta=Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY)?-e.wheelDeltaX*rtlFactor:-e.wheelDeltaY;}} //Old FireFox
    else if(we==='DOMMouseScroll')delta=-e.detail; //New FireFox
    else if(we==='wheel'){if(s.params.mousewheelForceToAxis){if(s.isHorizontal()){if(Math.abs(e.deltaX)>Math.abs(e.deltaY))delta=-e.deltaX*rtlFactor;else return;}else {if(Math.abs(e.deltaY)>Math.abs(e.deltaX))delta=-e.deltaY;else return;}}else {delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX*rtlFactor:-e.deltaY;}}if(delta===0)return;if(s.params.mousewheelInvert)delta=-delta;if(!s.params.freeMode){if(new window.Date().getTime()-s.mousewheel.lastScrollTime>60){if(delta<0){if((!s.isEnd||s.params.loop)&&!s.animating)s.slideNext();else if(s.params.mousewheelReleaseOnEdges)return true;}else {if((!s.isBeginning||s.params.loop)&&!s.animating)s.slidePrev();else if(s.params.mousewheelReleaseOnEdges)return true;}}s.mousewheel.lastScrollTime=new window.Date().getTime();}else { //Freemode or scrollContainer:
    var position=s.getWrapperTranslate()+delta*s.params.mousewheelSensitivity;var wasBeginning=s.isBeginning,wasEnd=s.isEnd;if(position>=s.minTranslate())position=s.minTranslate();if(position<=s.maxTranslate())position=s.maxTranslate();s.setWrapperTransition(0);s.setWrapperTranslate(position);s.updateProgress();s.updateActiveIndex();if(!wasBeginning&&s.isBeginning||!wasEnd&&s.isEnd){s.updateClasses();}if(s.params.freeModeSticky){clearTimeout(s.mousewheel.timeout);s.mousewheel.timeout=setTimeout(function(){s.slideReset();},300);}else {if(s.params.lazyLoading&&s.lazy){s.lazy.load();}} // Return page scroll on edge positions
    if(position===0||position===s.maxTranslate())return;}if(s.params.autoplay)s.stopAutoplay();if(e.preventDefault)e.preventDefault();else e.returnValue=false;return false;}s.disableMousewheelControl=function(){if(!s.mousewheel.event)return false;s.container.off(s.mousewheel.event,handleMousewheel);return true;};s.enableMousewheelControl=function(){if(!s.mousewheel.event)return false;s.container.on(s.mousewheel.event,handleMousewheel);return true;}; /*=========================
              Parallax
              ===========================*/function setParallaxTransform(el,progress){el=$(el);var p,pX,pY;var rtlFactor=s.rtl?-1:1;p=el.attr('data-swiper-parallax')||'0';pX=el.attr('data-swiper-parallax-x');pY=el.attr('data-swiper-parallax-y');if(pX||pY){pX=pX||'0';pY=pY||'0';}else {if(s.isHorizontal()){pX=p;pY='0';}else {pY=p;pX='0';}}if(pX.indexOf('%')>=0){pX=parseInt(pX,10)*progress*rtlFactor+'%';}else {pX=pX*progress*rtlFactor+'px';}if(pY.indexOf('%')>=0){pY=parseInt(pY,10)*progress+'%';}else {pY=pY*progress+'px';}el.transform('translate3d('+pX+', '+pY+',0px)');}s.parallax={setTranslate:function setTranslate(){s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){setParallaxTransform(this,s.progress);});s.slides.each(function(){var slide=$(this);slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){var progress=Math.min(Math.max(slide[0].progress,-1),1);setParallaxTransform(this,progress);});});},setTransition:function setTransition(duration){if(typeof duration==='undefined')duration=s.params.speed;s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){var el=$(this);var parallaxDuration=parseInt(el.attr('data-swiper-parallax-duration'),10)||duration;if(duration===0)parallaxDuration=0;el.transition(parallaxDuration);});}}; /*=========================
              Plugins API. Collect all and init all plugins
              ===========================*/s._plugins=[];for(var plugin in s.plugins){var p=s.plugins[plugin](s,s.params[plugin]);if(p)s._plugins.push(p);} // Method to call all plugins event/method
    s.callPlugins=function(eventName){for(var i=0;i<s._plugins.length;i++){if(eventName in s._plugins[i]){s._plugins[i][eventName](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);}}}; /*=========================
              Events/Callbacks/Plugins Emitter
              ===========================*/function normalizeEventName(eventName){if(eventName.indexOf('on')!==0){if(eventName[0]!==eventName[0].toUpperCase()){eventName='on'+eventName[0].toUpperCase()+eventName.substring(1);}else {eventName='on'+eventName;}}return eventName;}s.emitterEventListeners={};s.emit=function(eventName){ // Trigger callbacks
    if(s.params[eventName]){s.params[eventName](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);}var i; // Trigger events
    if(s.emitterEventListeners[eventName]){for(i=0;i<s.emitterEventListeners[eventName].length;i++){s.emitterEventListeners[eventName][i](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);}} // Trigger plugins
    if(s.callPlugins)s.callPlugins(eventName,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);};s.on=function(eventName,handler){eventName=normalizeEventName(eventName);if(!s.emitterEventListeners[eventName])s.emitterEventListeners[eventName]=[];s.emitterEventListeners[eventName].push(handler);return s;};s.off=function(eventName,handler){var i;eventName=normalizeEventName(eventName);if(typeof handler==='undefined'){ // Remove all handlers for such event
    s.emitterEventListeners[eventName]=[];return s;}if(!s.emitterEventListeners[eventName]||s.emitterEventListeners[eventName].length===0)return;for(i=0;i<s.emitterEventListeners[eventName].length;i++){if(s.emitterEventListeners[eventName][i]===handler)s.emitterEventListeners[eventName].splice(i,1);}return s;};s.once=function(eventName,handler){eventName=normalizeEventName(eventName);var _handler=function _handler(){handler(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);s.off(eventName,_handler);};s.on(eventName,_handler);return s;}; // Accessibility tools
    s.a11y={makeFocusable:function makeFocusable($el){$el.attr('tabIndex','0');return $el;},addRole:function addRole($el,role){$el.attr('role',role);return $el;},addLabel:function addLabel($el,label){$el.attr('aria-label',label);return $el;},disable:function disable($el){$el.attr('aria-disabled',true);return $el;},enable:function enable($el){$el.attr('aria-disabled',false);return $el;},onEnterKey:function onEnterKey(event){if(event.keyCode!==13)return;if($(event.target).is(s.params.nextButton)){s.onClickNext(event);if(s.isEnd){s.a11y.notify(s.params.lastSlideMessage);}else {s.a11y.notify(s.params.nextSlideMessage);}}else if($(event.target).is(s.params.prevButton)){s.onClickPrev(event);if(s.isBeginning){s.a11y.notify(s.params.firstSlideMessage);}else {s.a11y.notify(s.params.prevSlideMessage);}}if($(event.target).is('.'+s.params.bulletClass)){$(event.target)[0].click();}},liveRegion:$('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),notify:function notify(message){var notification=s.a11y.liveRegion;if(notification.length===0)return;notification.html('');notification.html(message);},init:function init(){ // Setup accessibility
    if(s.params.nextButton&&s.nextButton&&s.nextButton.length>0){s.a11y.makeFocusable(s.nextButton);s.a11y.addRole(s.nextButton,'button');s.a11y.addLabel(s.nextButton,s.params.nextSlideMessage);}if(s.params.prevButton&&s.prevButton&&s.prevButton.length>0){s.a11y.makeFocusable(s.prevButton);s.a11y.addRole(s.prevButton,'button');s.a11y.addLabel(s.prevButton,s.params.prevSlideMessage);}$(s.container).append(s.a11y.liveRegion);},initPagination:function initPagination(){if(s.params.pagination&&s.params.paginationClickable&&s.bullets&&s.bullets.length){s.bullets.each(function(){var bullet=$(this);s.a11y.makeFocusable(bullet);s.a11y.addRole(bullet,'button');s.a11y.addLabel(bullet,s.params.paginationBulletMessage.replace(/{{index}}/,bullet.index()+1));});}},destroy:function destroy(){if(s.a11y.liveRegion&&s.a11y.liveRegion.length>0)s.a11y.liveRegion.remove();}}; /*=========================
              Init/Destroy
              ===========================*/s.init=function(){if(s.params.loop)s.createLoop();s.updateContainerSize();s.updateSlidesSize();s.updatePagination();if(s.params.scrollbar&&s.scrollbar){s.scrollbar.set();if(s.params.scrollbarDraggable){s.scrollbar.enableDraggable();}}if(s.params.effect!=='slide'&&s.effects[s.params.effect]){if(!s.params.loop)s.updateProgress();s.effects[s.params.effect].setTranslate();}if(s.params.loop){s.slideTo(s.params.initialSlide+s.loopedSlides,0,s.params.runCallbacksOnInit);}else {s.slideTo(s.params.initialSlide,0,s.params.runCallbacksOnInit);if(s.params.initialSlide===0){if(s.parallax&&s.params.parallax)s.parallax.setTranslate();if(s.lazy&&s.params.lazyLoading){s.lazy.load();s.lazy.initialImageLoaded=true;}}}s.attachEvents();if(s.params.observer&&s.support.observer){s.initObservers();}if(s.params.preloadImages&&!s.params.lazyLoading){s.preloadImages();}if(s.params.autoplay){s.startAutoplay();}if(s.params.keyboardControl){if(s.enableKeyboardControl)s.enableKeyboardControl();}if(s.params.mousewheelControl){if(s.enableMousewheelControl)s.enableMousewheelControl();}if(s.params.hashnav){if(s.hashnav)s.hashnav.init();}if(s.params.a11y&&s.a11y)s.a11y.init();s.emit('onInit',s);}; // Cleanup dynamic styles
    s.cleanupStyles=function(){ // Container
    s.container.removeClass(s.classNames.join(' ')).removeAttr('style'); // Wrapper
    s.wrapper.removeAttr('style'); // Slides
    if(s.slides&&s.slides.length){s.slides.removeClass([s.params.slideVisibleClass,s.params.slideActiveClass,s.params.slideNextClass,s.params.slidePrevClass].join(' ')).removeAttr('style').removeAttr('data-swiper-column').removeAttr('data-swiper-row');} // Pagination/Bullets
    if(s.paginationContainer&&s.paginationContainer.length){s.paginationContainer.removeClass(s.params.paginationHiddenClass);}if(s.bullets&&s.bullets.length){s.bullets.removeClass(s.params.bulletActiveClass);} // Buttons
    if(s.params.prevButton)$(s.params.prevButton).removeClass(s.params.buttonDisabledClass);if(s.params.nextButton)$(s.params.nextButton).removeClass(s.params.buttonDisabledClass); // Scrollbar
    if(s.params.scrollbar&&s.scrollbar){if(s.scrollbar.track&&s.scrollbar.track.length)s.scrollbar.track.removeAttr('style');if(s.scrollbar.drag&&s.scrollbar.drag.length)s.scrollbar.drag.removeAttr('style');}}; // Destroy
    s.destroy=function(deleteInstance,cleanupStyles){ // Detach evebts
    s.detachEvents(); // Stop autoplay
    s.stopAutoplay(); // Disable draggable
    if(s.params.scrollbar&&s.scrollbar){if(s.params.scrollbarDraggable){s.scrollbar.disableDraggable();}} // Destroy loop
    if(s.params.loop){s.destroyLoop();} // Cleanup styles
    if(cleanupStyles){s.cleanupStyles();} // Disconnect observer
    s.disconnectObservers(); // Disable keyboard/mousewheel
    if(s.params.keyboardControl){if(s.disableKeyboardControl)s.disableKeyboardControl();}if(s.params.mousewheelControl){if(s.disableMousewheelControl)s.disableMousewheelControl();} // Disable a11y
    if(s.params.a11y&&s.a11y)s.a11y.destroy(); // Destroy callback
    s.emit('onDestroy'); // Delete instance
    if(deleteInstance!==false)s=null;};s.init(); // Return swiper instance
    return s;}; /*==================================================
            Prototype
        ====================================================*/Swiper.prototype={isSafari:function(){var ua=navigator.userAgent.toLowerCase();return ua.indexOf('safari')>=0&&ua.indexOf('chrome')<0&&ua.indexOf('android')<0;}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function isArray(arr){return Object.prototype.toString.apply(arr)==='[object Array]';}, /*==================================================
            Browser
            ====================================================*/browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1}, /*==================================================
            Devices
            ====================================================*/device:function(){var ua=navigator.userAgent;var android=ua.match(/(Android);?[\s\/]+([\d.]+)?/);var ipad=ua.match(/(iPad).*OS\s([\d_]+)/);var ipod=ua.match(/(iPod)(.*OS\s([\d_]+))?/);var iphone=!ipad&&ua.match(/(iPhone\sOS)\s([\d_]+)/);return {ios:ipad||iphone||ipod,android:android};}(), /*==================================================
            Feature Detection
            ====================================================*/support:{touch:window.Modernizr&&Modernizr.touch===true||function(){return !!('ontouchstart' in window||window.DocumentTouch&&document instanceof DocumentTouch);}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===true||function(){var div=document.createElement('div').style;return 'webkitPerspective' in div||'MozPerspective' in div||'OPerspective' in div||'MsPerspective' in div||'perspective' in div;}(),flexbox:function(){var div=document.createElement('div').style;var styles='alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient'.split(' ');for(var i=0;i<styles.length;i++){if(styles[i] in div)return true;}}(),observer:function(){return 'MutationObserver' in window||'WebkitMutationObserver' in window;}()}, /*==================================================
            Plugins
            ====================================================*/plugins:{}}; /*===========================
        Dom7 Library
        ===========================*/var Dom7=function(){var Dom7=function Dom7(arr){var _this=this,i=0; // Create array-like object
    for(i=0;i<arr.length;i++){_this[i]=arr[i];}_this.length=arr.length; // Return collection with methods
    return this;};var $=function $(selector,context){var arr=[],i=0;if(selector&&!context){if(selector instanceof Dom7){return selector;}}if(selector){ // String
    if(typeof selector==='string'){var els,tempParent,html=selector.trim();if(html.indexOf('<')>=0&&html.indexOf('>')>=0){var toCreate='div';if(html.indexOf('<li')===0)toCreate='ul';if(html.indexOf('<tr')===0)toCreate='tbody';if(html.indexOf('<td')===0||html.indexOf('<th')===0)toCreate='tr';if(html.indexOf('<tbody')===0)toCreate='table';if(html.indexOf('<option')===0)toCreate='select';tempParent=document.createElement(toCreate);tempParent.innerHTML=selector;for(i=0;i<tempParent.childNodes.length;i++){arr.push(tempParent.childNodes[i]);}}else {if(!context&&selector[0]==='#'&&!selector.match(/[ .<>:~]/)){ // Pure ID selector
    els=[document.getElementById(selector.split('#')[1])];}else { // Other selectors
    els=(context||document).querySelectorAll(selector);}for(i=0;i<els.length;i++){if(els[i])arr.push(els[i]);}}} // Node/element
    else if(selector.nodeType||selector===window||selector===document){arr.push(selector);} //Array of elements or instance of Dom
    else if(selector.length>0&&selector[0].nodeType){for(i=0;i<selector.length;i++){arr.push(selector[i]);}}}return new Dom7(arr);};Dom7.prototype={ // Classes and attriutes
    addClass:function addClass(className){if(typeof className==='undefined'){return this;}var classes=className.split(' ');for(var i=0;i<classes.length;i++){for(var j=0;j<this.length;j++){this[j].classList.add(classes[i]);}}return this;},removeClass:function removeClass(className){var classes=className.split(' ');for(var i=0;i<classes.length;i++){for(var j=0;j<this.length;j++){this[j].classList.remove(classes[i]);}}return this;},hasClass:function hasClass(className){if(!this[0])return false;else return this[0].classList.contains(className);},toggleClass:function toggleClass(className){var classes=className.split(' ');for(var i=0;i<classes.length;i++){for(var j=0;j<this.length;j++){this[j].classList.toggle(classes[i]);}}return this;},attr:function attr(attrs,value){if(arguments.length===1&&typeof attrs==='string'){ // Get attr
    if(this[0])return this[0].getAttribute(attrs);else return undefined;}else { // Set attrs
    for(var i=0;i<this.length;i++){if(arguments.length===2){ // String
    this[i].setAttribute(attrs,value);}else { // Object
    for(var attrName in attrs){this[i][attrName]=attrs[attrName];this[i].setAttribute(attrName,attrs[attrName]);}}}return this;}},removeAttr:function removeAttr(attr){for(var i=0;i<this.length;i++){this[i].removeAttribute(attr);}return this;},data:function data(key,value){if(typeof value==='undefined'){ // Get value
    if(this[0]){var dataKey=this[0].getAttribute('data-'+key);if(dataKey)return dataKey;else if(this[0].dom7ElementDataStorage&&key in this[0].dom7ElementDataStorage)return this[0].dom7ElementDataStorage[key];else return undefined;}else return undefined;}else { // Set value
    for(var i=0;i<this.length;i++){var el=this[i];if(!el.dom7ElementDataStorage)el.dom7ElementDataStorage={};el.dom7ElementDataStorage[key]=value;}return this;}}, // Transforms
    transform:function transform(_transform){for(var i=0;i<this.length;i++){var elStyle=this[i].style;elStyle.webkitTransform=elStyle.MsTransform=elStyle.msTransform=elStyle.MozTransform=elStyle.OTransform=elStyle.transform=_transform;}return this;},transition:function transition(duration){if(typeof duration!=='string'){duration=duration+'ms';}for(var i=0;i<this.length;i++){var elStyle=this[i].style;elStyle.webkitTransitionDuration=elStyle.MsTransitionDuration=elStyle.msTransitionDuration=elStyle.MozTransitionDuration=elStyle.OTransitionDuration=elStyle.transitionDuration=duration;}return this;}, //Events
    on:function on(eventName,targetSelector,listener,capture){function handleLiveEvent(e){var target=e.target;if($(target).is(targetSelector))listener.call(target,e);else {var parents=$(target).parents();for(var k=0;k<parents.length;k++){if($(parents[k]).is(targetSelector))listener.call(parents[k],e);}}}var events=eventName.split(' ');var i,j;for(i=0;i<this.length;i++){if(typeof targetSelector==='function'||targetSelector===false){ // Usual events
    if(typeof targetSelector==='function'){listener=arguments[1];capture=arguments[2]||false;}for(j=0;j<events.length;j++){this[i].addEventListener(events[j],listener,capture);}}else { //Live events
    for(j=0;j<events.length;j++){if(!this[i].dom7LiveListeners)this[i].dom7LiveListeners=[];this[i].dom7LiveListeners.push({listener:listener,liveListener:handleLiveEvent});this[i].addEventListener(events[j],handleLiveEvent,capture);}}}return this;},off:function off(eventName,targetSelector,listener,capture){var events=eventName.split(' ');for(var i=0;i<events.length;i++){for(var j=0;j<this.length;j++){if(typeof targetSelector==='function'||targetSelector===false){ // Usual events
    if(typeof targetSelector==='function'){listener=arguments[1];capture=arguments[2]||false;}this[j].removeEventListener(events[i],listener,capture);}else { // Live event
    if(this[j].dom7LiveListeners){for(var k=0;k<this[j].dom7LiveListeners.length;k++){if(this[j].dom7LiveListeners[k].listener===listener){this[j].removeEventListener(events[i],this[j].dom7LiveListeners[k].liveListener,capture);}}}}}}return this;},once:function once(eventName,targetSelector,listener,capture){var dom=this;if(typeof targetSelector==='function'){targetSelector=false;listener=arguments[1];capture=arguments[2];}function proxy(e){listener(e);dom.off(eventName,targetSelector,proxy,capture);}dom.on(eventName,targetSelector,proxy,capture);},trigger:function trigger(eventName,eventData){for(var i=0;i<this.length;i++){var evt;try{evt=new window.CustomEvent(eventName,{detail:eventData,bubbles:true,cancelable:true});}catch(e){evt=document.createEvent('Event');evt.initEvent(eventName,true,true);evt.detail=eventData;}this[i].dispatchEvent(evt);}return this;},transitionEnd:function transitionEnd(callback){var events=['webkitTransitionEnd','transitionend','oTransitionEnd','MSTransitionEnd','msTransitionEnd'],i,j,dom=this;function fireCallBack(e){ /*jshint validthis:true */if(e.target!==this)return;callback.call(this,e);for(i=0;i<events.length;i++){dom.off(events[i],fireCallBack);}}if(callback){for(i=0;i<events.length;i++){dom.on(events[i],fireCallBack);}}return this;}, // Sizing/Styles
    width:function width(){if(this[0]===window){return window.innerWidth;}else {if(this.length>0){return parseFloat(this.css('width'));}else {return null;}}},outerWidth:function outerWidth(includeMargins){if(this.length>0){if(includeMargins)return this[0].offsetWidth+parseFloat(this.css('margin-right'))+parseFloat(this.css('margin-left'));else return this[0].offsetWidth;}else return null;},height:function height(){if(this[0]===window){return window.innerHeight;}else {if(this.length>0){return parseFloat(this.css('height'));}else {return null;}}},outerHeight:function outerHeight(includeMargins){if(this.length>0){if(includeMargins)return this[0].offsetHeight+parseFloat(this.css('margin-top'))+parseFloat(this.css('margin-bottom'));else return this[0].offsetHeight;}else return null;},offset:function offset(){if(this.length>0){var el=this[0];var box=el.getBoundingClientRect();var body=document.body;var clientTop=el.clientTop||body.clientTop||0;var clientLeft=el.clientLeft||body.clientLeft||0;var scrollTop=window.pageYOffset||el.scrollTop;var scrollLeft=window.pageXOffset||el.scrollLeft;return {top:box.top+scrollTop-clientTop,left:box.left+scrollLeft-clientLeft};}else {return null;}},css:function css(props,value){var i;if(arguments.length===1){if(typeof props==='string'){if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(props);}else {for(i=0;i<this.length;i++){for(var prop in props){this[i].style[prop]=props[prop];}}return this;}}if(arguments.length===2&&typeof props==='string'){for(i=0;i<this.length;i++){this[i].style[props]=value;}return this;}return this;}, //Dom manipulation
    each:function each(callback){for(var i=0;i<this.length;i++){callback.call(this[i],i,this[i]);}return this;},html:function html(_html){if(typeof _html==='undefined'){return this[0]?this[0].innerHTML:undefined;}else {for(var i=0;i<this.length;i++){this[i].innerHTML=_html;}return this;}},text:function text(_text){if(typeof _text==='undefined'){if(this[0]){return this[0].textContent.trim();}else return null;}else {for(var i=0;i<this.length;i++){this[i].textContent=_text;}return this;}},is:function is(selector){if(!this[0])return false;var compareWith,i;if(typeof selector==='string'){var el=this[0];if(el===document)return selector===document;if(el===window)return selector===window;if(el.matches)return el.matches(selector);else if(el.webkitMatchesSelector)return el.webkitMatchesSelector(selector);else if(el.mozMatchesSelector)return el.mozMatchesSelector(selector);else if(el.msMatchesSelector)return el.msMatchesSelector(selector);else {compareWith=$(selector);for(i=0;i<compareWith.length;i++){if(compareWith[i]===this[0])return true;}return false;}}else if(selector===document)return this[0]===document;else if(selector===window)return this[0]===window;else {if(selector.nodeType||selector instanceof Dom7){compareWith=selector.nodeType?[selector]:selector;for(i=0;i<compareWith.length;i++){if(compareWith[i]===this[0])return true;}return false;}return false;}},index:function index(){if(this[0]){var child=this[0];var i=0;while((child=child.previousSibling)!==null){if(child.nodeType===1)i++;}return i;}else return undefined;},eq:function eq(index){if(typeof index==='undefined')return this;var length=this.length;var returnIndex;if(index>length-1){return new Dom7([]);}if(index<0){returnIndex=length+index;if(returnIndex<0)return new Dom7([]);else return new Dom7([this[returnIndex]]);}return new Dom7([this[index]]);},append:function append(newChild){var i,j;for(i=0;i<this.length;i++){if(typeof newChild==='string'){var tempDiv=document.createElement('div');tempDiv.innerHTML=newChild;while(tempDiv.firstChild){this[i].appendChild(tempDiv.firstChild);}}else if(newChild instanceof Dom7){for(j=0;j<newChild.length;j++){this[i].appendChild(newChild[j]);}}else {this[i].appendChild(newChild);}}return this;},prepend:function prepend(newChild){var i,j;for(i=0;i<this.length;i++){if(typeof newChild==='string'){var tempDiv=document.createElement('div');tempDiv.innerHTML=newChild;for(j=tempDiv.childNodes.length-1;j>=0;j--){this[i].insertBefore(tempDiv.childNodes[j],this[i].childNodes[0]);} // this[i].insertAdjacentHTML('afterbegin', newChild);
    }else if(newChild instanceof Dom7){for(j=0;j<newChild.length;j++){this[i].insertBefore(newChild[j],this[i].childNodes[0]);}}else {this[i].insertBefore(newChild,this[i].childNodes[0]);}}return this;},insertBefore:function insertBefore(selector){var before=$(selector);for(var i=0;i<this.length;i++){if(before.length===1){before[0].parentNode.insertBefore(this[i],before[0]);}else if(before.length>1){for(var j=0;j<before.length;j++){before[j].parentNode.insertBefore(this[i].cloneNode(true),before[j]);}}}},insertAfter:function insertAfter(selector){var after=$(selector);for(var i=0;i<this.length;i++){if(after.length===1){after[0].parentNode.insertBefore(this[i],after[0].nextSibling);}else if(after.length>1){for(var j=0;j<after.length;j++){after[j].parentNode.insertBefore(this[i].cloneNode(true),after[j].nextSibling);}}}},next:function next(selector){if(this.length>0){if(selector){if(this[0].nextElementSibling&&$(this[0].nextElementSibling).is(selector))return new Dom7([this[0].nextElementSibling]);else return new Dom7([]);}else {if(this[0].nextElementSibling)return new Dom7([this[0].nextElementSibling]);else return new Dom7([]);}}else return new Dom7([]);},nextAll:function nextAll(selector){var nextEls=[];var el=this[0];if(!el)return new Dom7([]);while(el.nextElementSibling){var next=el.nextElementSibling;if(selector){if($(next).is(selector))nextEls.push(next);}else nextEls.push(next);el=next;}return new Dom7(nextEls);},prev:function prev(selector){if(this.length>0){if(selector){if(this[0].previousElementSibling&&$(this[0].previousElementSibling).is(selector))return new Dom7([this[0].previousElementSibling]);else return new Dom7([]);}else {if(this[0].previousElementSibling)return new Dom7([this[0].previousElementSibling]);else return new Dom7([]);}}else return new Dom7([]);},prevAll:function prevAll(selector){var prevEls=[];var el=this[0];if(!el)return new Dom7([]);while(el.previousElementSibling){var prev=el.previousElementSibling;if(selector){if($(prev).is(selector))prevEls.push(prev);}else prevEls.push(prev);el=prev;}return new Dom7(prevEls);},parent:function parent(selector){var parents=[];for(var i=0;i<this.length;i++){if(selector){if($(this[i].parentNode).is(selector))parents.push(this[i].parentNode);}else {parents.push(this[i].parentNode);}}return $($.unique(parents));},parents:function parents(selector){var parents=[];for(var i=0;i<this.length;i++){var parent=this[i].parentNode;while(parent){if(selector){if($(parent).is(selector))parents.push(parent);}else {parents.push(parent);}parent=parent.parentNode;}}return $($.unique(parents));},find:function find(selector){var foundElements=[];for(var i=0;i<this.length;i++){var found=this[i].querySelectorAll(selector);for(var j=0;j<found.length;j++){foundElements.push(found[j]);}}return new Dom7(foundElements);},children:function children(selector){var children=[];for(var i=0;i<this.length;i++){var childNodes=this[i].childNodes;for(var j=0;j<childNodes.length;j++){if(!selector){if(childNodes[j].nodeType===1)children.push(childNodes[j]);}else {if(childNodes[j].nodeType===1&&$(childNodes[j]).is(selector))children.push(childNodes[j]);}}}return new Dom7($.unique(children));},remove:function remove(){for(var i=0;i<this.length;i++){if(this[i].parentNode)this[i].parentNode.removeChild(this[i]);}return this;},add:function add(){var dom=this;var i,j;for(i=0;i<arguments.length;i++){var toAdd=$(arguments[i]);for(j=0;j<toAdd.length;j++){dom[dom.length]=toAdd[j];dom.length++;}}return dom;}};$.fn=Dom7.prototype;$.unique=function(arr){var unique=[];for(var i=0;i<arr.length;i++){if(unique.indexOf(arr[i])===-1)unique.push(arr[i]);}return unique;};return $;}(); /*===========================
         Get Dom libraries
         ===========================*/var swiperDomPlugins=['jQuery','Zepto','Dom7'];for(var i=0;i<swiperDomPlugins.length;i++){if(window[swiperDomPlugins[i]]){addLibraryPlugin(window[swiperDomPlugins[i]]);}} // Required DOM Plugins
    var domLib;if(typeof Dom7==='undefined'){domLib=window.Dom7||window.Zepto||window.jQuery;}else {domLib=Dom7;} /*===========================
        Add .swiper plugin from Dom libraries
        ===========================*/function addLibraryPlugin(lib){lib.fn.swiper=function(params){var firstInstance;lib(this).each(function(){var s=new Swiper(this,params);if(!firstInstance)firstInstance=s;});return firstInstance;};}if(domLib){if(!('transitionEnd' in domLib.fn)){domLib.fn.transitionEnd=function(callback){var events=['webkitTransitionEnd','transitionend','oTransitionEnd','MSTransitionEnd','msTransitionEnd'],i,j,dom=this;function fireCallBack(e){ /*jshint validthis:true */if(e.target!==this)return;callback.call(this,e);for(i=0;i<events.length;i++){dom.off(events[i],fireCallBack);}}if(callback){for(i=0;i<events.length;i++){dom.on(events[i],fireCallBack);}}return this;};}if(!('transform' in domLib.fn)){domLib.fn.transform=function(transform){for(var i=0;i<this.length;i++){var elStyle=this[i].style;elStyle.webkitTransform=elStyle.MsTransform=elStyle.msTransform=elStyle.MozTransform=elStyle.OTransform=elStyle.transform=transform;}return this;};}if(!('transition' in domLib.fn)){domLib.fn.transition=function(duration){if(typeof duration!=='string'){duration=duration+'ms';}for(var i=0;i<this.length;i++){var elStyle=this[i].style;elStyle.webkitTransitionDuration=elStyle.MsTransitionDuration=elStyle.msTransitionDuration=elStyle.MozTransitionDuration=elStyle.OTransitionDuration=elStyle.transitionDuration=duration;}return this;};}}window.Swiper=Swiper;})(); /*===========================
    Swiper AMD Export
    ===========================*/if(typeof module!=='undefined'){module.exports=window.Swiper;}else if(typeof define==='function'&&define.amd){define([],function(){'use strict';return window.Swiper;});} });

    var Swiper = (swiper && typeof swiper === 'object' && 'default' in swiper ? swiper['default'] : swiper);

    // add special animation features to the current tag instance
    riot$1.mixin('animation-features', {
      features: { Velocity: Velocity },
      defaultTransitions: {
        in: 'transition.slideUpIn',
        out: 'transition.slideUpOut'
      },
      moveIn: function moveIn(el) {
        return Velocity(el, this.defaultTransitions.in);
      },
      moveOut: function moveOut(el) {
        return Velocity(el, this.defaultTransitions.out);
      }
    });

    // enhanced alerts
    riot$1.mixin('alert', {
      alert: swal$1
    });

    // swiper
    riot$1.mixin('swiper', { Swiper: Swiper });

    var _class = function () {
      function _class() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? 'Jack' : arguments[0];
        babelHelpers.classCallCheck(this, _class);

        this.name = name;
        this.isLogged = false;
      }
      // fake authentication


      babelHelpers.createClass(_class, [{
        key: 'authenticate',
        value: function authenticate(email, password) {
          if (password == 'foo') {
            return this.isLogged = true;
          } else return 'The password was wrong try with "foo"';
        }
      }]);
      return _class;
    }();

    // App configuration constants

    var PORT = 3000;
    var HOST_NAME = 'localhost';

    /**
     * Private methods
     */

    function _ajaxRequest(url) {
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function () {
          if (request.status >= 200 && request.status < 400) resolve(request.responseText);else reject(request);
        };
        request.onerror = reject;
        request.send();
      });
    }

    function _nodeRequest(url, hostname, port) {

      var options = {
        host: HOST_NAME,
        port: PORT,
        path: url
      };
      return new Promise(function (resolve, reject) {
        http.get(options, function (res, body) {
          res.on('data', function (chunk) {
            resolve(chunk);
          });
        }).on('error', function (e) {
          reject(e);
        });
      });
    }

    /**
     * Public methods
     */

    /**
     * Get the base url of the project reading the config variables
     * @param   { String } hostname - to override the hostname
     * @param   { Number } port - to override the port
     * @returns { String } return the base path of the app
     */
    function getBase(hostname, port) {
      return 'http://' + (hostname || HOST_NAME) + ':' + (port || PORT);
    }

    /**
     * Detect if we are running the code on a node environment
     * @returns {Boolean} - either true or false
     */
    function isNode() {
      return typeof window === 'undefined';
    }

    /**
     * Cheap fetch polyfill that works also on node because whatwg-fetch sucks!
     * @param   { String } url - url to call
     * @param   { String } hostname - optional hostname
     * @param   { Number } port - optional port
     * @returns { Promise } hoping to get this promise resolved..
     */
    function fetch(url, hostname, port) {
      if (isNode()) {
        return _nodeRequest(url, hostname, port);
      } else {
        return _ajaxRequest('' + getBase(hostname, port) + url);
      }
    }

    // cached data

    var _class$2 = function () {
      function _class(opts) {
        babelHelpers.classCallCheck(this, _class);

        riot$1.observable(this);
        this.url = opts.url;
        this._data = null;
      }
      // fetch new data from the api caching the result


      babelHelpers.createClass(_class, [{
        key: 'fetch',
        value: function fetch$$() {
          var _this = this;

          // was it already fetched
          if (!this._data) {
            this.trigger('fetching');
            return fetch(this.url).then(function (res) {
              var data = JSON.parse(res);
              _this._data = Object.assign({}, data); // clone the original data
              _this.wasFetched = true;
              _this.trigger('fetched', data);
              return data;
            });
          } else return Promise.resolve(this._data);
        }
      }]);
      return _class;
    }();

    var _class$1 = function (_Gateway) {
      babelHelpers.inherits(_class, _Gateway);

      function _class() {
        babelHelpers.classCallCheck(this, _class);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
      }

      return _class;
    }(_class$2);

    var _class$3 = function (_Gateway) {
      babelHelpers.inherits(_class, _Gateway);

      function _class() {
        babelHelpers.classCallCheck(this, _class);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
      }

      babelHelpers.createClass(_class, [{
        key: 'listen',
        value: function listen() {
          var _this2 = this;

          // no need to run this on the server
          if (IS_SERVER) return;
          this.socket = io.connect(getBase(), { forceNew: true });
          this.socket.on('news', function (news) {
            _this2.trigger('news::published', news);
          });
        }
      }]);
      return _class;
    }(_class$2);

    var _class$4 = function (_Gateway) {
      babelHelpers.inherits(_class, _Gateway);

      function _class() {
        babelHelpers.classCallCheck(this, _class);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
      }

      return _class;
    }(_class$2);

    var _class$5 = function (_Gateway) {
      babelHelpers.inherits(_class, _Gateway);

      function _class() {
        babelHelpers.classCallCheck(this, _class);
        return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
      }

      babelHelpers.createClass(_class, [{
        key: 'slideId',
        set: function set(id) {
          if (id == this._slideId) return;
          this._slideId = +id; // typecast to number
          this.trigger('slide::changed', this._slideId);
        },
        get: function get() {
          return this._slideId || 1;
        }
      }]);
      return _class;
    }(_class$2);

    var gateways = {};
    var getGateway = function getGateway(name, Gateway, opts) {
      if (gateways[name] && IS_CLIENT) return gateways[name];else {
        // cache the gateway
        gateways[name] = new Gateway(opts);
        return gateways[name];
      }
    };
    var routes = {
      '/': function _() {
        return getGateway('index', _class$1, { url: '/api/index' });
      },
      '/feed': function feed() {
        return getGateway('feed', _class$3, { url: '/api/feed' });
      },
      '/login': function login() {
        return getGateway('login', _class$4, { url: '/api/login' });
      },
      '/gallery': function gallery() {
        return getGateway('gallery', _class$5, { url: '/api/gallery' });
      },
      '/gallery/*': function gallery(id) {
        var galleryGateway = getGateway('gallery', _class$5, { url: '/api/gallery' });
        galleryGateway.slideId = id; // set the slide id
        return galleryGateway;
      }
    };

    var nprogress = __commonjs(function (module, exports, global) {
    /* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
     * @license MIT */

    ;(function (root, factory) {

      if (typeof define === 'function' && define.amd) {
        define(factory);
      } else if ((typeof exports === 'undefined' ? 'undefined' : babelHelpers.typeof(exports)) === 'object') {
        module.exports = factory();
      } else {
        root.NProgress = factory();
      }
    })(__commonjs_global, function () {
      var NProgress = {};

      NProgress.version = '0.2.0';

      var Settings = NProgress.settings = {
        minimum: 0.08,
        easing: 'ease',
        positionUsing: '',
        speed: 200,
        trickle: true,
        trickleRate: 0.02,
        trickleSpeed: 800,
        showSpinner: true,
        barSelector: '[role="bar"]',
        spinnerSelector: '[role="spinner"]',
        parent: 'body',
        template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      };

      /**
       * Updates configuration.
       *
       *     NProgress.configure({
       *       minimum: 0.1
       *     });
       */
      NProgress.configure = function (options) {
        var key, value;
        for (key in options) {
          value = options[key];
          if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;
        }

        return this;
      };

      /**
       * Last number.
       */

      NProgress.status = null;

      /**
       * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
       *
       *     NProgress.set(0.4);
       *     NProgress.set(1.0);
       */

      NProgress.set = function (n) {
        var started = NProgress.isStarted();

        n = clamp(n, Settings.minimum, 1);
        NProgress.status = n === 1 ? null : n;

        var progress = NProgress.render(!started),
            bar = progress.querySelector(Settings.barSelector),
            speed = Settings.speed,
            ease = Settings.easing;

        progress.offsetWidth; /* Repaint */

        queue(function (next) {
          // Set positionUsing if it hasn't already been set
          if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

          // Add transition
          css(bar, barPositionCSS(n, speed, ease));

          if (n === 1) {
            // Fade out
            css(progress, {
              transition: 'none',
              opacity: 1
            });
            progress.offsetWidth; /* Repaint */

            setTimeout(function () {
              css(progress, {
                transition: 'all ' + speed + 'ms linear',
                opacity: 0
              });
              setTimeout(function () {
                NProgress.remove();
                next();
              }, speed);
            }, speed);
          } else {
            setTimeout(next, speed);
          }
        });

        return this;
      };

      NProgress.isStarted = function () {
        return typeof NProgress.status === 'number';
      };

      /**
       * Shows the progress bar.
       * This is the same as setting the status to 0%, except that it doesn't go backwards.
       *
       *     NProgress.start();
       *
       */
      NProgress.start = function () {
        if (!NProgress.status) NProgress.set(0);

        var work = function work() {
          setTimeout(function () {
            if (!NProgress.status) return;
            NProgress.trickle();
            work();
          }, Settings.trickleSpeed);
        };

        if (Settings.trickle) work();

        return this;
      };

      /**
       * Hides the progress bar.
       * This is the *sort of* the same as setting the status to 100%, with the
       * difference being `done()` makes some placebo effect of some realistic motion.
       *
       *     NProgress.done();
       *
       * If `true` is passed, it will show the progress bar even if its hidden.
       *
       *     NProgress.done(true);
       */

      NProgress.done = function (force) {
        if (!force && !NProgress.status) return this;

        return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
      };

      /**
       * Increments by a random amount.
       */

      NProgress.inc = function (amount) {
        var n = NProgress.status;

        if (!n) {
          return NProgress.start();
        } else {
          if (typeof amount !== 'number') {
            amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
          }

          n = clamp(n + amount, 0, 0.994);
          return NProgress.set(n);
        }
      };

      NProgress.trickle = function () {
        return NProgress.inc(Math.random() * Settings.trickleRate);
      };

      /**
       * Waits for all supplied jQuery promises and
       * increases the progress as the promises resolve.
       *
       * @param $promise jQUery Promise
       */
      (function () {
        var initial = 0,
            current = 0;

        NProgress.promise = function ($promise) {
          if (!$promise || $promise.state() === "resolved") {
            return this;
          }

          if (current === 0) {
            NProgress.start();
          }

          initial++;
          current++;

          $promise.always(function () {
            current--;
            if (current === 0) {
              initial = 0;
              NProgress.done();
            } else {
              NProgress.set((initial - current) / initial);
            }
          });

          return this;
        };
      })();

      /**
       * (Internal) renders the progress bar markup based on the `template`
       * setting.
       */

      NProgress.render = function (fromStart) {
        if (NProgress.isRendered()) return document.getElementById('nprogress');

        addClass(document.documentElement, 'nprogress-busy');

        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = Settings.template;

        var bar = progress.querySelector(Settings.barSelector),
            perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
            parent = document.querySelector(Settings.parent),
            spinner;

        css(bar, {
          transition: 'all 0 linear',
          transform: 'translate3d(' + perc + '%,0,0)'
        });

        if (!Settings.showSpinner) {
          spinner = progress.querySelector(Settings.spinnerSelector);
          spinner && removeElement(spinner);
        }

        if (parent != document.body) {
          addClass(parent, 'nprogress-custom-parent');
        }

        parent.appendChild(progress);
        return progress;
      };

      /**
       * Removes the element. Opposite of render().
       */

      NProgress.remove = function () {
        removeClass(document.documentElement, 'nprogress-busy');
        removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);
      };

      /**
       * Checks if the progress bar is rendered.
       */

      NProgress.isRendered = function () {
        return !!document.getElementById('nprogress');
      };

      /**
       * Determine which positioning CSS rule to use.
       */

      NProgress.getPositioningCSS = function () {
        // Sniff on document.body.style
        var bodyStyle = document.body.style;

        // Sniff prefixes
        var vendorPrefix = 'WebkitTransform' in bodyStyle ? 'Webkit' : 'MozTransform' in bodyStyle ? 'Moz' : 'msTransform' in bodyStyle ? 'ms' : 'OTransform' in bodyStyle ? 'O' : '';

        if (vendorPrefix + 'Perspective' in bodyStyle) {
          // Modern browsers with 3D support, e.g. Webkit, IE10
          return 'translate3d';
        } else if (vendorPrefix + 'Transform' in bodyStyle) {
          // Browsers without 3D support, e.g. IE9
          return 'translate';
        } else {
          // Browsers without translate() support, e.g. IE7-8
          return 'margin';
        }
      };

      /**
       * Helpers
       */

      function clamp(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
      }

      /**
       * (Internal) converts a percentage (`0..1`) to a bar translateX
       * percentage (`-100%..0%`).
       */

      function toBarPerc(n) {
        return (-1 + n) * 100;
      }

      /**
       * (Internal) returns the correct CSS for changing the bar's
       * position given an n percentage, and speed and ease from Settings
       */

      function barPositionCSS(n, speed, ease) {
        var barCSS;

        if (Settings.positionUsing === 'translate3d') {
          barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
        } else if (Settings.positionUsing === 'translate') {
          barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
        } else {
          barCSS = { 'margin-left': toBarPerc(n) + '%' };
        }

        barCSS.transition = 'all ' + speed + 'ms ' + ease;

        return barCSS;
      }

      /**
       * (Internal) Queues a function to be executed.
       */

      var queue = function () {
        var pending = [];

        function next() {
          var fn = pending.shift();
          if (fn) {
            fn(next);
          }
        }

        return function (fn) {
          pending.push(fn);
          if (pending.length == 1) next();
        };
      }();

      /**
       * (Internal) Applies css properties to an element, similar to the jQuery 
       * css method.
       *
       * While this helper does assist with vendor prefixed property names, it 
       * does not perform any manipulation of values prior to setting styles.
       */

      var css = function () {
        var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'],
            cssProps = {};

        function camelCase(string) {
          return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
            return letter.toUpperCase();
          });
        }

        function getVendorProp(name) {
          var style = document.body.style;
          if (name in style) return name;

          var i = cssPrefixes.length,
              capName = name.charAt(0).toUpperCase() + name.slice(1),
              vendorName;
          while (i--) {
            vendorName = cssPrefixes[i] + capName;
            if (vendorName in style) return vendorName;
          }

          return name;
        }

        function getStyleProp(name) {
          name = camelCase(name);
          return cssProps[name] || (cssProps[name] = getVendorProp(name));
        }

        function applyCss(element, prop, value) {
          prop = getStyleProp(prop);
          element.style[prop] = value;
        }

        return function (element, properties) {
          var args = arguments,
              prop,
              value;

          if (args.length == 2) {
            for (prop in properties) {
              value = properties[prop];
              if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
            }
          } else {
            applyCss(element, args[1], args[2]);
          }
        };
      }();

      /**
       * (Internal) Determines if an element or space separated list of class names contains a class name.
       */

      function hasClass(element, name) {
        var list = typeof element == 'string' ? element : classList(element);
        return list.indexOf(' ' + name + ' ') >= 0;
      }

      /**
       * (Internal) Adds a class to an element.
       */

      function addClass(element, name) {
        var oldList = classList(element),
            newList = oldList + name;

        if (hasClass(oldList, name)) return;

        // Trim the opening space.
        element.className = newList.substring(1);
      }

      /**
       * (Internal) Removes a class from an element.
       */

      function removeClass(element, name) {
        var oldList = classList(element),
            newList;

        if (!hasClass(element, name)) return;

        // Replace the class name.
        newList = oldList.replace(' ' + name + ' ', ' ');

        // Trim the opening and closing spaces.
        element.className = newList.substring(1, newList.length - 1);
      }

      /**
       * (Internal) Gets a space separated list of the class names on the element. 
       * The list is wrapped with a single space on each end to facilitate finding 
       * matches within the list.
       */

      function classList(element) {
        return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
      }

      /**
       * (Internal) Removes an element from the DOM.
       */

      function removeElement(element) {
        element && element.parentNode && element.parentNode.removeChild(element);
      }

      return NProgress;
    });
    });

    var NProgress = (nprogress && typeof nprogress === 'object' && 'default' in nprogress ? nprogress['default'] : nprogress);

    var app;
    var initialData = JSON.parse(window.initialData);
    window.IS_SERVER = false;
    window.IS_CLIENT = true;

    riot$1.route.base('/');
    // start the progress bar
    NProgress.start();

    Object.keys(routes).forEach(function (route) {
      riot$1.route(route, function () {
        var gateway = routes[route].apply(routes, arguments);
        if (!app) {

          // extend the gateway using the initial data
          Object.assign(gateway, initialData.gateway);
          // store the initial data
          gateway._data = initialData;

          initialData.gateway = gateway;
          initialData.user = new _class();
          app = riot$1.mount('app', initialData)[0];
          NProgress.done();
        } else {
          NProgress.start();
          gateway.fetch().then(function (data) {
            data.gateway = gateway;
            app.mountSubview(data);
            NProgress.done();
          });
        }
      });
    });

    riot$1.route.start(true);

}));