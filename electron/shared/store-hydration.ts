import { store } from "../../src/redux/store";

export const waitForStoreRehydration = () => {
  return new Promise<string | null>((resolve) => {
    const state = store.getState();
    if (state._persist?.rehydrated) {
      resolve(store.getState().user.tokens.accessToken);
      return;
    }
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state._persist?.rehydrated) {
        unsubscribe();
        resolve(store.getState().user.tokens.accessToken);
      }
    });
  });
};
