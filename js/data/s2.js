window.TOPICS_DATA = window.TOPICS_DATA || [];

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S2", name: "Core Concepts",
  desc: "Pods, ReplicaSets, Deployments, Namespaces, Services (ClusterIP/NodePort/LoadBalancer). Imperative vs Declarative. kubectl create/expose/run với --dry-run=client -o yaml.",
  hints: ["Nhầm RS vs Deployment","Syntax imperative create/expose","DNS cross-namespace"],
});
