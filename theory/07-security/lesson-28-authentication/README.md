# Lesson 28 — Authentication

## Theory

Authentication in Kubernetes answers the question: **Who is this?** There are two categories of identities:

| Identity            | Managed by                           | Used for                    |
| ------------------- | ------------------------------------ | --------------------------- |
| **Users**           | External systems (certs, OIDC, LDAP) | Humans using `kubectl`      |
| **ServiceAccounts** | Kubernetes API                       | Pods and internal processes |

> Kubernetes has **no user database**. You cannot `kubectl create user alice`. User identities come from the **Common Name (CN)** in an X.509 certificate, or from an OIDC token's `sub` claim.

### X.509 Client Certificates (most common for humans/CKA)

- The cluster CA signs user certificates.
- The **CN** field becomes the username.
- The **O** (Organization) field maps to group membership.
- kubeconfig stores the client cert and key.

### ServiceAccounts

- Created as Kubernetes objects: `kubectl create serviceaccount <name>`
- A JWT token is mounted automatically inside each Pod at `/var/run/secrets/kubernetes.io/serviceaccount/token`
- Pods use this token to authenticate to the API server
- Since K8s 1.24, tokens are short-lived and bound to the Pod (no long-lived secrets created automatically)

### Groups

Kubernetes groups come from the `O` field in a certificate or from OIDC `groups` claim:

- `system:masters` → cluster-admin (bound to `cluster-admin` ClusterRole)
- `system:nodes` → node group (used by kubelets)
- `system:authenticated` → any authenticated user
- `system:unauthenticated` → anonymous requests

---

## Lab

### 1. View your current authentication context

```bash
kubectl config view    # shows clusters, users, contexts
kubectl config current-context
kubectl config view --minify    # current context only

# Who am I?
kubectl auth whoami 2>/dev/null || \
  kubectl get --raw /api/v1/namespaces | head -3    # if API accessible, you're authenticated
```

### 2. Create a new user with a certificate

```bash
# Generate a private key for user "alice"
openssl genrsa -out alice.key 2048

# Create a Certificate Signing Request (CSR)
openssl req -new -key alice.key \
  -subj "/CN=alice/O=developers" \
  -out alice.csr

# Encode the CSR for the Kubernetes CSR API
CSR_B64=$(cat alice.csr | base64 | tr -d '\n')

# Submit a CertificateSigningRequest to Kubernetes
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: alice-csr
spec:
  request: $CSR_B64
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
    - client auth
EOF

kubectl get csr
```

### 3. Approve the CSR and extract the certificate

```bash
kubectl certificate approve alice-csr
kubectl get csr alice-csr    # STATUS: Approved,Issued

# Extract the signed certificate
kubectl get csr alice-csr -o jsonpath='{.status.certificate}' | base64 -d > alice.crt

# Verify
openssl x509 -in alice.crt -noout -subject -dates
```

### 4. Add the new user to kubeconfig

```bash
# Add user credentials
kubectl config set-credentials alice \
  --client-certificate=alice.crt \
  --client-key=alice.key

# Add a context for alice
kubectl config set-context alice-context \
  --cluster=minikube \
  --user=alice \
  --namespace=default

kubectl config get-contexts
```

### 5. Switch to the new user context

```bash
kubectl config use-context alice-context

# Alice has no permissions yet
kubectl get pods    # Forbidden

# Switch back to admin
kubectl config use-context minikube
```

### 6. ServiceAccount token

```bash
kubectl create serviceaccount app-sa
kubectl create token app-sa    # creates a short-lived token (K8s 1.24+)

# Decode the JWT (base64 middle section)
TOKEN=$(kubectl create token app-sa)
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | python3 -m json.tool
```

### Cleanup

```bash
kubectl delete csr alice-csr 2>/dev/null; true
kubectl delete serviceaccount app-sa 2>/dev/null; true
kubectl config delete-context alice-context 2>/dev/null; true
kubectl config delete-user alice 2>/dev/null; true
rm -f alice.key alice.csr alice.crt
```

---

## Next

Move on to Lesson 29 — TLS Certificates and CSR.
