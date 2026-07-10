# Kubernetes Learning Path (CKA-style curriculum)

Environment: Ubuntu 26 (WSL2), local Minikube cluster (`docker` driver, `containerd` runtime), 100% free.

Progress is tracked below. Check off an item only after you've done the lab and confirmed the result. Each lesson has its own folder with a `README.md` (theory + commands/YAML + cleanup).

## Progress Checklist

### 0. Setup

- [x] Install Docker, kubectl, Minikube; start the cluster — [`theory/00-setup/lesson-00-setup/`](./theory/00-setup/lesson-00-setup/README.md)

### 1. Introduction

- [x] Course introduction & architecture notes (no lab — overview only)

### 2. Core Concepts

- [ ] Cluster Architecture (Docker vs Container, etcd, kube-apiserver, kube-controller-manager, kube-scheduler, kubelet, kube-proxy) — [`theory/02-core-concepts/lesson-01-cluster-architecture/`](./theory/02-core-concepts/lesson-01-cluster-architecture/README.md)
- [ ] Pods (imperative commands & YAML) — [`theory/02-core-concepts/lesson-02-pods/`](./theory/02-core-concepts/lesson-02-pods/README.md)
- [ ] ReplicaSets (creation & behavior) — [`theory/02-core-concepts/lesson-03-replicasets/`](./theory/02-core-concepts/lesson-03-replicasets/README.md)
- [ ] Deployments (rolling updates, rollbacks) — [`theory/02-core-concepts/lesson-04-deployments/`](./theory/02-core-concepts/lesson-04-deployments/README.md)
- [ ] Services (ClusterIP, NodePort, LoadBalancer) — [`theory/02-core-concepts/lesson-05-services/`](./theory/02-core-concepts/lesson-05-services/README.md)
- [ ] Namespaces — [`theory/02-core-concepts/lesson-06-namespaces/`](./theory/02-core-concepts/lesson-06-namespaces/README.md)
- [ ] Imperative vs Declarative commands (`kubectl apply` vs `create`/`expose`) — [`theory/02-core-concepts/lesson-07-imperative-vs-declarative/`](./theory/02-core-concepts/lesson-07-imperative-vs-declarative/README.md)

### 3. Scheduling

- [ ] Manual scheduling — [`theory/03-scheduling/lesson-08-manual-scheduling/`](./theory/03-scheduling/lesson-08-manual-scheduling/README.md)
- [ ] Labels and selectors — [`theory/03-scheduling/lesson-09-labels-selectors/`](./theory/03-scheduling/lesson-09-labels-selectors/README.md)
- [ ] Taints and tolerations — [`theory/03-scheduling/lesson-10-taints-tolerations/`](./theory/03-scheduling/lesson-10-taints-tolerations/README.md)
- [ ] Node affinity — [`theory/03-scheduling/lesson-11-node-affinity/`](./theory/03-scheduling/lesson-11-node-affinity/README.md)
- [ ] Resource requests and limits — [`theory/03-scheduling/lesson-12-resource-limits/`](./theory/03-scheduling/lesson-12-resource-limits/README.md)
- [ ] DaemonSets — [`theory/03-scheduling/lesson-13-daemonsets/`](./theory/03-scheduling/lesson-13-daemonsets/README.md)
- [ ] Static Pods — [`theory/03-scheduling/lesson-14-static-pods/`](./theory/03-scheduling/lesson-14-static-pods/README.md)
- [ ] Multiple schedulers — [`theory/03-scheduling/lesson-15-multiple-schedulers/`](./theory/03-scheduling/lesson-15-multiple-schedulers/README.md)

### 4. Logging & Monitoring

- [ ] Monitor cluster components (Metrics Server) — [`theory/04-logging-monitoring/lesson-16-monitoring/`](./theory/04-logging-monitoring/lesson-16-monitoring/README.md)
- [ ] Managing application logs — [`theory/04-logging-monitoring/lesson-17-logs/`](./theory/04-logging-monitoring/lesson-17-logs/README.md)

