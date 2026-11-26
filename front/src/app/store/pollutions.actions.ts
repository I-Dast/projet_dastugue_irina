export class LoadPollutions {
  static readonly type = '[Pollutions] Load';
}

export class DeletePollution {
  static readonly type = '[Pollutions] Delete';

  constructor(readonly id: number | string | undefined) {}
}
