import {decryptMedia} from '../src/decrypt';
const mime = require('mime-types');
const fs = require('fs');

async function test() {
    const message = {
        "type": "image",
        "t": 1587248609, 
        "clientUrl": "https://mmg-fna.whatsapp.net/d/f/Atdfg_vtnm1GexGZY4Qllcsnvk9bQQs9Wihm0GCa8Ly9.enc",
        "directPath": "/v/t62.7118-24/31297007_2889015684498573_8260880620120850949_n.enc?oh=60fdee4af4bce909ff19a8da7251c3ea&oe=C4BA3D89",
        "mimetype": "image/jpeg",
        "filehash": "omlsH6BMAjnADg0gO5kSPj1vxBQ8wkSkS9CdWxTTbj0=",
        "uploadhash": "6sDgacjBXn0CMJmk4Ywu2d5Srzff9o5/tdLZYDuTIpI=",
        "size": 104781,
        "mediaKey": "hd69/kqRLig4EZrePm7sURqUAtC1mDfiftiUbl8rQCw=",
        "mediaKeyTimestamp": 1587248601,
        "width": 800,
        "height": 600
      }
    const filename = `${message.t}.${mime.extension(message.mimetype)}`;
    const mediaData = await decryptMedia(message,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36");
    fs.writeFile(filename, mediaData, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
}

test();