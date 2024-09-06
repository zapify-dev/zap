export type ReadResult<T> = {
  error?: Error;
  result?: T;
  status: 'success' | 'failure';
};
