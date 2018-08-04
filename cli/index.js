#!/usr/bin/env node

if (require('cluster').isWorker) {
  require('../process/worker')
} else {
  require('./pache')
}
