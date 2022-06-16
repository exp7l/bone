const { ethers } = globalThis;

export const objectify = function objectify(arrary, propertyFn, valueFn) {
  return arrary.reduce(
    (object, element) => ({
      ...object,
      [propertyFn(element)]: valueFn(element),
    }),
    {},
  );
};

export const toWAD = function toWAD(realString) {
  return ethers.utils.parseUnits(realString, 18);
};
