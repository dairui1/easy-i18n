export const retryFetch = async (url: string, options: any, retries: number, retryDelay: number): Promise<Response> => new Promise((resolve, reject) => {
  const makeRequest = (retryCount: number) => {
    fetch(url, options)
      .then(response => resolve(response))
      .catch((error) => {
        console.error(error);
        if (retryCount > 0) {
          console.log('retryCount', retryCount);
          setTimeout(() => makeRequest(retryCount - 1), retryDelay);
        } else {
          reject(error);
        }
      });
  };

  makeRequest(retries);
});