require('coffeescript/register')

const cluster = require('cluster')
const EventEmitter = require('events').EventEmitter

const out = require('../screen-output')

module.exports = function () {
  if (cluster.isMaster) {
    const envir = require('../envir')
    envir.printInfo()

    console.log(`\n------- 主线程启动 -------\n`)

    const workerInfo = w => `(wid: ${w.id} pid: ${w.process.pid})`

    cluster.on('listening', (worker, address) => {
      out.info(`worker standy. ${workerInfo(worker)}`)
    })

    cluster.on('online', (worker) => {
      out.info(`worker online. ${workerInfo(worker)}`)
    })

    cluster.on('disconnect', (worker, code, signal) => {
      out.warn(`worker disconnect. ${workerInfo(worker)}`)
    })

    cluster.on('exit', (worker, code, signal) => {
      out.error(`worker exit ${workerInfo(worker)}`)
    })

    if (envir.cluster_fork_num) {
      var CPUs = Array.from({ length: envir.cluster_fork_num })
    } else {
      var CPUs = require('os').cpus()
    }

    // 线程池
    let workers = []

    // 停止所有进程并清空线程池
    const stopAllWorkers = () => {
      workers.forEach(worker => {
        // 移除所有 disconnect、exit 事件
        cluster.removeAllListeners('disconnect')
        cluster.removeAllListeners('exit')

        // 先断开连接
        // 成功断开连接后再关闭进程
        const { pid } = worker.process
        worker.once('disconnect', () => {
          worker.kill()
        })
        worker.disconnect()
      })

      workers.length = 0
    }

    // 重启所有进程
    const relaunchWorkers = () => {
      stopAllWorkers()

      workers = CPUs.map(() => cluster.fork())
      envir.setEnvir(workers)
      workers.forEach(worker => {
        worker.send({
          type: 'web',
        })
      })
    }

    relaunchWorkers()

    require('./app-watcher').watch({
      preChange: stopAllWorkers,
      change: relaunchWorkers,
    })
  } else {
    require('./worker')
  }
}
