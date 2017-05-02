declare module 'node-rsa' {
    class RSA {
        constructor(options?: Object);
        constructor(keyData: string|Buffer|Object, options?: Object);
        constructor(keyData: string|Buffer|Object, format: string, options?: Object);
        exportKey(format: 'pkcs8-public-der'): Buffer;
        exportKey(format: 'pkcs1-private'): string;
        exportKey(format?: string): string|Buffer;
        sign(buffer: Buffer, encoding?: string, source_encoding?: string): Buffer;
    }
    export = RSA;
}
