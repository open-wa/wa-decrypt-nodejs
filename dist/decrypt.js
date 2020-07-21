"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bleachMessage = exports.decryptMedia = exports.mediaTypes = void 0;
var crypto_1 = __importDefault(require("crypto"));
var futoin_hkdf_1 = __importDefault(require("futoin-hkdf"));
var atob_1 = __importDefault(require("atob"));
var axios_1 = __importDefault(require("axios"));
var timeout = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
exports.mediaTypes = {
    IMAGE: 'Image',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    PTT: 'Audio',
    DOCUMENT: 'Document',
    STICKER: 'Image'
};
exports.decryptMedia = function (message, useragentOverride) { return __awaiter(void 0, void 0, void 0, function () {
    var options, haventGottenImageYet, res, error_1, buff, mediaDataBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': processUA(useragentOverride),
                        'DNT': 1,
                        'Upgrade-Insecure-Requests': 1,
                        'origin': 'https://web.whatsapp.com/',
                        'referer': 'https://web.whatsapp.com/'
                    }
                };
                if (!message.clientUrl)
                    throw new Error('message is missing critical data needed to download the file.');
                haventGottenImageYet = true;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                _a.label = 2;
            case 2:
                if (!haventGottenImageYet) return [3, 7];
                return [4, axios_1.default.get(message.clientUrl.trim(), options)];
            case 3:
                res = _a.sent();
                if (!(res.status == 200)) return [3, 4];
                haventGottenImageYet = false;
                return [3, 6];
            case 4: return [4, timeout(2000)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [3, 2];
            case 7: return [3, 9];
            case 8:
                error_1 = _a.sent();
                throw error_1;
            case 9:
                buff = Buffer.from(res.data, 'binary');
                mediaDataBuffer = magix(buff, message.mediaKey, message.type, message.size);
                return [2, mediaDataBuffer];
        }
    });
}); };
var processUA = function (userAgent) {
    var ua = userAgent || 'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36';
    if (!ua.includes('WhatsApp'))
        ua = "WhatsApp/2.16.352 " + ua;
    return ua;
};
var magix = function (fileData, mediaKeyBase64, mediaType, expectedSize) {
    var encodedHex = fileData.toString('hex');
    var encodedBytes = hexToBytes(encodedHex);
    var mediaKeyBytes = base64ToBytes(mediaKeyBase64);
    var info = "WhatsApp " + exports.mediaTypes[mediaType.toUpperCase()] + " Keys";
    var hash = 'sha256';
    var salt = new Uint8Array(32);
    var expandedSize = 112;
    var mediaKeyExpanded = futoin_hkdf_1.default(mediaKeyBytes, expandedSize, {
        salt: salt,
        info: info,
        hash: hash
    });
    var iv = mediaKeyExpanded.slice(0, 16);
    var cipherKey = mediaKeyExpanded.slice(16, 48);
    var decipher = crypto_1.default.createDecipheriv('aes-256-cbc', cipherKey, iv);
    var decoded = decipher.update(encodedBytes);
    var mediaDataBuffer = expectedSize ? fixPadding(decoded, expectedSize) : decoded;
    return mediaDataBuffer;
};
var fixPadding = function (data, expectedSize) {
    var padding = (16 - (expectedSize % 16)) & 0xf;
    if (padding > 0) {
        if ((expectedSize + padding) == data.length) {
            data = data.slice(0, data.length - padding);
        }
        else if ((data.length + padding) == expectedSize) {
            var arr = new Uint16Array(padding).map(function (b) { return padding; });
            data = Buffer.concat([data, Buffer.from(arr)]);
        }
    }
    return Buffer.from(data, 'utf-8');
};
var hexToBytes = function (hexStr) {
    var intArray = [];
    for (var i = 0; i < hexStr.length; i += 2) {
        intArray.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new Uint8Array(intArray);
};
var base64ToBytes = function (base64Str) {
    var binaryStr = atob_1.default(base64Str);
    var byteArray = new Uint8Array(binaryStr.length);
    for (var i = 0; i < binaryStr.length; i++) {
        byteArray[i] = binaryStr.charCodeAt(i);
    }
    return byteArray;
};
exports.bleachMessage = function (m) {
    var r = __assign({}, m);
    Object.keys(m).map(function (key) {
        if (!["type", "clientUrl", "mimetype", "mediaKey", "size", "filehash", "uploadhash"].includes(key))
            delete r[key];
    });
    return r;
};
