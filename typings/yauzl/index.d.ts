/// <reference types="node" />
declare module 'yauzl' {
    import {Readable} from 'stream';
    import {EventEmitter} from 'events';

    export function fromBuffer(buffer: Buffer, options: any, callback: (err: Error, zipFile: ZipFile) => void): void;
    export function fromBuffer(buffer: Buffer, callback: (err: Error, zipFile: ZipFile) => void): void;
    export class ZipFile extends EventEmitter {
        on(event: 'entry', callback: (entry: Entry) => void): this;
        on(event: 'end', callback: () => void): this;
        on(event: 'close', callback: () => void): this;
        on(event: 'error', callback: (err: Error) => void): this;
        readEntry(): void;
        openReadStream(entry: Entry, options: any, callback: (err: Error, stream: Readable) => void): void;
        openReadStream(entry: Entry, callback: (err: Error, stream: Readable) => void): void;
    }
    export class Entry {
        versionMadeBy: number;
        versionNeededToExtract: number;
        generalPurposeBitFlag: number;
        compressionMethod: number;
        lastModFileTime: number;
        lastModFileDate: number;
        crc32: number;
        compressedSize: number;
        uncompressedSize: number;
        fileNameLength: number;
        extraFieldLength: number;
        fileCommentLength: number;
        internalFileAttributes: number;
        externalFileAttributes: number;
        relativeOffsetOfLocalHeader: number;
        fileName: string;
        extraFields: Array<{id: number, data: Buffer}>;
        fileComment: string;
        getLastModDate(): Date;
        isEncrypted(): boolean;
        isCompressed(): boolean;
    }
}
