# newGis

## 介绍

> npm-check-updates 模块更新  
`ncu` 是 `npm-check-updates` 的缩写命令.

```json
npm install -g npm-check-updates
或者
cnpm install -g npm-check-updates
```

> 更新

```json
rm npm自带更新，将根据package.json版本进行更新，每次都要改动 package.json 中的版本号
npm update  
rm node-check-updates or ncu 查看更新
ncu
rm 执行更新，自动帮你更改 package.json 里的版本号，简单方便
ncu -a
```

> `npm update` 命令使用  
> npm-check检查更新

```json
npm install -g npm-check
```

> npm-upgrade更新

```json
npm install -g npm-upgrade
```

> 更新全局包

```json
npm update <name> -g
```

> 更新生产环境依赖包：

```json
npm update <name> --save
```

> 更新开发环境依赖包：

```cmd
npm update <name> --save-dev
```

```cmd
npm ls --depth 0 -g // 看看哪些失效了
npm prune -g // 修剪下全局包
npm rebuild -g // 重建下全局包
npm update -g // 更新下全局包的版本
npm cache clear --force -g // 删除全局包的缓存（慎重）
```

## 配置

定义了  **离线模式** 和 **在线模式** ：  
模式的配置位于 env.development 和 env.production 文件内，变量名为"VUE_APP_CONFIG_MODE"  
两种模式对应的 key 值为 **0** 和 **1**。  
为符合旧版配置结构，配置参数结构按旧版进行了调整，  
组件配置文件需根据组件位置在 config 目录下新建对应目录:

---

**"src/components/Wrapper"**  对应  **"config/components/Wrapper"**

---

其中 uri 参数 为符合接口规则， 路径起始和结束处需添加   '/' ：

---

**"components/Wrapper"**  ->  **"/components/Wrapper/"**

新版本特有属性: hasConfig 及 configName, 离线模式
