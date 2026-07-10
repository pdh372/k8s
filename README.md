# Kubernetes Learning Path (CKA-style curriculum)

Environment: Ubuntu 26 (WSL2), local Minikube cluster (`docker` driver, `containerd` runtime), 100% free.

Progress is tracked below. Check off an item only after you've done the lab and confirmed the result. Each lesson has its own folder with a `README.md` (theory + commands/YAML + cleanup).

## Progress Checklist

### 0. Setup

- [x] Install Docker, kubectl, Minikube; start the cluster — [`00-setup/lesson-00-setup/`](./00-setup/lesson-00-setup/README.md)

### 1. Introduction

- [x] Course introduction & architecture notes (no lab — overview only)

### 2. Core Concepts

- [ ] Cluster Architecture (Docker vs Container, etcd, kube-apiserver, kube-controller-manager, kube-scheduler, kubelet, kube-proxy) — [`02-core-concepts/lesson-01-cluster-architecture/`](./02-core-concepts/lesson-01-cluster-architecture/README.md)
- [ ] Pods (imperative commands & YAML) — [`02-core-concepts/lesson-02-pods/`](./02-core-concepts/lesson-02-pods/README.md)
- [ ] ReplicaSets (creation & behavior) — [`02-core-concepts/lesson-03-replicasets/`](./02-core-concepts/lesson-03-replicasets/README.md)
- [ ] Deployments (rolling updates, rollbacks) — [`02-core-concepts/lesson-04-deployments/`](./02-core-concepts/lesson-04-deployments/README.md)
- [ ] Services (ClusterIP, NodePort, LoadBalancer) — [`02-core-concepts/lesson-05-services/`](./02-core-concepts/lesson-05-services/README.md)
- [ ] Namespaces — [`02-core-concepts/lesson-06-namespaces/`](./02-core-concepts/lesson-06-namespaces/README.md)
- [ ] Imperative vs Declarative commands (`kubectl apply` vs `create`/`expose`) — [`02-core-concepts/lesson-07-imperative-vs-declarative/`](./02-core-concepts/lesson-07-imperative-vs-declarative/README.md)

### 3. Scheduling

- [ ] Manual scheduling — [`03-scheduling/lesson-08-manual-scheduling/`](./03-scheduling/lesson-08-manual-scheduling/README.md)
- [ ] Labels and selectors — [`03-scheduling/lesson-09-labels-selectors/`](./03-scheduling/lesson-09-labels-selectors/README.md)
- [ ] Taints and tolerations — [`03-scheduling/lesson-10-taints-tolerations/`](./03-scheduling/lesson-10-taints-tolerations/README.md)
- [ ] Node affinity — [`03-scheduling/lesson-11-node-affinity/`](./03-scheduling/lesson-11-node-affinity/README.md)
- [ ] Resource requests and limits — [`03-scheduling/lesson-12-resource-limits/`](./03-scheduling/lesson-12-resource-limits/README.md)
- [ ] DaemonSets — [`03-scheduling/lesson-13-daemonsets/`](./03-scheduling/lesson-13-daemonsets/README.md)
- [ ] Static Pods — [`03-scheduling/lesson-14-static-pods/`](./03-scheduling/lesson-14-static-pods/README.md)
- [ ] Multiple schedulers — [`03-scheduling/lesson-15-multiple-schedulers/`](./03-scheduling/lesson-15-multiple-schedulers/README.md)

### 4. Logging & Monitoring

- [ ] Monitor cluster components (Metrics Server) — [`04-logging-monitoring/lesson-16-monitoring/`](./04-logging-monitoring/lesson-16-monitoring/README.md)
- [ ] Managing application logs — [`04-logging-monitoring/lesson-17-logs/`](./04-logging-monitoring/lesson-17-logs/README.md)

### 5. Application Lifecycle Management

- [ ] Rolling updates and rollbacks — [`05-app-lifecycle/lesson-18-rolling-updates-rollbacks/`](./05-app-lifecycle/lesson-18-rolling-updates-rollbacks/README.md)
- [ ] Commands and arguments (Docker & Kubernetes) — [`05-app-lifecycle/lesson-19-commands-arguments/`](./05-app-lifecycle/lesson-19-commands-arguments/README.md)
- [ ] Environment variables — [`05-app-lifecycle/lesson-20-env-vars/`](./05-app-lifecycle/lesson-20-env-vars/README.md)
- [ ] ConfigMaps & Secrets (encrypting secret data at rest) — [`05-app-lifecycle/lesson-21-configmaps-secrets/`](./05-app-lifecycle/lesson-21-configmaps-secrets/README.md)
- [ ] Multi-container Pods (design patterns) — [`05-app-lifecycle/lesson-22-multi-container-pods/`](./05-app-lifecycle/lesson-22-multi-container-pods/README.md)
- [ ] Init containers — [`05-app-lifecycle/lesson-23-init-containers/`](./05-app-lifecycle/lesson-23-init-containers/README.md)

### 6. Cluster Maintenance

- [ ] OS upgrades on nodes (drain, cordon, uncordon) — [`06-cluster-maintenance/lesson-24-os-upgrades/`](./06-cluster-maintenance/lesson-24-os-upgrades/README.md)
- [ ] Kubernetes release updates & cluster upgrade process — [`06-cluster-maintenance/lesson-25-cluster-upgrade/`](./06-cluster-maintenance/lesson-25-cluster-upgrade/README.md)
- [ ] Backup and restore (etcd snapshot) — [`06-cluster-maintenance/lesson-26-etcd-backup/`](./06-cluster-maintenance/lesson-26-etcd-backup/README.md)

### 7. Security

