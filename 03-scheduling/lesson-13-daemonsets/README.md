# Lesson 13 — DaemonSets

## Theory

A **DaemonSet** ensures that exactly **one Pod runs on every Node** (or a filtered subset of Nodes). When a new Node is added to the cluster, the DaemonSet controller automatically creates a Pod on it. When a Node is removed, the Pod is garbage collected.

### Use Cases

- **Log collectors** (Fluentd, Filebeat) — need to collect logs from every Node's filesystem
- **Monitoring agents** (Datadog, Prometheus Node Exporter) — need per-Node metrics
- **Network plugins** (kube-proxy, Calico, Weave) — must run on every Node
- **Storage daemons** (Ceph, GlusterFS node components)

### DaemonSet vs Deployment

|          | DaemonSet                                | Deployment     |
| -------- | ---------------------------------------- | -------------- |
| Replicas | Exactly 1 per Node (no `replicas` field) | N total Pods   |
| Scaling  | Automatic with Node count                | Manual or HPA  |
| Use case | Node-level agents                        | Stateless apps |

### How DaemonSet Scheduling Works

DaemonSet Pods bypass the normal scheduler — the DaemonSet controller places them directly by setting `spec.nodeName`. This means they can be placed on Nodes with `NoSchedule` taints that would otherwise block regular Pods.

You can restrict which Nodes get the DaemonSet Pod using:

- `nodeSelector`
- `nodeAffinity`
- Tolerations (to include tainted Nodes)

---

## YAML

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
    name: log-collector
spec:
    selector:
        matchLabels:
            app: log-collector
    template:
        metadata:
            labels:
                app: log-collector
        spec:
            tolerations:
                - key: node-role.kubernetes.io/control-plane
                  operator: Exists
                  effect: NoSchedule
            containers:
                - name: fluentd
                  image: fluent/fluentd:v1.16
                  volumeMounts:
                      - name: varlog
                        mountPath: /var/log
            volumes:
                - name: varlog
                  hostPath:
                      path: /var/log
```

Note: No `replicas` field — replica count equals Node count.

---

## Lab

### 1. Create a DaemonSet

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-monitor
  namespace: kube-system
spec:
  selector:
    matchLabels:
      app: node-monitor
  template:
    metadata:
      labels:
        app: node-monitor
    spec:
      containers:
        - name: monitor
          image: busybox:1.36
          command: ["/bin/sh", "-c", "while true; do echo 'monitoring'; sleep 60; done"]
EOF

kubectl get daemonset -n kube-system node-monitor
kubectl get pods -n kube-system -l app=node-monitor -o wide
```

On a single-node Minikube cluster you'll see exactly 1 Pod.

### 2. Inspect the DaemonSet

```bash
kubectl describe daemonset node-monitor -n kube-system
```

Look for **Desired / Current / Ready** counts and the **Events** section.

### 3. See existing system DaemonSets

```bash
kubectl get daemonset -n kube-system
```

You'll see `kube-proxy` (and possibly your CNI plugin) — these are real DaemonSets that ship with Kubernetes.

### 4. Restrict DaemonSet to labeled Nodes

```bash
kubectl label node minikube monitoring=enabled

cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: selective-monitor
spec:
  selector:
    matchLabels:
      app: selective-monitor
  template:
    metadata:
      labels:
        app: selective-monitor
    spec:
      nodeSelector:
        monitoring: enabled     # only runs on Nodes with this label
      containers:
        - name: agent
          image: busybox:1.36
          command: ["/bin/sh", "-c", "sleep 3600"]
EOF

kubectl get pods -l app=selective-monitor -o wide
```

### 5. Rolling update of a DaemonSet

DaemonSets support rolling updates too:

```bash
kubectl set image daemonset/node-monitor monitor=busybox:1.37 -n kube-system
kubectl rollout status daemonset/node-monitor -n kube-system
kubectl rollout history daemonset/node-monitor -n kube-system
```

### Cleanup

```bash
kubectl delete daemonset node-monitor -n kube-system 2>/dev/null; true
kubectl delete daemonset selective-monitor 2>/dev/null; true
kubectl label node minikube monitoring- 2>/dev/null; true
```

---

## Next

Move on to Lesson 14 — Static Pods.
