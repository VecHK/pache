const envir = require('../../envir');
const {Playlist} = require('../model');

module.exports = new class extends require('./service') {
  async create(data) {
    delete data._id;

    const playlist = new Playlist(data);

    return playlist.save();
  }

  async destory(id) {
    const playlist = await this.get(id);
    return playlist.delet();
  }

  async get(id) {
    id = String(id);
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      throw this.Interrup('playlist not found',404);
    }

    return playlist;
  }

  getList() {
    return Playlist.find().sort({'sort':1});
  }

  async update(id,data) {
    delete data._id;
    return Playlist.updateOne(
      { playlist_id:id },
      { $set:data }
    )
  }
}
