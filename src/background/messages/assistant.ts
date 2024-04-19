// 发送消息给助理
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { getSummeryDoc } from "~api/getAssiatant";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { image,css } = req.body
  const {sender: {tab}} = req
  if(!image) {
    return res.send({success: false, summer: 'image is empty'})
  }
  const controller = new AbortController();
  const signal = controller.signal
  const sendMeg = (e, messageId) => {
    chrome.tabs.sendMessage(tab.id, {
      action: "UPDATE_MESSING_INFO",
      data: e,
      messageId,
      module: module,
    })
  }
  await getSummeryDoc(sendMeg, image, css, signal);
  chrome.tabs.sendMessage(tab.id, {
    action: "UPDATE_MESSING_INFO--SUCCESS",
    module: module,
    status: 'success',
  }).catch((error) => {
    controller?.abort()
  })
}

export default handler
