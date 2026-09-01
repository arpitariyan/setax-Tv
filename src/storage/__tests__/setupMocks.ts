// Define global __DEV__ for React Native / Expo environment in Jest
(global as any).__DEV__ = true;

const storageStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => storageStore[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    storageStore[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storageStore[key];
  }),
  clear: jest.fn(async () => {
    Object.keys(storageStore).forEach((key) => delete storageStore[key]);
  }),
}));

const secureStore: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => secureStore[key] || null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    secureStore[key] = value;
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    delete secureStore[key];
  }),
}));

let mockFileStore: Record<string, string> = {};

jest.mock('expo-file-system', () => {
  return {
    Paths: {
      document: 'mock://documents',
    },
    File: class MockFile {
      uri: string;
      constructor(...uris: string[]) {
        this.uri = uris.join('/');
      }
      get exists() {
        return Boolean(mockFileStore[this.uri]);
      }
      async write(content: string) {
        mockFileStore[this.uri] = content;
      }
      async text() {
        return mockFileStore[this.uri] || '';
      }
      delete() {
        delete mockFileStore[this.uri];
      }
    },
  };
});
