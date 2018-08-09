{ isValid } = (require 'mongoose').Types.ObjectId

OBJECT_ID_LENGTH = 24

isObjectId = (val) ->
  (val.length == OBJECT_ID_LENGTH) and (isValid val)

module.exports = isObjectId
