export interface FoodItem {
  _id: string;
  name: string;
  type: "main" | "side";
  price: number;
  createdAt?: string;
  updatedAt?: string;
}
