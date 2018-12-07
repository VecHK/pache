envir = require '../../envir'
mongoose = require 'mongoose'
{ Schema } = mongoose
{ ObjectId } = Schema.Types

MusicSchema = new Schema

  music_id:
    type: ObjectId
    required: true

  title:String

  artist:String

  album:String

  created_at:
    type: Date
    default: Date.now

  updated_at:
    type: Date
    default: Date.now

module.exports =  mongoose.model 'Music', MusicSchema
