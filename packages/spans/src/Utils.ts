export const createFalsePromise = (): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(false);
    }, 0);
  });
};

// TODO remove this
export const convertMSToNano = (ms: number | undefined) => {
  if (!ms) {
    return undefined;
  }
  return ms * 1e6;
};

export const validateAndLogRequiredProperties = ({...params}) => {
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const value = params[key] as string | number;
      if (!value || value.toString().trim() === "") {
        console.warn(`[Embrace] The parameter: ${key}, is required.`);
        return false;
      }
    }
  }
  return true;
};
