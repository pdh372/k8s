# Lesson 5 — Services

## Theory

Pods are ephemeral — they come and go, and their IP addresses change every time. A **Service** provides a stable virtual IP + DNS name that load-balances traffic across a dynamic set of Pods selected by label.

### Service Types

| Type                    | Reachable from                                      | When to use                         |
| ----------------------- | --------------------------------------------------- | ----------------------------------- |
| **ClusterIP** (default) | Inside the cluster only                             | Service-to-service communication    |
| **NodePort**            | Outside the cluster via `<NodeIP>:<NodePort>`       | Dev/testing, simple external access |
| **LoadBalancer**        | Outside via a cloud LB (GKE, EKS, AKS…)             | Production external access on cloud |
| **ExternalName**        | Inside cluster, but proxies to an external DNS name | Routing to external services        |

### Port Terminology

```
External client
      ↓
 NodePort (30080 on every Node)
      ↓
 Service port (80)      ← what other Pods use to reach this service
      ↓
 targetPort (8080)      ← the actual container port
```

| Field        | Meaning                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| `port`       | Port the Service listens on inside the cluster                                  |
| `targetPort` | Port on the Pod/container to forward traffic to (defaults to `port` if omitted) |
| `nodePort`   | NodePort only: port opened on every Node (auto-assigned 30000–32767 if omitted) |

### How DNS Works

CoreDNS gives every Service a fully-qualified DNS name:

```
<service-name>.<namespace>.svc.cluster.local
```

Within the same namespace you can use just `<service-name>`. Across namespaces you need at least `<service-name>.<namespace>`.

### How the Service Finds Pods — Endpoints

Kubernetes automatically maintains an **Endpoints** object for each Service, listing the IPs of all Pods matching the selector. The Service routes traffic to those IPs. If `Endpoints` is empty, the selector isn't matching anything.

---

## YAML

**ClusterIP:**

```yaml
apiVersion: v1
kind: Service
metadata:
    name: nginx-clusterip
spec:
    selector:
        app: nginx
    ports:
        - port: 80
          targetPort: 80
```

**NodePort:**

```yaml
apiVersion: v1
kind: Service
metadata:
    name: nginx-nodeport
spec:
    type: NodePort
    selector:
        app: nginx
    ports:
        - port: 80
          targetPort: 80
          nodePort: 30080
```

**LoadBalancer (cloud):**

```yaml
apiVersion: v1
kind: Service
metadata:
    name: nginx-lb
spec:
    type: LoadBalancer
    selector:
        app: nginx
    ports:
        - port: 80
          targetPort: 80
```

---

## Lab

### 1. Create a Deployment to test against

```bash
kubectl create deployment nginx-svc-demo --image=nginx:1.25 --replicas=3
```

### 2. Create a ClusterIP Service

```bash
kubectl expose deployment nginx-svc-demo --port=80 --target-port=80 --name=nginx-clusterip
kubectl get service nginx-clusterip
```

Test from inside the cluster (ClusterIP is not reachable from your host):

```bash
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -qO- nginx-clusterip
```

### 3. Create a NodePort Service

```bash
kubectl expose deployment nginx-svc-demo \
  --port=80 --target-port=80 \
  --type=NodePort --name=nginx-nodeport
kubectl get service nginx-nodeport    # note the auto-assigned NodePort (e.g. 31XXX)
```

Access from your host via Minikube:

```bash
minikube service nginx-nodeport --url
curl $(minikube service nginx-nodeport --url)
```

### 4. Inspect Endpoints

```bash
kubectl describe service nginx-clusterip    # look at Endpoints line
kubectl get endpoints nginx-clusterip       # list Pod IPs directly
```

Scale the Deployment and watch the Endpoints update:

```bash
kubectl scale deployment nginx-svc-demo --replicas=5
kubectl get endpoints nginx-clusterip    # 5 IPs now
```

### 5. Cross-namespace DNS

```bash
kubectl create namespace test-ns
kubectl run nginx-ns --image=nginx:1.25 -n test-ns
kubectl expose pod nginx-ns --port=80 --name=nginx-ns-svc -n test-ns

# From default namespace, reach the service using full DNS name
kubectl run dns-test --image=busybox --rm -it --restart=Never -- \
  wget -qO- nginx-ns-svc.test-ns.svc.cluster.local
```

### 6. Service without a Selector (headless)

If you set `clusterIP: None`, no virtual IP is assigned — DNS returns the individual Pod IPs directly. Used with StatefulSets.

```bash
kubectl get service nginx-clusterip -o yaml | grep clusterIP
```

### Cleanup

```bash
kubectl delete deployment nginx-svc-demo
kubectl delete service nginx-clusterip nginx-nodeport
kubectl delete namespace test-ns
```

---

## Next

Once you understand ClusterIP, NodePort, and how Endpoints work, move on to Lesson 6 — Namespaces.
