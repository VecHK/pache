const envir = require('../../envir');
const { Music } = require('../model');

module.exports = new class extends require('./service') {
    async creat(data) {
        delete data._id;
        
        const music = new Music(data);

        return music.save();
    }

    async destory(id) {
        const music = await this.get(id);
        return music.delete();
    }

    async get(id) {
        id = String(id);
        const music = await Music.findById(id);
        if (!music) {
            throw this.Interrup('music not found',404);
        }

        return music;
    }

    getList() {
        return Music.find().sort({ 'sort':1});
    }

    async update(id,data) {
        const music = await this.get(id);
        delete data._id;
        return Music.updateOne(
            { music_id:_id},
            { $set:data}
        )
    }
}