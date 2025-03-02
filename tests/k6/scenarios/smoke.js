import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
  vus: 1,
  duration: "10s",
};

export default function () {
  const endpoints = [
    {
      url: "http://localhost:3000/api/regions?search=Jakarta",
      name: "Search Region",
    },
    {
      url: "http://localhost:3000/api/regions/provinces",
      name: "Provinces List",
    },
    {
      url: "http://localhost:3000/api/regions/provinces/3200000000/cities",
      name: "Cities List",
    },
    {
      url: "http://localhost:3000/api/regions/provinces/3200000000/cities/3276000000/districts",
      name: "Districts List",
    },
    {
      url: "http://localhost:3000/api/regions/provinces/3200000000/cities/3276000000/districts/3276040000/villages",
      name: "Villages List",
    },
  ];

  for (let endpoint of endpoints) {
    let res = http.get(endpoint.url, {
      headers: { "Content-Type": "application/json" },
    });

    let jsonRes;
    let hasData = false;

    try {
      jsonRes = res.json();
      hasData = Array.isArray(jsonRes?.data) && jsonRes.data.length > 0;
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Failed to parse JSON:`, error);
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

    check(res, {
      [`✅ ${endpoint.name} - Status is 200`]: (r) => r.status === 200,
      [`⚡ ${endpoint.name} - Response time < 500 ms`]: (r) =>
        r.timings.duration < 500,
      [`📊 ${endpoint.name} - Response has data`]: () => hasData,
      ...errorChecks,
    });

    sleep(1);
  }
}
