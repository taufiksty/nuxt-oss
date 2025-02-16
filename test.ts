import http from "k6/http";
import { sleep, check } from "k6";

export default function () {
  const res = http.get("http://localhost:3000/api/regions?search=jakarta");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "is response time <= 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);
}
