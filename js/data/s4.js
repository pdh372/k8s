window.TOPICS_DATA = window.TOPICS_DATA || [];

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S4", name: "Logging & Monitoring",
  desc: "kubectl top node/pod (metrics-server), kubectl logs -f, kubectl logs --previous, logs cho multi-container pod với -c flag.",
  hints: ["kubectl logs multi-container","metrics-server cài chưa"],
});
