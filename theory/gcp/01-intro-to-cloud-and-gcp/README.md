# Section 1 — Introduction to Cloud and Google Cloud

## Cloud Computing Fundamentals

**Cloud computing** is on-demand delivery of IT resources — compute, storage, databases, networking — over the internet, with pay-as-you-go pricing. You rent infrastructure from a provider instead of buying and running it yourself.

### Why enterprises used to need thousands of servers

Before the cloud, every company that wanted to run a website, a database, or an app had to buy and operate its own physical servers:

- **Peak capacity, all the time** — you size hardware for your busiest day of the year (Black Friday, tax deadline), then that capacity sits mostly idle the other 364 days.
- **Redundancy** — one server is a single point of failure, so you buy at least two of everything (compute, power supplies, network links).
- **Growth headroom** — you over-provision today for the traffic you expect in 2–3 years, because ordering and racking new hardware takes months.

### Challenges with managing your own data center

| Challenge                  | Detail                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| **Capital expense (CapEx)** | Servers, racks, cooling, power — all paid upfront, before you've earned a dollar from them. |
| **Capacity planning**       | Guess wrong and you either overspend on idle hardware or run out of capacity mid-launch.    |
| **Physical operations**     | Power, cooling, fire suppression, physical security, hardware failures at 3am.               |
| **Time to provision**       | Ordering, shipping, and racking a new server can take weeks to months.                       |
| **Staffing**                | You need people on-site to rack, cable, and replace failed hardware.                         |
| **Geographic reach**        | Serving users on another continent means building — or renting — a data center there too.    |

### What is "the Cloud"

The cloud is someone else's data center (AWS, Google, Azure, ...) rented to you as a service, accessed over the internet, billed by usage instead of ownership. The provider owns and operates the physical hardware; you consume virtual resources on top of it.

### Advantages of Cloud

| Advantage                  | What it means in practice                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| **Pay-as-you-go**           | OpEx instead of CapEx — pay for what you use, stop paying when you stop using it.        |
| **Elasticity**              | Scale resources up for a traffic spike, then back down — automatically, in minutes.       |
| **No hardware ownership**   | No racking, cabling, cooling, or replacing failed disks — the provider handles it.        |
| **Global reach in minutes** | Deploy into a region on another continent without building anything physical there.       |
| **Managed services**        | Let the provider run your database, message queue, or Kubernetes control plane for you.   |
| **Faster time to market**   | Spin up infrastructure in minutes instead of waiting weeks for hardware procurement.       |

> **Exam framing:** when a scenario describes unpredictable traffic, global users, or a team that doesn't want to manage hardware — "cloud" (and usually "managed service") is the expected answer.

## Cloud Terminology to Remember

### The 5 essential characteristics of cloud (NIST definition)

| Characteristic            | Meaning                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **On-demand self-service** | Provision resources yourself (console, CLI, API) — no human approval/ticket needed.   |
| **Broad network access**   | Available over the internet from any standard device.                                 |
| **Resource pooling**       | The provider's hardware is shared across many customers ("multi-tenant"), invisibly.  |
| **Rapid elasticity**       | Scale resources up or down quickly, often automatically, to match demand.             |
| **Measured service**       | Usage is metered — you can see, and pay for, exactly what you consumed.               |

### CapEx vs OpEx

- **CapEx (Capital Expenditure)** — buying hardware upfront; it's an asset you depreciate over years. Traditional data centers.
- **OpEx (Operational Expenditure)** — ongoing running cost, billed as you go. Cloud spend is OpEx — no upfront asset, no depreciation schedule.

### Scaling: vertical vs horizontal

| Type                   | What it means                                              | Limit                                            |
| ------------------------ | -------------------------------------------------------------- | --------------------------------------------------- |
| **Vertical scaling**    | Add more CPU/RAM to an existing machine ("scale up")         | Hits a hardware ceiling; usually needs a restart    |
| **Horizontal scaling**  | Add more machines running the same workload ("scale out")    | Effectively unlimited; needs a load balancer in front |

Cloud strongly favors horizontal scaling — it's what Managed Instance Groups, GKE node pools, and Cloud Run concurrency are all built around.

### Availability, durability, and SLA

