# Section 18 — Going Deeper with Google Cloud Run

## Cloud Run — Deployment Options

| Option                     | Detail                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| **Deploy from source**       | `gcloud run deploy --source=.` — Cloud Run builds the container for you via Buildpacks, no Dockerfile needed. |
| **Deploy a pre-built image** | `gcloud run deploy --image=...` — you built and pushed the image yourself (Artifact Registry). |
| **Continuous deployment**    | Connect a GitHub/Cloud Source Repos repo — Cloud Run auto-builds and deploys on every push. |

### Deployment options — scenarios

| Scenario                                                            | Answer                                       |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| Team has no Dockerfile and wants the fastest path to deploy               | Deploy from source (Buildpacks)                       |
| Team already has a hardened, custom-built image                            | Deploy a pre-built image                              |
| Want every git push to main to auto-deploy                                 | Continuous deployment from a connected repo            |

## Exploring Cloud Run Scaling

Cloud Run scales **instances** based on incoming request volume:

```bash
gcloud run deploy my-service \
  --min-instances=0 \
  --max-instances=20 \
  --region=us-central1
```

| Setting             | Effect                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `--min-instances=0`   | Default — scales fully to zero when idle (no cost, but a "cold start" delay on the next request). |
| `--min-instances=1+`  | Keeps at least N instances always warm — avoids cold starts, costs more (always-on baseline). |
| `--max-instances`     | Caps how far it can scale out — a safety limit against runaway cost/traffic spikes. |

## Configuring Concurrency

**Concurrency** = how many simultaneous requests one container instance can handle before Cloud Run starts a new instance.

```bash
gcloud run deploy my-service --concurrency=80
```

- **Default is 80.** Higher concurrency = fewer instances needed for the same load = cheaper, but only safe if your app is actually capable of handling multiple requests in parallel (e.g. non-blocking I/O).
- Set `concurrency=1` for apps that can only safely handle one request at a time (e.g. some legacy single-threaded code).

## Pricing Options for Cloud Run

| Model                     | Detail                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| **Request-based billing**     | Default — pay only for CPU/memory while actively handling a request (CPU throttled to ~0 between requests). |
| **Instance-based billing**    | CPU is always allocated (not throttled between requests) — for workloads doing background work outside of request handling; costs more since it's billed for the instance's full uptime, not just active-request time. |

## Cloud Run — Scenarios

| Scenario                                                                  | Answer                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Latency-sensitive API, cold starts unacceptable                                    | Set `min-instances >= 1`                                       |
| Service does background work (e.g. a queue listener) even between requests          | Instance-based billing                                          |
| App is single-threaded and cannot safely handle 2 requests at once on one instance   | `--concurrency=1`                                               |
| Want to cap cost during an unexpected traffic spike                                 | `--max-instances`                                               |

## Serving Traffic From Multiple Regions

Cloud Run services are regional. For multi-region resilience/latency, deploy the same service to multiple regions and put a **global external HTTP(S) Load Balancer** in front, using a **Serverless NEG (Network Endpoint Group)** per region as the backend — the load balancer then routes each user to their nearest healthy region automatically.

## Next

Continue to **Section 19 — Managing Google Cloud Run using gcloud**.
