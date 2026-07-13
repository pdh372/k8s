# Lesson 26 — Backup and Restore (etcd)

## Theory

**etcd** is the cluster's single source of truth. If etcd data is lost, the cluster loses all knowledge of its state — every Deployment, Service, Secret, ConfigMap, etc. Regular snapshots are essential.

### What Gets Backed Up?

etcd stores all Kubernetes objects. A snapshot contains the entire cluster state at the moment it was taken. The snapshot does **not** contain:

- Data inside containers (use application-level backups for that)
- Persistent Volume data (back up separately via your storage solution)

### Alternatives to etcd Backup

Some teams back up Kubernetes by exporting all resources as YAML:

```bash
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml
```

This is less complete than an etcd snapshot (misses some resources), but simpler and works without etcd access.

### `etcdctl` Authentication

etcd requires TLS client certificates for access. On a kubeadm cluster the certs are at:

```
/etc/kubernetes/pki/etcd/ca.crt
/etc/kubernetes/pki/etcd/server.crt
/etc/kubernetes/pki/etcd/server.key
```

Always set `ETCDCTL_API=3` — the v2 API is deprecated.

---

## Lab

### 1. Verify etcd is running

```bash
kubectl get pods -n kube-system | grep etcd
kubectl describe pod etcd-minikube -n kube-system | grep Image
```

### 2. Access etcd inside Minikube

```bash
minikube ssh

# Check etcd is listening
sudo netstat -tlnp | grep 2379

# Set up environment
export ETCDCTL_API=3
ETCD_CERT_DIR=/etc/kubernetes/pki/etcd

# Quick health check
sudo etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=$ETCD_CERT_DIR/ca.crt \
  --cert=$ETCD_CERT_DIR/server.crt \
  --key=$ETCD_CERT_DIR/server.key \
  endpoint health
```

### 3. Take an etcd snapshot

```bash
# Still inside minikube ssh
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /tmp/etcd-snapshot.db

# Verify snapshot
sudo ETCDCTL_API=3 etcdctl snapshot status /tmp/etcd-snapshot.db --write-out=table

exit
```

Copy snapshot to host:

```bash
minikube cp minikube:/tmp/etcd-snapshot.db ./etcd-snapshot.db
ls -lh etcd-snapshot.db
```

### 4. Create some data, then restore to pre-data state

```bash
# Create objects AFTER the snapshot
kubectl create namespace post-backup
kubectl create deployment test-restore --image=nginx:1.25 -n post-backup
kubectl get all -n post-backup
```

### 5. Restore from snapshot (procedure)

> ⚠️ Restoration requires stopping the API server, replacing etcd data, then restarting. On a real cluster this causes downtime. On Minikube this is complex — the steps below show the real-world kubeadm procedure.

**Real kubeadm procedure (reference — do not run on Minikube):**

```bash
# 1. Stop the API server (remove static pod manifest temporarily)
sudo mv /etc/kubernetes/manifests/kube-apiserver.yaml /tmp/

# 2. Restore etcd data to a new directory
sudo ETCDCTL_API=3 etcdctl snapshot restore /tmp/etcd-snapshot.db \
  --data-dir=/var/lib/etcd-restore

# 3. Update etcd static pod to use the new data directory
sudo sed -i 's|/var/lib/etcd|/var/lib/etcd-restore|g' /etc/kubernetes/manifests/etcd.yaml

# 4. Restore the API server manifest
sudo mv /tmp/kube-apiserver.yaml /etc/kubernetes/manifests/

# 5. Wait for API server and etcd to restart
kubectl get nodes    # should work once restored
```

After restore, objects created after the snapshot will be gone:

```bash
kubectl get namespace post-backup    # Not found — it didn't exist at snapshot time
```

### 6. ETCD cluster member list

```bash
minikube ssh

sudo ETCDCTL_API=3 etcdctl \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  member list

exit
```

### 7. Key etcd facts for the CKA exam

- Default port: `2379` (client), `2380` (peer)
- Default data directory: `/var/lib/etcd`
- The etcd Pod manifest is at `/etc/kubernetes/manifests/etcd.yaml`
- Check `--data-dir` and `--listen-client-urls` inside that manifest
- Always use `ETCDCTL_API=3`

### Cleanup

```bash
kubectl delete namespace post-backup 2>/dev/null; true
kubectl delete deployment test-restore -n post-backup 2>/dev/null; true
rm -f etcd-snapshot.db
```

---

## Next

Cluster Maintenance complete. Move on to Lesson 27 — Security Primitives.
