/**
 * Safe local verification test script for Meta WhatsApp Cloud API Webhooks.
 * Tests GET verification challenge, error cases, and POST event handling.
 * Does NOT print or reveal any sensitive secrets or tokens.
 */
const http = require("http");

const BASE_HOST = "localhost";
const BASE_PORT = 3000;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_HOST,
      port: BASE_PORT,
      path,
      method,
      headers: {
        ...headers,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("   MentorHUB WhatsApp Webhook Verification Suite ");
  console.log("=================================================");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "mentorhub_whatsapp_verify_token";
  const testChallenge = "1158201444";

  let allPassed = true;

  // Test 1: Successful verification on /api/whatsapp/webhook
  try {
    const res1 = await makeRequest(
      "GET",
      `/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${testChallenge}`
    );
    const pass = res1.statusCode === 200 && res1.body === testChallenge;
    console.log(`[TEST 1] GET /api/whatsapp/webhook with valid token: ${pass ? "PASSED (HTTP 200, challenge match)" : "FAILED (Status " + res1.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 1] Error: ${err.message}`);
    allPassed = false;
  }

  // Test 2: Successful verification with trailing slash /api/whatsapp/webhook/
  try {
    const res2 = await makeRequest(
      "GET",
      `/api/whatsapp/webhook/?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${testChallenge}`
    );
    const pass = res2.statusCode === 200 && res2.body === testChallenge;
    console.log(`[TEST 2] GET /api/whatsapp/webhook/ (trailing slash): ${pass ? "PASSED (HTTP 200, challenge match)" : "FAILED (Status " + res2.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 2] Error: ${err.message}`);
    allPassed = false;
  }

  // Test 3: Verification with incorrect token (Must return HTTP 403 Forbidden)
  try {
    const res3 = await makeRequest(
      "GET",
      `/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=invalid_mismatched_token&hub.challenge=${testChallenge}`
    );
    const pass = res3.statusCode === 403;
    console.log(`[TEST 3] GET /api/whatsapp/webhook with invalid token: ${pass ? "PASSED (HTTP 403 Forbidden as expected)" : "FAILED (Status " + res3.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 3] Error: ${err.message}`);
    allPassed = false;
  }

  // Test 4: Verification with missing hub parameters (Must return HTTP 400 Bad Request)
  try {
    const res4 = await makeRequest("GET", `/api/whatsapp/webhook?hub.mode=subscribe`);
    const pass = res4.statusCode === 400;
    console.log(`[TEST 4] GET /api/whatsapp/webhook with missing parameters: ${pass ? "PASSED (HTTP 400 Bad Request as expected)" : "FAILED (Status " + res4.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 4] Error: ${err.message}`);
    allPassed = false;
  }

  // Test 5: Fallback path /whatsapp/webhook without /api prefix
  try {
    const res5 = await makeRequest(
      "GET",
      `/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${testChallenge}`
    );
    const pass = res5.statusCode === 200 && res5.body === testChallenge;
    console.log(`[TEST 5] GET /whatsapp/webhook (direct fallback path): ${pass ? "PASSED (HTTP 200, challenge match)" : "FAILED (Status " + res5.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 5] Error: ${err.message}`);
    allPassed = false;
  }

  // Test 6: POST event payload (delivery status update)
  try {
    const postPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba_test_123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "15551234567",
                  phone_number_id: "test_phone_id",
                },
                statuses: [
                  {
                    id: "msg_status_test_id",
                    status: "delivered",
                    timestamp: "1729500000",
                    recipient_id: "919876543210",
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    const res6 = await makeRequest("POST", "/api/whatsapp/webhook", postPayload);
    const pass = res6.statusCode === 200;
    console.log(`[TEST 6] POST /api/whatsapp/webhook with status event: ${pass ? "PASSED (HTTP 200 EVENT_RECEIVED)" : "FAILED (Status " + res6.statusCode + ")"}`);
    if (!pass) allPassed = false;
  } catch (err) {
    console.log(`[TEST 6] Error: ${err.message}`);
    allPassed = false;
  }

  console.log("=================================================");
  console.log(`Final Result: ${allPassed ? "ALL 6 TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log("=================================================");

  process.exit(allPassed ? 0 : 1);
}

runTests();
