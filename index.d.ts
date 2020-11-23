


declare class File {
    toJson(): object;
}


export function parseFile(filePath: string, cb?: any): Promise<File>;