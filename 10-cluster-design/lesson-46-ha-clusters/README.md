# Lesson 46 — Designing HA Clusters

## Theory

A **High Availability (HA) Kubernetes cluster** ensures the control plane continues to function even if one or more control plane Nodes fail. Worker Nodes continue running existing Pods even when the control plane is down — new scheduling and scaling decisions just can't be made until it recovers.

### Single Control Plane vs HA

```
Single control plane (dev/learning):
  [Worker] [Worker]
      ↑         ↑
  [Control Plane] ← single point of failure

HA control plane (production):
  [Worker] [Worker] [Worker]
         ↑
  [Load Balancer]
   /      |      \
[CP-1] [CP-2] [CP-3]   ← quorum: 2 of 3 must be up
```

### etcd Topology Options

**Stacked etcd** (etcd runs on each control plane Node):

- Simpler to set up
- Each control plane Node runs: apiserver + etcd + controller-manager + scheduler
- Risk: if a control plane Node is lost, an etcd member is also lost

**External etcd** (etcd runs on separate Nodes):

- More complex, more Nodes
- etcd cluster is isolated from control plane failures
- Recommended for production-critical clusters

### etcd Quorum

etcd uses the **Raft consensus algorithm**. It needs a quorum (majority) to elect a leader and process writes:

| etcd members | Quorum needed | Tolerated failures |
| ------------ | ------------- | ------------------ |
| 1            | 1             | 0                  |
| 3            | 2             | 1                  |
| 5            | 3             | 2                  |
| 7            | 4             | 3                  |

Always use an **odd number** of etcd members. Even numbers don't help — 4 members still only tolerates 1 failure (quorum = 3).

### Control Plane Load Balancer

All clients (`kubectl`, worker Node kubelets, controllers) must reach the API server. With multiple API servers, a **load balancer** provides a single endpoint:

- Cloud: AWS ALB, GCP Cloud Load Balancer
- On-prem: Keepalived + HAProxy, kube-vip, MetalLB
- The LB VIP is what you set in `--control-plane-endpoint` in kubeadm

### Leader Election

`kube-controller-manager` and `kube-scheduler` use **leader election** to ensure only one active instance at a time (even when multiple replicas run for HA). The active instance holds a lease in etcd; others stand by.

```bash
kubectl get lease -n kube-system
```

---

## Lab (kubeadm HA setup — reference / conceptual)

> Setting up a real multi-node HA cluster requires multiple VMs. This lab shows the commands and concepts without requiring real multi-VM setup.

### 1. HA kubeadm init (first control plane)

```bash
# On the first control plane node:
kubeadm init \
  --control-plane-endpoint "LOAD_BALANCER_DNS:6443" \
  --upload-certs \
  --pod-network-cidr=10.244.0.0/16

# Output includes:
# - kubeadm join command for additional control plane nodes (with --control-plane flag)
# - kubeadm join command for worker nodes
# - certificate key for joining control plane nodes
```

### 2. Join additional control plane nodes

```bash
# On second and third control plane nodes:
kubeadm join LOAD_BALANCER_DNS:6443 \
  --token <token> \
  --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane \
  --certificate-key <cert-key>
```

### 3. Verify HA setup

```bash
kubectl get nodes    # 3 control-plane nodes + workers
kubectl get pods -n kube-system    # 3 of each: etcd, apiserver, controller-manager, scheduler
kubectl get lease -n kube-system    # shows which kube-scheduler and controller-manager won leader election
```

### 4. Simulate a control plane failure

```bash
# (On a multi-node cluster)
# Stop one control plane node's API server
# kubectl and workloads continue working — other CP nodes take over

# etcd cluster health
minikube ssh
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  endpoint status --cluster -w table
exit
```

### 5. Check leader election state

```bash
# Who is the current kube-scheduler leader?
kubectl get lease kube-scheduler -n kube-system -o yaml | grep holderIdentity

# Who is the current controller-manager leader?
kubectl get lease kube-controller-manager -n kube-system -o yaml | grep holderIdentity
```

### 6. HA Checklist for Production

- [ ] 3 or 5 control plane nodes
- [ ] 3 or 5 etcd members (stacked or external)
- [ ] Load balancer in front of API servers (L4 TCP)
- [ ] `--control-plane-endpoint` set to the LB VIP
- [ ] etcd snapshots scheduled (see Lesson 26)
- [ ] Certificate rotation configured
- [ ] Monitoring of etcd leader health
- [ ] PodDisruptionBudgets for critical workloads
- [ ] Worker nodes distributed across availability zones
- [ ] etcd on fast local SSDs (etcd is latency-sensitive)

---

## Next

Move on to Lesson 47 — Kubernetes The Hard Way (overview).
