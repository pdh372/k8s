# Section 14 — Getting Started with App Engine

## Getting Started with App Engine

**App Engine** is GCP's original PaaS — deploy your source code (or a container) and Google handles provisioning, scaling, and load balancing entirely. It's the fastest path from code to a running, scaled, HTTPS-served application.

## App Engine Environments — Standard vs Flexible

| Aspect                | Standard environment                                | Flexible environment                                  |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| **Runtime**             | Fixed set of supported language runtimes/versions        | Any runtime, via a custom Docker container                    |
| **Scale to zero**       | Yes — instances can go to zero when there's no traffic    | No — always keeps at least one instance running               |
| **Startup time**        | Seconds (sandboxed runtime)                                | Minutes (starts a full container/VM)                          |
| **Underlying infra**    | Sandboxed runtime, no direct OS access                     | Runs on Compute Engine VMs — SSH access available             |
| **Best for**             | Standard web apps in a supported language, cost-sensitive, bursty traffic | Apps needing custom system libraries, background threads, non-HTTP network access |

## Application Component Hierarchy

```
Application (1 per project — created once, cannot be undone/moved to another project)
└── Service (formerly "module") — a logical component, e.g. "default", "api", "worker"
    └── Version — a specific deployment of a service's code
        └── Instance — an actual running instance serving that version
```

Key facts:

- An **Application** is a **project-level singleton** — one App Engine app per GCP project, and once you pick its region, that's permanent.
- **Traffic splitting** happens at the Version level — you can send e.g. 90% of traffic to `v1` and 10% to `v2` for canary testing, without touching DNS or a separate load balancer.

## App Engine — Remember

- Choosing App Engine's region locks in the region for the *entire application* — plan ahead.
- Standard environment idle instances can literally cost $0 (scale to zero); Flexible always has a baseline running cost.
- App Engine gives you an HTTPS endpoint and custom domain support out of the box — no separate load balancer setup required for the basic case.

## Getting Started with App Engine — Scenarios

| Scenario                                                             | Answer                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| Simple Python web app, bursty traffic, wants to minimize idle cost           | App Engine Standard                                   |
| App needs a custom runtime/library the Standard environment doesn't support | App Engine Flexible                                   |
| Need to gradually roll out a new version to a % of live traffic              | App Engine traffic splitting between Versions          |
| App needs to open non-HTTP sockets or write to local disk extensively        | App Engine Flexible (or reconsider Cloud Run/GKE)      |

## Playing with Google App Engine

```bash
# Initialize the App Engine application for this project (one-time, picks the region)
gcloud app create --region=us-central

# Deploy from source (reads app.yaml in the current directory)
gcloud app deploy

# Open the deployed app in a browser
gcloud app browse

# Stream logs
gcloud app logs tail -s default
```

### Exploring App Engine

```bash
gcloud app versions list                     # all deployed versions
gcloud app services list                     # all services
gcloud app instances list                    # all running instances
gcloud app describe                          # application-level detail (region, etc.)
```

## Next

Continue to **Section 15 — Going Deeper with App Engine**.
