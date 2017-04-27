/// <reference types="node" />
declare module 'yazl' {
    import {Readable} from 'stream';
    export class ZipFile {
        addFile(realPath: string, metadataPath: string, options?: any): void;
        addBuffer(buffer: Buffer, metadataPath: string, options?: any): void;
        outputStream: Readable;
        end(finalSizeCallback: (size: number) => void): void;
    }
}
