# Section 23 — Digging Deeper Into Kubernetes

> Kubernetes/GKE is the single most heavily tested service on the Associate Cloud Engineer exam — worth extra study time relative to its section count.

## Deployment vs ReplicaSet

| Resource         | What it does                                                              | Do you use it directly?              |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------- |
| **ReplicaSet**     | Ensures N identical Pod replicas are running at all times.                        | Rarely — it's a low-level building block |
| **Deployment**      | Manages ReplicaSets *for* you — adds rolling updates, rollback history, and declarative version changes on top. | **Yes** — almost always the right abstraction |

```bash
kubectl create deployment hello-web --image=nginx:1.25
kubectl get replicasets              # a ReplicaSet was created automatically, owned by the Deployment
kubectl get deployment hello-web -o yaml | grep -A2 strategy
```

Updating a Deployment's image creates a **new ReplicaSet** and scales it up while scaling the old one down — that's what a rolling update physically is under the hood.

## Exploring a Kubernetes Pod

```bash
kubectl get pods
kubectl describe pod <pod-name>       # full detail + Events (scheduling, pulling, errors)
kubectl exec -it <pod-name> -- /bin/sh
kubectl logs <pod-name>
kubectl logs <pod-name> --previous    # logs from the PREVIOUS instance, after a crash/restart
```

## Kubernetes Logical View — Key Components

```
Deployment
  └── ReplicaSet
        └── Pod(s) ── one or more containers, sharing an IP
Service ── stable endpoint routing to a set of Pods (by label selector)
```

## Key Components in the Kubernetes Cluster

Same control plane / node split from Section 21, revisited:

| Component              | Runs where       | Job                                                              |
| --------------------------- | ------------------ | ------------------------------------------------------------------ |
| `kube-apiserver`           | Control plane      | Front door for every API request — the only thing anything talks to |
| `etcd`                      | Control plane      | Stores all cluster state as key-value data                          |
| `kube-scheduler`            | Control plane      | Assigns new Pods to a Node based on resource availability/constraints |
| `controller-manager`        | Control plane      | Runs the reconciliation loops (Deployment, ReplicaSet, Node controllers, etc.) |
| `kubelet`                   | Every Node          | Talks to the API server, starts/stops containers on that Node        |
| `kube-proxy`                | Every Node          | Maintains network rules so Services can route to the right Pods       |

On GKE, you never see or manage the control plane row — Google runs it for you.

## Exploring the Controller Manager

The **controller-manager** runs many independent control loops in one process, each watching a specific resource type and reconciling actual state → desired state (e.g. the Deployment controller, ReplicaSet controller, Node controller). This is the literal implementation of "Kubernetes is declarative" from Section 21 — it's this component that never stops comparing what exists to what was declared.

## Understanding Kubernetes Node Pools

A **Node Pool** is a group of Nodes within a cluster that all share the same machine type/config. A single GKE Standard cluster can have multiple Node Pools — e.g. a pool of cheap Spot VMs for batch jobs and a pool of standard VMs for the main app, in the same cluster.

```bash
gcloud container node-pools create batch-pool \
  --cluster=my-cluster \
  --region=us-central1 \
  --spot \
  --machine-type=e2-medium
```

(Autopilot manages Node Pools invisibly — this is a Standard-mode concept.)

## GKE Cluster Types

| Dimension          | Options                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------ |
| **Mode**              | Standard (you manage Nodes) vs Autopilot (fully managed, Section 22)                  |
| **Availability**      | **Zonal** (single-zone control plane and nodes — cheaper, less resilient) vs **Regional** (control plane and nodes replicated across zones in a region — survives a zone outage, the production default) |
| **Access**            | **Public cluster** (nodes have external access) vs **Private cluster** (nodes have only internal IPs — more secure, common for production) |

## Creating a Deployment — Background Activity

When you run `kubectl create deployment` (or `apply` a Deployment YAML):

1. The request hits `kube-apiserver`, gets validated and written to `etcd`.
2. The Deployment controller notices the new object and creates a **ReplicaSet**.
3. The ReplicaSet controller notices it has 0 of N desired Pods and creates **Pod** objects.
4. `kube-scheduler` assigns each Pod to a Node.
5. `kubelet` on that Node pulls the container image and starts it.
6. Once running and passing any readiness probe, the Pod is marked `Ready` and (if a Service selects it) starts receiving traffic.

## Troubleshooting Kubernetes Deployment Errors

| Symptom                        | Likely cause                                       | Check                                                    |
| ---------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| `ImagePullBackOff`                | Wrong image name/tag, or private registry auth missing    | `kubectl describe pod <name>` → Events                          |
| `CrashLoopBackOff`                 | Container starts then exits (app crash, wrong command)     | `kubectl logs <name> --previous`                                 |
| Pod stuck `Pending`                | No Node has enough resources, or nothing satisfies a constraint | `kubectl describe pod <name>` → Events → `FailedScheduling`       |
| Deployment shows `0/3 available`   | Pods failing readiness probe, or crashing before ready       | `kubectl describe deployment <name>` + Pod-level checks above    |

### Troubleshooting scenarios

| Scenario                                                        | Likely fix                                       |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| New image tag doesn't exist in the registry                        | `ImagePullBackOff` — fix the tag                         |
| App requires an env var that isn't set, exits immediately          | `CrashLoopBackOff` — check `logs --previous`, fix config |
| Cluster is out of CPU/memory for the requested Pod resources        | `Pending` — resize the Node Pool or reduce requests       |

## GKE — A Few More Best Practices

- Use **Deployments**, not bare Pods, for anything long-running.
- Prefer **regional clusters** for production (survive a zone outage).
- Use **private clusters** unless Nodes genuinely need public IPs.
- Split workloads into **Node Pools** by resource profile (e.g. Spot VMs for batch, standard for latency-sensitive).
- Set **resource requests/limits** on every container — without them, scheduling and autoscaling can't make good decisions.

## GKE — A Few Advanced Features

- **Workload Identity** — lets a Kubernetes Pod authenticate as a GCP service account without managing key files (covered further in the IAM sections).
- **Binary Authorization** — enforce that only signed/verified container images can deploy to the cluster.
- **Cluster Autoscaler** — automatically adds/removes Nodes based on unschedulable Pods (Standard mode; see Section 25 for full scaling coverage).

## GKE — A Few More Scenarios

| Scenario                                                       | Answer                                    |
| -------------------------------------------------------------------- | ---------------------------------------------- |
| Need to run different machine types for different workloads in one cluster | Multiple Node Pools (Standard mode)              |
| Cluster must survive an entire zone going down                        | Regional cluster                                |
| Nodes should not be reachable from the public internet                | Private cluster                                 |
| Pod needs to call a GCP API (e.g. Cloud Storage) securely              | Workload Identity, not a static key file          |

## Next

Continue to **Section 24 — Digging Deeper Into Declarative Kubernetes**.
