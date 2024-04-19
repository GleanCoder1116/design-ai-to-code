import React, { useEffect } from "react"

import styleText from "data-text:~/AppWindow/Move/index.scss"
import IconDrag from "~Icon/IconDrag";


export interface Position {
  x: number;
  y: number;
}


interface MoveProps {
  setPosition: (position: Position) => void
  positionRef: React.MutableRefObject<Position>
  contentAreaRef: React.MutableRefObject<HTMLDivElement | undefined>
}

function Move({ positionRef, contentAreaRef, setPosition }: MoveProps) {
  useEffect(() => {
    const savedPosition = JSON.parse(sessionStorage.getItem("position") || "{}")
    if (savedPosition) {
      setPosition(savedPosition)
      positionRef.current = savedPosition
      if (contentAreaRef.current) {
        contentAreaRef.current.style.top = `${positionRef.current.y}px`
        contentAreaRef.current.style.left = `${positionRef.current.x}px`
      }
    } else if (contentAreaRef.current) {
      contentAreaRef.current.style.top = `60px`
      contentAreaRef.current.style.right = `10px`
    }
  }, [])

  function handleMouseDown(e: {
    preventDefault: () => void
    clientX: number
    clientY: number
  }) {
    e.preventDefault()

    function moveElement(e: { clientX: number; clientY: number }) {
      positionRef.current = {
        x: e.clientX - 20,
        y: e.clientY - 20
      }
      if (contentAreaRef.current) {
        contentAreaRef.current.style.top = `${positionRef.current.y}px`
        contentAreaRef.current.style.left = `${positionRef.current.x}px`
      }
      // 不允许将 contentAreaRef.current 拖出浏览器窗口；
      if (contentAreaRef.current && contentAreaRef.current.offsetLeft < 0) {
        contentAreaRef.current.style.left = "0px"
      }
      if (contentAreaRef.current && contentAreaRef.current.offsetTop < 0) {
        contentAreaRef.current.style.top = "0px"
      }
      // 右侧边界为浏览器窗口宽度减去 contentAreaRef.current 的宽度
      if (
        contentAreaRef.current &&
        contentAreaRef.current.offsetLeft >
          window.innerWidth - contentAreaRef.current.offsetWidth
      ) {
        contentAreaRef.current.style.left = `${
          window.innerWidth - contentAreaRef.current.offsetWidth
        }px`
      }
      // 下侧边界为浏览器窗口高度减去 contentAreaRef.current 的高度
      if (
        contentAreaRef.current &&
        contentAreaRef.current.offsetTop >
          window.innerHeight - contentAreaRef.current.offsetHeight
      ) {
        contentAreaRef.current.style.top = `${
          window.innerHeight - contentAreaRef.current.offsetHeight
        }px`
      }
    }

    function stopMoving() {
      sessionStorage.setItem("position", JSON.stringify(positionRef.current)) // 将当前位置存储到 sessionStorage 中
      document.removeEventListener("mousemove", moveElement)
      document.removeEventListener("mouseup", stopMoving)
    }

    document.addEventListener("mousemove", moveElement)
    document.addEventListener("mouseup", stopMoving)
  }

  return (
    <>
    <style>{styleText}</style>
    <div className="figmaai-window-drag" onMouseDown={handleMouseDown}>
      <IconDrag />
    </div>
    </>
  )
}

export default Move