- [ ] Kubernetes security primitives — [`07-security/lesson-27-security-primitives/`](./07-security/lesson-27-security-primitives/README.md)
- [ ] Authentication (users, service accounts) — [`07-security/lesson-28-authentication/`](./07-security/lesson-28-authentication/README.md)
- [ ] TLS certificates & CSR — [`07-security/lesson-29-tls-certificates/`](./07-security/lesson-29-tls-certificates/README.md)
- [ ] KubeConfig — [`07-security/lesson-30-kubeconfig/`](./07-security/lesson-30-kubeconfig/README.md)
- [ ] RBAC (Role, RoleBinding, ClusterRole) — [`07-security/lesson-31-rbac/`](./07-security/lesson-31-rbac/README.md)
- [ ] Image security & private registries — [`07-security/lesson-32-image-security/`](./07-security/lesson-32-image-security/README.md)
- [ ] Security contexts — [`07-security/lesson-33-security-contexts/`](./07-security/lesson-33-security-contexts/README.md)
- [ ] Network policies — [`07-security/lesson-34-network-policies/`](./07-security/lesson-34-network-policies/README.md)

### 8. Storage

- [ ] Storage in Docker vs Kubernetes — [`08-storage/lesson-35-storage-intro/`](./08-storage/lesson-35-storage-intro/README.md)
- [ ] Container Storage Interface (CSI) — [`08-storage/lesson-36-csi/`](./08-storage/lesson-36-csi/README.md)
- [ ] Volumes & Persistent Volumes (PV) — [`08-storage/lesson-37-persistent-volumes/`](./08-storage/lesson-37-persistent-volumes/README.md)
- [ ] Persistent Volume Claims (PVC) — [`08-storage/lesson-38-pvc/`](./08-storage/lesson-38-pvc/README.md)
- [ ] Storage Classes — [`08-storage/lesson-39-storage-classes/`](./08-storage/lesson-39-storage-classes/README.md)

### 9. Networking

- [ ] Prerequisites (routing, gateway, DNS) — [`09-networking/lesson-40-networking-prereqs/`](./09-networking/lesson-40-networking-prereqs/README.md)
- [ ] Docker networking vs cluster networking — [`09-networking/lesson-41-docker-vs-k8s-networking/`](./09-networking/lesson-41-docker-vs-k8s-networking/README.md)
- [ ] CNI (Weave, Calico) — [`09-networking/lesson-42-cni/`](./09-networking/lesson-42-cni/README.md)
- [ ] IPAM, Pod networking, Service networking (kube-proxy) — [`09-networking/lesson-43-pod-service-networking/`](./09-networking/lesson-43-pod-service-networking/README.md)
- [ ] CoreDNS in Kubernetes — [`09-networking/lesson-44-coredns/`](./09-networking/lesson-44-coredns/README.md)
- [ ] Ingress (controller & resources) — [`09-networking/lesson-45-ingress/`](./09-networking/lesson-45-ingress/README.md)

### 10. Design and Install a Kubernetes Cluster

- [ ] Designing HA clusters — [`10-cluster-design/lesson-46-ha-clusters/`](./10-cluster-design/lesson-46-ha-clusters/README.md)
- [ ] Kubernetes "The Hard Way" overview — [`10-cluster-design/lesson-47-k8s-hard-way/`](./10-cluster-design/lesson-47-k8s-hard-way/README.md)

## Folder Structure

```
k8s/
├── README.md                              (this file — progress tracker)
├── 00-setup/
│   └── lesson-00-setup/
├── 02-core-concepts/
│   ├── lesson-01-cluster-architecture/
│   ├── lesson-02-pods/
│   ├── lesson-03-replicasets/
│   ├── lesson-04-deployments/
│   ├── lesson-05-services/
│   ├── lesson-06-namespaces/
│   └── lesson-07-imperative-vs-declarative/
├── 03-scheduling/
│   ├── lesson-08-manual-scheduling/
│   ├── lesson-09-labels-selectors/
│   ├── lesson-10-taints-tolerations/
│   ├── lesson-11-node-affinity/
│   ├── lesson-12-resource-limits/
│   ├── lesson-13-daemonsets/
│   ├── lesson-14-static-pods/
│   └── lesson-15-multiple-schedulers/
├── 04-logging-monitoring/
│   ├── lesson-16-monitoring/
│   └── lesson-17-logs/
├── 05-app-lifecycle/
│   ├── lesson-18-rolling-updates-rollbacks/
│   ├── lesson-19-commands-arguments/
│   ├── lesson-20-env-vars/
│   ├── lesson-21-configmaps-secrets/
│   ├── lesson-22-multi-container-pods/
│   └── lesson-23-init-containers/
├── 06-cluster-maintenance/
│   ├── lesson-24-os-upgrades/
│   ├── lesson-25-cluster-upgrade/
│   └── lesson-26-etcd-backup/
├── 07-security/
│   ├── lesson-27-security-primitives/
│   ├── lesson-28-authentication/
│   ├── lesson-29-tls-certificates/
│   ├── lesson-30-kubeconfig/
│   ├── lesson-31-rbac/
│   ├── lesson-32-image-security/
│   ├── lesson-33-security-contexts/
│   └── lesson-34-network-policies/
├── 08-storage/
│   ├── lesson-35-storage-intro/
│   ├── lesson-36-csi/
│   ├── lesson-37-persistent-volumes/
│   ├── lesson-38-pvc/
│   └── lesson-39-storage-classes/
├── 09-networking/
│   ├── lesson-40-networking-prereqs/
│   ├── lesson-41-docker-vs-k8s-networking/
│   ├── lesson-42-cni/
│   ├── lesson-43-pod-service-networking/
│   ├── lesson-44-coredns/
│   └── lesson-45-ingress/
└── 10-cluster-design/
    ├── lesson-46-ha-clusters/
    └── lesson-47-k8s-hard-way/
```
