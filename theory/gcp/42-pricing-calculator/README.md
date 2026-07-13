# Section 42 — Exploring the Google Cloud Pricing Calculator

## Getting Started with the Pricing Calculator — GCE VMs

The **Google Cloud Pricing Calculator** (a free web tool at Google's pricing calculator site) lets you estimate monthly cost before provisioning anything — essential for cost-conscious design decisions and a recurring theme of this whole course.

For a Compute Engine estimate, you typically input:

- Machine family/type (or custom vCPU/RAM)
- Region (prices vary by region — Section 2)
- Usage: hours/month, or "730 hours" for always-on
- Any committed use / sustained use discount assumptions (Section 3)
- Boot disk type and size
- Any additional Persistent Disks

The calculator outputs an estimated monthly (and often hourly) cost breakdown by line item.

## Compute Options

The same calculator supports estimating **GKE**, **App Engine**, and **Cloud Run** costs too — each with inputs matching that service's actual billing model:

| Service         | What you input                                                    |
| ------------------- | -------------------------------------------------------------------- |
| **GKE**            | Node machine type/count (Standard) or expected Pod resource requests (Autopilot) |
| **App Engine**      | Instance class, expected instance-hours                                |
| **Cloud Run**        | Expected requests/month, average request duration, memory/CPU per request |

## Databases

For Cloud SQL, Spanner, BigQuery, etc., inputs shift to match each service's billing model — e.g. Cloud SQL asks for instance tier + storage + HA on/off; BigQuery asks for storage GB + expected query data scanned per month (since BigQuery bills primarily for data processed, not a running instance).

## Others

Storage (Cloud Storage: GB stored per class + operations count + egress), networking (egress traffic estimates), and other services follow the same pattern — the calculator's inputs always mirror how that specific service actually gets billed, which is exactly why understanding each service's pricing model (covered throughout this course) matters more than memorizing the calculator's UI.

> **Exam framing:** the exam won't ask you to operate the calculator UI — it tests whether you understand *what drives cost* for each service (uptime, storage class, data scanned, egress) well enough to reason about a scenario without a calculator at all.

## Next

Continue to **Section 43 — Going Advanced with Google Compute Engine**.
