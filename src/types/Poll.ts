import { PoolMessageOptions } from '@wppconnect/wa-js/dist/chat'

export type Poll = {
    contact: string,
    name: string,
    choices: string[],
    options?: PoolMessageOptions
}