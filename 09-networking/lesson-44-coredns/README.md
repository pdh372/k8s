# Lesson 44 — CoreDNS in Kubernetes

## Theory

**CoreDNS** is the cluster DNS server. It replaced `kube-dns` in Kubernetes 1.13 and is deployed as a Deployment in `kube-system`. Every Pod has its `/etc/resolv.conf` configured to point to CoreDNS's ClusterIP (`kube-dns` Service).

### DNS Names in Kubernetes

| Object               | DNS Name                                             |
| -------------------- | ---------------------------------------------------- |
| Service              | `<service>.<namespace>.svc.cluster.local`            |
| Pod                  | `<pod-ip-dashes>.<namespace>.pod.cluster.local`      |
| Headless Service Pod | `<pod-name>.<service>.<namespace>.svc.cluster.local` |

Shorthand (from within the same namespace): just `<service>`.

### The `search` Domain in `/etc/resolv.conf`

Pods get this resolv.conf:

```
nameserver 10.96.0.10
search default.svc.cluster.local svc.cluster.local cluster.local
options ndots:5
```

`ndots:5`: if a name has fewer than 5 dots, K8s tries search domains first. So `nginx-svc` expands to `nginx-svc.default.svc.cluster.local` before trying DNS globally.

### CoreDNS Configuration — Corefile

CoreDNS uses a `Corefile` ConfigMap for configuration:

```
.:53 {
    errors
    health {
       lameduck 5s
    }
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
       pods insecure
       fallthrough in-addr.arpa ip6.arpa
       ttl 30
    }
    prometheus :9153
    forward . /etc/resolv.conf {
       max_concurrent 1000
    }
    cache 30
    loop
    reload
    loadbalance
}
```

The `kubernetes` plugin handles all `*.cluster.local` queries. Everything else is forwarded to the Node's upstream DNS (from `/etc/resolv.conf` on the Node).

---

## Lab

### 1. Inspect CoreDNS

```bash
kubectl get deployment coredns -n kube-system
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl get service kube-dns -n kube-system
# kube-dns Service has the stable ClusterIP that Pods use as nameserver
```

### 2. View the CoreDNS ConfigMap (Corefile)

```bash
kubectl get configmap coredns -n kube-system -o yaml
```

### 3. DNS resolution inside a Pod

```bash
kubectl run dns-test --image=busybox --rm -it --restart=Never -- /bin/sh

# Inside the Pod:
cat /etc/resolv.conf

# Resolve a Service (short name)
nslookup kubernetes

# Fully qualified
nslookup kubernetes.default.svc.cluster.local

# Cross-namespace
nslookup kube-dns.kube-system.svc.cluster.local

# External DNS
nslookup google.com

exit
```

### 4. Create a Service and test DNS

```bash
kubectl run web --image=nginx:1.25
kubectl expose pod web --port=80 --name=web-svc

kubectl run dns-test2 --image=busybox --rm -it --restart=Never -- \
  /bin/sh -c "nslookup web-svc; wget -qO- web-svc"
```

### 5. Custom DNS entry for an external service

```bash
# Add a custom DNS entry for an external hostname via hosts plugin
kubectl edit configmap coredns -n kube-system
```

Add to the Corefile (before `kubernetes` block):

```
hosts {
    1.2.3.4 myexternal.company.com
    fallthrough
}
```

```bash
# Restart CoreDNS to pick up config change
kubectl rollout restart deployment/coredns -n kube-system

# Test
kubectl run dns-test3 --image=busybox --rm -it --restart=Never -- \
  nslookup myexternal.company.com
```

### 6. Debug DNS issues

```bash
# Check if CoreDNS is healthy
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns

# Check that kube-dns Service exists and has the right ClusterIP
kubectl get svc kube-dns -n kube-system

# Check a Pod's resolv.conf
kubectl exec <any-pod> -- cat /etc/resolv.conf
# Should have: nameserver <kube-dns ClusterIP>

# Use a dnspython-based debug image
kubectl run dnsutils --image=gcr.io/kubernetes-e2e-test-images/dnsutils:1.3 \
  --restart=Never -- sleep 3600
kubectl exec dnsutils -- nslookup kubernetes.default
```

### Cleanup

```bash
kubectl delete pod web dns-test2 dnsutils 2>/dev/null; true
kubectl delete service web-svc 2>/dev/null; true
```

---

## Next

Move on to Lesson 45 — Ingress.
