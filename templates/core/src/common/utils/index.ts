export * from './logger';

export const Delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms, true));
