import { decryptMedia } from "../src/decrypt";
const mime = require("mime-types");
const fs = require("fs");
import crypto from "crypto";

async function test() {
  //The absolute minimum data required to decrypt a file. This expires after a while. Add your own data here.
  const message = {
    clientUrl: "https://mmg.whatsapp.net/d/f/AiEm7XJBxP_8ri_k9zlwe2zeWtU0j89pY5wNEwVyoMfe.enc",
    mediaKey: "8xM7x7PoQZK2hxNaLUm9uWIpgAf0PjUiTTAZLVzlTo8=",
    mimetype: "audio/ogg; codecs=opus",
    size: 36583,
    type: "ptt",
    filehash: "RnaReUwzotOVz+t7yy3cypWCIwcjqzsO3rLBxJ7/foY=",
    uploadhash: "SyfWSQRbVN6XQ8c5FPTKcObk9gnFNuiS48OMDl5DGMQ="
    }
  const filename = `${Date.now()}.${mime.extension(message.mimetype)}`;
  const mediaData = await decryptMedia(message);
  //Now confirm hash

  let output_hash = crypto
    .createHash("sha256")
    .update(mediaData)
    .digest("base64");
  let hashValid = message.filehash == output_hash;
  console.log("Hash Validated:", hashValid);
  fs.writeFile(filename, mediaData, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
}

test();
