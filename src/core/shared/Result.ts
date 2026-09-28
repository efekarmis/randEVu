export class Result<TValue, TError> {
  private constructor(
    private readonly success: boolean,
    private readonly _value?: TValue,
    private readonly _error?: TError,
  ) {}

  static ok<TValue, TError = never>(value: TValue): Result<TValue, TError> {
    return new Result<TValue, TError>(true, value, undefined);
  }

  static fail<TError, TValue = never>(error: TError): Result<TValue, TError> {
    return new Result<TValue, TError>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this.success;
  }

  get isFailure(): boolean {
    return !this.success;
  }

  get value(): TValue {
    if (!this.success) {
      throw new Error("Cannot read value of a failed Result.");
    }
    return this._value as TValue;
  }

  get error(): TError {
    if (this.success) {
      throw new Error("Cannot read error of a successful Result.");
    }
    return this._error as TError;
  }

  map<TNewValue>(fn: (value: TValue) => TNewValue): Result<TNewValue, TError> {
    return this.success
      ? Result.ok(fn(this._value as TValue))
      : Result.fail(this._error as TError);
  }

  mapError<TNewError>(fn: (error: TError) => TNewError): Result<TValue, TNewError> {
    return this.success
      ? Result.ok(this._value as TValue)
      : Result.fail(fn(this._error as TError));
  }

  match<TOutcome>(handlers: {
    onSuccess: (value: TValue) => TOutcome;
    onFailure: (error: TError) => TOutcome;
  }): TOutcome {
    return this.success
      ? handlers.onSuccess(this._value as TValue)
      : handlers.onFailure(this._error as TError);
  }
}
