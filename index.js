
var query = require('query')
  , events = require('event')
  , domify = require('domify')
  , Color = require('color')
  , position = require('position')
  , Emitter = require('emitter')
  , _ = require('lodash')

module.exports = ColorPicker

function localPos(e, el) {
  var offset = position(el || e.target);
  return {
    x: e.pageX - offset.left,
    y: e.pageY - offset.top
  };
}

// limit a number >= min, <= max
function limit(number, min, max) {
  if (arguments.length === 1) {
    min = 0
    max = 1
  }
  if (number < min) return min
  if (number > max) return max
  return number
}

function ColorPicker(options) {
  options = _.extend({
    width: 180,
    height: 180
  }, options || {})
  this.el = domify(require('./template'))
  this.main = query('.main', this.el)
  this.hue = query('.hue', this.el)
  this.alpha = query('.alpha', this.el)
  this.alphacolor = query('.alphacolor', this.el)
  this.alphapos = query('.alphapos', this.el)
  this.mainpos = query('.mainpos', this.el)
  this.huepos = query('.huepos', this.el)
  this.preview = query('.preview', this.el)
  this.cover = query('.cover', this.el)
  this.color = new Color(options.color)
  events.bind(this.main, 'mousedown', this.mainDown.bind(this))
  events.bind(this.hue, 'mousedown', this.hueDown.bind(this))
  events.bind(this.alpha, 'mousedown', this.alphaDown.bind(this))
  this.size(options.width, options.height)
  this.update()
}

Emitter(ColorPicker.prototype)

_.extend(ColorPicker.prototype, {
  size: function (w, h) {
    if (arguments.length === 1) {
      h = w
    }
    this.width = w
    this.height = h
    var s = (w < h ? w : h) / 9
    this.main.style.width = w + 'px';
    this.main.style.height = h + 'px';
    this.hue.style.width = s + 'px';
    this.hue.style.height = h + 'px';
    this.alpha.style.height = s + 'px';
    this.alpha.style.width = w + 'px';
    this.preview.style.height = s + 'px';
    this.preview.style.width = s + 'px';
  },
  mainDown: function (e) {
    var self = this
    function move(e) {
      e.preventDefault()
      e.stopPropagation()
      var pos = localPos(e, self.main)
        , v = 1 - limit(pos.y / self.height)
        , s = limit(pos.x / self.width)
        , l = (2 - s) * v
      self.color.l = l / 2
      self.color.s = v ? s * v / (l <= 1 ? l : 2 - l) : 0
      self.mainpos.style.top = 100 * (1 - v) + '%'
      self.mainpos.style.left = 100 * s + '%'
      self.updateAlphaColor()
      self.emit('slide', self.color)
      self.updateMain()
    }
    function remove(e) {
      events.unbind(window, 'mousemove', move)
      events.unbind(window, 'mouseup', remove)
      self.updateAlphaColor()
      self.emit('change', self.color)
    }
    events.bind(window, 'mousemove', move)
    events.bind(window, 'mouseup', remove)
    move(e)
  },
  hueDown: function (e) {
    var self = this
    function move(e) {
      e.preventDefault()
      e.stopPropagation()
      var pos = localPos(e, self.hue)
      self.color.h = 1 - limit(pos.y / self.height)
      self.updateAlphaColor()
      self.emit('slide', self.color)
      self.updateHue()
    }
    function remove(e) {
      events.unbind(window, 'mousemove', move)
      events.unbind(window, 'mouseup', remove)
      self.emit('change', self.color)
    }
    events.bind(window, 'mousemove', move)
    events.bind(window, 'mouseup', remove)
    move(e)
  },
  alphaDown: function (e) {
    var self = this
    function move(e) {
      e.preventDefault()
      e.stopPropagation()
      var pos = localPos(e, self.alpha)
      self.color.a = 1 - limit(pos.x / self.width)
      self.emit('slide', self.color)
      self.updateAlpha()
    }
    function remove(e) {
      events.unbind(window, 'mousemove', move)
      events.unbind(window, 'mouseup', remove)
      self.emit('change', self.color)
    }
    events.bind(window, 'mousemove', move)
    events.bind(window, 'mouseup', remove)
    move(e)
  },
  update: function () {
    this.updateMain()
    this.updateHue()
    this.updateAlpha()
    this.updateAlphaColor()
  },
  updateHue: function () {
    this.huepos.style.top = 100 * (1 - this.color.h) + '%'
    this.main.style.backgroundColor = 'hsl(' + 360 * this.color.h + ', 100%, 50%)'
    var vars = this.color.h * 360 + ', ' + this.color.s * 100 + '%, ' + this.color.l * 100
    this.preview.style.backgroundColor = 'hsl(' + vars + '%)';
  },
  updateMain: function () {
    var vars = this.color.h * 360 + ', ' + this.color.s * 100 + '%, ' + this.color.l * 100
    this.preview.style.backgroundColor = 'hsl(' + vars + '%)';
  },
  updateAlpha: function () {
    this.alphapos.style.left = 100 * (1 - this.color.a) + '%'
    this.cover.style.opacity = 1 - this.color.a
  },
  updateAlphaColor: function () {
    var vars = this.color.h * 360 + ', ' + this.color.s * 100 + '%, ' + this.color.l * 100
    this.alphacolor.style.backgroundImage = 'linear-gradient(to right, hsla(' + vars + '%, 1) 0%, hsla(' + vars + '%, 0) 100%)'
  }
})



