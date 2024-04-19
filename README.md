这是一个使用`plasmo init`[1](https://www.npmjs.com/package/plasmo)初始化的[Plasmo扩展](https://docs.plasmo.com/)项目。

## 开始使用

首先，运行开发服务器：

```bash
pnpm dev
# 或者
npm run dev
```

打开你的浏览器并加载相应的开发版本。例如，如果你正在为使用清单v3的chrome浏览器开发，使用：`build/chrome-mv3-dev`。

你可以通过修改`popup.tsx`来开始编辑弹出窗口。当你做出更改时，它应该会自动更新。要添加一个选项页面，只需在项目的根目录下添加一个`options.tsx`文件，并默认导出一个React组件。同样地，要添加一个内容页面，向项目根目录添加一个`content.ts`文件，导入一些模块并进行一些逻辑操作，然后重新加载浏览器上的扩展。

如需进一步指导，请[访问我们的文档](https://docs.plasmo.com/)。

## 制作生产版本

运行以下命令：

```bash
pnpm build
# 或者
npm run build
```

这应该会为你的扩展创建一个生产包，准备好被压缩并发布到商店。

## 提交到网络商店

部署你的Plasmo扩展的最简单方法是使用内置的[bpp](https://bpp.browser.market) GitHub action。然而，在实际使用此操作之前，请确保你已经构建了你的扩展并上传了第一个版本到商店，以建立基本的凭据。然后，只需按照[这个设置指南](https://docs.plasmo.com/framework/workflows/submit)进行操作，你就应该可以开始自动化提交了！


## 配置相应的key
在根目录下创建`.env.development`文件，并写入以下内容：
```bash
PLASMO_PUBLIC_SERVER_DOMAIN=you can use your own server domain
PLASMO_PUBLIC_SERVER_KEY=you can use your own server key
```

