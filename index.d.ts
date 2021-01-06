
export interface AchFileHeader {
    recordTypeCode: string;
    priorityCode: string;
    immediateDestination: string;
    immediateOrigin: string;
    fileCreationDate: string;
    fileCreationTime: string;
    fileIdModifier: string;
    recordSize: string;
    blockingFactor: string;
    formatCode: string;
    immediateDestinationName: string;
    immediateOriginName: string;
    referenceCode: string;
}

export interface AchFileControl {
    recordTypeCode: string;
    batchCount: number;
    blockCount: number;
    addendaCount: number;
    entryHash: number;
    totalDebit: number;
    totalCredit: number;
    reserved: string;
}

export interface AchBatchHeader {
    recordTypeCode: string;
    serviceClassCode: string;
    companyName: string;
    companyDiscretionaryData: string;
    companyIdentification: string;
    standardEntryClassCode: string;
    companyEntryDescription: string;
    companyDescriptiveDate: string;
    effectiveEntryDate: string;
    settlementDate: string;
    originatorStatusCode: string;
    originatingDFI: string;
    batchNumber: number;
}

export interface AchBatchControl {
    recordTypeCode: string;
    serviceClassCode: string;
    addendaCount: number;
    entryHash: string;
    totalDebit: number;
    totalCredit: number;
    companyIdentification: string;
    messageAuthenticationCode: string;
    reserved: string;
    originatingDFI: string;
    batchNumber: number;
}

export interface AchAddenda {
    recordTypeCode: string;
    addendaTypeCode: string;
    paymentRelatedInformation: string;
    addendaSequenceNumber: number;
    entryDetailSequenceNumber: string;
}

export interface AchEntry {
    recordTypeCode: string;
    transactionCode: string;
    receivingDFI: string;
    checkDigit: string;
    DFIAccount: string;
    amount: number;
    idNumber: string;
    individualName: string;
    discretionaryData: string;
    addendaId: string;
    traceNumber: string;
    addendas: AchAddenda[];
}

export interface AchBatch {
    header: AchBatchHeader;
    control: AchBatchControl;
    entries: AchEntry[];
}

export interface AchFile {
    header: AchFileHeader;
    control: AchFileControl;
    batches: AchBatch[];
}


declare class File {
    constructor(options: any, autoValidate?: boolean);
    addBatch(batch: Batch);
    generateFile(): String;
    toJson(): AchFile;
}

declare class Batch {
    constructor(options: any, autoValidate?: boolean);
    addEntry(entry: Entry);
    toJson(): AchBatch;
}

declare class Entry {
    constructor(options: any, autoValidate?: boolean);
    addAddenda(addenda: EntryAddenda);
    toJson(): AchEntry;
}

declare class EntryAddenda {
    constructor(options: any, autoValidate?: boolean);
    toJson(): EntryAddenda;
}


export function parseFile(filePath: string, cb?: any): Promise<File>;
export function parse(str: string, cb?: any): Promise<File>;