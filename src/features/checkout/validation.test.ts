import { describe, expect, it } from "vitest";
import { checkoutFields, formatPakistaniMobile, normalizePakistaniMobile, validateBilling } from "./validation";

const valid: Record<(typeof checkoutFields)[number], string> = {
  firstName: "Ayesha",
  lastName: "Khan",
  phone: "0300 1234567",
  email: "",
  province: "Islamabad Capital Territory",
  city: "Islamabad",
  street: "House 0, Street 0, F-7/2",
  apartment: "",
  postalCode: "44000",
  notes: "",
  paymentMethod: "cod",
};

describe("normalizePakistaniMobile", () => {
  it.each(["03001234567", "0300 1234567", "0300-1234567", "+92 300 1234567", "+923001234567", "00923001234567", "923001234567", "(0300) 123-4567"])(
    "normalises %s",
    (input) => {
      expect(normalizePakistaniMobile(input)).toBe("+923001234567");
    },
  );

  it.each(["", "042 1234567", "+92 42 1234567", "0300123456", "030012345678", "+1 300 1234567", "03001234abc"])(
    "rejects %s",
    (input) => {
      expect(normalizePakistaniMobile(input)).toBeNull();
    },
  );

  it("formats for display", () => {
    expect(formatPakistaniMobile("+923001234567")).toBe("+92 300 1234567");
  });
});

describe("validateBilling (Pakistan, cash on delivery)", () => {
  it("accepts a complete Pakistani address and normalises the phone", () => {
    const result = validateBilling(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({ phone: "+923001234567", email: null, paymentMethod: "cod", postalCode: "44000" });
  });

  it("makes email and postal code optional but validates them when given", () => {
    expect(validateBilling({ ...valid, postalCode: "" }).ok).toBe(true);
    const result = validateBilling({ ...valid, email: "nope", postalCode: "4400" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "postalCode"]);
  });

  it("only allows Pakistani provinces and cash on delivery", () => {
    const result = validateBilling({ ...valid, province: "California", paymentMethod: "paypal" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["paymentMethod", "province"]);
  });

  it("requires name, street, city and a mobile number", () => {
    const result = validateBilling({ ...valid, firstName: "", lastName: "", street: "", city: "", phone: "" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.fieldErrors).sort()).toEqual(["city", "firstName", "lastName", "phone", "street"]);
  });
});
