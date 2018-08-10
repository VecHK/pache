import './style.less'

import timeout from '@/utils/timeout'
import EventLite from '@/utils/event-lite'
import NetStatus from '@/utils/net-status'
import { Delay } from '@/utils/wheel'

const netStatus = NetStatus.init()

class LoadImage {
  start(url) {
    this.start_time = null
    const xhr = new XMLHttpRequest
    this.xhr = xhr
    xhr.onprogress = e => {
      const percent = parseFloat((e.loaded / e.total).toFixed(2))
      this.emit('progress', percent)
    }
    xhr.onload = e => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 304) {
          // const blobObject = new Blob([xhr.response], { type: xhr.getResponseHeader('content-type') })
          this.interval = Date.now() - this.start_time
          this.emit('done', xhr.response)
        } else {
          this.emit('failure', xhr)
        }
        this.emit(`${xhr.status}`, xhr.response, xhr)
      }
    }
    xhr.onerror = e => {
      this.emit('error', xhr, e)
      console.error(e, xhr)
    }
    xhr.onloadend = e => {
      this.emit('end', xhr)
    }
    xhr.onloadstart = e => {
      this.start_time = Date.now()
      this.emit('start', url)
    }

    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.send()
  }
}
LoadImage.prototype.__proto__ = Object.create(EventLite)

function 获取元素真实宽度(ele) {
  const css = getComputedStyle(ele)

  const c = p => parseInt(css[p])

  const container_width = c('width')
  const paddingLeft = c('padding-left')
  const paddingRight = c('padding-right')
  const borderLeft = c('border-left-width')
  const borderRight = c('border-right-width')

  const isBorderBox = /border-box/.test(css['box-sizing'])
  if (isBorderBox) {
    return container_width - paddingLeft - paddingRight - borderLeft - borderRight
  } else {
    return container_width
  }
}

class MetaImage {
  setSize(width, height) {
    $(this.container).css({
      height: `${height}px`,
      width: `${width}px`
    })
  }
  calcSize() {
    // 所有分頁的寬度都是一樣的，介於隱藏頁的寬度高度都無法獲取，故採取獲取當前分頁的寬度的策略
    this.limitWidth = 获取元素真实宽度(page.current)

    const {availHeight} = screen

    let imgHeight = parseInt(availHeight * 0.8)
    // console.log(`limitWidth: ${this.limitWidth}, imgHeight: ${imgHeight}, height: ${this.height}`)

    if (imgHeight > this.height) {
      imgHeight = this.height
    }

    let imgWidth = parseInt(imgHeight * this.ratio)

    if (imgWidth > this.limitWidth) {
      this.base = 'width'
      imgWidth = this.limitWidth
      imgHeight = imgWidth / this.ratio
    } else {
      this.base = 'height'
    }

    return {
      width: imgWidth,
      height: imgHeight,
    }
  }
  resize() {
    if (this.isLong()) {
      const height = screen.availHeight * .75
      $(this.container).css({
        height: `${height}px`
      })
      this.positingLongScrollBlock()
      // this.spreadLongLine(height)

      return
    } else if (this.lastWidth !== window.innerWidth) {
      this.lastWidth = window.innerWidth
      const {width, height} = this.calcSize()
      if (this.status) {
        this.setSize(width, height)
      } else {
        this.setSize(width, 192)
      }
    } else {
      return
    }
  }

  loadDirect() {
    const imgl = this.load(100)
    imgl.on('start', url => {
      this.container.style.transition = 'height 1ms'
      const {width, height} = this.calcSize()
      this.isLong() || this.setSize(width, height)
    })
    // imgl.start(this.source)
    return imgl
  }

