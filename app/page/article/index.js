import './style/'

import vools from '@/utils/vools'

import Page from './components/page'
import PageControl from './components/page/page-control'
import PageSelector from './components/selector'
import SourceCodeFrame from './components/source-code-frame'
import MetaImageFrame from './components/meta-img'
import Layer from './components/layer'

window.pageloaded = function () {
  window.layer = Layer.init($$('#article'), $$('#article section.footnotes'))

  const articleContainer = document.getElementById('article')
  window.page = new Page(articleContainer)

  window.topMenu = new PageControl($$('.top-menu'), window.page)

  window.pageSelector = new PageSelector($$('.page-selector'), window.page)

  window.sourceCodeFrame = new SourceCodeFrame(articleContainer)
  window.metaImage = new MetaImageFrame(articleContainer)

  // 防止露陷的 CSS 要刪除掉了
  $('.execable-css').remove()
}
