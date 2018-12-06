const envir = require('../../envir');
const mongoose = require('mongoose');
var {Schema} = mongoose;
var {ObjectId} = Schema.Types;

MusicSchema = new Schema ({

    music_id :{
        type: ObjectId,
        required:true
    },

    title:String,

    artist:String,

    album:String,

}
)

mongoose.model('Music',MusicSchema);
