window.TOPICS_DATA = window.TOPICS_DATA || [];

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S6", name: "Cluster Maintenance",
  desc: "OS Upgrades (kubectl drain/cordon/uncordon), Cluster Upgrade với kubeadm (upgrade plan → upgrade apply → upgrade node), ETCD Backup & Restore (etcdctl snapshot save/restore, ETCDCTL_API=3, các flags: --endpoints --cacert --cert --key --data-dir).",
  hints: ["etcdctl flags hay thiếu","kubeadm upgrade sequence","drain vs cordon"],
});
