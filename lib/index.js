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

var _hastUtilSelect = require('hast-util-select')

var _path = require('path')

var _path2 = _interopRequireDefault(_path)

var _re = require('./re.js')

var _re2 = _interopRequireDefault(_re)

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

var q = 'img[alt^="as"]'

exports.default = function(options) {
   var dirpath = getDirPath(options)

   return function(ast) {
      var imgs = (0, _hastUtilSelect.selectAll)(q, ast)
      return new Promise(function(resolve, reject) {
         return Promise.all(
            imgs.map(function(node) {
               return (0, _re2.default)(node, dirpath).then(function(reNode) {
                  node = Object.assign(node, reNode)
                  node.properties.alt = ''
                  return
               })
            })
         )
            .then(function() {
               return resolve()
            })
            .catch(function(err) {
               return reject(err)
            })
      })
   }
}

var getDirPath = function getDirPath(options) {
   if (
      (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !==
      'object'
   )
      return

   var dirpath = void 0
   var reference = options.reference,
      relative = options.relative

   if (reference) {
      dirpath = _path2.default.dirname(reference)
   } else if (relative) {
      if (_path2.default.extname(relative)) {
         throw new Error('rehype-img-as option "relative" must be "dirpath"')
      }
      dirpath = relative
   }

   if (dirpath && dirpath[dirpath.length - 1] !== '/') {
      dirpath = dirpath + '/'
   }
   return dirpath
}
module.exports = exports['default']
