declare module 'mockserver-node' {
  export function start_mockserver({
    serverPort,
    trace,
  }: {
    serverPort: number;
    trace: boolean;
  }): void;

  export function stop_mockserver({ serverPort }: { serverPort: number }): void;
}
