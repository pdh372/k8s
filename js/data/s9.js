window.TOPICS_DATA = window.TOPICS_DATA || [];

TOPICS_DATA.push({
  phase: "s9", pLabel: "PHASE 3 · Học S9", pClass: "pb-s9",
  tag: "S9·PRE", name: "Network Prerequisites",
  desc: "Switching & Routing (ip link/addr/route, default gateway), DNS (/etc/hosts, /etc/resolv.conf, nameserver, search domain), CoreDNS (Corefile, plugins), Network Namespaces (ip netns, veth pair, bridge, iptables), Docker Networking (bridge/host/none, docker0), CNI spec (ADD/DEL, plugin binary location /opt/cni/bin/, config /etc/cni/net.d/).",
  hints: ["veth pair là gì","CNI plugin path hay quên","ip netns commands"],
});

TOPICS_DATA.push({
  phase: "s9", pLabel: "PHASE 3 · Học S9", pClass: "pb-s9",
  tag: "S9·CORE", name: "Cluster & Pod Networking",
  desc: "Cluster Networking (Node IP, Pod CIDR, Service CIDR, port requirements), Pod Networking model (mỗi pod có IP riêng, veth pair → bridge → node routing), CNI in Kubernetes (kubelet --network-plugin, CNI config path), CNI Weave (weave-net DaemonSet, ipam range), IPAM.",
  hints: ["Pod CIDR vs Service CIDR","CNI config file location","Weave DaemonSet"],
});

TOPICS_DATA.push({
  phase: "s9", pLabel: "PHASE 3 · Học S9", pClass: "pb-s9",
  tag: "S9·SVC", name: "Service Networking & DNS",
  desc: "Service Networking (kube-proxy modes: iptables/ipvs, clusterIP range, iptables rules), DNS format: <svc>.<ns>.svc.cluster.local và <ip-dashes>.<ns>.pod.cluster.local, CoreDNS in Kubernetes (ConfigMap coredns, forward plugin, kubectl -n kube-system).",
  hints: ["iptables vs ipvs mode","DNS format pod vs service","CoreDNS ConfigMap"],
});

TOPICS_DATA.push({
  phase: "s9", pLabel: "PHASE 3 · Học S9", pClass: "pb-s9",
  tag: "S9·ING", name: "Ingress & Gateway API 2025",
  desc: "Ingress (IngressClass, rules, paths, pathType: Prefix/Exact, TLS), Ingress Controller (NGINX ingress controller deployment), Annotations (nginx.ingress.kubernetes.io/rewrite-target), Gateway API 2025 (GatewayClass, Gateway, HTTPRoute — thay thế Ingress trong tương lai, có thể ra trong đề thi CKA mới).",
  hints: ["Ingress vs Service","rewrite-target annotation","Gateway API vs Ingress"],
});
