# Lesson 1 — Cluster Architecture

## Theory

A Kubernetes cluster has two kinds of machines: the **Control Plane** (the brain, makes decisions) and **Worker Nodes** (where your application containers actually run). In Minikube, both roles live on a single node — but conceptually they're still separate.

### Control Plane Components

| Component | Role |
|---|---|
| **kube-apiserver** | The only front door. Every request — from `kubectl`, from other components, from anything — goes through here. It validates and processes REST operations, then reads/writes cluster state via etcd. Nothing talks to etcd directly except the API server. |
| **etcd** | A distributed, consistent key-value store. This is the cluster's single source of truth: every object (Pod, Deployment, Service, ConfigMap...) is stored here. If etcd is lost, the cluster loses all memory of its state. |
| **kube-scheduler** | Watches for newly created Pods that have no Node assigned yet, and decides which Node they should run on — based on resource requests, constraints, affinity rules, etc. It only *decides*; it doesn't start anything itself. |
| **kube-controller-manager** | Runs multiple controller loops (Node controller, ReplicaSet controller, Endpoint controller, Service Account controller...). Each one continuously watches the API server and works to reconcile actual state → desired state. This is the "self-healing" engine behind Kubernetes. |

### Worker Node Components

| Component | Role |
|---|---|
| **kubelet** | An agent running on every node. It receives Pod specs (via the API server) and makes sure the described containers are actually running — by talking directly to the container runtime. |
| **kube-proxy** | Maintains network rules on each node so traffic can reach the correct Pod, whether the request comes from inside or outside the cluster. |
| **Container runtime** | The software that actually runs containers (containerd, CRI-O, or Docker via a shim). Kubernetes talks to it through a standard interface called **CRI** (Container Runtime Interface) — this is why we could freely choose `--container-runtime=containerd` when starting Minikube instead of being locked to Docker. |

### Docker vs. Container (clearing up a common confusion)

Docker is **one product** that implements container technology (build, run, package). "Container" is the general concept. Kubernetes doesn't depend on Docker specifically — it depends on anything that implements CRI. That's why dockershim was deprecated in Kubernetes 1.24+, and containerd (which Docker itself is built on) became the standard direct runtime.

### Request Flow Example

```
kubectl create ...
      │
      ▼
kube-apiserver  ──writes──▶  etcd
      │
      ▼ (controller-manager notices desired vs actual mismatch)
kube-controller-manager ──requests a Node──▶ kube-scheduler
      │
      ▼ (scheduler assigns a Node)
kubelet (on that Node) ──tells──▶ container runtime (containerd)
      │
      ▼
Container actually starts running
```

## Lab — Observe the Architecture on Your Own Cluster

```bash
kubectl cluster-info
kubectl get nodes -o wide
```

In Minikube, the control-plane components actually run as Pods themselves (static Pods) in the `kube-system` namespace — you can see them directly:
```bash
kubectl get pods -n kube-system
```

Look for `etcd-minikube`, `kube-apiserver-minikube`, `kube-controller-manager-minikube`, `kube-scheduler-minikube` — match each one back to the theory table above.

Inspect a Node's full details (capacity, conditions, running Pods):
```bash
kubectl describe node minikube
```

See every resource type Kubernetes knows about:
```bash
kubectl api-resources
```

No cleanup needed — this lesson is read-only observation.

## Next

Once you can identify each control-plane component running as a Pod on your cluster, move on to Lesson 2 — Pods.
