// Shared formatters so currency/dates/numbers look identical on every page.

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const number = new Intl.NumberFormat("en-US");

export const formatCurrency = (value: number) => currency.format(value);

export const formatNumber = (value: number) => number.format(value);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
