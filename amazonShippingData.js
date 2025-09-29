exports.amazonShippingFee = {
  // Fulfilment by Amazon (FBA)
  fba: {
    local: [
      { minKg: 0, maxKg: 0.5, fee: 34.5 },
      { minKg: 0.501, maxKg: 1, fee: 54.5 },
      { minKg: 1.001, maxKg: 5, fee: 80 },
      { minKg: 5.001, maxKg: 12, fee: 176 },
      { minKg: 12.001, maxKg: null, base: 176, extraPerKg: 5 },
    ],
    regional: [
      { minKg: 0, maxKg: 0.5, fee: 54.5 },
      { minKg: 0.501, maxKg: 1, fee: 74.5 },
      { minKg: 1.001, maxKg: 5, fee: 122 },
      { minKg: 5.001, maxKg: 12, fee: 261 },
      { minKg: 12.001, maxKg: null, base: 261, extraPerKg: 6 },
    ],
    national: [
      { minKg: 0, maxKg: 0.5, fee: 65 },
      { minKg: 0.501, maxKg: 1, fee: 85 },
      { minKg: 1.001, maxKg: 5, fee: 148 },
      { minKg: 5.001, maxKg: 12, fee: 321 },
      { minKg: 12.001, maxKg: null, base: 321, extraPerKg: 8 },
    ],
  },
  // Easy Ship
  easyShip: {
    local: [
      { minKg: 0, maxKg: 0.5, fee: 34 },
      { minKg: 0.501, maxKg: 1, fee: 54 },
      { minKg: 1.001, maxKg: 5, fee: 122 },
      { minKg: 5.001, maxKg: 12, fee: 192 },
      { minKg: 12.001, maxKg: null, base: 192, extraPerKg: 5 },
    ],
    regional: [
      { minKg: 0, maxKg: 0.5, fee: 54 },
      { minKg: 0.501, maxKg: 1, fee: 74 },
      { minKg: 1.001, maxKg: 5, fee: 148 },
      { minKg: 5.001, maxKg: 12, fee: 261 },
      { minKg: 12.001, maxKg: null, base: 261, extraPerKg: 6 },
    ],
    national: [
      { minKg: 0, maxKg: 0.5, fee: 65 },
      { minKg: 0.501, maxKg: 1, fee: 85 },
      { minKg: 1.001, maxKg: 5, fee: 173 },
      { minKg: 5.001, maxKg: 12, fee: 321 },
      { minKg: 12.001, maxKg: null, base: 321, extraPerKg: 8 },
    ],
  },

  // Self Ship (Amazon doesn’t charge — seller bears courier cost directly)
  selfShip: {
    note: "Amazon does not levy shipping fee for Self Ship. Seller pays courier directly.",
    local: [],
    regional: [],
    national: [],
  },

  // Seller Flex (similar to FBA)
  sellerFlex: {
    local: [
      { minKg: 0, maxKg: 0.5, fee: 34.5 },
      { minKg: 0.501, maxKg: 1, fee: 54.5 },
      { minKg: 1.001, maxKg: 5, fee: 80 },
      { minKg: 5.001, maxKg: 12, fee: 176 },
      { minKg: 12.001, maxKg: null, base: 176, extraPerKg: 5 },
    ],
    regional: [
      { minKg: 0, maxKg: 0.5, fee: 54.5 },
      { minKg: 0.501, maxKg: 1, fee: 74.5 },
      { minKg: 1.001, maxKg: 5, fee: 122 },
      { minKg: 5.001, maxKg: 12, fee: 261 },
      { minKg: 12.001, maxKg: null, base: 261, extraPerKg: 6 },
    ],
    national: [
      { minKg: 0, maxKg: 0.5, fee: 65 },
      { minKg: 0.501, maxKg: 1, fee: 85 },
      { minKg: 1.001, maxKg: 5, fee: 148 },
      { minKg: 5.001, maxKg: 12, fee: 321 },
      { minKg: 12.001, maxKg: null, base: 321, extraPerKg: 8 },
    ],
  },
};
