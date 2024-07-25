class TariffDto {
  constructor(model) {
    this.id = model.id;
    this.plan = model.plan;
    this.creations = model.creations;
    this.edits = model.edits;
    this.startAt = model.startAt;
    this.endAt = model.endAt;
    this.hasSubscription = Boolean(model.paymentMethodId);
    this.isExpired = model.isExpired;
  }
}

module.exports = TariffDto;
