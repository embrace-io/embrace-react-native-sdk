import { startServer } from './embrace_server';

const main = async () => {
  startServer(true);
  await new Promise(() => {});
};

main();
