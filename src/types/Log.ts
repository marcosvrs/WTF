export default interface Log {
  level: number;
  message: string;
  attachment: boolean;
  contact: string;
  date?: string;
}
