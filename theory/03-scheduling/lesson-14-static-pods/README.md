# Lesson 14 — Static Pods

## Theory

**Static Pods** are Pod definitions managed **directly by the kubelet** on a Node — not by the API server or any controller. The kubelet watches a directory on the Node's filesystem and creates/restarts Pods from any YAML files it finds there.

### Why Static Pods Matter

The Kubernetes control plane components themselves are static Pods:

- `etcd-minikube`
- `kube-apiserver-minikube`
- `kube-controller-manager-minikube`
- `kube-scheduler-minikube`

This is how Kubernetes bootstraps itself — even before the API server is running, the kubelet can read those manifests from disk and start the containers.

### Static Pods vs Regular Pods

|                                 | Static Pod                            | Regular Pod                      |
| ------------------------------- | ------------------------------------- | -------------------------------- |
| Created by                      | kubelet (reads from disk)             | API server (via controller/user) |
| API server needed?              | No                                    | Yes                              |
| Deleted via `kubectl delete`?   | No — kubelet recreates it immediately | Yes                              |
| Visible via `kubectl get pods`? | Yes (as a **mirror Pod**)             | Yes                              |
| Managed by controllers?         | No                                    | Yes                              |

### Mirror Pod

When the kubelet creates a static Pod, it also creates a read-only **mirror Pod** object on the API server. This is why you can `kubectl get pods -n kube-system` and see `etcd-minikube`. But if you `kubectl delete` it, only the mirror is deleted — the kubelet recreates it from the file on disk.

### Static Pod Directory

Default path: `/etc/kubernetes/manifests/`

Configured via the kubelet's `--pod-manifest-path` flag or `staticPodPath` in the kubelet config file (`/var/lib/kubelet/config.yaml`).

---

## Lab

### 1. Find the static Pod manifest directory

SSH into the Minikube node:

```bash
minikube ssh
ls /etc/kubernetes/manifests/
# etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

Look at one of the control plane manifests:

```bash
cat /etc/kubernetes/manifests/kube-apiserver.yaml
exit
```

### 2. Create a static Pod manually

SSH in and drop a manifest file into the directory:

```bash
minikube ssh

sudo tee /etc/kubernetes/manifests/static-nginx.yaml <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: static-nginx
  namespace: default
spec:
  containers:
    - name: nginx
      image: nginx:1.25
EOF

exit
```

Wait a few seconds, then check from your host — the kubelet should have started it:

```bash
kubectl get pods -n default
# You'll see "static-nginx-minikube" (mirror Pod, suffixed with node name)
```

### 3. Try to delete the static Pod (it comes back)

```bash
kubectl delete pod static-nginx-minikube
kubectl get pods    # recreated almost immediately — kubelet re-reads the file
```

### 4. To truly delete a static Pod — remove the file

```bash
minikube ssh
sudo rm /etc/kubernetes/manifests/static-nginx.yaml
exit

kubectl get pods    # gone now
```

### 5. Find the kubelet config path

```bash
minikube ssh
ps aux | grep kubelet | grep config
# Look for --config= flag
cat /var/lib/kubelet/config.yaml | grep staticPodPath
exit
```

### 6. Identify static Pods in a real cluster

Static Pods always have the Node name appended to their name:

```bash
kubectl get pods -n kube-system
# etcd-minikube, kube-apiserver-minikube, etc. → all static Pods
```

Confirm by checking the `ownerReferences` — static Pods have none (or `Node` as owner):

```bash
kubectl get pod etcd-minikube -n kube-system -o jsonpath='{.metadata.ownerReferences}'
```

### Cleanup

The static Pod was removed in step 4. No further cleanup needed.

---

## Next

Move on to Lesson 15 — Multiple Schedulers.
