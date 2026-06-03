import { describe, expect, it, vi } from "vitest";
import { getOrderById, getReceiptUrlFromResponse } from "./orderService";
import * as apiClient from "@/api/apiClient";

describe("getOrderById", () => {
  it("maps order item add-on quantities from options", async () => {
    const requestApiSpy = vi.spyOn(apiClient, "requestApi").mockResolvedValue({
      success: true,
      message: "ok",
      data: {
        order_id: 123,
        status: 0,
        amount: 540,
        items: [
          {
            item_id: 9,
            item_name: "Burger",
            quantity: 3,
            unit_price: 120,
            total_price: 360,
            options: [
              {
                group_name: "Extra Toppings",
                option_name: "Cheese",
                quantity: 2,
                price: 30,
                unit_price: 30,
                total_price: 60,
              },
              {
                group_name: "Extra Toppings",
                option_name: "Olives",
                quantity: 1,
                price: 20,
                unit_price: 20,
                total_price: 20,
              },
            ],
          },
        ],
      },
      raw: null,
    });

    const order = await getOrderById(123);

    expect(requestApiSpy).toHaveBeenCalledWith({
      method: "get",
      url: "/orders/items/123",
    });
    expect(order.items[0]).toMatchObject({
      item_name: "Burger",
      quantity: 3,
      options: [
        {
          group_name: "Extra Toppings",
          option_name: "Cheese",
          quantity: 2,
          unit_price: 30,
          total_price: 60,
        },
        {
          group_name: "Extra Toppings",
          option_name: "Olives",
          quantity: 1,
          unit_price: 20,
          total_price: 20,
        },
      ],
    });
    expect(order.items[0].options_text).toBe(
      "Extra Toppings: Cheese x2\nExtra Toppings: Olives x1",
    );
  });
});

describe("getReceiptUrlFromResponse", () => {
  it("supports direct receiptUrl responses", () => {
    expect(getReceiptUrlFromResponse({ receiptUrl: "/receipts/1.pdf" })).toBe(
      "/receipts/1.pdf",
    );
  });

  it("supports url responses", () => {
    expect(getReceiptUrlFromResponse({ url: "/receipts/2.pdf" })).toBe(
      "/receipts/2.pdf",
    );
  });

  it("supports nested data receiptUrl responses", () => {
    expect(
      getReceiptUrlFromResponse({ data: { receiptUrl: "/receipts/3.pdf" } }),
    ).toBe("/receipts/3.pdf");
  });

  it("supports nested receipt url responses", () => {
    expect(getReceiptUrlFromResponse({ receipt: { url: "/receipts/4.pdf" } })).toBe(
      "/receipts/4.pdf",
    );
  });
});