### 5. Application Lifecycle Management

- [ ] Rolling updates and rollbacks — [`theory/05-app-lifecycle/lesson-18-rolling-updates-rollbacks/`](./theory/05-app-lifecycle/lesson-18-rolling-updates-rollbacks/README.md)
- [ ] Commands and arguments (Docker & Kubernetes) — [`theory/05-app-lifecycle/lesson-19-commands-arguments/`](./theory/05-app-lifecycle/lesson-19-commands-arguments/README.md)
- [ ] Environment variables — [`theory/05-app-lifecycle/lesson-20-env-vars/`](./theory/05-app-lifecycle/lesson-20-env-vars/README.md)
- [ ] ConfigMaps & Secrets (encrypting secret data at rest) — [`theory/05-app-lifecycle/lesson-21-configmaps-secrets/`](./theory/05-app-lifecycle/lesson-21-configmaps-secrets/README.md)
- [ ] Multi-container Pods (design patterns) — [`theory/05-app-lifecycle/lesson-22-multi-container-pods/`](./theory/05-app-lifecycle/lesson-22-multi-container-pods/README.md)
- [ ] Init containers — [`theory/05-app-lifecycle/lesson-23-init-containers/`](./theory/05-app-lifecycle/lesson-23-init-containers/README.md)

### 6. Cluster Maintenance

- [ ] OS upgrades on nodes (drain, cordon, uncordon) — [`theory/06-cluster-maintenance/lesson-24-os-upgrades/`](./theory/06-cluster-maintenance/lesson-24-os-upgrades/README.md)
- [ ] Kubernetes release updates & cluster upgrade process — [`theory/06-cluster-maintenance/lesson-25-cluster-upgrade/`](./theory/06-cluster-maintenance/lesson-25-cluster-upgrade/README.md)
- [ ] Backup and restore (etcd snapshot) — [`theory/06-cluster-maintenance/lesson-26-etcd-backup/`](./theory/06-cluster-maintenance/lesson-26-etcd-backup/README.md)

### 7. Security

- [ ] Kubernetes security primitives — [`theory/07-security/lesson-27-security-primitives/`](./theory/07-security/lesson-27-security-primitives/README.md)
- [ ] Authentication (users, service accounts) — [`theory/07-security/lesson-28-authentication/`](./theory/07-security/lesson-28-authentication/README.md)
- [ ] TLS certificates & CSR — [`theory/07-security/lesson-29-tls-certificates/`](./theory/07-security/lesson-29-tls-certificates/README.md)
- [ ] KubeConfig — [`theory/07-security/lesson-30-kubeconfig/`](./theory/07-security/lesson-30-kubeconfig/README.md)
- [ ] RBAC (Role, RoleBinding, ClusterRole) — [`theory/07-security/lesson-31-rbac/`](./theory/07-security/lesson-31-rbac/README.md)
- [ ] Image security & private registries — [`theory/07-security/lesson-32-image-security/`](./theory/07-security/lesson-32-image-security/README.md)
- [ ] Security contexts — [`theory/07-security/lesson-33-security-contexts/`](./theory/07-security/lesson-33-security-contexts/README.md)
- [ ] Network policies — [`theory/07-security/lesson-34-network-policies/`](./theory/07-security/lesson-34-network-policies/README.md)

### 8. Storage

- [ ] Storage in Docker vs Kubernetes — [`theory/08-storage/lesson-35-storage-intro/`](./theory/08-storage/lesson-35-storage-intro/README.md)
- [ ] Container Storage Interface (CSI) — [`theory/08-storage/lesson-36-csi/`](./theory/08-storage/lesson-36-csi/README.md)
- [ ] Volumes & Persistent Volumes (PV) — [`theory/08-storage/lesson-37-persistent-volumes/`](./theory/08-storage/lesson-37-persistent-volumes/README.md)
- [ ] Persistent Volume Claims (PVC) — [`theory/08-storage/lesson-38-pvc/`](./theory/08-storage/lesson-38-pvc/README.md)
- [ ] Storage Classes — [`theory/08-storage/lesson-39-storage-classes/`](./theory/08-storage/lesson-39-storage-classes/README.md)

