# Lesson 47 — Kubernetes The Hard Way

## Theory

**Kubernetes the Hard Way** (originally by Kelsey Hightower) is the exercise of bootstrapping a Kubernetes cluster from scratch — without using kubeadm, Minikube, or any automation. You do everything manually: generate every certificate, write every kubeconfig, configure every component.

The goal is **understanding**, not production use. After doing this, kubeadm feels like magic because you know exactly what it's automating.

### What kubeadm Does Automatically (that you do manually in Hard Way)

1. Generate the cluster CA and all component certificates
2. Generate kubeconfig files for each component
3. Configure etcd
4. Write kube-apiserver, kube-controller-manager, kube-scheduler static Pod manifests
5. Bootstrap worker Nodes (kubelet config, kube-proxy)
6. Install CoreDNS
7. Configure RBAC for system components

### The Steps (High Level)

```
1. Provision VMs / infrastructure
2. Generate CA and all TLS certificates
3. Generate kubeconfig files for each component
4. Generate the data-encryption config (Secrets encryption at rest)
5. Bootstrap etcd cluster
6. Bootstrap control plane (apiserver, controller-manager, scheduler)
7. Bootstrap worker nodes (kubelet, kube-proxy)
8. Configure kubectl for remote access
9. Provision Pod networking (CNI)
10. Deploy CoreDNS
11. Smoke test
```

### Certificates You Create Manually

| Certificate              | CN                               | O (Group)        |
| ------------------------ | -------------------------------- | ---------------- |
| Cluster CA               | `Kubernetes`                     | —                |
| Admin client             | `admin`                          | `system:masters` |
| kubelet (per node)       | `system:node:<node-name>`        | `system:nodes`   |
| Controller Manager       | `system:kube-controller-manager` | —                |
| Scheduler                | `system:kube-scheduler`          | —                |
| kube-proxy               | `system:kube-proxy`              | —                |
| API server server cert   | `kubernetes`                     | —                |
| Service Account key pair | —                                | —                |

### The Reference

- Original guide (GCP): https://github.com/kelseyhightower/kubernetes-the-hard-way
- AWS version: https://github.com/prabhatsharma/kubernetes-the-hard-way-aws
- VirtualBox/local: https://github.com/mmumshad/kubernetes-the-hard-way

---

## Lab (condensed walkthrough — key steps to understand)

### 1. Certificate generation overview

```bash
# Install cfssl (certificate tool used in the Hard Way guide)
# brew install cfssl  (macOS)
# or use openssl as an alternative

# CA config
cat > ca-config.json <<'EOF'
{
  "signing": {
    "default": { "expiry": "8760h" },
    "profiles": {
      "kubernetes": {
        "usages": ["signing", "key encipherment", "server auth", "client auth"],
        "expiry": "8760h"
      }
    }
  }
}
EOF

# Generate CA cert with openssl (alternative to cfssl)
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -days 3650 \
  -subj "/CN=Kubernetes/O=Kubernetes" -out ca.crt

echo "CA generated: ca.crt + ca.key"
openssl x509 -in ca.crt -noout -subject -dates
```

### 2. Generate admin client certificate

```bash
openssl genrsa -out admin.key 2048
openssl req -new -key admin.key \
  -subj "/CN=admin/O=system:masters" \
  -out admin.csr
openssl x509 -req -in admin.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -days 365 -out admin.crt

echo "Admin cert generated"
openssl x509 -in admin.crt -noout -subject
```

### 3. Generate a kubeconfig manually

```bash
APISERVER="https://127.0.0.1:6443"
CLUSTER_NAME="kubernetes-hardway"

# Set cluster
kubectl config set-cluster $CLUSTER_NAME \
  --certificate-authority=ca.crt \
  --embed-certs=true \
  --server=$APISERVER \
  --kubeconfig=admin.kubeconfig

# Set credentials
kubectl config set-credentials admin \
  --client-certificate=admin.crt \
  --client-key=admin.key \
  --embed-certs=true \
  --kubeconfig=admin.kubeconfig

# Set context
kubectl config set-context default \
  --cluster=$CLUSTER_NAME \
  --user=admin \
  --kubeconfig=admin.kubeconfig

kubectl config use-context default --kubeconfig=admin.kubeconfig
cat admin.kubeconfig | head -20
```

### 4. etcd static configuration (reference)

On a hard-way setup, etcd is run as a systemd service (not a static Pod):

```ini
[Unit]
Description=etcd

[Service]
ExecStart=/usr/local/bin/etcd \
  --name master-1 \
  --cert-file=/etc/etcd/kubernetes.pem \
  --key-file=/etc/etcd/kubernetes-key.pem \
  --peer-cert-file=/etc/etcd/kubernetes.pem \
  --peer-key-file=/etc/etcd/kubernetes-key.pem \
  --trusted-ca-file=/etc/etcd/ca.pem \
  --peer-trusted-ca-file=/etc/etcd/ca.pem \
  --peer-client-cert-auth \
  --client-cert-auth \
  --initial-cluster master-1=https://192.168.5.11:2380 \
  --initial-cluster-state new \
  --data-dir=/var/lib/etcd
```

### 5. What the Hard Way teaches you

By doing it manually, you understand:

- Why there are so many certificates (each component has its own identity)
- Why kubeconfigs have embedded certs
- Why the API server needs so many flags (one per component it talks to)
- What bootstrap tokens are and why they exist
- Why `kubectl` needs the CA cert to trust the cluster
- How the Node authorization mode works (kubelet cert CN = `system:node:<name>`)

### 6. Recommended approach

1. **First**: complete this Minikube-based curriculum (you're doing it!)
2. **Next**: do Kubernetes the Hard Way on VMs (Vagrant + VirtualBox or GCP)
3. **Finally**: practice CKA exam tasks on killer.sh

---

## Checklist — Before the CKA Exam

Review these key skills:

```
Core Concepts
  [ ] Create/inspect/delete Pods, Deployments, Services (imperative + YAML)
  [ ] kubectl --dry-run=client -o yaml shortcut
  [ ] Namespace management

Scheduling
  [ ] nodeName, nodeSelector, nodeAffinity
  [ ] Taints and tolerations
  [ ] Static Pods (/etc/kubernetes/manifests)

Application Lifecycle
  [ ] Rolling updates + rollbacks
  [ ] ConfigMaps and Secrets (env + volume mount)
  [ ] Init containers

Cluster Maintenance
  [ ] drain/cordon/uncordon
  [ ] kubeadm upgrade procedure (order: kubeadm → control plane → workers)
  [ ] etcdctl snapshot save/restore

Security
  [ ] RBAC: create Role, ClusterRole, RoleBinding
  [ ] ServiceAccount and imagePullSecrets
  [ ] Security contexts (runAsUser, readOnlyRootFilesystem, capabilities)
  [ ] NetworkPolicy (deny-all, allow specific)

Storage
  [ ] PV + PVC (static and dynamic)
  [ ] StorageClass
  [ ] Mount PVC in Pod

Networking
  [ ] Services (ClusterIP, NodePort)
  [ ] Ingress + IngressClass
  [ ] CoreDNS troubleshooting
  [ ] kube-proxy + iptables awareness
```

### Cleanup

```bash
rm -f ca.key ca.crt ca.csr ca.srl admin.key admin.crt admin.csr admin.kubeconfig ca-config.json
```

---

## Congratulations!

You have completed the full CKA-style Kubernetes curriculum.

**Next steps:**

1. Practice each lab until the commands are muscle memory
2. Do timed practice on [killer.sh](https://killer.sh) (CKA simulator)
3. Take the CKA exam at [training.linuxfoundation.org](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)
