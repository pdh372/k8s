# Lesson 43 — Pod and Service Networking (kube-proxy)

## Theory

### Pod Networking (IPAM)

Each Pod gets a unique IP from the **cluster Pod CIDR**. The CNI plugin's IPAM component allocates IPs — typically using the `host-local` IPAM which gives each Node a sub-range of the cluster CIDR:

```
Cluster Pod CIDR: 10.244.0.0/16
  Node 1: 10.244.0.0/24  → Pods get IPs 10.244.0.1–254
  Node 2: 10.244.1.0/24  → Pods get IPs 10.244.1.1–254
  Node 3: 10.244.2.0/24  → Pods get IPs 10.244.2.1–254
```

### Service Networking (kube-proxy)

When you create a Service, the API server assigns it a **ClusterIP** from the Service CIDR (e.g. `10.96.0.0/12`). This IP is **virtual** — no interface holds this IP. It's a fiction implemented by iptables/IPVS rules on every Node.

```
Pod → send to 10.96.0.80 (Service IP)
    → iptables DNAT rule rewrites destination → 10.244.1.5:8080 (actual Pod IP)
```

**kube-proxy** runs on every Node as a DaemonSet and is responsible for keeping these iptables/IPVS rules in sync with Service and Endpoints objects in the API server.

### kube-proxy Modes

| Mode                 | Mechanism                              | Scale                     |
| -------------------- | -------------------------------------- | ------------------------- |
| `iptables` (default) | Linear iptables NAT rules              | Good to ~10k services     |
| `ipvs`               | Kernel-level load balancer; hash-based | Better for large clusters |
| `userspace`          | Legacy, userspace proxy                | Deprecated                |

### NodePort Implementation

When you create a `NodePort` Service (e.g. port 30080), kube-proxy adds an iptables rule on **every Node** that:

1. Accepts traffic on port 30080
2. DNATs to one of the Service's endpoint Pod IPs

This is why you can reach a NodePort service on _any_ Node's IP, even if the Pod isn't on that Node.

---

## Lab

### 1. Inspect kube-proxy

```bash
kubectl get pods -n kube-system -l k8s-app=kube-proxy
kubectl describe pod -n kube-system -l k8s-app=kube-proxy | head -40
```

kube-proxy is a DaemonSet — one Pod per Node.

### 2. Check kube-proxy mode

```bash
kubectl get configmap kube-proxy -n kube-system -o yaml | grep mode
# Empty or "iptables" → iptables mode
# "ipvs" → IPVS mode
```

### 3. See Service iptables rules

```bash
minikube ssh

# All Kubernetes service chains
sudo iptables -t nat -L KUBE-SERVICES -n --line-numbers | head -20

# Create a Service first
exit
kubectl create deployment nginx-net --image=nginx:1.25 --replicas=2
kubectl expose deployment nginx-net --port=80 --name=nginx-net-svc
SVC_IP=$(kubectl get svc nginx-net-svc -o jsonpath='{.spec.clusterIP}')
echo "Service ClusterIP: $SVC_IP"

minikube ssh
# Find the iptables chain for this service IP
sudo iptables -t nat -L KUBE-SERVICES -n | grep "$SVC_IP" 2>/dev/null
# Follow the chain...
sudo iptables -t nat -L -n | grep -A5 nginx
exit
```

### 4. Test load balancing

```bash
# Requests to the Service ClusterIP are load-balanced across Pods
kubectl run lb-test --image=busybox --rm -it --restart=Never -- \
  /bin/sh -c "for i in \$(seq 10); do wget -qO- nginx-net-svc; done" | grep -c "nginx"
```

### 5. NodePort iptables rules

```bash
kubectl expose deployment nginx-net --port=80 --type=NodePort --name=nginx-nodeport
kubectl get svc nginx-nodeport    # note the NodePort

minikube ssh
# Show NodePort DNAT rules
NP=$(kubectl get svc nginx-nodeport -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30000")
sudo iptables -t nat -L -n | grep $NP | head -5
exit
```

### 6. IPVS mode (optional)

```bash
# Switch kube-proxy to IPVS mode
kubectl edit configmap kube-proxy -n kube-system
# Change: mode: "" → mode: "ipvs"

# Restart kube-proxy
kubectl rollout restart daemonset kube-proxy -n kube-system

# Verify IPVS rules
minikube ssh
sudo ipvsadm -L -n | head -20
exit
```

### 7. Endpoints object

Every Service has an Endpoints object that kube-proxy watches for IP changes:

```bash
kubectl get endpoints nginx-net-svc    # lists Pod IPs
kubectl describe endpoints nginx-net-svc

# Scale up and watch Endpoints update
kubectl scale deployment nginx-net --replicas=4
kubectl get endpoints nginx-net-svc    # 4 IPs now
```

### Cleanup

```bash
kubectl delete deployment nginx-net 2>/dev/null; true
kubectl delete service nginx-net-svc nginx-nodeport 2>/dev/null; true
```

---

## Next

Move on to Lesson 44 — CoreDNS in Kubernetes.
