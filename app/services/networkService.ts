export const networkService = {
  get: async (url: string, options?: RequestInit) => {
    const response = await fetch(url, { ...options, method: "GET" });
    return response.json();
  },
  post: async (url: string, body: any, options?: RequestInit) => {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: JSON.stringify(body),
    });
    return response.json();
  },
};
