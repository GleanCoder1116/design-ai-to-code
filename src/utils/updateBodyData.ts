import { isJSON } from "~utils";

class BodyDataUpdater {
    private doneInfo = '';
    private allData = '';
  
    constructor(private reader: ReadableStreamDefaultReader<Uint8Array>, private resolve: (value: unknown) => void, private sendMsg: any) {}
  
    updateBodyData() {
      let parseData: any = {};
      let _chunk = '';
  
      void this.reader.read().then(async ({ done, value }) => {
        let endMsg = '';
        if (done) {
          this.allData = '';
  
          // 需要将相关的数据返回返回给前端，前端需要根据信息进行编辑
          this.resolve({ success: true, summer: this.doneInfo });
          return done;
        }
        const uint8array = new Uint8Array(value);
        const decoder = new TextDecoder();
        const data = await decoder.decode(uint8array);
        console.log('data', data, decoder, value)
        this.allData += data;
        // 修改截断方式
        const endMsgArr = this.allData?.split('data: ');
        endMsgArr.filter(item => item).forEach((endMsgItem) => {
          endMsg = endMsgItem
          if (!isJSON(endMsg)) {
            this.updateBodyData();
            return;
          }
          const parsedMsg = endMsg;
          parseData = data && isJSON(endMsg) ? JSON.parse(parsedMsg) : { text: endMsg };
          if (parseData?.id) {
            this.doneInfo = parseData?.id;
          }
          if (data?.includes("success")) {
            parseData = JSON.parse(data);
          }
          if (parseData?.finish_reason !== 'stop') { 
            _chunk += parseData?.choices?.[0]?.delta?.content || parseData.message || parseData.msg || '';
          }
        });
        // 需要 sendMsg 将内容存在 store 中
        this.sendMsg(
          [401, 403, 500].includes(parseData.statusCode) && parseData?.success === false ?
            parseData : _chunk || '', parseData.id);
        if (![401, 403, 500].includes(parseData.statusCode) && parseData?.success !== false) {
          this.updateBodyData();
        } else {
          this.resolve({ success: false, summer: parseData?.message || data });
        }
      });
    }
  }
  // BodyDataUpdater 类的实例化
  export const updateBodyData = (reader, resolve, sendMsg) => {
    const bodyDataUpdater = new BodyDataUpdater(reader, resolve, sendMsg);
    bodyDataUpdater.updateBodyData();
  }