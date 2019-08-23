module.exports = (ctx = {}) => `# Pache 配置
# 採用的是 Suc 配置文件的語法
#
# propertyName >*
# 這上面形式的是要求輸入【字符串】，從大於號右邊開始接受輸入的字符串，
# 左側的 propertyName 則是屬性名，按下回車結束輸入
#
# test > abc
# 相當於 { test: " abc" }
#
# [propertyName] 9
# 這上面形式的是要求輸入【數字】或者【布爾值】，由中括號[]括起來的則是屬性名
# 右側的數值為數字，注意，如果輸入的不是【數字】或者【布爾值】，Suc 解析器則會報錯
#
# [test] 999
# 相當於 { test: 999 }
#
# [b] FALSE
# 相當於 { b: FALSE }



##### 基本配置
##### -------------------

# MongoDB URL
# 建議使用有用戶的 MongoDB 配置
# 或者禁止外網訪問的 MongoDB 配置
db >${ctx.db}

# JWT Token Secret
JWT_TOKEN_SECRET >${ctx.JWT_TOKEN_SECRET}

# 用戶密碼
pass >${ctx.pass}


# HTTP 監聽端口
[port] ${ctx.port}


# session 密鑰
# 開發測試的時候似乎沒那麼重要
# 正式使用的時候請務必修改
session_secret >${ctx.session_secret}


# 單頁最大文章數
[limit] ${ctx.limit}


# 圖片存儲目錄
# 缺省為模塊目錄中的 img_pool 文件夾
# 打上注釋即為使用默認值
# 正式使用請設置到可控的目錄上，建議採用絕對路徑的書寫格式
${ctx.IMAGE_PATH ? '#' : ''} IMAGE_PATH >${ctx.IMAGE_PATH}


# 轉載文章的顏色
# 打上注釋將會使用缺省顏色
# 缺省為 #46c01b
repost_color >${ctx.repost_color}


##### 功能及其優化配置
##### -------------------

# 主域名
master_domain >${ctx.master_domain}

# 強制重定向到主域名
# 開啟后，非主域名訪問的地址將會強制跳轉到主域名上
# 開啟之前請確認 master_domain 是否填寫，否則會跳轉到莫名其妙的地方
[FORCE_REDIRECT_TO_MASTER_DOMAIN] ${ctx.FORCE_REDIRECT_TO_MASTER_DOMAIN}

# 启用 HTTP/2
# 开启此选项后相当于启用了 https 了
# 原先的 enable_https 不再使用
#### 注意
#### 此处所指的 H2 是加密的 H2，而不是 H2C(HTTP/2 Cleartext)
[USE_H2] ${ctx.USE_H2}

# HTTP/2 端口，默認為 443
[H2_PORT] ${ctx.H2_PORT}

# 是否強制跳转到 http/2
# 啟用后，以 HTTP 方式訪問 Pache 則會強制跳轉到 http/2 的連接上（重定向）
[FORCE_H2] ${ctx.FORCE_H2}

# private_key 是私钥文件的路径
PRIVATE_KEY >${ctx.PRIVATE_KEY}

# certificate 是证书文件的路径
CERTIFICATE >${ctx.CERTIFICATE}


# 已格式化的 Markdown 文章是否強制轉換為 HTML 實體字符
# 如果 [markdown_entitles] 為 TRUE，則漢字（UTF-8）也會被轉換為 HTML 實體字符
# 如果設置為 FALSE，格式化后的數據體積會減少一些，更多疑問，請見 cheerio issues:
# https://github.com/yeoman/generator/issues/638
[markdown_entitles] ${ctx.markdown_entitles}


# 啟用 GZIP 文本（Content-Type 匹配 /text/）壓縮
[GZIP_ENABLE] ${ctx.GZIP_ENABLE}


# 啟用 Pug 模板引擎緩存
# 需要使用到 Redis
[PUG_CACHE] ${ctx.PUG_CACHE}


# 啟用 meta-img
# 在移動設備加載 Pache 圖片時默認不自動加載
[META_IMG] ${ctx.META_IMG}

# cluster 線程數
# 通常多線程的性能會比單線程要好
# 如果設置為 0 則為當前的 CPU 數量
# 線程數不是越多越好，通常最佳值是當前的 CPU 數量
[cluster_fork_num] ${ctx.cluster_fork_num}


# ESD 設置
# 擴展的靜態目錄
#### 注意 CAUTION
#### 如沒有什麼需求，請不要開啟此選項，因為 Pache 會將 ESD 列表中的
#### 路徑作為備選靜態目錄，謹慎謹慎
[ESD_ENABLE] ${ctx.ESD_ENABLE}

# ESD 列表
# 靜態目錄的訪問策略是從列表的第一個目錄開始訪問，最頂層的是 Pache 路由
# 例如：
# 訪問 /test.js，如果 Pache 路由沒有命中，則會在 /home/不存在的目錄A 中查找，
# 若還找不到，則會在 /home/不存在的目錄B 中查找。如果都沒有找到，
# 則返回一個 HTTP 404
# 為避免出錯最好使用絕對路徑
[ESD_LIST]
${ctx.ESD_LIST.join('\n')}

# Pache 跳轉
# ALIAS_CONFIG_FILE >G:/alias.json
`
