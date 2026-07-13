# Section 26 — Exploring Observability for GKE (OpenTelemetry and more)

## What is Observability

**Observability** is the ability to understand what's happening inside a system from the outside, based on the data it produces — usually broken into three pillars:

| Pillar        | Answers                                        | GCP tool          |
| --------------- | ---------------------------------------------------- | -------------------- |
| **Metrics**    | "How much / how fast / how many?" (numeric time series) | Cloud Monitoring     |
| **Logs**        | "What exactly happened?" (discrete event records)     | Cloud Logging         |
| **Traces**      | "Where did time go across a multi-service request?"   | Cloud Trace            |

## Observability for GKE — Built-in Integrations

GKE ships with the **Cloud Operations for GKE** integration enabled by default on new clusters — no agent installation needed:

- **Cluster, Node, Pod, and container-level metrics** flow to Cloud Monitoring automatically (CPU, memory, restarts).
- **Container stdout/stderr logs** flow to Cloud Logging automatically, pre-labeled with Pod/Namespace/Container metadata for easy filtering.
- Pre-built **GKE dashboards** in the Console visualize cluster health without any setup.

## Why OpenTelemetry

**OpenTelemetry (OTel)** is a vendor-neutral, open-source standard for instrumenting applications to emit metrics, logs, and traces — one instrumentation API/SDK that can export to Cloud Monitoring/Trace, or to any other observability backend, without rewriting your app's instrumentation code.

Why it matters: hand-instrumenting for a single vendor's proprietary SDK locks you in; OpenTelemetry keeps your application code portable across observability backends — you only change the *exporter* configuration, not your app.

## Export and Integrate Observability Data

```bash
# Query recent logs for a specific GKE workload
gcloud logging read \
  'resource.type="k8s_container" AND resource.labels.namespace_name="default" AND resource.labels.pod_name=~"web-.*"' \
  --limit=50
```

Beyond the Console/`gcloud`, Cloud Monitoring and Logging data can be exported to:

- **BigQuery** — for long-term storage and SQL-based analysis.
- **Pub/Sub** — to stream into a third-party SIEM or custom pipeline.
- **Cloud Storage** — for cheap, long-term archival.

## Next

Continue to **Section 27 — Encryption in Google Cloud with Cloud KMS**.
