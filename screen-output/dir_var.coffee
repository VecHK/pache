chalk = require 'chalk'

isObj = (obj) ->
  (!Array.isArray obj) and (typeof obj == 'object') and (obj != null)

print = (str, stream = process.stdout) ->
  stream.write str

default_options = Object.freeze
  indent: 2

palette =
  undefined: 'fuchsia'
  null: 'chocolate'
  nan: 'aqua'
  infinity: 'aqua'
  number: 'aqua'
  string: 'lime'
  symbol: 'yellow'

transformColor = (type) ->
  chalk.keyword palette[type]

transform = (type, value) ->
  transformer = transformColor type
  return transformer value

_valuePrint = (value) ->
  value_type = typeof value

  if value is undefined
    value = transform 'undefined', 'undefined'
  else if typeof value is 'symbol'
    value = transform 'symbol', String value
  else if typeof value is 'string'
    value = transform 'string', JSON.stringify value
  else if isNaN value
    value = transform 'nan', 'NaN'
  else unless isFinite value
    value = transform 'infinity', 'Infinity'
  else if typeof value is 'number'
    value = transform 'number', JSON.stringify value
  else if value is null
    value = transform 'null', 'null'
  else
    value = String value

  print value

valuePrint = (value, indent, property_indent) ->
  if Array.isArray value
    printArrayProperty value, indent, property_indent
  else if isObj value
    printObjectProperty value, indent, property_indent
  else
    _valuePrint value

dotPrint = (cursor, total) ->
  if cursor != total.length - 1
    print ","


rowPrint = (value, cursor, total, indent, property_indent, prefix = '') ->
  print ''.padEnd property_indent
  print prefix
  valuePrint value, indent, property_indent
  dotPrint cursor, total
  print "\n"


block = (block_char, indent, start_indent, fn) ->
  property_indent = start_indent + indent
  start_indent_space = ''.padEnd start_indent

  print "#{block_char[0]}\n"
  fn property_indent
  print "#{start_indent_space}#{block_char[1]}"


printArrayProperty = (arr, indent = 2, start_indent = 0) ->
  block '[]', indent, start_indent, (property_indent) ->
    arr.forEach (value, cursor) ->
      rowPrint value, cursor, arr, indent, property_indent, ''


printObjectProperty = (obj, indent = 2, start_indent = 0) ->
  block '{}', indent, start_indent, (property_indent) ->
    Object.keys obj
    .forEach (key, cursor, keys) ->
      rowPrint obj[key], cursor, keys, indent, property_indent, "#{key}: "


dir_var = (obj, opt = {}) ->
  opt = Object.assign {}, opt, default_options

  valuePrint obj, opt.indent, 0

  print '\n'

module.exports = dir_var
