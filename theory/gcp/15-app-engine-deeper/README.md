# Section 15 — Going Deeper with App Engine

## Options for Scaling Instances

| Scaling type          | Detail                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| **Automatic scaling**    | App Engine adds/removes instances based on traffic, latency, and request queue — the default; supports scale-to-zero on Standard. |
| **Basic scaling**        | Creates instances only when requests arrive, kills them after an idle timeout you set — good for backend work triggered on demand. |
| **Manual scaling**       | You specify a fixed number of instances — for stateful workloads needing predictable instance count. |

## `app.yaml` Reference

The deployment config file every App Engine service needs, at the root of the source directory:

```yaml
runtime: python312
service: default            # omit for the default service

instance_class: F2

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.6

env_variables:
  DB_HOST: "10.0.0.5"

handlers:
  - url: /.*
    script: auto
```

Key fields: `runtime` (language/version), `service` (which service this deploys to), `instance_class` (size), scaling block, `env_variables`, and `handlers` (URL routing rules, mostly relevant in older/standard configurations).

## Request Routing

Incoming requests to `PROJECT_ID.appspot.com` are routed:

1. To a **service** — either the `default` service, or `service-dot-PROJECT_ID.appspot.com` for a named one.
2. To a **version** within that service — either the version marked as receiving traffic, or split across multiple versions by percentage (traffic splitting), or targeted directly via `version-dot-service-dot-PROJECT_ID.appspot.com`.
3. To an **instance** of that version, chosen by App Engine's own load balancing.

## Deploying New Versions Without Downtime

```bash
# Deploy as a new version WITHOUT sending it traffic yet
gcloud app deploy --version=v2 --no-promote

# Test it directly via its version-specific URL
# https://v2-dot-default-dot-PROJECT_ID.appspot.com

# Once verified, gradually shift traffic (canary release)
gcloud app services set-traffic default --splits=v1=0.9,v2=0.1

# When confident, cut over fully
gcloud app services set-traffic default --splits=v2=1
```

Because each version is independently deployed and old versions keep running until you delete them, this gives you an instant rollback path — just shift traffic back to the old version.

## Scenarios

| Scenario                                                                | Answer                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Backend job service that should scale down to zero when there's no work         | Basic scaling                                                       |
| Need predictable, fixed instance count for a stateful legacy app                 | Manual scaling                                                       |
| Roll out a risky change to only 5% of users first                                | Deploy with `--no-promote`, then `set-traffic` with a small split    |
| A bad deploy needs to be rolled back immediately                                 | `set-traffic` back to the previous version (near-instant, no rebuild) |

## Releasing New Versions — Demo

```bash
gcloud app deploy --version=v2
gcloud app versions list
gcloud app services set-traffic default --splits=v2=1
gcloud app versions delete v1 --service=default   # cleanup once confident
```

## Managing Multiple Services

```bash
# service.yaml for a second service specifies: service: api
gcloud app deploy api/app.yaml

gcloud app services list
gcloud app services describe api
gcloud app services delete api
```

Each service scales, versions, and deploys completely independently — this is how a single App Engine application hosts multiple logically separate components (e.g. `default` for the web frontend, `api` for a backend API).

## Next

Continue to **Section 16 — Managing App Engine using gcloud**.
