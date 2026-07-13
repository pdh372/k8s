# Section 40 — Operations in Google Cloud Platform

## Getting Started with Google Cloud Monitoring

**Cloud Monitoring** collects metrics (CPU, memory, request latency, custom application metrics) from GCP resources, builds dashboards, and fires **alerts** when a metric crosses a threshold.

```bash
gcloud monitoring dashboards list
# Alerting policies are typically created via Console or Terraform for their JSON complexity,
# but can be listed/described via:
gcloud alpha monitoring policies list
```

## Getting Started with Google Cloud Logging

**Cloud Logging** collects, stores, and lets you search structured log entries from every GCP service and your own applications.

```bash
gcloud logging read 'resource.type="gce_instance"' --limit=20
gcloud logging read 'severity>=ERROR' --limit=20
```

## Cloud Logging — Audit Logs

**Audit Logs** record *who did what, where, and when* across your GCP resources — automatically generated, not something you write yourself.

| Audit log type              | Contains                                                    | Enabled by default? |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| **Admin Activity**              | Configuration/metadata changes (creating a VM, changing an IAM policy) | Yes, always on, can't be disabled |
| **Data Access**                 | Reads/writes of user data (e.g. reading an object from Cloud Storage) | Mostly off by default (high volume) — enable per-service if needed |
| **System Event**                | Google-initiated actions (e.g. a live migration)                     | Yes, always on          |
| **Policy Denied**               | A request denied due to a security policy (e.g. VPC Service Controls) | Yes, always on          |

> **Exam framing:** "Who deleted this VM?" → Admin Activity audit log, always available, no setup needed.

## Cloud Logging — Routing Logs and Exports

Logs can be routed via **sinks** to long-term destinations for retention, analysis, or compliance beyond Cloud Logging's default retention window:

```bash
gcloud logging sinks create my-sink \
  storage.googleapis.com/my-log-archive-bucket \
  --log-filter='resource.type="gce_instance"'

gcloud logging sinks list
```

| Destination        | Use case                                          |
| ---------------------- | ------------------------------------------------------ |
| **Cloud Storage**      | Cheap, long-term archival                                |
| **BigQuery**           | SQL-based analysis of log data                            |
| **Pub/Sub**             | Stream to a third-party SIEM or custom pipeline           |

## Demo — Cloud Logging + Cloud Monitoring Together

A common pattern: a Cloud Function triggered by a log-based metric or a Pub/Sub-routed log entry, doing custom processing/alerting — e.g. export specific audit log entries to a bucket for a compliance pipeline, using a sink into Pub/Sub that triggers a function.

## Getting Started with Google Cloud Trace

**Cloud Trace** captures **latency data** across a request as it flows through multiple services — showing exactly where time is spent in a distributed call chain (directly solving the "distributed debugging" pain point raised for microservices in Section 12).

```bash
gcloud trace traces list --limit=10
```

## Google Cloud Debugger — Deprecated

> Cloud Debugger (live production debugging/breakpoints without stopping the app) has been **shut down by Google** and is no longer available. If you see it referenced in older material, treat it as historical — it is not part of the current GCP product lineup or exam surface.

## Getting Started with Google Cloud Profiler

**Cloud Profiler** continuously analyzes CPU and memory usage *within* your running application's code (which functions consume the most resources) — for performance optimization, distinct from Trace (which looks at cross-service request latency) and Monitoring (which looks at infrastructure-level metrics).

## Scenarios — Operations in GCP

| Scenario                                                                | Answer                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Need to know who deleted a specific Compute Engine instance                        | Admin Activity audit log                                |
| Need to see where latency is coming from across 5 microservices handling one request | Cloud Trace                                              |
| Need to retain logs for 7 years for compliance, beyond default retention           | Logging sink → Cloud Storage                             |
| App is slow; need to know which function in the code is the bottleneck             | Cloud Profiler                                            |
| Need an alert when error rate crosses a threshold                                  | Cloud Monitoring alerting policy                          |

## Next

Continue to **Section 41 — Organizations and IAM: Organizing Google Cloud Resources**.
