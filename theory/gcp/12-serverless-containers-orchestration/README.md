# Section 12 — Getting Started with Serverless, Containers and Container Orchestration

## Getting Started with Serverless

**Serverless** doesn't mean "no servers" — it means you never think about servers. The provider handles provisioning, scaling (including scaling to zero when idle), and patching entirely; you deploy code or a container and pay only while it's actually executing.

### Serverless is NOT just compute

Serverless is a deployment model that shows up across categories, not just "run my code":

| Category    | Serverless example                              |
| ------------- | -------------------------------------------------- |
| Compute      | Cloud Run, Cloud Functions                          |
| Database     | Firestore, BigQuery (serverless SQL analytics)      |
| Messaging    | Pub/Sub                                             |
| Data pipelines | Cloud Dataflow                                    |

### Serverless variations

| Variation                  | Detail                                                                     |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **FaaS (Functions as a Service)** | Deploy a single function, triggered by an event (HTTP request, Pub/Sub message, file upload). Cloud Functions. |
| **Serverless containers**  | Deploy a full container image, provider handles scaling/infra. Cloud Run.          |
| **Serverless data services** | You query/use the service, provider handles all underlying infrastructure. BigQuery, Firestore. |

## Getting Started with Containers

### Challenges with traditional deployment

Before containers, "it works on my machine" was a constant problem — an app's behavior depended on the exact OS packages, library versions, and config of whatever machine it ran on. Moving from dev → staging → production risked subtle environment differences breaking things.

**Containers solve this** by packaging the application together with everything it needs to run (code, runtime, system libraries, config) into one portable, immutable image — it behaves identically everywhere.

### How containers work

A container shares the **host machine's OS kernel** but gets an isolated filesystem, process space, and network namespace via OS-level features (Linux namespaces + cgroups). This is why containers start in milliseconds and use far less overhead than a VM.

### Virtual Machines vs Containers

| Aspect              | Virtual Machine                          | Container                                    |
| ---------------------- | ------------------------------------------- | ------------------------------------------------ |
| **Isolation unit**    | Full OS (own kernel) via a hypervisor      | Process, isolated via OS kernel features (shares host kernel) |
| **Startup time**      | Minutes (boots a full OS)                   | Seconds or less                                   |
| **Size**              | GBs (full OS image)                          | MBs (just app + dependencies)                     |
| **Density**            | Fewer per host (each needs full OS overhead) | Many more per host                                |
| **Isolation strength** | Strong (separate kernel)                     | Weaker than a VM (shared kernel) — matters for multi-tenant security decisions |

### Containers — Summary

Containers give you: portability (build once, run anywhere), consistency (same image dev → prod), and efficiency (lightweight, fast startup, high density) — at the cost of slightly weaker isolation than a full VM.

## Getting Started with Microservices

### Monolith applications

A **monolith** is a single deployable unit containing all of an application's functionality (UI, business logic, data access) — simple to develop and deploy early on, but scaling, deploying, and maintaining it gets harder as the codebase grows (one team's change can break unrelated functionality; you must scale the *entire* app even if only one part is under load).

### What exactly is a microservice

A **microservice architecture** splits an application into small, independently deployable services, each owning a specific business capability, communicating over the network (usually HTTP/gRPC).

### Why choose microservices

| Benefit                  | Detail                                                                    |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Independent deployment** | Ship one service without redeploying the whole app.                            |
| **Independent scaling**    | Scale only the service under load, not everything.                              |
| **Technology flexibility** | Each service can use a different language/stack if needed.                       |
| **Fault isolation**        | One service crashing doesn't necessarily take down the whole app.                |
| **Team autonomy**          | Different teams own different services, ship independently.                      |

### Challenges with microservices architectures

Splitting a monolith into microservices trades one set of problems for another:

- **Operational complexity** — now you have dozens/hundreds of deployables instead of one.
- **Network reliability** — inter-service calls can fail, time out, or be slow (a monolith's function calls never had this problem).
- **Distributed debugging** — a single user request might touch 10 services; tracing what went wrong is much harder (this is exactly why Cloud Trace / Cloud Logging / observability matters — Section 26).
- **Service discovery & communication** — services need to find and talk to each other reliably.

### Microservices Solutions — Containers and Orchestration

Containers are the natural packaging unit for microservices (one service = one container image). But running dozens of containers, keeping them healthy, scaling them independently, and routing traffic between them by hand doesn't work at any real scale — that's the exact problem **container orchestration** (Kubernetes / GKE, covered starting Section 21) solves: automated deployment, scaling, networking, and self-healing for a fleet of containers.

## Next

Continue to **Section 13 — Exploring Google Cloud Managed Services for Compute**.