### 9. Networking

- [ ] Prerequisites (routing, gateway, DNS) — [`theory/09-networking/lesson-40-networking-prereqs/`](./theory/09-networking/lesson-40-networking-prereqs/README.md)
- [ ] Docker networking vs cluster networking — [`theory/09-networking/lesson-41-docker-vs-k8s-networking/`](./theory/09-networking/lesson-41-docker-vs-k8s-networking/README.md)
- [ ] CNI (Weave, Calico) — [`theory/09-networking/lesson-42-cni/`](./theory/09-networking/lesson-42-cni/README.md)
- [ ] IPAM, Pod networking, Service networking (kube-proxy) — [`theory/09-networking/lesson-43-pod-service-networking/`](./theory/09-networking/lesson-43-pod-service-networking/README.md)
- [ ] CoreDNS in Kubernetes — [`theory/09-networking/lesson-44-coredns/`](./theory/09-networking/lesson-44-coredns/README.md)
- [ ] Ingress (controller & resources) — [`theory/09-networking/lesson-45-ingress/`](./theory/09-networking/lesson-45-ingress/README.md)

### 10. Design and Install a Kubernetes Cluster

- [ ] Designing HA clusters — [`theory/10-cluster-design/lesson-46-ha-clusters/`](./theory/10-cluster-design/lesson-46-ha-clusters/README.md)
- [ ] Kubernetes "The Hard Way" overview — [`theory/10-cluster-design/lesson-47-k8s-hard-way/`](./theory/10-cluster-design/lesson-47-k8s-hard-way/README.md)

## Folder Structure

```
k8s/                                    (repo root — course notes + web app)
├── README.md                           this file: progress tracker + web app notes
│
├── theory/                             all 48 lesson notes (a README.md per lesson)
│   ├── 00-setup/                       lesson 00
│   ├── 02-core-concepts/               lessons 01–07
│   ├── 03-scheduling/                  lessons 08–15
│   ├── 04-logging-monitoring/          lessons 16–17
│   ├── 05-app-lifecycle/               lessons 18–23
│   ├── 06-cluster-maintenance/         lessons 24–26
│   ├── 07-security/                    lessons 27–34
│   ├── 08-storage/                     lessons 35–39
│   ├── 09-networking/                  lessons 40–45
│   └── 10-cluster-design/              lessons 46–47
│
├── src/                                web app source (React + TypeScript)
│   ├── data/                           questions, labs, diagrams, lessons.json (generated)
│   ├── components/  pages/  lib/
│   ├── App.tsx  main.tsx  index.css
├── scripts/generate-content.mjs        builds src/data/lessons.json from theory/
├── public/                             favicon
├── index.html
├── package.json                        pnpm scripts: dev · build · gen
├── vite.config.ts  tsconfig*.json  tailwind.config.js  postcss.config.js
└── pnpm-lock.yaml  pnpm-workspace.yaml
```

## Interactive web app

A visual study hub built from these lesson notes — an interactive cluster
diagram, hands-on labs, flashcards and quizzes. The app source lives at the
repo root (Vite + React + TypeScript + Tailwind, package manager: pnpm).

### Run

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

### Build

```bash
pnpm build    # static output in dist/
pnpm preview  # serve the built site locally
```

The static build (hash router, relative asset paths) can be hosted on GitHub
Pages, Vercel, Netlify, or any static file server.

### Where content lives

- **Lessons** — generated from `theory/**/README.md` into `src/data/lessons.json`
  (runs automatically before `dev`/`build`, or manually via `pnpm gen`).
- **Flashcards & quiz** — `src/data/questions.ts`.
- **Labs** — `src/data/labs.ts` (runnable Minikube scenarios).
- **Diagrams** — `src/data/{architecture,networking,traffic,storage,rbac,tls,cicd,observability}.ts`, registered in `src/data/diagrams.ts`.
