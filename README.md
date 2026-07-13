# Kubernetes Learning Path (CKA-style curriculum)

Environment: Ubuntu 26 (WSL2), local Minikube cluster (`docker` driver, `containerd` runtime), 100% free.

Progress is tracked below. Check off an item only after you've done the lab and confirmed the result. Each lesson has its own folder with a `README.md` (theory + commands/YAML + cleanup).

## Progress Checklist

### 0. Setup

- [x] Install Docker, kubectl, Minikube; start the cluster — [`theory/k8s/00-setup/lesson-00-setup/`](./theory/k8s/00-setup/lesson-00-setup/README.md)

### 1. Introduction

- [x] Course introduction & architecture notes (no lab — overview only)

### 2. Core Concepts

- [ ] Cluster Architecture (Docker vs Container, etcd, kube-apiserver, kube-controller-manager, kube-scheduler, kubelet, kube-proxy) — [`theory/k8s/02-core-concepts/lesson-01-cluster-architecture/`](./theory/k8s/02-core-concepts/lesson-01-cluster-architecture/README.md)
- [ ] Pods (imperative commands & YAML) — [`theory/k8s/02-core-concepts/lesson-02-pods/`](./theory/k8s/02-core-concepts/lesson-02-pods/README.md)
- [ ] ReplicaSets (creation & behavior) — [`theory/k8s/02-core-concepts/lesson-03-replicasets/`](./theory/k8s/02-core-concepts/lesson-03-replicasets/README.md)
- [ ] Deployments (rolling updates, rollbacks) — [`theory/k8s/02-core-concepts/lesson-04-deployments/`](./theory/k8s/02-core-concepts/lesson-04-deployments/README.md)
- [ ] Services (ClusterIP, NodePort, LoadBalancer) — [`theory/k8s/02-core-concepts/lesson-05-services/`](./theory/k8s/02-core-concepts/lesson-05-services/README.md)
- [ ] Namespaces — [`theory/k8s/02-core-concepts/lesson-06-namespaces/`](./theory/k8s/02-core-concepts/lesson-06-namespaces/README.md)
- [ ] Imperative vs Declarative commands (`kubectl apply` vs `create`/`expose`) — [`theory/k8s/02-core-concepts/lesson-07-imperative-vs-declarative/`](./theory/k8s/02-core-concepts/lesson-07-imperative-vs-declarative/README.md)

### 3. Scheduling

- [ ] Manual scheduling — [`theory/k8s/03-scheduling/lesson-08-manual-scheduling/`](./theory/k8s/03-scheduling/lesson-08-manual-scheduling/README.md)
- [ ] Labels and selectors — [`theory/k8s/03-scheduling/lesson-09-labels-selectors/`](./theory/k8s/03-scheduling/lesson-09-labels-selectors/README.md)
- [ ] Taints and tolerations — [`theory/k8s/03-scheduling/lesson-10-taints-tolerations/`](./theory/k8s/03-scheduling/lesson-10-taints-tolerations/README.md)
- [ ] Node affinity — [`theory/k8s/03-scheduling/lesson-11-node-affinity/`](./theory/k8s/03-scheduling/lesson-11-node-affinity/README.md)
- [ ] Resource requests and limits — [`theory/k8s/03-scheduling/lesson-12-resource-limits/`](./theory/k8s/03-scheduling/lesson-12-resource-limits/README.md)
- [ ] DaemonSets — [`theory/k8s/03-scheduling/lesson-13-daemonsets/`](./theory/k8s/03-scheduling/lesson-13-daemonsets/README.md)
- [ ] Static Pods — [`theory/k8s/03-scheduling/lesson-14-static-pods/`](./theory/k8s/03-scheduling/lesson-14-static-pods/README.md)
- [ ] Multiple schedulers — [`theory/k8s/03-scheduling/lesson-15-multiple-schedulers/`](./theory/k8s/03-scheduling/lesson-15-multiple-schedulers/README.md)

### 4. Logging & Monitoring

- [ ] Monitor cluster components (Metrics Server) — [`theory/k8s/04-logging-monitoring/lesson-16-monitoring/`](./theory/k8s/04-logging-monitoring/lesson-16-monitoring/README.md)
- [ ] Managing application logs — [`theory/k8s/04-logging-monitoring/lesson-17-logs/`](./theory/k8s/04-logging-monitoring/lesson-17-logs/README.md)

