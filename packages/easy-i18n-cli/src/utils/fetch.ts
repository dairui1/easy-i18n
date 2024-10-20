import consola from "consola";

export const retryFetch = async (url: string, options: any, retries: number, retryDelay: number): Promise<Response> => new Promise((resolve, reject) => {
  const makeRequest = (retryCount: number) => {
    fetch(url, options)
      .then(response => resolve(response))
      .catch((error) => {
        consola.error(error);
        if (retryCount > 0) {
          consola.log('retryCount', retryCount);
          setTimeout(() => makeRequest(retryCount - 1), retryDelay);
        } else {
          reject(error);
        }
      });
  };

  makeRequest(retries);
});