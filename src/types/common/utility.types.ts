export type Exact<T> = T extends object ? { [K in keyof T]: Exact<Exclude<T[K], undefined>> } : T;
