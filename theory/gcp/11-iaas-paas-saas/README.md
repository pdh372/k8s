# Section 11 — Getting Started with IaaS, PaaS and SaaS

## Getting Started with Managed Services

Every cloud service sits on a spectrum of **how much you manage vs how much the provider manages**. The more the provider manages, the less flexible but less operational burden for you.

## IaaS and PaaS Examples — App and Database

| Layer                                  | Compute example       | Database example                        |
| ------------------------------------------ | ------------------------ | -------------------------------------------- |
| **IaaS (Infrastructure as a Service)**    | Compute Engine (you manage the OS, patching, runtime) | A database you install yourself on a Compute Engine VM |
| **PaaS (Platform as a Service)**          | App Engine, Cloud Run (you manage code only) | Cloud SQL, Cloud Spanner (Google manages the OS, patching, HA, backups — you manage schema/data) |
| **SaaS (Software as a Service)**          | Gmail, Google Workspace | — you don't manage anything, just use the product |

## IaaS and PaaS — Responsibilities

| Responsibility          | IaaS (Compute Engine) | PaaS (App Engine / Cloud SQL) |
| --------------------------- | ------------------------- | ------------------------------- |
| Physical hardware, data center | Google                  | Google                           |
| Virtualization, networking     | Google                  | Google                           |
| OS patching                    | **You**                 | Google                           |
| Runtime (language, DB engine)  | **You**                 | Google                           |
| Scaling                        | **You** (manually, or via MIG/autoscaler you configure) | Google (mostly automatic) |
| Your application code / data   | **You**                 | **You**                          |

This is the cloud version of the classic "shared responsibility model" — the further up the stack (IaaS → PaaS → SaaS), the more Google owns, the less you own, and the less control you have.

## Getting Started with SaaS

**SaaS (Software as a Service)** — a complete, ready-to-use application, delivered over the internet. You don't manage any infrastructure, code, or scaling — you just use it (and configure it, e.g. user permissions). Examples: Gmail, Google Docs, Salesforce.

## Service Categories — Scenarios

| Scenario                                                                    | Answer                              |
| -------------------------------------------------------------------------------- | ------------------------------------------ |
| Team wants full OS-level control to run a custom, unusual software stack           | IaaS — Compute Engine                       |
| Team wants to deploy code without managing servers, patching, or scaling           | PaaS — App Engine / Cloud Run                |
| Company just needs email and office docs, no development involved                  | SaaS — Google Workspace                      |
| Team wants a managed relational database without administering the DB engine itself | PaaS — Cloud SQL                             |
| Team needs to bring a custom kernel module or specific OS version                  | IaaS — Compute Engine (only layer giving OS-level access) |

## Next

Continue to **Section 12 — Getting Started with Serverless, Containers and Container Orchestration**.
