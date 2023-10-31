export type Attachment = Pick<File, 'name' | 'type' | 'lastModified'> & {
    url: string | ArrayBuffer
};