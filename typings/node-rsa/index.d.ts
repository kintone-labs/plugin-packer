declare module 'node-rsa' {
    class RSA {
        constructor(keyData: string|Buffer|Object, format: string, options?: Object);
        sign(buffer: Buffer, encoding?: string, source_encoding?: string): Buffer;
    }
    export = RSA;
}
