const isMergeableObject = (value: any) =>
  isNonNullObject(value) &&
  !isSpecial(value);

const isNonNullObject = (value: any) => !!value && typeof value === "object";

const isSpecial = (value: any) => {
  var stringValue = Object.prototype.toString.call(value);
  return stringValue === "[object RegExp]" ||
    stringValue === "[object Date]" ||
    isReactElement(value);
};

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 0xeac7;

const isReactElement = (value: any) => value.$$typeof === REACT_ELEMENT_TYPE;

const emptyTarget = (val: any) => Array.isArray(val) ? [] : {};

const cloneUnlessOtherwiseSpecified = (value: any, options: DeepMergeOptions) =>
  (options.clone !== false && options.isMergeableObject?.(value))
    ? merge(emptyTarget(value), value, options)
    : value;

// * See: https://www.npmjs.com/package/deepmerge
const combineMerge = (
  target: any[],
  source: any[],
  options: DeepMergeOptions,
) => {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (typeof destination[index] === "undefined") {
      destination[index] = options.cloneUnlessOtherwiseSpecified?.(
        item,
        options,
      );
    } else if (options.isMergeableObject?.(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};
const defaultArrayMerge = combineMerge;
// const defaultArrayMerge = (
//   target: any[],
//   source: any[],
//   options: DeepMergeOptions,
// ) =>
//   target.concat(source).map((element) =>
//     cloneUnlessOtherwiseSpecified(element, options)
//   );

const getMergeFunction = (key: string, options: DeepMergeOptions) => {
  if (!options.customMerge) {
    return merge;
  }
  var customMerge = options.customMerge(key);
  return typeof customMerge === "function" ? customMerge : merge;
};

const getEnumerableOwnPropertySymbols = (target: any) =>
  Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter((symbol) =>
      target.propertyIsEnumerable(symbol)
    )
    : [];

const getKeys = (target: {}) =>
  Object.keys(target).concat(
    getEnumerableOwnPropertySymbols(target) as any,
  );

const propertyIsOnObject = (object: any, property: string) => {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
};

// Protects from prototype poisoning and unexpected merging up the prototype chain.
const propertyIsUnsafe = (target: any, key: string) =>
  propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
  !(Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
    Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.

const mergeObject = (target: any, source: any, options: DeepMergeOptions) => {
  const destination: any = {};
  if (options.isMergeableObject?.(target)) {
    getKeys(target).forEach((key) => {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    });
  }
  getKeys(source).forEach((key) => {
    if (propertyIsUnsafe(target, key)) {
      return;
    }

    if (
      propertyIsOnObject(target, key) &&
      options.isMergeableObject?.(source[key])
    ) {
      destination[key] = getMergeFunction(key, options)(
        target[key],
        source[key],
        options,
      );
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination;
};

type DeepMergeOptions = {
  arrayMerge?: (target: any[], source: any[], options: DeepMergeOptions) => any;
  isMergeableObject?: (value: any) => boolean;
  cloneUnlessOtherwiseSpecified?: (
    value: any,
    options: DeepMergeOptions,
  ) => any;
  clone?: boolean;
  customMerge?: (key: string) => Function;
};

const merge = (
  target: any,
  source: any,
  options?: DeepMergeOptions,
): any => {
  options = options || {};
  options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  options.isMergeableObject = options.isMergeableObject || isMergeableObject;
  // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
  // implementations can use it. The caller may not replace it.
  options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, options);
  } else if (sourceIsArray) {
    return options.arrayMerge(target, source, options);
  } else {
    return mergeObject(target, source, options);
  }
};

merge.all = (array: any[], options: DeepMergeOptions) => {
  if (!Array.isArray(array)) {
    throw new Error("first argument should be an array");
  }
  return array.reduce((prev, next) => merge(prev, next, options), {});
};

export { merge };
