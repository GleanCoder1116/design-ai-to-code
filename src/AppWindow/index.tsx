import styleText from "data-text:~/AppWindow/index.scss"
import styleTextMenuItem from "data-text:~/AppWindow/MenuItem/index.scss"
import React, { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"

// https://github.com/remarkjs/react-markdown/issues/747
import "property-information"

import { getSummeryDoc } from "~api/getAssiatant"
import { IconCopy } from "~Icon/IconCopy"
import { appTitle, arrayBufferToBase64, generateTree, globalKey, nodeToCSS, nodeToCSSForMG } from "~utils"

import MenuItem from "./MenuItem"
import { IconCss } from "./MenuItem/IconCss"
import { IconKeyboard } from "./MenuItem/IconKeyboard"
import Move from "./Move"

function AppWindow() {
  const [position, setPosition] = useState({ x: 0, y: 0 }) // 初始位置为 (0, 0)
  const positionRef = useRef(position)
  const contentAreaRef = useRef<HTMLDivElement>()
  const contentMsg = useRef<HTMLDivElement>()
  const [msg, setMsg] = useState("")
  const [appWindowMsg, setAppWindowMsg] = useState("")
  const timeId = useRef(null)
  const [jsxCode, setJsxCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [loading, setLoading] = useState(false)
  const appWindowKey = globalKey();
  useEffect(() => {
    if(!window[appWindowKey]?.notify && appWindowMsg) {
      alert('请确认当前文件需要有编辑权限')
    }
    if (appWindowMsg && window.figma) {
      window[appWindowKey]?.notify?.(appWindowMsg)
    }
  }, [appWindowMsg])

  const genCssCode = async () => {
    setTimeout(() => {
      setAppWindowMsg("")
    }, 5000)
    if (!window[appWindowKey]) {
      setAppWindowMsg(`请在${appTitle()}中打开`)
      return
    }
    // console.log("genCssCode",nodeToCSSForMG(window.mg.document.currentPage.selection[0]))
    const node = window?.[appWindowKey]?.currentPage.selection[0]
    if (!node) {
      setAppWindowMsg("请选中一个元素")
      return
    }
    setAppWindowMsg(`正在生成${node.name}代码...`)
    const css = await node.getCSSAsync()
    // const cssString = JSON.stringify(css, null, 2);
    const className = node.type === "TEXT" ? "text" : node.name
    const formatCss = nodeToCSS(node.name, css)
    setMsg(`\`\`\`css\n${formatCss}\n\`\`\``)
    setCssCode(formatCss)
    setAppWindowMsg("生成代码成功")
  }

  // 同步background中的登录状态
  const handleSelectionChange = async () => {
    console.log("handleSelectionChange", )
    setTimeout(() => {
      setAppWindowMsg("")
    }, 5000)
    if (!window?.[appWindowKey]) {
      setAppWindowMsg(`请在${appTitle()}中打开`)
      return
    }
    const node = window?.[appWindowKey]?.currentPage.selection[0]
    if (!node) {
      setAppWindowMsg("请选中一个元素")
      return
    }
    // 获取生成图片的base64
    const image = await node.exportAsync({ format: "PNG" })
    // 限制图片大小
    if (image.length > 30000) {
      setAppWindowMsg("选取过大，***为了省***钱请选取小一点的图片")
      return
    }
    setAppWindowMsg(`正在生成${node.name}代码...`)

    const base64 = arrayBufferToBase64(image)
    const tree = await new Promise((resolve) => {
      generateTree(node, resolve)
    })
    const sendMeg = (e, messageId) => {
      setMsg(e)
    }
    setLoading(true)
    const res = await getSummeryDoc(sendMeg, base64, JSON.stringify(tree))
    setLoading(false)
    const codeMsg = msg
    // 使用正则表达式匹配 JSX 代码块
    const jsxRegex = /```jsx(.*?)```/s // 使用 s 标志来匹配多行字符串
    const jsxMatch = codeMsg.match(jsxRegex)

    // 使用正则表达式匹配 CSS 样式代码块
    const cssRegex = /```css(.*?)```/s // 使用 s 标志来匹配多行字符串
    const cssMatch = codeMsg.match(cssRegex)

    // 提取 JSX 代码和 CSS 样式
    const jsxCode = jsxMatch ? jsxMatch[1].trim() : "" // 获取匹配到的 JSX 代码块并去除首尾空格
    const cssCode = cssMatch ? cssMatch[1].trim() : "" // 获取匹配到的 CSS 样式代码块并去除首尾空格

    console.log("JSX 代码:", jsxCode)
    console.log("CSS 样式:", cssCode)
    setJsxCode(jsxCode)
    setCssCode(cssCode)
    setAppWindowMsg("生成代码成功")
  }

  useEffect(() => {
    if (timeId.current) {
      return
    }
    if (window?.[appWindowKey]) {
      window?.[appWindowKey]?.ui?.on?.("message", (msg) => {
        if (msg.type === "notify") {
          //  复制到剪切板
          navigator.clipboard
            .writeText(msg.code)
            .then(() => {
              window?.[appWindowKey]?.notify(`${msg.message}复制成功`)
            })
            .catch((err) => {
              window?.[appWindowKey]?.notify(`${msg.message}复制失败`)
            })
        }
      })
    }

    timeId.current = setTimeout(() => {
      timeId.current = null
      // 节流 1s 更新一次
      if (window.figma && window.figma?.showUI) {
        // Inner Plugin Iframe
        const copyCode = `
        <script>
        document.querySelectorAll('.genCode').forEach((item) => {
          item.addEventListener('click', (e) => {
            const button = e.target;
            const code = button.getAttribute('data-code');
            // 通知
            parent.postMessage({ pluginMessage: { type: 'notify', message: 'Copied JSX', code: code } }, '*')
          })
        })
        // 滚动到底部
        window.scrollTo(0, document.body.scrollHeight)
        </script>
        `
        const html = `<link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css"></link>${contentMsg.current?.innerHTML}${copyCode}`
        window?.[appWindowKey]?.showUI?.(html, {
          width: 512,
          height: 400,
          visible: true,
          title: "AI to Code"
        })
      }
    }, 500)
  }, [msg])

  const genCodeStyle = {
    padding: "2px 4px",
    cursor: "pointer",
    border: "1px solid #000",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#000",
    fontSize: "12px",
    marginBottom: "8px",
    marginRight: "8px",
    display: "flex",
    alignItems: "center"
  }

  return (
    <>
      <style>{styleText}</style>
      <style>{styleTextMenuItem}</style>
      <div
        className={"figmaai-window"}
        ref={contentAreaRef}
        style={{
          zIndex: 99999
        }}>
          {
            !loading && <> 
                <header className="figmaai-window-header">
          <div className="figmaai-window-header-handles">
            <Move
              contentAreaRef={contentAreaRef}
              setPosition={setPosition}
              positionRef={positionRef}
            />
            <div className="figmaai-window-header-title">Figma AI to Code</div>
          </div>
        </header>
        <MenuItem
            title="Gen Code By AI"
            handleClick={handleSelectionChange}
            icon={<IconKeyboard />}
          />
          <MenuItem
            title="Gen Code For Css"
            handleClick={genCssCode}
            icon={<IconCss />}
          />
            </>
          }
        
        <div>
          <div ref={contentMsg}>
            <div
              className="show-ui-content"
              style={{
                padding: "20px",
                height: "100%",
                overflow: "auto",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#333"
              }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "10px"
                }}>
                <button
                  style={genCodeStyle}
                  className="genCode"
                  data-code={jsxCode}>
                  <IconCopy /> Copy JSX
                </button>
                <button
                  style={genCodeStyle}
                  className="genCode"
                  data-code={cssCode}
                  id="copyCss">
                  <IconCopy /> Copy CSS
                </button>
              </div>
              <Markdown rehypePlugins={[rehypeHighlight]}>{msg}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppWindow
