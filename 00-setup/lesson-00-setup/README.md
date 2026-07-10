# Lesson 0 — Setup: Local Kubernetes Environment (Minikube)

Environment: Ubuntu 26, fully local, 100% free, no credit card required.

## Core Concepts

- **Container**: an app packaged with its code and runtime; runs identically anywhere.
- **Image**: the blueprint used to create a container.
- **Node**: a single machine that runs containers.
- **Cluster**: a group of nodes managed by Kubernetes.
- **Pod**: the smallest deployable unit in Kubernetes (usually one container).

## Step 1 — Install Docker (driver for Minikube)

```bash
sudo apt update
sudo apt install -y docker.io
sudo usermod -aG docker $USER
```

After this, close and reopen your terminal (or `su - $USER`) so the new `docker` group takes effect. Verify with:

```bash
groups        # should list "docker"
docker ps     # should run without sudo
```

## Step 2 — Install kubectl (CLI to control Kubernetes)

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Step 3 — Install Minikube

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Step 4 — Start the Cluster

```bash
minikube start --driver=docker --container-runtime=containerd
kubectl get nodes    # verify the cluster is up
```

Then confirm every system pod is `Running`:

```bash
kubectl get pods -n kube-system
```

If something shows `Pending` / `ImagePullBackOff` right after start, that's usually transient (network still initializing) — wait ~1 min and check again.

## Cleanup (when you're done practicing)

```bash
minikube delete   # removes the cluster, frees disk/RAM
```

## Useful Commands

```bash
kubectl get pods            # list running pods
kubectl logs <pod-name>     # view logs
kubectl describe pod <pod-name>   # debug a pod (check Events)
minikube dashboard          # visual UI for the cluster
minikube addons enable metrics-server # optional
```

## Next

Once your cluster is `Ready`, move on to [`../lesson-01-deploy-node-app/README.md`](../lesson-01-deploy-node-app/README.md).
