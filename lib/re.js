'use strict'

Object.defineProperty(exports, '__esModule', {
   value: true
})

var _typeof =
   typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
      ? function(obj) {
           return typeof obj
        }
      : function(obj) {
           return obj &&
           typeof Symbol === 'function' &&
           obj.constructor === Symbol &&
           obj !== Symbol.prototype
              ? 'symbol'
              : typeof obj
        }

var _slicedToArray = (function() {
   function sliceIterator(arr, i) {
      var _arr = []
      var _n = true
      var _d = false
      var _e = undefined
      try {
         for (
            var _i = arr[Symbol.iterator](), _s;
            !(_n = (_s = _i.next()).done);
            _n = true
         ) {
            _arr.push(_s.value)
            if (i && _arr.length === i) break
         }
      } catch (err) {
         _d = true
         _e = err
      } finally {
         try {
            if (!_n && _i['return']) _i['return']()
         } finally {
            if (_d) throw _e
         }
      }
      return _arr
   }
   return function(arr, i) {
      if (Array.isArray(arr)) {
         return arr
      } else if (Symbol.iterator in Object(arr)) {
         return sliceIterator(arr, i)
      } else {
         throw new TypeError(
            'Invalid attempt to destructure non-iterable instance'
         )
      }
   }
})()

var _regeneratorRuntime = require('regenerator-runtime')

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime)

var _url = require('url')

var _fetch = require('./fetch.js')

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

function _toConsumableArray(arr) {
   if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
         arr2[i] = arr[i]
      }
      return arr2
   } else {
      return Array.from(arr)
   }
}

exports.default = function _callee(node, dirpath) {
   var _separateAltQuery, fetchWay, attributes, cloneNode, cloneProperties

   return _regeneratorRuntime2.default.async(
      function _callee$(_context) {
         while (1) {
            switch ((_context.prev = _context.next)) {
               case 0:
                  ;(_separateAltQuery = separateAltQuery(node.properties.alt)),
                     (fetchWay = _separateAltQuery.fetchWay),
                     (attributes = _separateAltQuery.attributes)
                  _context.next = 3
                  return _regeneratorRuntime2.default.awrap(
                     nodeAfterFetch(node, fetchWay, dirpath)
                  )

               case 3:
                  cloneNode = _context.sent

                  node = Object.assign(node, cloneNode)

                  cloneProperties = attrToProperties(
                     node.properties.style,
                     attributes
                  )

                  node.properties = Object.assign(
                     node.properties,
                     cloneProperties
                  )

                  return _context.abrupt('return', node)

               case 8:
               case 'end':
                  return _context.stop()
            }
         }
      },
      null,
      undefined
   )
}

var separateAltQuery = function separateAltQuery(alt) {
   var fetchWay = void 0,
      attributes = {}
   var querystring = alt && alt.split('?')[1]
   if (querystring) {
      querystring.split('&').forEach(function(key_value) {
         var _key_value$split = key_value.split('='),
            _key_value$split2 = _slicedToArray(_key_value$split, 2),
            key = _key_value$split2[0],
            value = _key_value$split2[1]

         if (key === 'fetch') {
            fetchWay = value
         } else {
            attributes[key] = value
         }
      })
   }
   return { fetchWay: fetchWay, attributes: attributes }
}

var nodeAfterFetch = function _callee2(node, fetchWay, dirpath) {
   var src, mime, fetchPath, hast, reNode
   return _regeneratorRuntime2.default.async(
      function _callee2$(_context2) {
         while (1) {
            switch ((_context2.prev = _context2.next)) {
               case 0:
                  src = node.properties.src

                  if (!(src && fetchWay && typeof fetch === 'function')) {
                     _context2.next = 22
                     break
                  }

                  ;(mime = getMIME(src)),
                     (fetchPath = resolveFetchPath(src, dirpath))

                  if (!(fetchWay === 'hast')) {
                     _context2.next = 12
                     break
                  }

                  if (
                     !(
                        !(mime.indexOf('svg') !== -1) &&
                        !(mime.indexOf('html') !== -1)
                     )
                  ) {
                     _context2.next = 6
                     break
                  }

                  throw new Error(src + ' can\'t choise way "hast"')

               case 6:
                  _context2.next = 8
                  return _regeneratorRuntime2.default.awrap(
                     (0, _fetch.fetchToHast)(fetchPath)
                  )

               case 8:
                  hast = _context2.sent

                  if (
                     (typeof hast === 'undefined'
                        ? 'undefined'
                        : _typeof(hast)) === 'object'
                  ) {
                     reNode = hast.children.find(function(_ref) {
                        var type = _ref.type
                        return type === 'element'
                     })

                     if (reNode) {
                        node = reNode
                     }
                  }
                  _context2.next = 22
                  break

               case 12:
                  if (!(fetchWay === 'bloburl')) {
                     _context2.next = 21
                     break
                  }

                  if (!(mime.indexOf('html') !== -1)) {
                     _context2.next = 15
                     break
                  }

                  throw new Error(src + ' can\'t choise way "bloburl"')

               case 15:
                  if (!(typeof URL === 'function')) {
                     _context2.next = 19
                     break
                  }

                  _context2.next = 18
                  return _regeneratorRuntime2.default.awrap(
                     (0, _fetch.fetchToBlobUrl)(fetchPath)
                  )

               case 18:
                  node.properties.src = _context2.sent

               case 19:
                  _context2.next = 22
                  break

               case 21:
                  throw new Error(fetchWay + ' is incorrect as query')

               case 22:
                  return _context2.abrupt('return', node)

               case 23:
               case 'end':
                  return _context2.stop()
            }
         }
      },
      null,
      undefined
   )
}

var resolveFetchPath = function resolveFetchPath(src, dirpath) {
   return !dirpath ? src : (0, _url.resolve)(dirpath, src)
}

var attrToProperties = function attrToProperties(style, attributes) {
   if (style && attributes.style) {
      var joined = style + ';' + attributes.style,
         iterable = joined.split(';').map(function(keyval) {
            var key_val = keyval.split(':')
            return [key_val[0], key_val[1]]
         }),
         uniques = new Map(iterable)

      attributes.style = []
         .concat(_toConsumableArray(uniques.entries()))
         .map(function(tuples) {
            return tuples.join(':')
         })
         .join(';')
   }

   if (attributes.className && typeof attributes.className === 'string') {
      attributes.className = attributes.className.split(',')
   }

   return attributes
}

var getMIME = function getMIME(file) {
   var fragments = file.split('.')
   return fragments[fragments.length - 1]
}
module.exports = exports['default']
