require('coffeescript/register')

const cluster = require('cluster')
const EventEmitter = require('events').EventEmitter

module.exports = function () {
  if (cluster.isMaster) {
    const envir = require('../envir')
    envir.printInfo()

    console.log(`\n------- 主线程启动 -------\n`)

    cluster.on('listening', (worker, address) => {
      console.log(`端口已应用: wid[${worker.id}], pid[${worker.process.pid}], address[${address.address}:${address.port}]`)
    })
    cluster.on('online', (worker) => {
      console.log(`线程[${worker.id}]已在线`)
    })
    cluster.on('exit', (worker, code, signal) => {
      console.log(`线程${worker.process.pid}已离线`)
    })

    if (envir.cluster_fork_num) {
      var CPUs = Array.from({ length: envir.cluster_fork_num })
    } else {
      var CPUs = require('os').cpus()
    }

    let workers = []
    const stopWorkers = () => {
      workers.forEach(worker => {
        worker.kill()
      })
      workers.length = 0
    }
    const forkWorkers = () => {
      stopWorkers()

      workers = CPUs.map(() => cluster.fork())
      envir.setEnvir(workers)
      workers.forEach(worker => {
        worker.send({
          type: 'web',
        })
      })
    }

    forkWorkers()

    require('./app-watcher').watch({
      preChange: stopWorkers,
      change: forkWorkers,
    })
  } else {
    require('./worker')
  }
}
