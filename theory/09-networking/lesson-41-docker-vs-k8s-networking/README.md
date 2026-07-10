# Lesson 41 — Docker Networking vs Kubernetes Cluster Networking

## Theory

### Docker Networking Modes

| Mode               | Description                                                         | Use case                      |
| ------------------ | ------------------------------------------------------------------- | ----------------------------- |
| `bridge` (default) | Containers get private IPs on the `docker0` bridge; NAT out to host | Single-host container comms   |
| `host`             | Container shares the host's network stack directly (no isolation)   | Performance-critical          |
| `none`             | No network interface; fully isolated                                | Batch jobs needing no network |
| `overlay`          | Multi-host; spans multiple Docker hosts (Docker Swarm)              | Multi-host                    |
| `macvlan`          | Container gets its own MAC address on the host network              | Direct LAN access             |

### Docker's Limitation

On a single host, containers on the `docker0` bridge can talk to each other. But on **different hosts**, each Docker host has its own `docker0` bridge with possibly the same IP ranges → containers on different hosts cannot reach each other directly without NAT.

### Kubernetes Networking Model

Kubernetes mandates a flat networking model:

> **Every Pod must be able to reach every other Pod's IP without NAT**, regardless of which Node they're on.

This means:

- Pod-to-Pod on the **same Node**: via the Node's CNI bridge
- Pod-to-Pod on **different Nodes**: via the CNI plugin's overlay/routing mechanism
- No source IP masquerade between Pods

### The Kubernetes Networking Model (Three Requirements)

1. **All Pods can communicate with all other Pods without NAT**
2. **All Nodes can communicate with all Pods without NAT**
3. **The IP a Pod sees for itself is the same IP other Pods see for it**

These requirements are not built into Kubernetes — they're enforced by the **CNI plugin** you install.

### How CNI Satisfies This

Example with a VXLAN overlay (Flannel/Weave):

```
Pod A (Node 1: 10.244.1.5) → VXLAN tunnel → Pod B (Node 2: 10.244.2.7)
```

Example with BGP routing (Calico):

```
Pod A (Node 1: 192.168.1.5) → BGP routes → Pod B (Node 2: 192.168.2.7)
```

### IP Address Ranges

A Kubernetes cluster uses **three non-overlapping CIDR ranges**:

| Range        | Default (kubeadm)   | Used for                             |
| ------------ | ------------------- | ------------------------------------ |
| Node CIDR    | Your infrastructure | Node IPs                             |
| Pod CIDR     | `10.244.0.0/16`     | Pod IPs (one /24 sub-range per Node) |
| Service CIDR | `10.96.0.0/12`      | Service virtual IPs                  |

---

## Lab

### 1. Inspect the network architecture in Minikube

```bash
minikube ssh

# View all interfaces
ip addr show

# The cni0 bridge (or similar) is where Pod traffic flows
ip addr show cni0 2>/dev/null || ip addr show eth0

# Routing table — includes routes to Pod CIDR
ip route show

exit
```

### 2. Check the Pod CIDR

```bash
kubectl get node minikube -o jsonpath='{.spec.podCIDR}'
kubectl get node minikube -o jsonpath='{.spec.podCIDRs}'

# Each Node gets a slice of the cluster Pod CIDR
kubectl get nodes -o custom-columns=NODE:.metadata.name,POD_CIDR:.spec.podCIDR
```

### 3. Create Pods on different IPs and test connectivity

```bash
kubectl run pod-a --image=busybox --labels=test=a -- sleep 3600
kubectl run pod-b --image=busybox --labels=test=b -- sleep 3600

kubectl get pods -o wide    # note IP of each Pod

POD_B_IP=$(kubectl get pod pod-b -o jsonpath='{.status.podIP}')
echo "Pod B IP: $POD_B_IP"

# Pod A can reach Pod B directly (no NAT, no Service needed)
kubectl exec pod-a -- ping -c3 $POD_B_IP
```

### 4. Compare: Docker container cross-host limitation

On a standard Docker setup (not Swarm), two containers on different hosts cannot reach each other's private IPs. Kubernetes CNI solves this with a unified overlay or routing layer.

### 5. Service CIDR vs Pod CIDR

```bash
# Service CIDR — used for Service VIPs (ClusterIPs)
kubectl describe pod kube-apiserver-minikube -n kube-system | grep service-cluster-ip-range
# → --service-cluster-ip-range=10.96.0.0/12

# Pod CIDR
kubectl describe pod kube-controller-manager-minikube -n kube-system | grep cluster-cidr
# → --cluster-cidr=10.244.0.0/16
```

### 6. How Services use iptables (NAT)

```bash
minikube ssh

# Show Kubernetes iptables rules for Services
sudo iptables -t nat -L KUBE-SERVICES -n | head -30
# Each Service gets a KUBE-SERVICES chain entry
# Each endpoint (Pod IP:port) gets a KUBE-SEP-* chain for DNAT

exit
```

### Cleanup

```bash
kubectl delete pod pod-a pod-b 2>/dev/null; true
```

---

## Next

Move on to Lesson 42 — CNI Plugins.
