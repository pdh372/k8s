# Lesson 42 — CNI (Container Network Interface)

## Theory

**CNI** (Container Network Interface) is the standard interface between Kubernetes and network plugins. When a Pod is created, the kubelet calls the CNI plugin to:

1. Create the Pod's network namespace
2. Assign an IP address (from IPAM)
3. Connect the namespace to the cluster network
4. Set up routes

When a Pod is deleted, the CNI plugin reverses all of this.

### CNI Plugin Location

```
Binaries: /opt/cni/bin/        ← actual executables
Config:   /etc/cni/net.d/      ← network configuration JSON files
```

The kubelet detects the CNI plugin by reading `/etc/cni/net.d/` and calling the first `.conf` file it finds.

### Popular CNI Plugins

| Plugin        | Mechanism             | NetworkPolicy support | Notes                                          |
| ------------- | --------------------- | --------------------- | ---------------------------------------------- |
| **Flannel**   | VXLAN overlay         | ❌ No                 | Simplest; good for learning                    |
| **Calico**    | BGP routing + overlay | ✅ Yes                | Most popular for prod; excellent NetworkPolicy |
| **Weave Net** | VXLAN / fast datapath | ✅ Yes                | Easy setup                                     |
| **Cilium**    | eBPF                  | ✅ Yes (+ L7)         | Highest performance; advanced observability    |
| **Canal**     | Flannel + Calico      | ✅ Yes                | Flannel network + Calico policies              |
| **kindnet**   | Simple routing        | ❌ No                 | Used in `kind` clusters                        |

### Minikube CNI Options

```bash
minikube start --cni=calico     # Calico — supports NetworkPolicies
minikube start --cni=flannel    # Flannel — simple
minikube start --cni=cilium     # Cilium — eBPF
minikube start --cni=auto       # minikube picks one (default: bridge)
```

---

## Lab

### 1. Check which CNI plugin is running

```bash
minikube ssh
ls /opt/cni/bin/
ls /etc/cni/net.d/
cat /etc/cni/net.d/*.conf 2>/dev/null || cat /etc/cni/net.d/*.conflist 2>/dev/null
exit
```

### 2. Identify the CNI from the kube-system Pods

```bash
kubectl get pods -n kube-system
# Calico:  calico-node-*
# Flannel: kube-flannel-*
# Weave:   weave-net-*
# Cilium:  cilium-*
```

### 3. Try a Minikube with Calico (for NetworkPolicy support)

```bash
# Start a new Minikube profile with Calico
minikube start -p calico-demo --cni=calico

# Verify Calico Pods running
kubectl get pods -n kube-system -l k8s-app=calico-node --context=calico-demo

# Delete when done
minikube delete -p calico-demo
```

### 4. CNI IPAM (IP Address Management)

Each CNI plugin uses an IPAM plugin (often `host-local` or `calico-ipam`) to allocate IPs from the Pod CIDR:

```bash
minikube ssh
cat /etc/cni/net.d/*.conflist | python3 -m json.tool 2>/dev/null | grep -E 'ipam|subnet'
exit
```

### 5. Pod IP assignment flow

```bash
# Create a Pod and observe its IP
kubectl run cni-test --image=nginx:1.25
kubectl get pod cni-test -o wide    # note the IP — assigned by CNI IPAM

# The IP is from the Node's pod CIDR slice
kubectl get node minikube -o jsonpath='{.spec.podCIDR}'
```

### 6. CNI troubleshooting

If Pods are stuck in `ContainerCreating`:

```bash
kubectl describe pod <pod-name>    # look at Events for CNI errors

minikube ssh
# Check kubelet logs
sudo journalctl -u kubelet | grep -i cni | tail -20
exit
```

Common CNI issues:

- Wrong pod CIDR overlapping with existing network
- CNI binary missing from `/opt/cni/bin/`
- Config file malformed in `/etc/cni/net.d/`

### Cleanup

```bash
kubectl delete pod cni-test 2>/dev/null; true
```

---

## Next

Move on to Lesson 43 — Pod and Service Networking (IPAM, kube-proxy).
