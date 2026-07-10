# Lesson 32 — Image Security and Private Registries

## Theory

By default, Kubernetes pulls images from public registries (Docker Hub, `registry.k8s.io`). For private images, you need to:

1. Create a **docker-registry Secret** containing your registry credentials.
2. Reference it via `spec.imagePullSecrets` in the Pod (or attach it to the ServiceAccount so all Pods in the namespace inherit it).

### Security Best Practices for Container Images

- Use specific image tags, never `latest` in production (you lose reproducibility and auditability)
- Use image digests (`image@sha256:abc123`) for the strongest guarantee
- Scan images for vulnerabilities (Trivy, Snyk, Grype)
- Use minimal base images (distroless, Alpine, scratch)
- Don't run containers as root (set `runAsUser`)
- Never embed credentials, secrets, or private keys inside images

### Image Pull Policy

| `imagePullPolicy`        | Behavior                                              |
| ------------------------ | ----------------------------------------------------- |
| `Always`                 | Always pull from registry, even if local image exists |
| `IfNotPresent` (default) | Pull only if image not present locally                |
| `Never`                  | Never pull; fail if not present locally               |

If you use a tag of `latest`, `imagePullPolicy` defaults to `Always`. All other tags default to `IfNotPresent`.

---

## Lab

### 1. Create a docker-registry Secret

```bash
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=YOUR_DOCKERHUB_USERNAME \
  --docker-password=YOUR_PASSWORD \
  --docker-email=your@email.com

kubectl get secret regcred
kubectl get secret regcred -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d
```

> Replace credentials with real ones to test against a private registry. For lab purposes, the Secret creation command works even with dummy values — the error only appears when Kubernetes tries to pull.

### 2. Use the Secret in a Pod

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: private-image-pod
spec:
  imagePullSecrets:
    - name: regcred         # reference the Secret
  containers:
    - name: app
      image: your-private-registry.example.com/myapp:1.0
EOF
```

### 3. Attach imagePullSecrets to a ServiceAccount

Instead of adding `imagePullSecrets` to every Pod, attach it to the ServiceAccount once — all Pods using that SA inherit it:

```bash
kubectl create serviceaccount app-sa
kubectl patch serviceaccount app-sa \
  -p '{"imagePullSecrets":[{"name":"regcred"}]}'

kubectl get serviceaccount app-sa -o yaml
```

### 4. imagePullPolicy examples

```bash
# Always pull (useful for floating tags)
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: always-pull
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      imagePullPolicy: Always
EOF

# Never pull (image must be pre-loaded)
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: never-pull
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      imagePullPolicy: IfNotPresent
EOF
```

### 5. Use image digest instead of tag

```bash
# Get the digest
docker pull nginx:1.25
docker image inspect nginx:1.25 --format '{{.RepoDigests}}'
# Output: [nginx@sha256:abc123...]

# Use in Pod spec (immutable reference — won't change even if tag is overwritten)
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: digest-pod
spec:
  containers:
    - name: nginx
      image: nginx@sha256:66f1a9ae8622b2e95e3e72eb3a99a7b76b07078e20e9f8badf4588e86e6f3c65
EOF
```

### 6. Scan an image for vulnerabilities (optional)

```bash
# Install trivy (if not present)
# brew install aquasecurity/trivy/trivy  (macOS)
# sudo apt-get install trivy              (Ubuntu)

trivy image nginx:1.25 --severity HIGH,CRITICAL
```

### Cleanup

```bash
kubectl delete pod private-image-pod always-pull never-pull digest-pod 2>/dev/null; true
kubectl delete secret regcred 2>/dev/null; true
kubectl delete serviceaccount app-sa 2>/dev/null; true
```

---

## Next

Move on to Lesson 33 — Security Contexts.
