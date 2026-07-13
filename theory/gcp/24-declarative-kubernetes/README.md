# Section 24 — Digging Deeper Into Declarative Kubernetes

## What are Labels

**Labels** are key-value pairs attached to any Kubernetes object (`app: web`, `env: prod`). They're how Kubernetes objects *select* each other — a Service finds its Pods, a Deployment finds its Pods, all via label selectors, not names. Labels are the glue that connects otherwise-independent objects declaratively.

## Understanding Kubernetes YAML — Basics

Every Kubernetes object YAML has 4 required top-level fields:

| Field         | Meaning                                                         |
| --------------- | -------------------------------------------------------------------- |
| `apiVersion`   | Which API group/version this object belongs to                       |
| `kind`         | The object type (`Pod`, `Deployment`, `Service`, ...)                 |
| `metadata`     | Identity — `name`, `namespace`, `labels`                              |
| `spec`         | The desired state you want Kubernetes to create/maintain               |

## Example Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web                # must match template's labels below
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:1.25
          ports:
            - containerPort: 80
```

`spec.selector` is how the Deployment finds *its own* Pods — it must match `spec.template.metadata.labels` exactly, or the Deployment can't manage anything.

## Deployment Strategy

| Strategy         | Behavior                                                                    |
| ------------------- | ---------------------------------------------------------------------------------- |
| **RollingUpdate**  | Default — gradually replaces old Pods with new ones, controlled by `maxSurge`/`maxUnavailable` (same concept as MIG rolling updates, Section 5). |
| **Recreate**       | Kills all old Pods first, then creates all new ones — causes downtime, but guarantees no two versions ever run simultaneously (needed when old/new versions can't coexist, e.g. incompatible DB schema). |

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

## Understanding Deployment Probes

| Probe                | Question it answers                                       | Effect when it fails                                        |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Liveness probe**      | "Is this container still working, or should it be restarted?"      | Kubernetes kills and restarts the container                            |
| **Readiness probe**     | "Is this container ready to receive traffic right now?"            | Pod is removed from the Service's endpoints (no traffic), but NOT restarted |
| **Startup probe**       | "Has this slow-starting container finished booting yet?"           | Blocks liveness/readiness checks until it passes — prevents killing a container that's just slow to start |

```yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

## More Deployment YAML Examples

```yaml
# Resource requests/limits — needed for scheduling and autoscaling decisions
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

```yaml
# Environment variables from a ConfigMap
envFrom:
  - configMapRef:
      name: app-config
```

## Graceful Shutdown

When a Pod is deleted, Kubernetes sends `SIGTERM`, then waits `terminationGracePeriodSeconds` (default 30s) before force-killing with `SIGKILL`. Your app should catch `SIGTERM` and finish in-flight requests before exiting — otherwise clients see abrupt connection drops during every rollout or scale-down.

```yaml
spec:
  terminationGracePeriodSeconds: 60
```

## How Is a Secret Different from a ConfigMap

| Aspect            | ConfigMap                          | Secret                                                    |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Purpose**         | Non-sensitive config (URLs, flags)      | Sensitive data (passwords, tokens, keys)                          |
| **Storage**          | Plain text in `etcd`                     | Base64-encoded in `etcd` (NOT encrypted by default — encryption at rest for Secrets should be enabled at the cluster level; base64 is encoding, not security) |
| **Usage**            | Env vars or mounted files                | Env vars or mounted files, same mechanics as ConfigMap             |

> **Exam trap:** base64 is *not* encryption — anyone with `etcd` or API read access can decode a Secret trivially unless encryption-at-rest is explicitly enabled on the cluster.

## Example Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web              # routes to any Pod with this label
  ports:
    - port: 80             # port the Service listens on
      targetPort: 8080      # port on the Pod to forward to
  type: LoadBalancer
```

| Service `type`     | Behavior                                                                |
| ---------------------- | ---------------------------------------------------------------------------- |
| `ClusterIP` (default)  | Internal-only, reachable from inside the cluster                             |
| `NodePort`              | Also exposes a port on every Node's IP                                        |
| `LoadBalancer`          | Provisions a cloud load balancer (on GKE, an actual GCP Load Balancer) with a public IP |

## What are Namespaces

**Namespaces** partition a single cluster into multiple virtual clusters — for separating teams, environments (`dev`/`staging`), or applications. Names only need to be unique *within* a namespace, not across the whole cluster.

```bash
kubectl create namespace staging
kubectl get pods -n staging
kubectl config set-context --current --namespace=staging   # switch default namespace
```

## Why Use StatefulSet Instead of Deployment (e.g. for Kafka)

A **Deployment**'s Pods are interchangeable — any Pod can be replaced by any other, with a random name and no guaranteed identity. Some workloads (Kafka, databases, anything sharded) need:

- **Stable, predictable Pod names** (`kafka-0`, `kafka-1`, `kafka-2` — not random suffixes)
- **Stable storage** — the same Persistent Volume reattaches to the same Pod identity after a restart
- **Ordered, sequential startup/scaling** (`kafka-0` must be ready before `kafka-1` starts)

A **StatefulSet** provides exactly this. Use Deployment for stateless apps (the default choice); reach for StatefulSet only when identity/ordering/stable-storage genuinely matters.

## Why Use DaemonSet

A **DaemonSet** ensures exactly one copy of a Pod runs on *every* (or every matching) Node — used for node-level agents: log collectors, monitoring agents, network plugins. Unlike a Deployment, you don't set a replica count — the count is implicitly "one per Node," growing/shrinking automatically as Nodes are added/removed.

## What is a Pod Disruption Budget (PDB)

A **PodDisruptionBudget** limits how many Pods of an app can be voluntarily taken down at once (during a Node drain for maintenance, a cluster upgrade, or a Node pool resize) — protecting availability during planned disruptions. It does **not** protect against involuntary disruption (a Node crashing unexpectedly).

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2       # or use maxUnavailable: 1
  selector:
    matchLabels:
      app: web
```

## Exploring the Power of Kubernetes Labels

Because Services, Deployments, and PDBs all select Pods by label rather than by name, you can dynamically retarget almost anything just by changing labels:

```bash
kubectl label pod web-abc123 tier=canary
kubectl get pods -l app=web,tier=canary
kubectl get pods -l 'env in (prod,staging)'
```

## Scenarios

| Scenario                                                                     | Answer                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| App can't have two versions running simultaneously (breaking DB schema change)         | `Recreate` deployment strategy                                |
| Slow-starting legacy app keeps getting killed before it finishes booting               | Add a `startupProbe`                                          |
| Need to store a database password for a Pod to use                                     | Secret (not ConfigMap)                                        |
| Need one logging agent Pod on every single Node                                        | DaemonSet                                                     |
| Running Kafka, need stable per-broker identity and storage                             | StatefulSet                                                    |
| Must guarantee at least 2 Pods stay up during a planned Node drain                      | PodDisruptionBudget with `minAvailable: 2`                     |
| Multiple teams sharing one cluster, need name isolation                                | Namespaces                                                     |

## Next

Continue to **Section 25 — Scaling Options in Kubernetes**.
