# Lesson 29 — TLS Certificates and the CSR API

## Theory

All communication in a Kubernetes cluster is protected by TLS. Every component has a certificate signed by the cluster's **Certificate Authority (CA)**. Understanding the certificate infrastructure is important for debugging and for the CKA exam.

### Certificate Topology

```
Cluster CA (ca.crt / ca.key)
    ├── kube-apiserver.crt        ← server cert for API server
    ├── etcd/server.crt           ← etcd server cert
    ├── etcd/peer.crt             ← etcd peer communication
    ├── front-proxy-ca.crt        ← for API aggregation layer
    ├── admin.crt                 ← kubectl admin client cert
    ├── kubelet.crt               ← kubelet client cert (CN=system:node:<name>)
    ├── controller-manager.crt    ← controller-manager client cert
    └── scheduler.crt             ← scheduler client cert
```

On a kubeadm cluster all certs live under `/etc/kubernetes/pki/`.

### Certificate Fields That Matter

| Field                | Kubernetes meaning |
| -------------------- | ------------------ |
| **CN** (Common Name) | Username           |
| **O** (Organization) | Group              |

Examples:

- `CN=kube-scheduler, O=system:masters` — the scheduler's cert
- `CN=system:node:worker-1, O=system:nodes` — a kubelet's cert
- `CN=alice, O=developers` — a human user cert

### The Kubernetes CSR API

Instead of manually signing certificates with `openssl` on the control plane, you can submit a **CertificateSigningRequest** object to Kubernetes. An admin approves it, and Kubernetes signs it with the cluster CA.

```
User generates key + CSR
    ↓
Submit CertificateSigningRequest to API
    ↓
Admin: kubectl certificate approve <name>
    ↓
Extract signed cert: kubectl get csr <name> -o jsonpath=...
```

---

## Lab

### 1. Explore existing cluster certificates

```bash
minikube ssh
ls /etc/kubernetes/pki/
ls /etc/kubernetes/pki/etcd/
exit
```

### 2. Inspect a certificate

```bash
minikube ssh
# Inspect the API server certificate
sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -E 'Subject:|DNS:|IP:|Not After'
exit
```

Key fields to look at:

- `Subject` — CN and O
- `X509v3 Subject Alternative Name` — DNS names and IPs the cert is valid for (must include all ways the API server is reached)
- `Not After` — expiry date

### 3. Check certificate expiry for all kubeadm-managed certs

```bash
minikube ssh
sudo kubeadm certs check-expiration
exit
```

### 4. Renew certificates

```bash
minikube ssh
# Renew all certs (kubeadm rotates all with new 1-year expiry)
# sudo kubeadm certs renew all
# sudo systemctl restart kubelet
exit
```

### 5. Full CSR workflow (same as Lesson 28 — shown together here for reference)

```bash
# Generate key and CSR
openssl genrsa -out bob.key 2048
openssl req -new -key bob.key -subj "/CN=bob/O=developers" -out bob.csr

# Submit to Kubernetes
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: bob-csr
spec:
  request: $(cat bob.csr | base64 | tr -d '\n')
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
    - client auth
EOF

# List pending CSRs
kubectl get csr

# Approve or deny
kubectl certificate approve bob-csr
# kubectl certificate deny bob-csr   # to reject

# Get the signed cert
kubectl get csr bob-csr -o jsonpath='{.status.certificate}' | base64 -d > bob.crt
openssl x509 -in bob.crt -noout -subject -dates
```

### 6. Certificate used by a specific component

```bash
# See the client cert used by the controller-manager
kubectl describe pod kube-controller-manager-minikube -n kube-system | grep tls
```

### 7. Verify API server SANs

The API server certificate must include all IPs/hostnames used to reach it. If you get TLS errors when adding a new hostname, the SAN may be missing.

```bash
minikube ssh
sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -A5 "Subject Alternative"
exit
```

### Cleanup

```bash
kubectl delete csr bob-csr 2>/dev/null; true
rm -f bob.key bob.csr bob.crt
```

---

## Next

Move on to Lesson 30 — KubeConfig.