### 5. Application Lifecycle Management

- [ ] Rolling updates and rollbacks — [`theory/k8s/05-app-lifecycle/lesson-18-rolling-updates-rollbacks/`](./theory/k8s/05-app-lifecycle/lesson-18-rolling-updates-rollbacks/README.md)
- [ ] Commands and arguments (Docker & Kubernetes) — [`theory/k8s/05-app-lifecycle/lesson-19-commands-arguments/`](./theory/k8s/05-app-lifecycle/lesson-19-commands-arguments/README.md)
- [ ] Environment variables — [`theory/k8s/05-app-lifecycle/lesson-20-env-vars/`](./theory/k8s/05-app-lifecycle/lesson-20-env-vars/README.md)
- [ ] ConfigMaps & Secrets (encrypting secret data at rest) — [`theory/k8s/05-app-lifecycle/lesson-21-configmaps-secrets/`](./theory/k8s/05-app-lifecycle/lesson-21-configmaps-secrets/README.md)
- [ ] Multi-container Pods (design patterns) — [`theory/k8s/05-app-lifecycle/lesson-22-multi-container-pods/`](./theory/k8s/05-app-lifecycle/lesson-22-multi-container-pods/README.md)
- [ ] Init containers — [`theory/k8s/05-app-lifecycle/lesson-23-init-containers/`](./theory/k8s/05-app-lifecycle/lesson-23-init-containers/README.md)

### 6. Cluster Maintenance

- [ ] OS upgrades on nodes (drain, cordon, uncordon) — [`theory/k8s/06-cluster-maintenance/lesson-24-os-upgrades/`](./theory/k8s/06-cluster-maintenance/lesson-24-os-upgrades/README.md)
- [ ] Kubernetes release updates & cluster upgrade process — [`theory/k8s/06-cluster-maintenance/lesson-25-cluster-upgrade/`](./theory/k8s/06-cluster-maintenance/lesson-25-cluster-upgrade/README.md)
- [ ] Backup and restore (etcd snapshot) — [`theory/k8s/06-cluster-maintenance/lesson-26-etcd-backup/`](./theory/k8s/06-cluster-maintenance/lesson-26-etcd-backup/README.md)

### 7. Security

- [ ] Kubernetes security primitives — [`theory/k8s/07-security/lesson-27-security-primitives/`](./theory/k8s/07-security/lesson-27-security-primitives/README.md)
- [ ] Authentication (users, service accounts) — [`theory/k8s/07-security/lesson-28-authentication/`](./theory/k8s/07-security/lesson-28-authentication/README.md)
- [ ] TLS certificates & CSR — [`theory/k8s/07-security/lesson-29-tls-certificates/`](./theory/k8s/07-security/lesson-29-tls-certificates/README.md)
- [ ] KubeConfig — [`theory/k8s/07-security/lesson-30-kubeconfig/`](./theory/k8s/07-security/lesson-30-kubeconfig/README.md)
- [ ] RBAC (Role, RoleBinding, ClusterRole) — [`theory/k8s/07-security/lesson-31-rbac/`](./theory/k8s/07-security/lesson-31-rbac/README.md)
- [ ] Image security & private registries — [`theory/k8s/07-security/lesson-32-image-security/`](./theory/k8s/07-security/lesson-32-image-security/README.md)
- [ ] Security contexts — [`theory/k8s/07-security/lesson-33-security-contexts/`](./theory/k8s/07-security/lesson-33-security-contexts/README.md)
- [ ] Network policies — [`theory/k8s/07-security/lesson-34-network-policies/`](./theory/k8s/07-security/lesson-34-network-policies/README.md)

### 8. Storage

- [ ] Storage in Docker vs Kubernetes — [`theory/k8s/08-storage/lesson-35-storage-intro/`](./theory/k8s/08-storage/lesson-35-storage-intro/README.md)
- [ ] Container Storage Interface (CSI) — [`theory/k8s/08-storage/lesson-36-csi/`](./theory/k8s/08-storage/lesson-36-csi/README.md)
- [ ] Volumes & Persistent Volumes (PV) — [`theory/k8s/08-storage/lesson-37-persistent-volumes/`](./theory/k8s/08-storage/lesson-37-persistent-volumes/README.md)
- [ ] Persistent Volume Claims (PVC) — [`theory/k8s/08-storage/lesson-38-pvc/`](./theory/k8s/08-storage/lesson-38-pvc/README.md)
- [ ] Storage Classes — [`theory/k8s/08-storage/lesson-39-storage-classes/`](./theory/k8s/08-storage/lesson-39-storage-classes/README.md)

