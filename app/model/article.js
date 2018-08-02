const envir = require('../../envir');
const cheerio = require('cheerio');
const Cutl = require('pache-color-utils');
const imgSizeOf = require('image-size')
const imageSize = function (file) {
	return new Promise((res, rej) => {
		imgSizeOf(file, (err, dimensions) => err ? rej(err) : res(dimensions))
	})
}
const path = require('path')
const fs = require('mz/fs')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CategoryModel = mongoose.model('Category');

/* 转义 HTML 实体字符 */
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities;

/* markdown */
const MarkdownIt = require('markdown-it');

const hljs = require('highlight.js');

const md = MarkdownIt({
	html: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return `<pre class="hljs source-code"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
			} catch (e) {

			}
		}

		return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
	}
})
.use(require('markdown-it-footnote'))


const ObjectId = mongoose.Schema.Types.ObjectId;

const ArticleSchema = new Schema({
	status: { type: Number, default: 0 },

	title: { type: String, default: '(title)' },
	content: { type: String, default: '(empty)' },
	contentType: { type: String, default: 'text' },
	format: { type: String, default: '(format)' },
	tags: { type: Array, default: [] },

	date: { type: Date, default: Date.now },
	mod: { type: Date, default: Date.now },

	repost: { type: Object, default: null },
	category: { type: String, default: null },
	is_draft: { type: Boolean, default: false },
	is_repost: { type: Boolean, default: false },
	link_symbol: { type: String, default: null },
	fusion_color: { type: String, default: '#CCC' },

	// HTML head 的追加內容，數組元素是字符串
	headAppend: { type: Array, default: [] },

	output: { type: Object, default: { heads: [], format: '' } },
});

const repost_color = Cutl.init(envir.repost_color || '#46c01b');
const repost_color_middle = async function (opts) {
	let {is_repost, category, set, source} = opts
	if (!set) { set = source }
	if (is_repost === undefined) {
		is_repost = ('is_repost' in set) ? set.is_repost : source.is_repost
	}
	if (category === undefined) {
		category = await CategoryModel.findOne({
			_id: ('category' in set) ? set.category : source.category
		})
	} else if (typeof(category) === 'string') {
		category = await CategoryModel.findOne({ _id: category })
	}

	if (is_repost && category === null) {
		// 無分類的轉載文章
		set.fusion_color = repost_color.getColorCode()
	} else if (!is_repost && category === null) {
		// 無分類的非轉載文章
		set.fusion_color = '#CCC'
	} else if (category && is_repost) {
		// 有分類的轉載文章
		// const c_color = Cutl.init(category.color)
		// const f_color = Cutl.or(c_color, repost_color)
		// set.fusion_color = f_color.getColorCode()
		set.fusion_color = repost_color.getColorCode()
	} else if (category && !is_repost) {
		// 有分類的非轉載文章
		set.fusion_color = category.color
	}
}

// 代码框
const linecodeAppend = function () {
	let $ = cheerio.load(this.format, {
		decodeEntities: envir.markdown_entitles ? true : false,
	})

	const codeContainers = $('.hljs.source-code')
	if (codeContainers.length) {
		for (let cursor = 0; cursor < codeContainers.length; ++cursor) {
			let fillHtml = `<div class="linecode">1</div>`
			let count = 2

			const codeContent = $(codeContainers[cursor]).text()
			for (let i = 0; i < codeContent.length; ++i) {
				if (codeContent[i] === '\n') {
					fillHtml += `<div class="linecode">${count}</div>`
					++count
				}
			}

			const codeLineFrame = $('<div class="codeline-frame">').html(fillHtml)
			$('code', codeContainers[cursor]).before(codeLineFrame)
		}

		const sourceCode = $('.hljs.source-code > code')
		for (let cursor = 0; cursor < sourceCode.length; ++cursor) {
			const html = $(sourceCode[cursor]).html()
			$(sourceCode[cursor]).html(
				html.split('\n').map(inline => `<div class="inline">${inline}</div>`).join('')
			)
		}

		this.format = $.html()
	}
}

const contentFormat = async function () {
	console.warn('contentFormat')
	this.contentType = this.contentType.toLowerCase();

	// headAppend 将插入在 head 标签中
	// **注意** 请不要使用 ECMAScript 6，headAppend 里的代码并不会转换为 ECMAScript 5
	this.headAppend = []

	// 一些可能用得到的常量
	this.headAppend.push(`<script>;(function () {
		window.PACHE_PRE = {
			ROOT_FONT_SIZE: parseFloat(getComputedStyle(document.getElementsByTagName('html')[0])['font-size']),
		}
	})();</script>`)

	if (this.contentType === 'markdown') {
		this.format = md.render(this.content);
	} else if (this.contentType === 'text') {
		this.format = `<pre class="text-type"><code>${entities.encode(this.content)}</code></pre>`;
	} else if (this.contentType === 'html') {
		this.format = this.content;
	} else {
		this.format = 'unknown contentType';
	}

	/* 分頁處理 */
	const splited = this.format.split(`<div class="split-page"></div>`)
	this.format = `<script>var __PAGE_CODE_COUNT__ = ${splited.length}</script>` + splited.map(eleHTML => `<div class="page">${eleHTML}</div>`).join('\n')


	/* 首字下沉 */
	let $ = cheerio.load(this.format, {
		decodeEntities: envir.markdown_entitles ? true : false,
	})
	$('.page > p:first-child').each((idx, el) => {
		let elHtml = $(el).html().trimLeft()

		let initial_char = ''
		if (elHtml[0] === '&') {
			elHtml = elHtml.replace(/^&([a-z]|[A-Z]|[0-9]|\#){1,};/, match_str => {
				initial_char = match_str
				return ''
			})
		} else {
			initial_char = elHtml[0]
			elHtml = elHtml.slice(1, elHtml.length)
		}

		$(el).html(`<span class="initial">${initial_char}</span>` + elHtml)
	})

	// $ = cheerio.load(this.format, {
	// 	decodeEntities: envir.markdown_entitles ? true : false,
	// });
	/* 將首頁固定 */
	$($('.page')[0]).addClass('current-page').addClass('solid-page');

	/* 取出腳註 */
	let footnotesHTML = $('section.footnotes').html();
	if ($('section.footnotes').length) {
		$('section.footnotes').remove();
		this.format = $.html() + `\n<section class="footnotes">${footnotesHTML}</section>`
	} else {
		this.format = $.html()
	}

	linecodeAppend.apply(this)

	/*
		meta-img
		需要顯示出圖片的數位信息:
		- 圖片類型（jpeg、png、bmp、gif 等等
		- 圖片尺寸（1024x768、800x600）
		- 數位容量（233.43KB，1.1MB）
	*/
	if (envir.META_IMG) {
		let $ = cheerio.load(this.format, {
			decodeEntities: envir.markdown_entitles ? true : false,
		})
		const imgs = $('img')
		if (imgs.length) {
			this.headAppend.push(`<script>
				function calcSize(inputHeight, ratio) {
					// 所有分頁的寬度都是一樣的，介於隱藏頁的寬度高度都無法獲取，故採取獲取當前分頁的寬度的策略
					var widthElement = document.querySelector('head')
					var limitWidth = parseInt(getComputedStyle(widthElement).width)
					var paddingWidth = parseInt(getComputedStyle(widthElement)['padding-left']) * 2
					console.warn(window.innerWidth - paddingWidth)

					limitWidth = window.innerWidth - paddingWidth

					var availHeight = screen.availHeight

					var imgHeight = parseInt(availHeight * 0.8)

					if (imgHeight > inputHeight) {
						imgHeight = inputHeight
					}

					var imgWidth = parseInt(imgHeight * ratio)

					if (imgWidth > limitWidth) {
						imgWidth = limitWidth
						imgHeight = imgWidth / ratio
					}

					return {
						width: imgWidth,
						height: imgHeight,
					}
				}
				console.warn(parseInt(getComputedStyle(document.querySelector('head')).width))
				// alert()
			</script>`)
		}
		for (let cursor=0; cursor<imgs.length; ++cursor) {
			let img = imgs[cursor]
			let imgAttribs = img.attribs
			if (typeof(imgAttribs.src) !== 'string') { continue }
			else if (!imgAttribs.src.length) { continue }

			const imgLocal = path.join(
				envir.IMAGE_PATH,
				imgAttribs.src.replace(/(^\/img-pool\/)|(^\\img-pool\\)/g, '')
			)
			// 如果是本地圖片
			if (await fs.exists(imgLocal)) {
				img.name = 'div'
				const dimensions = await imageSize(imgLocal)
				const fileSize = (await fs.stat(imgLocal)).size

				// console.warn(cursor, dimensions)

				let noscript = $('<noscript>').html(`
					<img src="${imgAttribs.src}" ${imgAttribs.alt ? 'alt="' + imgAttribs.alt + '"' : ''} />
				`)
				$(img).append(noscript)


				const getAsideInnerHtml = append_class => `<div class="meta-info${append_class ? (' ' + append_class) : ''}">
					<div class="long">LONG</div>
					<div class="type">${dimensions.type.toUpperCase()}</div>
					<div class="dimension">
						<div class="pixel">${dimensions.width}×${dimensions.height}</div>
						<div class="line"><hr><div class="long-line"></div></div>
						<div class="size-frame"><div class="size">${parseInt(fileSize / 1024)} KB</div></div>
					</div>
				</div>`
				let aside = $('<aside>').html(`
					${getAsideInnerHtml()}
					<script>;(function () {
						var metaImg = document.querySelector('#meta-${cursor}')
						var aside = metaImg.querySelector('aside')

						var metaInfo = metaImg.querySelector('.meta-info')
						// if (metaInfo.offsetWidth > metaImg.offsetWidth) {
						// 	metaImg.setAttribute('width-short', '')
						// 	console.error('more than!')
						// }
						})();</script>
				`)
				$(img).append(aside)
				Object.assign(imgAttribs, {
					id: `meta-${cursor}`,
					'meta-source': imgAttribs.src,
					'meta-width': dimensions.width,
					'meta-height': dimensions.height,
					'meta-type': dimensions.type,
					'meta-size': fileSize,
				})

				// 是纵向长图
				if ((dimensions.height / 4) > dimensions.width) {
					console.warn('是纵向长图')
					Object.assign(imgAttribs, { 'meta-long': 1 })

					this.headAppend.push(`<script id="script-meta-${cursor}">;(function () {
						var style = document.createElement('style')

						style.innerHTML = '[id^="meta-${cursor}"] {' +
							'height:' + (screen.availHeight * 0.75) + 'px;' +
						'}' +
						'[id^="meta-${cursor}"] aside {' +
						'}'
						// '[id^="meta-${cursor}"] .long-line {' +
						// 	'height:' + (screen.availHeight * 0.75) + 'px;' +
						// 	'top:' + 'calc(-'+ (screen.availHeight * 0.75) +'px / 2)'
						// '}'

						document.getElementsByTagName('head')[0].appendChild(style)
					})();</script>`)
				} else {
					this.headAppend.push(`<script id="script-meta-${cursor}">;(function () {
						// var metaImg = document.getElementById('meta-${cursor}')

						var width = ${dimensions.width}
						var height = ${dimensions.height}
						var ratio = width / height
						var sizeObj = calcSize(height, ratio)
						// console.warn(metaImg, sizeObj, metaImg.innerHTML)

						var setWidth = sizeObj.width
						if (!navigator.connection || navigator.connection.type !== 'cellular') {
							var setHeight = sizeObj.height
						} else {
							var setHeight = 192
						}

						var style = document.createElement('style')
						style.innerHTML = '[id^="meta-${cursor}"] {' +
							'width:' + setWidth + 'px;' +
							'height:' + setHeight + 'px;' +
						'}'

						document.getElementsByTagName('head')[0].appendChild(style)
					})();</script>`)
				}

				// console.warn($(img).html())

				delete imgAttribs.src
				this.format = $.html()
			}
		}
	}
};

ArticleSchema.pre('save', async function () {
	await contentFormat.apply(this)

	this.tags = this.tags.filter(tag => tag.length)

	if (this.category === 'null') {
		this.category = null
	}

	await repost_color_middle({ source: this })
});

ArticleSchema.pre('update', async function () {
	let set = this._update.$set
	if (!set) {
		return
	}

	if (set.hasOwnProperty('tags') && !Array.isArray(set.tags)) {
		set.tags = [ set.tags ]
	}
	if (Array.isArray(set.tags)) {
		set.tags = set.tags.filter(tag => tag.length)
	}

	if (set.category === 'null') {
		set.category = null
	}

	// set.mod = new Date

	let result_list = await this.find({_id: this._conditions._id})
	for (let result of result_list) {
		if (result === null) {
			const err = new Error('article no found')
			err.status = 404
			throw err
		} else if (set.hasOwnProperty('content') && set.hasOwnProperty('contentType')) {
			/* 如果有 content 项，则同时需要显式地声明了 contentType 项 */
			await contentFormat.apply(set)
		} else if (set.hasOwnProperty('contentType')) {
			set.content = result.content
			await contentFormat.apply(set)
		} else {
			delete set.contentType
			delete set.content
		}
		console.warn('result.headAppend.length(1):', result.headAppend.length)
		console.warn(Object.keys(set))

		const opt = { source: result }
		if ('category' in set) {
			opt.category = set.category
			delete set.fusion_color
		}
		if ('is_repost' in set) {
			opt.is_repost = set.is_repost
			delete set.fusion_color
		}
		await repost_color_middle(opt)

		Object.assign(result, set)

		await result.save()
		console.warn('result.headAppend.length(2):', result.headAppend.length)
	}
});

mongoose.model('Article', ArticleSchema)
