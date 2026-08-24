function formatIndianNumber(value) {
  const [integer, decimal] = Number(value).toFixed(2).split(".");
  const lastThree = integer.slice(-3);
  const remaining = integer.slice(0, -3);
  const grouped = remaining ? `${remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
  return `${grouped}.${decimal}`;
}

export function formatIndianCurrency(amount) {
  return `₹${formatIndianNumber(amount)}`;
}

export function formatMaskedIndianCurrency(amount) {
  return formatIndianCurrency(amount).replace(/\d/g, "•");
}

export function formatIndianDateTime(timestamp) {
  if (!timestamp) return "";
  const indiaOffsetMilliseconds = (5 * 60 + 30) * 60 * 1000;
  const date = new Date(new Date(timestamp).getTime() + indiaOffsetMilliseconds);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}
