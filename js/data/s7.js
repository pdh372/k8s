window.TOPICS_DATA = window.TOPICS_DATA || [];

// S7 split thành 3 sub-topics để ôn tập có trọng tâm hơn

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·TLS", name: "Security — TLS & Kubeconfig",
  desc: "TLS in Kubernetes: CA cert (ca.crt/ca.key tại /etc/kubernetes/pki/), server certs (apiserver.crt), client certs (admin.crt, scheduler.crt, controller-manager.crt, kubelet-client.crt). Certificate API: tạo CertificateSigningRequest object từ .csr base64-encode, kubectl certificate approve/deny, kubectl get csr, status Approved → cert được issued. Kubeconfig: cấu trúc clusters/users/contexts, kubectl config view --raw, use-context, current-context, set-credentials, set-cluster, --kubeconfig flag.",
  hints: ["Cert location /etc/kubernetes/pki","CSR base64 encode","kubectl certificate approve","Kubeconfig context switch"],
});

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·RBAC", name: "Security — RBAC & ServiceAccounts",
  desc: "API Groups: core group (/api/v1 — pods/nodes/services/secrets) vs named groups (/apis/apps/v1, /apis/rbac.authorization.k8s.io, /apis/batch/v1). RBAC: Role (namespace-scoped) vs ClusterRole (cluster-scoped), RoleBinding/ClusterRoleBinding, verbs: get/list/watch/create/update/patch/delete. kubectl create role/clusterrole --verb --resource, kubectl auth can-i --as, kubectl auth can-i --list. ServiceAccounts: tạo SA, gán vào pod qua serviceAccountName, automountServiceAccountToken: false, SA token mount tại /var/run/secrets/kubernetes.io/serviceaccount/, TokenRequest API.",
  hints: ["Role vs ClusterRole scope","RBAC verbs list","kubectl auth can-i --as","SA token mount path"],
});

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·EXT", name: "Security — Admission & CRD",
  desc: "Admission Controllers: thứ tự xử lý request (Authentication → Authorization → Admission Control), mutating vs validating webhook, built-in controllers (NamespaceLifecycle, LimitRanger, ServiceAccount, ResourceQuota). Custom Admission Controllers: MutatingWebhookConfiguration, ValidatingWebhookConfiguration, webhook server phải serve TLS, caBundle. API Versions: v1alpha1 → v1beta1 → v1, preferred version vs storage version, API deprecation policy, kubectl convert. Custom Resource Definitions (CRD): apiVersion: apiextensions.k8s.io/v1, spec.group, spec.versions, spec.scope (Namespaced/Cluster), Custom Resource (CR), controller pattern.",
  hints: ["Admission controller order","CRD vs built-in resource","Webhook caBundle","API version promotion path"],
});

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·IMG", name: "Security — Image Security & Secrets",
  desc: "Image Security: private registry (docker.io/gcr.io/private-repo), imagePullSecrets (tạo secret type docker-registry: kubectl create secret docker-registry regcred --docker-server --docker-username --docker-password --docker-email, gán vào pod qua spec.imagePullSecrets), image tag :latest vs digest. Secrets: tạo secret generic (--from-literal, --from-file), envFrom secretRef, env valueFrom secretKeyRef, volume mount secret, Secret không được mã hóa mặc định trong etcd. Encrypt Secret at Rest: EncryptionConfiguration resource (providers: aescbc/aesgcm/secretbox/identity), kube-apiserver --encryption-provider-config flag, sau khi enable cần chạy kubectl get secrets -A -o json | kubectl replace -f - để mã hóa lại toàn bộ.",
  hints: ["imagePullSecrets vs image flag","secret docker-registry type","EncryptionConfiguration providers thứ tự ưu tiên","encrypt existing secrets sau khi enable"],
});

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·CTX", name: "Security — Security Contexts",
  desc: "Security Contexts: đặt ở cấp pod (spec.securityContext) hoặc container (spec.containers[].securityContext) — container-level ghi đè pod-level. runAsUser (UID), runAsGroup (GID), fsGroup (GID cho mounted volumes), runAsNonRoot: true. capabilities: add (NET_ADMIN, SYS_TIME) / drop (ALL), chỉ áp dụng ở container-level. privileged: true (không dùng production). allowPrivilegeEscalation: false. readOnlyRootFilesystem: true. seccompProfile (RuntimeDefault/Localhost). Dùng kubectl exec để verify: id, whoami, cat /proc/1/status.",
  hints: ["pod-level vs container-level securityContext","capabilities chỉ ở container-level","fsGroup dùng khi nào","verify bằng kubectl exec id"],
});

TOPICS_DATA.push({
  phase: "review", pLabel: "PHASE 1 · Ôn S1–S7", pClass: "pb-review",
  tag: "S7·NETPOL", name: "Security — Network Policies",
  desc: "Network Policies: mặc định tất cả pod đều allow all ingress/egress (flat network). NetworkPolicy resource: spec.podSelector (chọn pod áp dụng), policyTypes: [Ingress/Egress]. ingress.from / egress.to: namespaceSelector (matchLabels), podSelector (matchLabels), ipBlock (cidr, except). Port: protocol TCP/UDP, port number. Kết hợp: cùng list item = AND (pod VÀ namespace), tách list item = OR. CNI phải hỗ trợ NetworkPolicy (Calico/Weave hỗ trợ, Flannel không). deny-all pattern: spec.podSelector: {} với policyTypes nhưng không có ingress/egress rules.",
  hints: ["AND vs OR trong from/to rules","deny-all pattern","CNI nào hỗ trợ NetworkPolicy","egress cần cho phép DNS port 53"],
});
