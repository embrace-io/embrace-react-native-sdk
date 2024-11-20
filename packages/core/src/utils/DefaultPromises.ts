const createFalsePromise = (): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(false);
    }, 0);
  });
};

const createTruePromise = (): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 0);
  });
};
export {createFalsePromise, createTruePromise};
