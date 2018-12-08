const service = require('../../service/playlist');

module.exports = new class PlaylistController {
  async create(ctx) {
    const { body } = ctx.request;
    ctx.backCreated(await service.create(body));
  }

  async destroy(ctx) {
    const { id } = ctx.params;
    ctx.back(await service.destory(id));
  }

  async get(ctx) {
    ctx.back(await service.get(ctx.params.id));
  }

  async getList(ctx) {
    ctx.back(await service.getList());
  }

  async patch(ctx) {
    const { id } = ctx.params;
    const { body } = ctx.request;
    delete bode._id;

    ctx.back(await service.update(id,body));
  }
}
