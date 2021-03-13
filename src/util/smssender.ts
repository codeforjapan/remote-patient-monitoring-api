import axios from 'axios'
import { stringify } from 'uuid';

export interface RequestToSendSMS {
  Token:string;
  To: string;
  Message: string;
  SecurityCode: string;
  ShorturlFlg: "0" | "1";
}
export interface LoginInfo {
  securityKey: string;
  accessKey: string;
}

export interface SendSMSResult {
  messageId?: string;
  status: string;
}
export class SMSSender {
  endpoint: string;
  loigninfo: LoginInfo;
  constructor(endpoint: string, logininfo: LoginInfo) {
    this.endpoint = endpoint;
    this.loigninfo = logininfo;
  }
  public async sendSMS(to: string, text: string): Promise<SendSMSResult> {
    if (this.endpoint == "") {
      console.log(`******** send SMS to ${to} ************`);
      console.log(text);
      return new Promise((resolve) => {
        resolve({status: "100"})
      })
    }else{
      const params: RequestToSendSMS = {
        Token: this.loigninfo.accessKey,
        To: to,
        Message: text,
        SecurityCode: this.loigninfo.securityKey,
        ShorturlFlg: "1"
      }
      const query = Object.keys(params).reduce( (acc: string, val: string):string => {
        return acc + "&" + val + "=" + (params[val] as string)
      }) 
      return new Promise((resolve, reject) => {
        const ret = await axios.post(this.endpoint, query)
        if (ret.data.status === "100") {
          resolve({messageId: ret.data.messageId, status: ret.data.status})
        }else{
          reject({status: ret.data.status})
        }
      })
    }
  }
}
