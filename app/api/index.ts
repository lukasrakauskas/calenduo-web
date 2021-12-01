import { Api } from './api';

export * from './api';

export const api = new Api({
  baseUrl: process.env.API_URL,
});
