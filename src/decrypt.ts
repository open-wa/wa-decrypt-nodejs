import crypto from 'crypto';
import hkdf from 'futoin-hkdf';
import atob from 'atob';
import axios from 'axios';
import {ResponseType} from 'axios';

const timeout = (ms:number) => new Promise(res => setTimeout(res, ms));
export const mediaTypes = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  PTT: 'Audio',
  DOCUMENT: 'Document',
  STICKER: 'Image'
};

export const decryptMedia = async (message: any, useragentOverride?: string) => {
  const options = {
    responseType: 'arraybuffer' as ResponseType,
    headers: {
      'User-Agent': processUA(useragentOverride),
      'DNT':1,
      'Upgrade-Insecure-Requests':1,
      'origin': 'https://web.whatsapp.com/',
      'referer': 'https://web.whatsapp.com/'
    }
  };
  if(!message.clientUrl) throw new Error('message is missing critical data needed to download the file.')
  let haventGottenImageYet = true;
  let res: any;
  try{
    while (haventGottenImageYet) {
      res = await axios.get(message.clientUrl.trim(),options);
      if (res.status == 200) {
        haventGottenImageYet = false;
      } else {
        await timeout(2000);
      }
    }
  } catch(error){
    throw error
  }
  const buff = Buffer.from(res.data, 'binary');
  const mediaDataBuffer = magix(buff, message.mediaKey, message.type);
  return mediaDataBuffer;
};

const processUA = (userAgent:string)=> {
  let ua = userAgent||'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36';
  if (!ua.includes('WhatsApp')) ua = "WhatsApp/2.16.352 "+ua;
  return ua;
}

const magix = (fileData: any, mediaKeyBase64: any, mediaType: any) => {
  var encodedHex = fileData.toString('hex');
  var encodedBytes = hexToBytes(encodedHex);
  var mediaKeyBytes: any = base64ToBytes(mediaKeyBase64);
  const info = `WhatsApp ${mediaTypes[mediaType.toUpperCase()]} Keys`;
  const hash: string = 'sha256';
  const salt: any = new Uint8Array(32);
  const expandedSize = 112;
  const mediaKeyExpanded = hkdf(mediaKeyBytes, expandedSize, {
    salt,
    info,
    hash
  });
  var iv = mediaKeyExpanded.slice(0, 16);
  var cipherKey = mediaKeyExpanded.slice(16, 48);
  if(mediaType !== mediaTypes.PTT) encodedBytes = encodedBytes.slice(0, -10);
  var decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
  var decoded: any = decipher.update(encodedBytes);
  const mediaDataBuffer = Buffer.from(decoded, 'utf-8');
  return mediaDataBuffer;
};

const hexToBytes = (hexStr: any) => {
  var intArray = [];
  for (var i = 0; i < hexStr.length; i += 2) {
    intArray.push(parseInt(hexStr.substr(i, 2), 16));
  }
  return new Uint8Array(intArray);
};

const base64ToBytes = (base64Str: any) => {
  var binaryStr = atob(base64Str);
  var byteArray = new Uint8Array(binaryStr.length);
  for (var i = 0; i < binaryStr.length; i++) {
    byteArray[i] = binaryStr.charCodeAt(i);
  }
  return byteArray;
};

/**
 * This removes all but the minimum required data to decrypt media. This can be useful to minimize sensitive data transport. Note, this deletes all information regarding where/who sent the message.
 */
export const bleachMessage = (m) => {
  var r = {...m};
  Object.keys(m).map(key => {
  if(!["type", "clientUrl", "mimetype", "mediaKey"].includes(key)) delete r[key]
  })
  return r;
}