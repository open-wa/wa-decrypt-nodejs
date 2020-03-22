"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var futoin_hkdf_1 = __importDefault(require("futoin-hkdf"));
var atob_1 = __importDefault(require("atob"));
var rp = __importStar(require("request-promise-native"));
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
    var options, haventGottenImageYet, res, buff, mediaDataBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                options = {
                    url: message.clientUrl.trim(),
                    encoding: null,
                    simple: false,
                    resolveWithFullResponse: true,
                    headers: {
                        'User-Agent': processUA(useragentOverride)
                    }
                };
                haventGottenImageYet = true;
                _a.label = 1;
            case 1:
                if (!haventGottenImageYet) return [3, 6];
                return [4, rp.get(options)];
            case 2:
                res = _a.sent();
                if (!(res.statusCode == 200)) return [3, 3];
                haventGottenImageYet = false;
                return [3, 5];
            case 3: return [4, timeout(2000)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [3, 1];
            case 6:
                buff = Buffer.from(res.body, 'utf8');
                mediaDataBuffer = magix(buff, message.mediaKey, message.type);
                return [2, mediaDataBuffer];
        }
    });
}); };
var processUA = function (userAgent) {
    var ua = userAgent || 'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36';
    if (!ua.includes('WhatsApp'))
        ua = "WhatsApp/2.16.352 " + ua;
    return ua;
};
var magix = function (fileData, mediaKeyBase64, mediaType) {
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
    encodedBytes = encodedBytes.slice(0, -10);
    var decipher = crypto_1.default.createDecipheriv('aes-256-cbc', cipherKey, iv);
    var decoded = decipher.update(encodedBytes);
    var mediaDataBuffer = Buffer.from(decoded, 'utf-8');
    return mediaDataBuffer;
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
