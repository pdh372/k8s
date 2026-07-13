# Section 17 — Getting Started with Google Cloud Run

## Getting Started with Cloud Run

**Cloud Run** runs a container image as a fully-managed, serverless HTTP service — no cluster to manage, scales automatically (including to zero), and you're billed only for the CPU/memory actually used while handling requests.

## Cloud Run — Services vs Jobs vs Worker Pools vs Functions

| Type              | Trigger                                | Runs how long                            | Use case                                                  |
| -------------------- | ------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| **Service**        | Incoming HTTP request(s)                    | As long as it takes to handle each request     | Web apps, REST/gRPC APIs                                          |
| **Job**            | Manually, on a schedule, or triggered        | Runs to completion, then stops (no HTTP server) | Batch processing, one-off scripts, DB migrations                  |
| **Worker Pool**    | Pulls from a queue continuously (not request-driven) | Runs continuously                              | Background processing off a queue (e.g. Pub/Sub) with no HTTP endpoint |
| **Function** (Cloud Run functions) | A single event (HTTP, Pub/Sub, Storage, etc.) | Just that one invocation                      | Small, single-purpose event handlers — like Cloud Functions, now unified under Cloud Run |

## Typical Steps in Using Cloud Run

1. Write your app, listening on the port given by the `PORT` environment variable (Cloud Run injects it — don't hardcode a port).
2. Package it as a container image (`Dockerfile` → build → push to Artifact Registry).
3. Deploy: `gcloud run deploy` — Cloud Run pulls the image and starts serving.
4. Cloud Run automatically scales instances (including to zero) based on incoming request volume.

## Component Hierarchy

```
Service (e.g. "my-api")
└── Revision — an immutable snapshot created on each deploy
    └── Instance — an actual running container instance of that revision
```

Every deploy creates a new **Revision**; like App Engine Versions, you can split traffic between revisions for canary rollouts, and roll back instantly by shifting traffic to a previous revision.

## Playing with Google Cloud Run

```bash
# Deploy directly from source (Cloud Run builds the container for you via Buildpacks)
gcloud run deploy my-service \
  --source=. \
  --region=us-central1 \
  --allow-unauthenticated

# Or deploy a pre-built image
gcloud run deploy my-service \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/repo/my-image:latest \
  --region=us-central1

gcloud run services describe my-service --region=us-central1
gcloud run services list
```

`--allow-unauthenticated` makes the service publicly reachable; omit it to require IAM-based authentication (`Cloud Run Invoker` role) for every caller.

## Playing with a Cloud Run Function

```bash
gcloud run deploy my-function \
  --source=. \
  --function=handler_name \
  --region=us-central1 \
  --allow-unauthenticated
```

This deploys a single function (event-triggered), rather than a full container service — the modern replacement for standalone Cloud Functions, now built on the same Cloud Run infrastructure.

## Next

Continue to **Section 18 — Going Deeper with Google Cloud Run**.
