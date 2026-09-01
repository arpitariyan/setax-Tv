import { useNetworkState } from '../useNetworkState';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => {}),
}));

describe('useNetworkState Module Unit Tests', () => {
  test('export is a defined function', () => {
    expect(typeof useNetworkState).toBe('function');
  });
});
