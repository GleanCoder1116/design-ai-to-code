
// 安装成功后，获取 getDictionary 接口的数据
chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled")
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("onMessage", request)
    sendResponse({ name: "onMessage" })
})
  

// const inject = async (tabId: number) => {
//   chrome.scripting.executeScript(
//     {
//       target: {
//         tabId
//       },
//       world: "MAIN", // MAIN in order to access the window object
//       func: windowChanger
//     },
//     () => {
//       console.log("Background script got callback after injection")
//     }
//   )
// }

// // Simple example showing how to inject.
// // You can inject however you'd like to, doesn't have
// // to be with chrome.tabs.onActivated
// chrome.tabs.onActivated.addListener((e) => {
//   inject(e.tabId)
// })