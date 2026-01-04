export const calculateTotal = (items: any[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
