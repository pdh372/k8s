# Section 4 — Managing VM Groups with Instance Groups

## What is an Instance Group

An **Instance Group** is a collection of VMs managed as a single unit. Two flavors:

| Type                         | Detail                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Unmanaged Instance Group**   | A loose grouping of arbitrary, dissimilar VMs — mostly for legacy/imported setups. No autoscaling, no self-healing. Avoid for new work. |
| **Managed Instance Group (MIG)** | A group of *identical* VMs created from one Instance Template — supports autoscaling, autohealing, rolling updates, and load balancing. This is what "instance group" means in practice on the exam and in real usage. |

## What is a Managed Instance Group (MIG)

A MIG takes an **Instance Template** (Section 3) and keeps a target number of identical VMs running from it, automatically:

- **Autoscaling** — adds/removes VMs based on CPU, load balancing capacity, or a custom Cloud Monitoring metric.
- **Autohealing** — if a health check fails on an instance, the MIG recreates it.
- **Rolling updates** — deploy a new Instance Template version across the group gradually, with zero downtime.
- **Load balancer integration** — a MIG is the standard backend for Cloud Load Balancing (Sections 6–7).

MIGs come in two placement modes:

| Mode          | Detail                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| **Zonal MIG**  | All instances in one zone. Simpler, but a zone outage takes the whole group down. |
| **Regional MIG** | Instances spread across multiple zones in a region — survives a single-zone outage. Preferred default for production. |

## Playing with Instance Groups

```bash
# Create a template first (see Section 3)
gcloud compute instance-templates create web-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud

# Create a regional Managed Instance Group from it
gcloud compute instance-groups managed create web-mig \
  --template=web-template \
  --size=3 \
  --region=us-central1

# Check status
gcloud compute instance-groups managed describe web-mig --region=us-central1
gcloud compute instance-groups managed list-instances web-mig --region=us-central1
```

Cleanup:

```bash
gcloud compute instance-groups managed delete web-mig --region=us-central1
gcloud compute instance-templates delete web-template
```

## Scenarios

| Scenario                                                                | Answer                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------ |
| Fleet of identical web servers that must scale with traffic               | Managed Instance Group (regional)                |
| A group of miscellaneous, hand-built VMs someone wants to view together    | Unmanaged Instance Group (legacy — not the exam-preferred answer for new designs) |
| One instance keeps crashing and needs automatic replacement                | MIG autohealing (requires a health check)         |
| Deploying instances behind a load balancer, spread across the region for resilience | Regional Managed Instance Group           |

## Next

Continue to **Section 5 — Going Deeper with Instance Groups**.
