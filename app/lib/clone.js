const cloneArray = source => source.map(clone)

const cloneObject = source => {
  const obj = {}
  Object.keys(source).forEach(key => {
    obj[key] = clone(source[key])
  })
  return obj
}

const clone = val => {
  if (Array.isArray(val)) {
    return cloneArray(val)
  } else if (typeof(val) === 'object' && val !== null) {
    return cloneObject(val)
  } else {
    return val
  }
}

module.exports = clone
