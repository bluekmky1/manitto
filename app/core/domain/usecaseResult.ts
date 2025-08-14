export type UseCaseResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };
