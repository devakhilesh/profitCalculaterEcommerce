exports.amazonClosingFee = {
  fixedClosingFee: {
    standardEasyShip: [
      { min: 0, max: 300, fee: 6 },
      { min: 301, max: 500, fee: 11 },
      { min: 501, max: 1000, fee: 34 },
      { min: 1001, max: null, fee: 65 }, 
    ],
    easyShipPrime: [
      { min: 0, max: 300, fee: 6 },
      { min: 301, max: 500, fee: 11 },
      { min: 501, max: 1000, fee: 34 },
      { min: 1001, max: null, fee: 65 },
    ],
    selfShip: {
      allExceptBooks: [
        { min: 0, max: 300, fee: 20 },
        { min: 301, max: 500, fee: 25 },
        { min: 501, max: 1000, fee: 50 },
        { min: 1001, max: null, fee: 100 },
      ],
      books: [
        { min: 0, max: 300, fee: 6 },
        { min: 301, max: 500, fee: 25 },
        { min: 501, max: 1000, fee: 50 },
        { min: 1001, max: null, fee: 100 },
      ],
    },
    sellerFlex: [
      { min: 0, max: 300, fee: 6 },
      { min: 301, max: 500, fee: 11 },
      { min: 501, max: 1000, fee: 34 },
      { min: 1001, max: null, fee: 65 },
    ],
    categoriesWithException: [
      { min: 0, max: 300, fee: 13 },
      { min: 301, max: 500, fee: 13 },
      { min: 501, max: 1000, fee: 26 },
      { min: 1001, max: null, fee: 71 },
    ],
    allCategories: [
      { min: 0, max: 300, fee: 26 },
      { min: 301, max: 500, fee: 21 },
      { min: 501, max: 1000, fee: 26 },
      { min: 1001, max: null, fee: 51 },
    ],
  },
};
