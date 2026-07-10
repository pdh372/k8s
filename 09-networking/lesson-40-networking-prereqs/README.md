# Lesson 40 — Networking Prerequisites

## Theory

Before diving into Kubernetes networking, you need solid footing in Linux/container networking fundamentals. This lesson covers the building blocks Kubernetes uses.

### IP Addresses and Routing

**Switching** connects devices on the same network (Layer 2). **Routing** connects different networks via a router/gateway (Layer 3).

```bash
# View network interfaces
ip addr
ip link

# View routing table
ip route
route -n

# Add a route
ip route add 192.168.2.0/24 via 192.168.1.1

# View ARP table (MAC→IP mappings)
arp -n
```

### DNS

DNS resolves names to IP addresses. In Linux:

- `/etc/hosts` — local static name resolution (checked before DNS)
- `/etc/resolv.conf` — DNS server configuration (`nameserver` and `search` domains)
- `/etc/nsswitch.conf` — resolution order (`files dns`)

```bash
# Test DNS resolution
nslookup kubernetes.default.svc.cluster.local
dig kubernetes.default.svc.cluster.local
cat /etc/resolv.conf
```

### Linux Network Namespaces

Network namespaces give each process group its own isolated network stack (interfaces, routing table, iptables rules). This is how containers get their own IP address.

```bash
# Create a network namespace
ip netns add red
ip netns add blue

# List namespaces
ip netns

# Run a command inside a namespace
ip netns exec red ip addr    # "red" has its own loopback only

# Connect two namespaces with a virtual ethernet pair (veth)
ip link add veth-red type veth peer name veth-blue
ip link set veth-red netns red
ip link set veth-blue netns blue

# Assign IPs
ip netns exec red  ip addr add 192.168.15.1/24 dev veth-red
ip netns exec blue ip addr add 192.168.15.2/24 dev veth-blue
ip netns exec red  ip link set veth-red up
ip netns exec blue ip link set veth-blue up

# Test connectivity
ip netns exec red ping 192.168.15.2

# Cleanup
ip netns delete red
ip netns delete blue
```

### Linux Bridge

A bridge acts like a virtual switch — connecting multiple network namespaces together:

```
 NS1 ──veth1──┐
               ├── bridge ── eth0 (host)
 NS2 ──veth2──┘
```

Containers on the same host use a bridge to talk to each other. Docker's `docker0` and Kubernetes' CNI bridges work this way.

### iptables

`iptables` provides packet filtering, NAT, and port forwarding. Kubernetes uses iptables heavily for Services (kube-proxy rewrites rules for each Service VIP).

```bash
# List iptables rules
iptables -L -n -v
iptables -t nat -L -n -v    # NAT table (Services)
iptables -t nat -L KUBE-SERVICES -n    # Kubernetes service rules
```

### ipvs (alternative to iptables for kube-proxy)

IPVS is a kernel-level load balancer. kube-proxy can use IPVS mode instead of iptables for better performance at large scale.

---

## Lab

### 1. Inspect host networking

```bash
ip addr show
ip route show
ip link show
```

### 2. View the bridge created by the container runtime

```bash
minikube ssh
ip addr show    # look for cni0 or docker0 bridge
bridge link     # show bridge ports
exit
```

### 3. See how a Pod gets its network namespace

```bash
# Get a Pod's container ID
POD_ID=$(kubectl get pod -l app=kubernetes -n kube-system -o jsonpath='{.items[0].metadata.name}' 2>/dev/null | head -1)
# Or just pick any running pod
kubectl run nettest --image=nginx:1.25
kubectl get pod nettest -o wide    # note the Pod IP

# The Pod's IP comes from the CNI plugin assigning from the Pod CIDR
kubectl get nodes -o jsonpath='{.items[0].spec.podCIDR}'
```

### 4. DNS configuration inside a Pod

```bash
kubectl exec nettest -- cat /etc/resolv.conf
# nameserver 10.96.0.10  (CoreDNS ClusterIP)
# search default.svc.cluster.local svc.cluster.local cluster.local
# options ndots:5
```

`ndots:5` means if a name has fewer than 5 dots, search domains are tried first before treating it as an absolute name.

### 5. Test name resolution inside a Pod

```bash
kubectl exec nettest -- nslookup kubernetes.default.svc.cluster.local
kubectl exec nettest -- nslookup kubernetes    # short name works (search domain)
kubectl exec nettest -- cat /etc/hosts
```

### Cleanup

```bash
kubectl delete pod nettest 2>/dev/null; true
```

---

## Next

Move on to Lesson 41 — Docker Networking vs Kubernetes Cluster Networking.
