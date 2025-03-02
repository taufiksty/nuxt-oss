import http from "k6/http";
import { sleep, check } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// Metrics
const responseTimeTrend = new Trend("response_time");
const errorRate = new Rate("errors");
const requestCount = new Counter("request_count");

// Load test configuration
export let options = {
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be under 500ms
    errors: ["rate<0.1"], // Error rate should be less than 10%
  },
  stages: [
    { duration: "10s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "10s", target: 10 },
  ],
};

// Query and dynamic path parameter values
const searchTerms = ["Jakarta", "Bandung", "Surabaya", ""];
const provinceId = "3200000000";
const cityId = "3276000000";
const districtId = "3276040000";
const page = 1;
const limitOptions = [10, 20, 50];

// List of API endpoints to test
const endpoints = [
  {
    name: "Search Region",
    path: "/api/regions",
    params: {
      search: searchTerms[Math.floor(Math.random() * searchTerms.length)],
      page,
      limit: limitOptions[Math.floor(Math.random() * limitOptions.length)],
    },
  },
  {
    name: "Provinces List",
    path: "/api/regions/provinces",
  },
  {
    name: "Cities List",
    path: `/api/regions/provinces/${provinceId}/cities`,
  },
  {
    name: "Districts List",
    path: `/api/regions/provinces/${provinceId}/cities/${cityId}/districts`,
  },
  {
    name: "Villages List",
    path: `/api/regions/provinces/${provinceId}/cities/${cityId}/districts/${districtId}/villages`,
  },
];

// Base URL
const BASE_URL = "http://localhost:3000";

// Function to build query string from params
function buildQueryString(params) {
  if (!params) return "";
  return (
    "?" +
    Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&")
  );
}

// Function to test each endpoint
export default function () {
  for (const endpoint of endpoints) {
    const queryString = buildQueryString(endpoint.params);
    const url = `${BASE_URL}${endpoint.path}${queryString}`;

    const res = http.get(url, {
      headers: { "Content-Type": "application/json" },
    });

    // Add performance metrics
    responseTimeTrend.add(res.timings.duration);
    requestCount.add(1);
    errorRate.add(res.status !== 200);

    let jsonRes;
    try {
      jsonRes = res.json();
    } catch (error) {
      console.error(`❌ Failed to parse JSON for ${endpoint.name}:`, error);
      return;
    }

    let errorChecks = {};
    if (res.status !== 200) {
      errorChecks = {
        [`❌ ${endpoint.name} - Server Error (500)`]: (r) => r.status === 500,
        [`🚫 ${endpoint.name} - Not Found (404)`]: (r) => r.status === 404,
        [`⛔ ${endpoint.name} - Bad Request (400)`]: (r) => r.status === 400,
        [`⚠️ ${endpoint.name} - Unauthorized (401)`]: (r) => r.status === 401,
        [`🚨 ${endpoint.name} - Forbidden (403)`]: (r) => r.status === 403,
      };
    }

    let hasData = Array.isArray(jsonRes?.data) && jsonRes?.data.length > 0;

    // Perform checks
    check(res, {
      [`✅ ${endpoint.name} - Status is 200`]: (r) => r.status === 200,
      [`⚡ ${endpoint.name} - Response time < 500 ms`]: (r) =>
        r.timings.duration < 500,
      [`📊 ${endpoint.name} - Response has data`]: () => hasData,
      ...errorChecks,
    });

    sleep(1); // Simulate real user behavior with a short delay
  }
}
