/// <reference types="node" />
export declare const mediaTypes: {
    IMAGE: string;
    VIDEO: string;
    AUDIO: string;
    PTT: string;
    DOCUMENT: string;
    STICKER: string;
};
export declare const decryptMedia: (message: any, useragentOverride?: string) => Promise<Buffer>;
