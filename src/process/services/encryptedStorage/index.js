import EncryptedStorage from 'react-native-encrypted-storage';

export default {
  get: async name => {
    try {
      const data = await EncryptedStorage.getItem(name);
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  },
  set: async (name, data) => {
    await EncryptedStorage.setItem(name, JSON.stringify(data));
  },
  remove: async name => {
    await EncryptedStorage.removeItem(name);
  }
};
