
export interface TYPE_Response<T> {
  success: number
  msg: string
  status: number
  result: T
  body: ReadableStream | string | any
}

interface RequestInitType extends RequestInit {
  stream?: boolean
  body?: any
  signal?: AbortSignal
}


class Request {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(
    url: string,
    option?: RequestInitType
  ): Promise<TYPE_Response<T>> {
    const newUrl = url.includes("http") ? url : `${this.baseUrl}${url}`
    const response = await fetch(`${newUrl}`, option)
    if (option?.stream) {
      return response as any
    }
    const data = await response.json()
    return data as TYPE_Response<T>
  }

  async post<T>(
    url: string,
    option?: RequestInitType
  ): Promise<TYPE_Response<T>> {
    const newUrl = url.includes("http") ? url : `${this.baseUrl}${url}`
    const body = JSON.parse(option?.body || {});
    const {headers = {}, ...rest} = option;
    const response = await fetch(`${newUrl}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLASMO_PUBLIC_SERVER_KEY}`,
        ...headers
      },
      ...rest,
      body: JSON.stringify(body)
    })
    if (option?.stream) {
      return response as any
    }
    const data = await response.json()
    return data as TYPE_Response<T>
  }
}

export const SERVER_DOMAIN = process.env.PLASMO_PUBLIC_SERVER_DOMAIN

export default new Request(SERVER_DOMAIN)
