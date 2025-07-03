
export class ShowMessage2 {
  public Show: boolean;
  public Type: MessageType;
  public Message: string;
}

export enum MessageType2 {
  Sucess,
  Warning,
  Info,
  Error
}

export class ShowMessage {
  public Show: boolean;
  public Type: MessageType;
  public Message: string;
}

export enum MessageType {
  Sucess = 0,
  Warning = 1,
  Info = 2,
  Error = 3
}