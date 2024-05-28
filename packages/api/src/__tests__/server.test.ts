import { createCaller } from "@repo/api";
import { expect, test } from "vitest";

test("get products", async () => {
  const caller = createCaller({ session: null });

  const products = await caller.product.find({
    department: "Computers",
    limit: 5,
  });

  expect(products.products).not.toHaveLength(0);
  expect(products.products).not.toHaveLength(6);
});
