import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { isGooseMail, receivedEmailId, verifySvix } from "./inbound";

const secret = "whsec_" + Buffer.from("super-secret-key").toString("base64");
const payload = '{"type":"email.received","data":{"email_id":"abc"}}';
const id = "msg_1";
const timestamp = "1000";

function sign(body: string, ts = timestamp) {
  const raw = Buffer.from("super-secret-key");
  const digest = createHmac("sha256", raw).update(`${id}.${ts}.${body}`).digest("base64");
  return `v1,${digest}`;
}

describe("verifySvix", () => {
  it("accepts a matching signature", () => {
    expect(
      verifySvix(payload, { id, timestamp, signature: sign(payload) }, secret, 1000),
    ).toBe(true);
  });

  it("rejects a bad signature", () => {
    expect(
      verifySvix(payload, { id, timestamp, signature: "v1,nope" }, secret, 1000),
    ).toBe(false);
  });

  it("rejects a stale timestamp", () => {
    expect(
      verifySvix(payload, { id, timestamp, signature: sign(payload) }, secret, 1000 + 400),
    ).toBe(false);
  });
});

describe("receivedEmailId", () => {
  it("reads email.received ids", () => {
    expect(receivedEmailId({ type: "email.received", data: { email_id: "abc" } })).toBe("abc");
  });

  it("ignores other events", () => {
    expect(receivedEmailId({ type: "email.sent", data: { email_id: "abc" } })).toBeNull();
  });
});

describe("isGooseMail", () => {
  it("accepts info@chxgoose.com", () => {
    expect(
      isGooseMail({ type: "email.received", data: { to: ["info@chxgoose.com"] } }),
    ).toBe(true);
  });

  it("ignores mail for other domains on the same Resend account", () => {
    expect(
      isGooseMail({
        type: "email.received",
        data: { to: ["justin@justindkamen.com"], received_for: ["justin@justindkamen.com"] },
      }),
    ).toBe(false);
  });
});
