 /**
 * Interlinked finance logic:
 * - sellingPrice.amount = final price customer pays (incl GST if you store that way).
 * - sellingPrice.gstPercent = GST % applicable to selling price.
 * - sellingPrice.priceWithoutGst = computed as selling / (1 + gst/100)
 * - sellingPrice.gstAmount = selling - priceWithoutGst
 *
 * - TotalCost = sum of all cost components (priceWithoutGst + packaging + shipping + per-order costs + return losses + damage + tds + tcs etc.)
 *   (You can customize which fields you include in total cost; below I include the common ones.)
 *
 * - profitAmount = priceWithoutGst - directCostsIncluded
 * - profitPercentOnCost = profitAmount / directCostsIncluded * 100  (if directCostsIncluded > 0)
 * - profitPercentOnSelling = profitAmount / sellingPrice.amount * 100 (if sellingPrice.amount > 0)
 *
 * Functions provided:
 * - statics.computeSellingPriceFromCostAndProfit(cost, profitPercent) -> selling price (priceWithoutGst basis)
 * - statics.computeCostFromSellingAndProfit(selling, profitPercent) -> cost
 * - statics.computeProfitFromSellingAndCost(selling, cost) -> { profitAmount, profitPercentOnCost, profitPercentOnSelling }
 *
 * Instance:
 * - doc.computeDerived(): computes priceWithoutGst, gstAmount and profit fields and writes them to the document
 * - pre('save') runs computeDerived automatically
 */


