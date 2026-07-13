# Section 22 — Getting Started with Google Kubernetes Engine

## Why You Need Cloud Managed Kubernetes

Running Kubernetes yourself means standing up and operating the control plane (etcd, kube-apiserver, scheduler, controller-manager) — patching it, securing it, keeping it highly available, upgrading it without downtime. That's significant, ongoing operational work that has nothing to do with your actual application. **GKE removes all of it** — Google runs, patches, secures, and scales the control plane for you.

## What is Google Kubernetes Engine (GKE)

**GKE** is GCP's managed Kubernetes service. You get a standard, fully-conformant Kubernetes API — the same `kubectl` and YAML you'd use anywhere — without operating the control plane yourself.

## GKE Standard Mode vs Autopilot Mode

| Aspect                  | Standard mode                                    | Autopilot mode                                              |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| **Node management**       | You provision and manage the Node pools (machine type, count, upgrades) | Fully managed by Google — no Nodes to configure or see              |
| **Billing**                | Pay for Nodes provisioned, whether fully utilized or not | Pay per Pod resource request (CPU/memory actually requested)         |
| **Control**                 | Fine-grained — choose machine types, use DaemonSets, privileged Pods, etc. | Restricted — some node-level configs and privileged workloads aren't allowed |
| **Best for**                | Teams needing full control, specific machine types, or unsupported workload types | Teams that just want to run Pods and not think about Nodes at all    |

> **Exam framing:** "Least operational overhead" almost always points to **Autopilot**.

## Creating an Autopilot GKE Cluster

```bash
gcloud container clusters create-auto my-cluster \
  --region=us-central1

# Get kubectl credentials for the new cluster
gcloud container clusters get-credentials my-cluster --region=us-central1

kubectl get nodes
```

## Kubernetes — A Journey: Deploying Your Microservice

### Overview

The typical flow: containerize your app → write a Deployment manifest → apply it → expose it with a Service → watch Kubernetes keep it running.

### Deploy your microservice

```bash
kubectl create deployment hello-web --image=us-docker.pkg.dev/google-samples/containers/gke/hello-app:1.0
kubectl get deployments
kubectl get pods
```

### Exploring clusters and workloads

```bash
kubectl get nodes                     # what's in the cluster
kubectl get pods -o wide              # which node each pod landed on
kubectl describe deployment hello-web # full detail + recent events
kubectl logs -l app=hello-web         # logs from all pods matching the label
```

## Key Kubernetes Logical Concepts — Simplified

| Concept          | What it is                                                                      |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Pod**            | The smallest deployable unit — one or more containers that always run together, share an IP. |
| **Deployment**     | Declares "keep N replicas of this Pod template running" — handles scaling, self-healing, rolling updates. |
| **Service**        | A stable network endpoint in front of a changing set of Pods — Pods come and go (new IPs each time), the Service's address doesn't. |

```bash
# Expose the Deployment via a Service
kubectl expose deployment hello-web --port=80 --target-port=8080 --type=LoadBalancer
kubectl get services   # watch for an EXTERNAL-IP to be assigned
```

## Kubernetes — A Journey: Scaling

```bash
kubectl scale deployment hello-web --replicas=5
kubectl get pods -w   # watch new pods come up in real time
```

Scaling a Deployment is just changing the declared replica count — the controller handles creating (or removing) Pods to match.

## Kubernetes — A Journey: The End (Cleanup)

```bash
kubectl delete service hello-web
kubectl delete deployment hello-web
gcloud container clusters delete my-cluster --region=us-central1
```

## Key Kubernetes Concepts — Quick Review

- **Pod** = smallest unit, one or more co-located containers.
- **Deployment** = manages a set of identical Pods, declaratively.
- **Service** = stable networking endpoint for a set of Pods.
- **GKE Autopilot** = no Nodes to manage, billed per Pod resource request.
- **GKE Standard** = you manage Node pools, billed per Node.

## GKE Introduction — Scenarios

| Scenario                                                                | Answer                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Team wants Kubernetes with the absolute least operational overhead              | GKE Autopilot                                                       |
| Team needs a specific machine type or a DaemonSet that Autopilot restricts       | GKE Standard                                                        |
| App keeps crashing and Pods need automatic replacement                          | Deployment (self-healing via its controller)                        |
| Pods' IPs keep changing and clients need a stable address                       | Service                                                              |

## Next

Continue to **Section 23 — Digging Deeper Into Kubernetes**.
