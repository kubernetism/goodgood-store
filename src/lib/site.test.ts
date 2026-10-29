import { describe, expect, it } from "vitest";
import { siteConfig } from "./site";

describe("business contact details", () => {
  const { contact } = siteConfig;

  it("keeps all three supplied names and phone numbers", () => {
    expect(contact.people).toEqual([
      { name: "Salman Sami", phoneDisplay: "0311-9000985", phoneHref: "tel:+923119000985" },
      { name: "M.D Basit Khan", phoneDisplay: "0319-9073330", phoneHref: "tel:+923199073330" },
      { name: "Mubashir Khan", phoneDisplay: "0315-9021627", phoneHref: "tel:+923159021627" },
    ]);
  });

  it.each(contact.people)("uses an international dial link matching $name's displayed number", (person) => {
    const localNumber = person.phoneDisplay.replace(/\D/g, "");
    expect(localNumber).toMatch(/^03\d{9}$/);
    expect(person.phoneHref).toBe(`tel:+92${localNumber.slice(1)}`);
  });

  it("uses the first supplied person for compact contact links", () => {
    expect(contact.primary).toBe(contact.people[0]);
  });

  it("preserves the supplied business and branch address", () => {
    expect(contact).toMatchObject({
      businessName: "Abdul Sami Honey Enterprises",
      businessType: "Import & Export",
      branch: "Branch No. 2",
      address: "Usman Tower, Shop No. 1, 2, 3, Byco Pump, Main GT Road, Near Nasir Pur Phatak, Peshawar, Pakistan.",
    });
  });

  it("separates weekday support hours from anytime online ordering", () => {
    expect(contact.email).toBe("support@abdulsamienterprises.com");
    expect(contact.hours).toBe("Monday–Friday, 9:00am–5:00pm PKT");
    expect(contact.onlineOrders).toBe("Online orders anytime");
  });
});
