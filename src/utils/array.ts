const objToArr = <T = any>(
  object: Record<string, T>,
  randomOrder = false
): T[] => {
  const entries = Object.entries(object);
  const isUnordered = entries.some(entry => Number.isNaN(Number(entry[0])));

  if (randomOrder && isUnordered) {
    return Object.values(object);
  }

  return Object.entries(object)
    .sort((e1, e2) => Number(e1[0]) - Number(e2[0]))
    .map(e => e[1]);
};

export default objToArr;
