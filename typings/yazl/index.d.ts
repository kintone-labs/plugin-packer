/// <reference types="node" />
declare module 'yazl' {
    import {Readable} from 'stream';
    import {EventEmitter} from 'events';

    export class ZipFile extends EventEmitter {
        addFile(realPath: string, metadataPath: string, options?: Object): void;
        addBuffer(buffer: Buffer, metadataPath: string, options?: Object): void;
        addReadStream(readStream: Readable, metadataPath: string, options?: Object): void;
        outputStream: Readable;
        end(finalSizeCallback?: (size: number) => void): void;
    }
}
