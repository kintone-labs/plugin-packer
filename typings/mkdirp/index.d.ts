declare module 'mkdirp' {
    function mkdirp(dir: string, cb: (err: Error, made: string) => void): void;
    function mkdirp(dir: string, opts: any, cb: (err: Error, made: string) => void): void;
    namespace mkdirp {
        function sync(dir: string, opts?: any): string;
    }
    export = mkdirp;
}
