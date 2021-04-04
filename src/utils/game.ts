/* eslint-disable import/prefer-default-export */
export const getColor = (team?: number): 'green' | 'orange' | 'brandDark' => {
  if (team === undefined) {
    return 'brandDark';
  }

  return team === 0 ? 'green' : 'orange';
};