### 9. Networking

- [ ] Prerequisites (routing, gateway, DNS) — [`theory/k8s/09-networking/lesson-40-networking-prereqs/`](./theory/k8s/09-networking/lesson-40-networking-prereqs/README.md)
- [ ] Docker networking vs cluster networking — [`theory/k8s/09-networking/lesson-41-docker-vs-k8s-networking/`](./theory/k8s/09-networking/lesson-41-docker-vs-k8s-networking/README.md)
- [ ] CNI (Weave, Calico) — [`theory/k8s/09-networking/lesson-42-cni/`](./theory/k8s/09-networking/lesson-42-cni/README.md)
- [ ] IPAM, Pod networking, Service networking (kube-proxy) — [`theory/k8s/09-networking/lesson-43-pod-service-networking/`](./theory/k8s/09-networking/lesson-43-pod-service-networking/README.md)
- [ ] CoreDNS in Kubernetes — [`theory/k8s/09-networking/lesson-44-coredns/`](./theory/k8s/09-networking/lesson-44-coredns/README.md)
- [ ] Ingress (controller & resources) — [`theory/k8s/09-networking/lesson-45-ingress/`](./theory/k8s/09-networking/lesson-45-ingress/README.md)

### 10. Design and Install a Kubernetes Cluster

- [ ] Designing HA clusters — [`theory/k8s/10-cluster-design/lesson-46-ha-clusters/`](./theory/k8s/10-cluster-design/lesson-46-ha-clusters/README.md)
- [ ] Kubernetes "The Hard Way" overview — [`theory/k8s/10-cluster-design/lesson-47-k8s-hard-way/`](./theory/k8s/10-cluster-design/lesson-47-k8s-hard-way/README.md)

## Folder Structure

```
k8s/                                    (repo root — course notes + web app)
├── README.md                           this file: progress tracker + web app notes
│
├── theory/                              lesson notes, nested by track
│   └── k8s/                            all 48 K8s lesson notes (a README.md per lesson)
│       ├── 00-setup/                   lesson 00
│       ├── 02-core-concepts/           lessons 01–07
│       ├── 03-scheduling/              lessons 08–15
│       ├── 04-logging-monitoring/      lessons 16–17
│       ├── 05-app-lifecycle/           lessons 18–23
│       ├── 06-cluster-maintenance/     lessons 24–26
│       ├── 07-security/                lessons 27–34
│       ├── 08-storage/                 lessons 35–39
│       ├── 09-networking/              lessons 40–45
│       └── 10-cluster-design/          lessons 46–47
│       (gcp/ planned — same shape, once that track's notes are written)
│
├── src/                                web app source (React + TypeScript)
│   ├── data/                           questions, labs, diagrams, lessons.json (generated)
│   ├── components/  pages/  lib/
│   ├── App.tsx  main.tsx  index.css
├── scripts/generate-content.mjs        builds src/data/lessons.json from theory/k8s/
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

The static build uses BrowserRouter (clean URLs, no `#`). Deploy to Vercel,
Netlify, or Cloudflare Pages — each needs the app to serve `index.html` for
unknown paths (e.g. a deep link to `/k8s/quiz`), which `vercel.json` and
`public/_redirects` already handle. GitHub Pages and plain file servers don't
do this rewrite by default and aren't set up here.

### Where content lives

- **Lessons** — generated from `theory/k8s/**/README.md` into `src/data/lessons.json`
  (runs automatically before `dev`/`build`, or manually via `pnpm gen`).
- **Flashcards & quiz** — `src/data/questions.ts`.
- **Labs** — `src/data/labs.ts` (runnable Minikube scenarios).
- **Diagrams** — `src/data/{architecture,networking,traffic,storage,rbac,tls,cicd,observability}.ts`, registered in `src/data/diagrams.ts`.
