const hasOptionSet = (
  optionSets: Record<string, string[]>,
  options: string[],
) =>
  !!Object.values(optionSets).find((set) =>
    JSON.stringify(set) === JSON.stringify(options)
  );

export const addOptionSet = (
  optionSets: Record<string, string[]>,
  options: string[],
) => {
  if (!hasOptionSet(optionSets, options)) {
    optionSets[Object.keys(optionSets).length] = options;
  }
};
