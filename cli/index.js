#!/usr/bin/env node

if (require('cluster').isWorker) {
  require('../app/worker')
} else {
  require('./pache')
}
