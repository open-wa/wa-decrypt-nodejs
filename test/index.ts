import {decryptMedia} from '../src/decrypt';
const mime = require('mime-types');
const fs = require('fs');

async function test() {
  //The absolute minimum data required to decrypt a file
    const message = {
        "type": "image",
        "clientUrl": "https://mmg-fna.whatsapp.net/d/f/ArWPNrfRA-dsdarFjaUKLmdH3dsbqlAa46uu_185IrdX.enc",
        "mimetype": "image/jpeg",
        "mediaKey":  "qHQbszo9ErZQDo396CepreN9UAhCU6kz2l2zu8vjsYU=",
      }
    const filename = `${Date.now()}.${mime.extension(message.mimetype)}`;
    const mediaData = await decryptMedia(message,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36");
    fs.writeFile(filename, mediaData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
}

test();