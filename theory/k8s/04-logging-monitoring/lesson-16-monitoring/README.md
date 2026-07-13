# Lesson 16 — Monitoring (Metrics Server)

## Theory

Kubernetes does not bundle a full monitoring stack. For basic resource metrics (`kubectl top`) it uses the **Metrics Server** — a lightweight, in-memory aggregator that scrapes CPU and memory stats from each Node's kubelet and exposes them via the Metrics API.

### Architecture

```
Kubelet (cAdvisor)  →  Metrics Server  →  Metrics API  →  kubectl top / HPA
```

- **cAdvisor** is embedded in the kubelet. It collects per-container CPU/memory stats.
- **Metrics Server** polls all Nodes' kubelets every 60 seconds and holds the latest values in memory only (no history).
- **kubectl top** queries the Metrics API.
- **HPA** (Horizontal Pod Autoscaler) also uses the Metrics API to make scaling decisions.

> For production monitoring with history, alerting, and dashboards you need **Prometheus + Grafana** (not covered in this lesson but referenced).

### Metrics Server vs Full Prometheus

|                  | Metrics Server              | Prometheus                          |
| ---------------- | --------------------------- | ----------------------------------- |
| Data retention   | In-memory only (no history) | Time-series database (configurable) |
| Setup complexity | One manifest                | Full stack (operator recommended)   |
| Used by HPA      | Yes                         | Yes (with adapter)                  |
| Dashboards       | None                        | Grafana                             |
| Custom metrics   | No                          | Yes                                 |

---

## Lab

### 1. Enable Metrics Server on Minikube

```bash
minikube addons enable metrics-server
kubectl get deployment metrics-server -n kube-system
kubectl get pods -n kube-system | grep metrics-server
```

Wait for it to be Ready (may take ~60 seconds to gather initial data):

```bash
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
```

### 2. View Node resource usage

```bash
kubectl top nodes
```

Output shows `CPU(cores)`, `CPU%`, `MEMORY(bytes)`, `MEMORY%` for each Node.

### 3. View Pod resource usage

```bash
kubectl top pods
kubectl top pods -n kube-system    # system Pods
kubectl top pods --all-namespaces  # all namespaces
```

### 4. Sort by resource usage

```bash
kubectl top pods --sort-by=cpu
kubectl top pods --sort-by=memory
```

### 5. View resource usage for a specific Pod

```bash
# Create a busy Pod to see non-trivial metrics
kubectl run stress-test --image=polinux/stress \
  --requests='cpu=100m,memory=128Mi' \
  -- stress --cpu 1 --timeout 300s

sleep 30    # wait for metrics to update

kubectl top pod stress-test
```

### 6. Metrics API directly

```bash
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes | python3 -m json.tool | head -30
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods | python3 -m json.tool | head -30
```

### 7. Horizontal Pod Autoscaler (preview)

HPA uses Metrics Server to scale Deployments based on CPU/memory:

```bash
kubectl create deployment php-apache --image=hpa-example --replicas=1
kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=5
kubectl get hpa
# TARGETS shows current CPU% / target CPU%
```

### 8. What if Metrics Server isn't installed?

```bash
kubectl top nodes
# Error from server (ServiceUnavailable): the server is currently unable to handle the request
```

This is the error you'll see on a cluster without metrics-server. On the CKA exam, metrics-server is pre-installed.

### Cleanup

```bash
kubectl delete pod stress-test 2>/dev/null; true
kubectl delete deployment php-apache 2>/dev/null; true
kubectl delete hpa php-apache 2>/dev/null; true
```

---

## Next

Move on to Lesson 17 — Managing Application Logs.
