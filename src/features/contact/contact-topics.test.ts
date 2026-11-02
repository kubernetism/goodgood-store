import { describe, expect, it } from "vitest";
import {
  DEFAULT_MESSAGE_HINT,
  contactTopics,
  messageCounterAnnouncement,
  messageCounterText,
  messageHintFor,
  parseContactService,
  topicAnchorId,
  topicFromHash,
  topicPhrase,
} from "./contact-topics";
import { MESSAGE_MAX_LENGTH, MESSAGE_MIN_LENGTH, contactServices } from "./validation";

describe("contact topic picker", () => {
  it("offers every stored service once, with the stored value and label", () => {
    expect(contactTopics.map(({ value, label }) => ({ value, label }))).toEqual(contactServices);
    for (const topic of contactTopics) {
      expect(topic.description).not.toBe("");
      expect(topic.messageHint).toMatch(/\.$/);
    }
  });

  it("guides the message for the chosen topic", () => {
    expect(messageHintFor(null)).toBe(DEFAULT_MESSAGE_HINT);
    expect(messageHintFor("home-delivery")).toMatch(/order number/);
    expect(messageHintFor("bulk-orders")).toMatch(/quantity/);
  });

  it("round-trips pathway deep links through the hash", () => {
    for (const { value } of contactServices) expect(topicFromHash(`#${topicAnchorId(value)}`)).toBe(value);
    expect(topicFromHash("#enquiry-unknown")).toBeNull();
    expect(topicFromHash("#message")).toBeNull();
    expect(topicFromHash("")).toBeNull();
  });

  it("accepts only known services from untrusted input", () => {
    expect(parseContactService("bulk-orders")).toBe("bulk-orders");
    expect(parseContactService("BULK-ORDERS")).toBeNull();
    expect(parseContactService(["bulk-orders"])).toBeNull();
    expect(parseContactService(undefined)).toBeNull();
  });

  it("phrases the topic for confirmations, leaving 'Something else' generic", () => {
    expect(topicPhrase("gift-boxes")).toBe("corporate and wedding gifts");
    expect(topicPhrase("other")).toBeNull();
  });
});

describe("message character counter", () => {
  const counter = (length: number) => messageCounterText(length, MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH);

  it("shows progress against the limit by default", () => {
    expect(counter(0)).toBe("0 / 2,000");
    expect(counter(1234)).toBe("1,234 / 2,000");
  });

  it("counts down to the minimum while the message is too short", () => {
    expect(counter(1)).toBe("9 more characters needed");
    expect(counter(9)).toBe("1 more character needed");
    expect(counter(10)).toBe("10 / 2,000");
  });

  it("counts down near the limit and says when it is reached", () => {
    expect(counter(1799)).toBe("1,799 / 2,000");
    expect(counter(1800)).toBe("200 characters left");
    expect(counter(1999)).toBe("1 character left");
    expect(counter(2000)).toBe("Character limit reached");
  });

  it("announces only at a few thresholds", () => {
    expect(messageCounterAnnouncement(100, 2000)).toBe("");
    expect(messageCounterAnnouncement(1800, 2000)).toBe("200 characters left");
    expect(messageCounterAnnouncement(1950, 2000)).toBe("50 characters left");
    expect(messageCounterAnnouncement(2000, 2000)).toBe("Character limit reached");
  });
});
