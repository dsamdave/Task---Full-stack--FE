import { atom, selector } from 'recoil';

export const heightState = atom({
  key: 'heightState', // unique ID (with respect to other atoms/selectors)
  default: '', // default value (initial value)
});

export const dynaHeight = selector({
  key: 'dynaHeight', // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const newHeight = get(heightState);
  
    return newHeight;
  },
});

