Pache 3
---

## 安装

```
yarn global add pache-blog
```

## 要求

 - Redis
 - mongoDB

## 运行

```bash
# 启动配置文件交互程序
pache config ./config_name.suc

# 启动 web 服务器
pache run ./config_name.suc
```

## 开发

开发需要安装 `devDependencies` 引用。并且需要启动 `webpack`:

```bash
# 打包前端代码到 app/page-dist/
yarn page-generate

# watch 模式
yarn page-watch
```

## 关于配置文件

因为采用了 suc，故可能需要查看以下相关教程。目录中的 config.suc 当中有相关设置项的说明。<br>
也可以使用 `pache config <config_name>` 根据操作向导创建配置文件

## License

MIT
