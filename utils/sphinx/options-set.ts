// TODO remove duplicates e.g.
/*
'11':
  - STABLE
  - PROBLEM
'12':
  - STABLE
  - CHANGE 
  - PROBLEM
*/

// * Gets either the options as an array of string, or an array of the first key or each item
const simpleOptions = (options: any[]) =>
  options.map((option) =>
    typeof option === "string" ? option : Object.keys(option)[0]
  );

// * Gets the option set according to its simple JSON signature
export const getOptionSet = (
  optionSets: Record<string, any>,
  options: any[],
) => {
  const simpleOpts = simpleOptions(options);
  return Object.values(optionSets).find((set) => {
    return JSON.stringify(simpleOptions(set)) === JSON.stringify(simpleOpts);
  });
};

// * Adds a new options set, if it doesn't exist already
export const addOptionSet = (
  optionSets: Record<string, any[]>,
  options: any[],
) => {
  if (!getOptionSet(optionSets, options)) {
    optionSets[Object.keys(optionSets).length] = options;
  }
};

/** 
 * * Returns the option value, either the given string or the value of the first key that matches 'value'
 * options:
 *  - yes: true
 *  - no: false
 * getOptionValue(options, 'yes') = true
 *  */
export const getOptionValue = (options: any[], value: string | undefined) => {
  if (!value) return undefined;
  const index = options.find((option) =>
    typeof option === "string"
      ? option === value
      : Object.keys(option)[0] === value
  );
  return typeof index === "string" ? index : index[Object.keys(index)[0]];
};

// // * Tells if the option set is an enum i.e. its values are string
// export const isOptionsEnum = (options: any[]) =>
//   options.some((option) =>
//     typeof option === "string" ||
//     typeof option[Object.keys(option)[0]] === "string"
//   );

// // * If none of the options are string e.g. boolean, null, number... then it's a scalar
// export const isOptionsScalar = (options: any[]) => !isOptionsEnum(options);
