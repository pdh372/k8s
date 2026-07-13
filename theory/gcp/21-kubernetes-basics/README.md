# Section 21 — Getting Started with Kubernetes

> This is a quick GCP-course-level primer. For the full, deep Kubernetes curriculum (48 lessons — Pods, Deployments, Services, RBAC, networking, storage, troubleshooting, and more), see [`theory/k8s/`](../../k8s/) in this repo.

## What is Kubernetes

**Kubernetes (K8s)** is an open-source **container orchestration** platform — it automates deploying, scaling, networking, and self-healing a fleet of containers across a cluster of machines. It's the direct answer to the "microservices at scale" problem raised in Section 12: you describe the desired state, Kubernetes continuously works to make reality match it.

## Understanding Kubernetes Architecture

```
Control Plane (the "brain")           Nodes (the "muscle")
├── kube-apiserver  ← all communication goes through here
├── etcd            ← cluster state, stored as key-value data
├── kube-scheduler  ← decides which Node a new Pod runs on
└── controller-manager ← reconciliation loops (e.g. "3 replicas wanted → 3 replicas running")
                                        ├── kubelet    ← per-Node agent, starts/stops containers
                                        ├── kube-proxy ← per-Node networking rules
                                        └── container runtime (containerd)
```

You never talk to Nodes directly — every action (`kubectl apply`, a Deployment update) goes through the **kube-apiserver**, gets persisted in **etcd**, and the various controllers reconcile the cluster toward that desired state.

## Kubernetes is Cloud and Platform Agnostic

Kubernetes itself doesn't know or care whether it's running on GCP, AWS, Azure, or your own laptop — the same YAML manifests work anywhere there's a conformant Kubernetes cluster. This portability is the main reason teams choose it over a cloud-proprietary orchestration product: no lock-in, consistent tooling across environments.

On GCP, **Google Kubernetes Engine (GKE)** is a *managed* Kubernetes cluster — Google runs and patches the control plane for you (Section 22), but the Kubernetes API and manifests you write are identical to any other Kubernetes cluster.

## Why Kubernetes Is Called Declarative

You don't tell Kubernetes *how* to do something step by step (imperative) — you describe the **desired end state** in YAML ("I want 3 replicas of this container running"), and Kubernetes' controllers continuously reconcile actual state toward that desired state, indefinitely, without further instructions from you.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3          # ← declared desired state
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: web
          image: nginx:1.25
```

If a Pod crashes, gets deleted, or a Node dies, the controller notices the actual count no longer matches `replicas: 3` and creates a replacement — no human, and no imperative script, involved.

## Summary

Kubernetes = a declarative, cloud-agnostic system for running containers reliably at scale, built around a control plane that continuously reconciles actual cluster state toward whatever you declared. The next section covers **GKE** — Google's managed way to run it.

## Next

Continue to **Section 22 — Getting Started with Google Kubernetes Engine**.