- **Availability** — the percentage of time a service is usable (e.g. 99.9% uptime = ~8.7 hours of downtime/year).
- **Durability** — the probability data survives over time without being lost (e.g. Cloud Storage's famously high durability comes from redundant copies across disks/zones).
- **SLA (Service Level Agreement)** — the provider's contractual promise for availability/performance, usually with service credits if they miss it.
- **Latency** — the delay between a request and its response, driven mainly by physical distance. Placing resources in a region close to your users is the main lever you control.

### Scenarios

| Scenario                                                                     | Concept being tested                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| An e-commerce site needs 10x the servers only during a 48-hour flash sale     | Elasticity / horizontal scaling                               |
| Finance wants no upfront hardware purchase, cost tied to actual usage         | OpEx / pay-as-you-go                                          |
| A single VM is maxed out on CPU during business hours                        | Vertical scaling (short term) vs horizontal scaling (long term) |
| A service must promise 99.95% uptime to a customer contractually              | SLA                                                            |
| An object store must guarantee data is never silently lost                   | Durability                                                     |

## Google Cloud: An Introduction

**Google Cloud Platform (GCP)** is Google's public cloud — the same global network and infrastructure that runs Google Search, YouTube, and Gmail, rented out to run your workloads.

### Service categories you'll meet in this course

| Category                | Examples                                                              |
| -------------------------- | -------------------------------------------------------------------------- |
| **Compute**              | Compute Engine (VMs), Google Kubernetes Engine, Cloud Run, App Engine       |
| **Storage**              | Cloud Storage (objects), Persistent Disks (block), Filestore (file)        |
| **Databases**            | Cloud SQL, Cloud Spanner, Firestore, Bigtable, BigQuery, Memorystore        |
| **Networking**           | VPC, Cloud Load Balancing, Cloud DNS, Cloud VPN/Interconnect               |
| **Identity & security**  | Cloud IAM, Cloud KMS                                                       |
| **Operations**           | Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler               |

Most services have a **managed** (Google runs it) and a **self-managed** (you run it yourself on a VM) option. Each category above gets its own dedicated section later in this course.

### How you interact with GCP

| Interface                              | When to use it                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Cloud Console**                       | Web UI — good for exploring, one-off tasks, visualizing resources.                          |
| **Cloud Shell**                         | A free browser-based VM with `gcloud`, `kubectl`, and other tools pre-installed — zero setup. |
| **gcloud CLI**                          | Command-line tool for scripting and automating GCP — local install or via Cloud Shell.       |
| **Client libraries / REST / RPC API**   | For calling GCP services directly from your application code.                                |

### Free ways to learn

- **Free tier** — a set of GCP products with an always-free monthly usage allowance (e.g. a small Compute Engine VM, some Cloud Storage), which doesn't expire.
- **Free trial credit** — a one-time credit for new accounts (check the current amount/duration on the GCP signup page — it changes over time) to explore paid products without charge.

> **Cost discipline is a running theme in this course.** Every hands-on section that spins up billable resources ends with a cleanup step — get in the habit of tearing things down the moment you're done experimenting.

## Creating a GCP Project

A **Project** is the base container for every GCP resource — every VM, bucket, or database you create belongs to exactly one project. Projects are also the boundary for billing and IAM permissions.

### Project ID vs Project Name vs Project Number

| Field               | Mutable?        | Detail                                                                                                  |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Project Name**    | Yes              | A friendly display label. Can be anything, can be changed anytime.                                        |
| **Project ID**      | No (permanent)   | Globally unique across ALL of GCP. Used in CLI commands, URLs, resource names. Choose carefully — can't rename it, only delete and recreate. |
| **Project Number**  | No               | An auto-assigned numeric ID, used internally and by some APIs.                                            |

> **Exam trap:** "Can you rename a Project ID?" — no. If you need a different ID, you create a new project and migrate resources into it.

### Create a project — Console

1. Go to the Cloud Console project selector.
2. Click **New Project**.
3. Enter a **Project name**; note the auto-generated **Project ID** (edit it now if you want a custom one — this is your only chance).
4. Choose a billing account and organization/folder if applicable, then **Create**.

### Create a project — gcloud CLI

```bash
gcloud projects create my-project-id-12345 --name="My Learning Project"
gcloud config set project my-project-id-12345
gcloud config get-value project
```

### Link a billing account

Most APIs won't work until billing is enabled, even within the free tier.

```bash
gcloud billing accounts list
gcloud billing projects link my-project-id-12345 \
  --billing-account=XXXXXX-XXXXXX-XXXXXX
```

### Set a budget alert (do this before anything else)

Console: **Billing → Budgets & alerts → Create Budget**. Scope it to your project, set a small amount (e.g. $5–10), keep the default alert thresholds (50%/90%/100%). This emails you — it does **not** stop spending automatically, so it's a tripwire, not a hard cap.

### `gcloud init` — first-time interactive setup

```bash
gcloud init
```

Walks you through: logging in, picking/creating a project, and setting a default region/zone. Useful the first time you set up `gcloud` on a new machine.

### Cleanup

Delete a project you no longer need (stops all billing for everything inside it, after a ~30-day recovery window):

```bash
gcloud projects delete my-project-id-12345
```

## Next

Continue to **Section 2 — Google Cloud Regions and Zones**.
