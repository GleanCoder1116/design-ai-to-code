import { log } from "~utils"
import { updateBodyData } from "~utils/updateBodyData"

import request from "./request"

export interface TYPE_SummeryDoc {
  status: number
  success: boolean
  msg: string
  result: {
    accessToken: string
  }
}

// demoPrompt
const systemPrompt = `
  # 角色
  你是一个可以将 Figma 设计转换为 React 代码的专业开发人员。你的任务是将给定的 Figma 设计文件和 CSS 代码转换为相应的 React 代码。
  一定要清晰地理解设计文件和 CSS 代码，确保生成的 React 代码符合高质量的 React 开发标准，并且易于理解和维护。
  我会给你提供一个 Figma 设计文件和 CSS 代码，你需要根据这些信息生成相应的 React 代码。
  
  ## 技能
  - 使用给定的 Figma 设计文件和 CSS 代码，生成相应的 React 代码。
  - 给定了当前节点的嵌套结构，请根据嵌套的树结构生成合理的组件排布。
  - 生成的组件相关props, 如果需要；需要给出组件的props类型定义。
  - 确保生成的代码符合高质量的 React 开发标准，并且易于理解和维护。
  - 与设计师和开发团队紧密合作，确保代码与设计的一致性和兼容性。
  
  ## 限制
  - 只处理与 Figma 设计转换为 React 代码相关的任务，不处理其他无关的任务。
  - 遵守给定的项目规范和标准，确保代码的质量和可读性。
  - 与设计师和开发团队保持良好的沟通，及时解决问题和反馈。
  - 请严格按照之前返回的格式返回，我需要解析你返回的内容结构。
  
  **注意：如果代码有备注，请使用中文。代码尽可能详细，其他结束越简短越好**
  `

const reactCode =
  "import React, { ButtonHTMLAttributes } from 'react';\n// 定义 ButtonProps 接口，继承 ButtonHTMLAttributes，并添加自定义属性\ninterface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {\n  // 自定义属性\n  variant?: 'primary' | 'secondary' | 'danger';\n}\n// Button 组件\nconst Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {\n  // 根据 variant 属性设置不同的样式类名\n  const variantClassName = `btn btn-${variant}`;\n\n  return (\n    <button className={variantClassName} {...props}>\n      {children}\n    </button>\n  );\n};\nexport default Button;\n"
const cssCode =
  '.btn {"width":93,"height":40,"display":"flex","padding":"8px 16px","justify-content":"center","align-items":"center","gap":"10px","border-radius":"6px","background":"var(--slate-900, #0F172A)"}'

type MessageContent =
  | string
  | (
      | string
      | {
          type: "image_url" | "text"
          image_url?: string
          text?: string
        }
    )[]

type GPT4VCompletionRequest = {
  model: "gpt-4-vision-preview"
  messages: {
    role: "system" | "user" | "assistant" | "function"
    content: MessageContent
    name?: string | undefined
  }[]
  functions?: unknown[] | undefined
  function_call?: unknown | undefined
  stream?: boolean | undefined
  temperature?: number | undefined
  top_p?: number | undefined
  max_tokens?: number | undefined
  n?: number | undefined
  best_of?: number | undefined
  frequency_penalty?: number | undefined
  presence_penalty?: number | undefined
  logit_bias?:
    | {
        [x: string]: number
      }
    | undefined
  stop?: (string[] | string) | undefined
}

export const getSummeryDoc = async (
  sendMeg: (arg: string, arg1: string) => void,
  image?: string,
  css?: string,
  signal?: AbortSignal
) => {
  const image_url = image
  console.log("image_url", image_url)
  const body: GPT4VCompletionRequest = {
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    stream: true,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          {
            type: "image_url",
            image_url: `data:image/png;base64,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`
          },
          {
            type: "text",
            text: `相关树结构代码:  ${{
              name: "tabs",
              type: "INSTANCE",
              css: '{\n  "display": "flex",\n  "padding": "5px",\n  "align-items": "flex-start",\n  "border-radius": "6px",\n  "background": "var(--slate-100, #F1F5F9)"\n}',
              children: [
                {
                  name: "tab item",
                  type: "INSTANCE",
                  css: '{\n  "display": "flex",\n  "padding": "6px 12px",\n  "align-items": "flex-start",\n  "gap": "10px",\n  "border-radius": "3px",\n  "background": "#FFF"\n}',
                  children: [
                    {
                      name: "Selected",
                      type: "TEXT",
                      css: '{\n  "color": "var(--slate-900, #0F172A)",\n  "font-family": "Inter",\n  "font-size": "14px",\n  "font-style": "normal",\n  "font-weight": "500",\n  "line-height": "20px /* 142.857% */"\n}',
                      children: []
                    }
                  ]
                },
                {
                  name: "tab item",
                  type: "INSTANCE",
                  css: '{\n  "display": "flex",\n  "padding": "6px 12px",\n  "align-items": "flex-start",\n  "gap": "10px",\n  "border-radius": "3px"\n}',
                  children: [
                    {
                      name: "Unselected",
                      type: "TEXT",
                      css: '{\n  "color": "var(--slate-700, #334155)",\n  "font-family": "Inter",\n  "font-size": "14px",\n  "font-style": "normal",\n  "font-weight": "500",\n  "line-height": "20px /* 142.857% */"\n}',
                      children: []
                    }
                  ]
                }
              ]
            }}`
          },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${image_url}`
          },
          { type: "text", text: `相关树结构代码:  ${css}` }
        ]
      },
      {
        role: "assistant",
        content: JSON.stringify({
          reactCode,
          cssCode
        })
      },
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${image_url}`
          },
          { type: "text", text: `相关树结构代码:  ${css}` }
        ]
      }
    ]
  }
  try {
    return request
      .post<TYPE_SummeryDoc>(`/v1/chat/completions`, {
        method: "POST",
        // 中断上次请求
        signal,
        stream: true,
        body: JSON.stringify(body)
      })
      .then((response) => {
        const reader = response.body.getReader()
        const sendMsg = (e, messageId) => {
          console.log("e", e)
          sendMeg(e, messageId)
        }
        return new Promise((resolve) => {
          updateBodyData(reader, resolve, sendMsg)
        })
      })
      .then((summer) => {
        return { success: true, summer }
      })
      .catch((error) => {
        return { success: false, summer: error?.message }
      })
  } catch (error) {
    return { success: false, summer: error?.message }
  }
}