  switchSizeElement () {
    const old_size = $$('.size', this.container)
    const new_size = document.createElement('div')

    $(new_size).class('size', 'new-size').text(`${parseInt(this.size / 1024)} KB`)
    $(old_size).class('old-size')
    old_size.parentNode.appendChild(new_size)

    const time = parseFloat(getComputedStyle(old_size).animationDuration) * 1000
    return timeout(time).then(() => {
      $(new_size).classRemove('new-size')
      $(old_size).remove()
    })
  }
  async spreadLongLine (offsetHeight = this.container.offsetHeight) {
    const long_line = $$('.long-line', this.container)
    const $long_line = $(long_line)

    $long_line.css({
      top: `${offsetHeight / 2}px`,
      height: `${offsetHeight}px`,
    })

    await timeout(20)

    $long_line.css({
      transition: 'top 618ms',
      top: `-${offsetHeight / 2}px`,
    })
  }
  positingLongScrollBlock () {
    const long_line = $$('.long-line', this.container)
    const total_offsetLeft = long_line.offsetParent.offsetLeft + long_line.offsetLeft
    $('.long', this.container).css({
      lineHeight: `${this.container.offsetWidth - total_offsetLeft}px`
    })
  }
  initLongScrollBlock () {
    const long = $$('.long', this.container)
    const $long = $(long)
    $long.class('long-fade-in')

    this.positingLongScrollBlock()

    return timeout(20).then(() => {
      $long.css({
        'display': 'block',
      })

      return timeout(parseFloat(getComputedStyle($long[0]).animationDuration) * 1000)
    }).then(() => {
      $long.classRemove('long-fade-in')
    })
  }

  setImage(img, src) {
    return new Promise((resolve, reject) => {
      const clearEvent = () => {
        img.removeEventListener('load', done_handle)
      }
      const done_handle = e => {
        clearEvent()
        resolve(e)
      }
      img.addEventListener('load', done_handle)

      const err_handle = e => {
        clearEvent()
        reject(e)
      }
      img.addEventListener('error', err_handle)

      img.src = src
    })
  }

  setLongImage(img, src) {
    this.setImage(img, src).then(() => {
      this.openStatus = true
      $(img).css('opacity', '1')

      setTimeout(() => {
        this.switchSizeElement()

        this.spreadLongLine()
        timeout(200).then(() => {
          this.initLongScrollBlock()
        })

        this.delayLoaded.done()
      }, 800)
    })
  }

