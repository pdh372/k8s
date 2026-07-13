# Section 25 — Scaling Options in Kubernetes

## What are the Scaling Options in Kubernetes

Three independent, composable autoscalers, each solving a different dimension of "not enough/too much capacity":

| Autoscaler                     | Scales what                            | Based on                          |
| ------------------------------- | ------------------------------------------ | ------------------------------------ |
| **Horizontal Pod Autoscaler (HPA)** | Number of Pod replicas                     | CPU/memory usage, or a custom metric  |
| **Vertical Pod Autoscaler (VPA)**   | CPU/memory *requests* of each Pod           | Historical usage of that Pod           |
| **Cluster Autoscaler**              | Number of Nodes in the cluster              | Unschedulable Pods (not enough Node capacity) |

## Horizontal Pod Autoscaler (HPA)

Adds/removes **Pod replicas** to match load — the Kubernetes equivalent of Managed Instance Group autoscaling (Section 5), but at the Pod level instead of the VM level.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
```

```bash
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=60
kubectl get hpa
```

## Vertical Pod Autoscaler (VPA)

Adjusts a Pod's **CPU/memory requests** (the "size" of each Pod), rather than the count — for workloads where the right *shape* of a single instance isn't known upfront.

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  updatePolicy:
    updateMode: "Auto"    # Off (recommend-only), Initial, or Auto (applies changes, restarts Pods)
```

## How is HPA Different from VPA

| Aspect                | HPA                                        | VPA                                                    |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| **Adjusts**               | Number of Pods                                  | Size (CPU/memory) of each Pod                                |
| **Requires a restart?**   | No — new Pods just get added/removed             | Yes, in `Auto` mode — a Pod must be recreated with new resource requests |
| **Good fit**              | Stateless workloads that scale horizontally well  | Workloads that can't scale horizontally (or where right-sizing per-Pod resources matters more) |

> **Important:** HPA and VPA **cannot both control CPU/memory for the same Deployment simultaneously** — they'd fight each other. Use one or the other for the same metric.

## Cluster Autoscaler

Watches for **unschedulable Pods** (Pending because no Node has room) and adds a Node; removes Nodes that are underutilized and whose Pods can be safely rescheduled elsewhere. This is a **Node-level** scaler — it exists to make sure HPA/VPA-driven Pod scaling actually has somewhere to run.

- On GKE **Standard**, Cluster Autoscaler is an opt-in feature you enable per Node Pool.
- On GKE **Autopilot**, node-level scaling is fully automatic and invisible — you never configure this directly.

## How HPA, VPA and Cluster Autoscaler Compare

```
More traffic arrives
   → HPA adds more Pod replicas
       → if the cluster doesn't have enough Node capacity for those new Pods
           → Cluster Autoscaler adds more Nodes
   → VPA (independently) makes sure each Pod is requesting the right amount of CPU/memory
```

They operate at different layers and normally work together: HPA/VPA decide about Pods, Cluster Autoscaler makes sure Nodes exist to run them.

## Scenarios

| Scenario                                                                  | Answer                                       |
| -------------------------------------------------------------------------------- | --------------------------------------------------- |
| Web app traffic spikes during the day, needs more instances                       | HPA                                                   |
| A single Pod is a memory-bound batch job whose right size isn't known upfront      | VPA                                                   |
| HPA added Pods but they're stuck `Pending` — no Node has room                      | Cluster Autoscaler (or it's disabled — enable it)      |
| Deployment has both HPA and VPA targeting CPU at the same time                     | Misconfiguration — they'll conflict; use only one for the same metric |

## Next

Continue to **Section 26 — Exploring Observability for GKE**.
