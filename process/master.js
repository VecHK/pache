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

    cluster.on('disconnect', (worker, code, signal) => {
      console.log(`线程${worker.process.pid}已离线`)
    })

    cluster.on('exit', (worker, code, signal) => {
      console.log(`线程${worker.process.pid}已退出`)
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