  setImageAndSlideDown(img, src) {
    this.setImage(img, src).then(() => {
      this.openStatus = false
      $(img).css('opacity', '1')

      this.hideInfoElement(() => {
        $('.size', this.container).text(`${parseInt(this.size / 1024)} KB`)
      })

      this.delayLoaded.done()
      // $(this.metaInfoElement).css('opacity', '0')
    })
  }
  initImg() {
    this.delayLoaded = Delay()
  }
  load(TIMEOUT = 720) {
    // 已加載過的圖片不會再次加載
    if (this.img.src.length) { return }

    const imgl = new LoadImage
    imgl.once('done', imgBlob => {
      $('.size', this.container).text(`Done`)
      this.status = true

      if (!this.isLong()) {
        const {width, height} = this.calcSize()
        this.setSize(width, height)
      }

      this.blob = imgBlob
      let blobUrl = URL.createObjectURL(imgBlob)

      setTimeout(() => {
        if (this.isLong()) {
          this.setLongImage(this.img, blobUrl)
        } else {
          this.setImageAndSlideDown(this.img, blobUrl)
        }
      }, TIMEOUT)
    })
    imgl.on('progress', percent => {
      const size = this.size / 1024
      $('.size', this.container).text(`${parseInt(size * percent)}/${parseInt(size)}`)
    })
    imgl.on('failure', xhr => {
      $('.size', this.container).text(`${xhr.status}`)
    })
    imgl.on('error', xhr => {
      if (!netStatus.isOnline()) {
        $('.size', this.container).text(`offline`)
      } else {
        $('.size', this.container).text(`ERROR`)
      }
    })
    imgl.start(this.source)
    return imgl
  }
  showLongInfoElement () {
    const {container, img_container} = this
    const long = $$('.long', container)

    const ratio = img_container.scrollTop / (img_container.scrollHeight - container.offsetHeight)
    const longTop = ratio * (container.offsetHeight - long.offsetHeight)
    $(long).css('top', `${longTop}px`)
  }
  showInfoElement(callback) {
    $(this.img_container).removeCss('-webkit-overflow-scrolling', '-webkit-filter')
    $(this.infoElement).fadeIn(callback)

    if (this.isLong()) {
      this.showLongInfoElement()
    }
  }
  hideInfoElement(callback) {
    if (this.isLong()) {
      $(this.img_container).css({
        '-webkit-overflow-scrolling': 'touch',
        // '-webkit-filter': 'blur(0cm)',
      })
    }
    $(this.infoElement).fadeOut(callback)
  }
  infoElement() {
    const aside = $$('aside', this.container)
    this.metaInfoElement = $$('.meta-info', aside)

    this.status = false

    let loadStatus
    const asideClickHandle = e => {
      e.preventDefault()
      if (!loadStatus) {
        loadStatus = true
        const imgl = this.load()
        // 若 imgl 不存在說明圖片已經加載了
        if (imgl) {
          imgl.on('done', e => {
            this.container.removeEventListener('click', asideClickHandle)
          })
          imgl.on('end', e => { loadStatus = false })
        }
      }
    }
    this.container.addEventListener('click', asideClickHandle)

    this.openStatus = false
    this.delayLoaded.then(() => {
      this.container.addEventListener('click', e => {
        // if (this.isLong()) {
        //   openStatus = true
        // } else {
        // }
        this.openStatus = !this.openStatus

        if (this.openStatus) {
          this.showInfoElement()
        } else {
          this.hideInfoElement()
        }
      })
    })


    return aside
  }
  printInfo() {
    $('noscript', this.container).remove()

    this.img = new Image
    this.img.setAttribute('meta-source', this.source)
    this.img.style.opacity = 0

    this.img_container = document.createElement('div')
    this.img_container.classList.add('img-container')
    $(this.img_container).append(this.img)

    this.infoElement = this.infoElement()
    // $('aside', this.container).before(this.img_container)
    $(this.container).append(this.img_container)

    // this.resize()
  }
  failure() {
    alert('failure')
  }

  isLong () {
    return this.container.getAttribute('meta-long') !== null
  }

  'loadAttribute' () {
    const {container} = this

    this.source = container.getAttribute('meta-source')
    const height = parseInt(container.getAttribute('meta-height'))
    const width = parseInt(container.getAttribute('meta-width'))
    Object.assign(this, {
      height,
      width,
      ratio: width / height,
      type: container.getAttribute('meta-type'),
      size: container.getAttribute('meta-size'),
    })
  }

  init() {
    this.resizeHandle && window.removeEventListener('resize', this.resizeHandle)
    this.resizeHandle = e => {
      this.resize(e)
    }
    window.addEventListener('resize', e => { this.resize(e) })

    const {container} = this
    this.loadAttribute()

    if (this.height && this.width && this.type) {
      this.printInfo()

      if (!netStatus.isLimit()) {
        // 非限制網絡則直接加載
        this.loadDirect()
      } else {
        // 若連接到非限制類網絡則自動加載圖片
        netStatus.on('change-to-unlimit', e => {
          if (!this.img.src.length) {
            $('.size', this.container).text('unlimited')
            setTimeout(() => this.load(), 1000)
          }
        })
      }
    } else {
      this.failure()
    }
  }
  constructor(container) {
    this.container = container

    try {
      this.initImg()
    } catch (err) {
      console.error('this.initImg()', err)
    }
    try {
      this.init()
    } catch (err) {
      console.error('this.init()', err)
    }
  }
}
export default class MetaImageFrame {
  init() {
    const metaImgRaw_list = $('[id^="meta-"]', this.container)
    this.pool = metaImgRaw_list.map(raw => new MetaImage(raw))
  }
  constructor(container) {
    this.container = container
    this.init()
  }
}
