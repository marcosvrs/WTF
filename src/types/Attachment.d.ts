export type Attachment = null | Pick<File, 'name' | 'type' | 'lastModified'> & {
    url: string | ArrayBuffer
};