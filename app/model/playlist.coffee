envir = require '../../envir'
mongoose = require 'mongoose'
{ Schema } = mongoose
{ ObjectId } = Schema.Types

PlaylistSchema = new Schema

  playlist_id:
    type: ObjectId
    required: true

  name: String

  created_at:
    type: Date
    default: Date.now

  updated_at:
    type: Date
    default: Date.now

  list:
    type:Array
    default:[]

module.exports = mongoose.model 'Playlist', PlaylistSchema
