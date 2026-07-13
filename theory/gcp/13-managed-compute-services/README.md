# Section 13 — Exploring Google Cloud Managed Services for Compute

## Google Cloud's Compute Options, Compared

This is the single most exam-relevant table in the whole course — nearly every scenario question is really asking "which compute service fits this requirement?"

| Service              | Management level     | Scales to zero? | Unit of deployment      | Best for                                                   |
| ------------------------ | ------------------------ | ------------------ | --------------------------- | ---------------------------------------------------------------- |
| **Compute Engine**     | IaaS — you manage the OS  | No                | VM                           | Full OS control, custom/legacy software, lift-and-shift          |
| **Google Kubernetes Engine (GKE)** | Managed container orchestration | No (Standard) / Yes (Autopilot, per-pod) | Container, orchestrated by Kubernetes | Complex multi-service apps, need fine-grained orchestration control |
| **App Engine**         | PaaS                       | Yes (Standard env) | Source code / container (Flexible env) | Classic web apps, fastest path from code to URL                  |
| **Cloud Run**          | Serverless containers      | Yes               | Container image              | Stateless HTTP/event-driven services, request-based billing      |
| **Cloud Functions**    | Serverless, FaaS           | Yes               | Single function              | Small event-triggered logic (a file upload, a Pub/Sub message)   |

### The "how much do you manage" spectrum

```
Compute Engine → GKE → App Engine Flexible → Cloud Run → App Engine Standard → Cloud Functions
(most control,                                                          (least control,
 most ops burden)                                                        least ops burden)
```

## Scenarios — Google Cloud Compute Services

| Scenario                                                                       | Answer                                        |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Need root/OS-level access to install a custom kernel module                          | Compute Engine                                        |
| Deploying dozens of interdependent microservices needing fine control over networking/scheduling | GKE                                                    |
| Simplest possible path from source code to a running web app                          | App Engine Standard                                    |
| A stateless HTTP API that should scale to zero when idle, billed per request           | Cloud Run                                              |
| Run a small snippet of code in response to a file landing in a Cloud Storage bucket    | Cloud Functions                                        |
| Need a specific runtime version/library App Engine Standard doesn't support             | App Engine Flexible (runs in a container) or Cloud Run |
| Team already has Docker images and wants zero server management                        | Cloud Run                                              |
| Need to run existing on-prem VM workloads with minimal changes                          | Compute Engine (lift-and-shift)                        |

## Next

Continue to **Section 14 — Getting Started with App Engine**.
