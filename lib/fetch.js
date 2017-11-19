'use strict'

Object.defineProperty(exports, '__esModule', {
   value: true
})
exports.fetchToBlobUrl = exports.fetchToHast = undefined

var _regeneratorRuntime = require('regenerator-runtime')

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime)

var _rehype = require('rehype')

var _rehype2 = _interopRequireDefault(_rehype)

function _interopRequireDefault(obj) {
   return obj && obj.__esModule ? obj : { default: obj }
}

function _asyncToGenerator(fn) {
   return function() {
      var gen = fn.apply(this, arguments)
      return new Promise(function(resolve, reject) {
         function step(key, arg) {
            try {
               var info = gen[key](arg)
               var value = info.value
            } catch (error) {
               reject(error)
               return
            }
            if (info.done) {
               resolve(value)
            } else {
               return Promise.resolve(value).then(
                  function(value) {
                     step('next', value)
                  },
                  function(err) {
                     step('throw', err)
                  }
               )
            }
         }
         return step('next')
      })
   }
}

var fetchSkeleton = function fetchSkeleton(file) {
   return fetch(file).then(function(res) {
      if (!res.ok) {
         throw new Error('failed to fetch ' + file)
      }
      return res
   })
}

var fetchToHast = (exports.fetchToHast = (function() {
   var _ref = _asyncToGenerator(
      /*#__PURE__*/ _regeneratorRuntime2.default.mark(function _callee(file) {
         var text
         return _regeneratorRuntime2.default.wrap(
            function _callee$(_context) {
               while (1) {
                  switch ((_context.prev = _context.next)) {
                     case 0:
                        _context.prev = 0
                        _context.next = 3
                        return fetchSkeleton(file).then(function(res) {
                           return res.text()
                        })

                     case 3:
                        text = _context.sent
                        return _context.abrupt('return', htmlToHast(text))

                     case 7:
                        _context.prev = 7
                        _context.t0 = _context['catch'](0)

                        console.warn(_context.t0.message)
                        return _context.abrupt('return')

                     case 11:
                     case 'end':
                        return _context.stop()
                  }
               }
            },
            _callee,
            undefined,
            [[0, 7]]
         )
      })
   )

   return function fetchToHast(_x) {
      return _ref.apply(this, arguments)
   }
})())

var fetchToBlobUrl = (exports.fetchToBlobUrl = (function() {
   var _ref2 = _asyncToGenerator(
      /*#__PURE__*/ _regeneratorRuntime2.default.mark(function _callee2(file) {
         var blob
         return _regeneratorRuntime2.default.wrap(
            function _callee2$(_context2) {
               while (1) {
                  switch ((_context2.prev = _context2.next)) {
                     case 0:
                        _context2.prev = 0
                        _context2.next = 3
                        return fetchSkeleton(file).then(function(res) {
                           return res.blob()
                        })

                     case 3:
                        blob = _context2.sent
                        return _context2.abrupt(
                           'return',
                           URL.createObjectURL(blob)
                        )

                     case 7:
                        _context2.prev = 7
                        _context2.t0 = _context2['catch'](0)

                        console.warn(_context2.t0.message)
                        return _context2.abrupt('return', file)

                     case 11:
                     case 'end':
                        return _context2.stop()
                  }
               }
            },
            _callee2,
            undefined,
            [[0, 7]]
         )
      })
   )

   return function fetchToBlobUrl(_x2) {
      return _ref2.apply(this, arguments)
   }
})())

var htmlToHast = (function() {
   var processor = (0, _rehype2.default)().data('settings', {
      fragment: true,
      position: false
   })
   return function(html) {
      return processor.parse(html)
   }
})()
