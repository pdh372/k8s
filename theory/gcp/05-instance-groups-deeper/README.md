# Section 5 — Going Deeper with Instance Groups

## Key Configuration When Creating a MIG

| Setting                | Detail                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| **Instance Template**    | The blueprint every instance in the group is created from.                                       |
| **Target size**          | The number of instances to maintain (fixed, or a range if autoscaling is enabled).                |
| **Location**             | Single zone, or multiple zones within a region (regional MIG — recommended for resilience).       |
| **Autoscaling policy**   | Metric to scale on (CPU utilization, load balancing serving capacity, a custom Cloud Monitoring metric, or schedule-based) plus min/max instance bounds. |
| **Health check**         | An HTTP/TCP/gRPC probe used for **autohealing** — if it fails repeatedly, the MIG recreates that instance. |
| **Autohealing initial delay** | Grace period after an instance starts before health checks count against it (lets slow-starting apps boot). |

```bash
# Attach an autoscaling policy
gcloud compute instance-groups managed set-autoscaling web-mig \
  --region=us-central1 \
  --max-num-replicas=10 \
  --min-num-replicas=2 \
  --target-cpu-utilization=0.6

# Attach a health check for autohealing
gcloud compute health-checks create http web-health-check --port=80

gcloud compute instance-groups managed update web-mig \
  --region=us-central1 \
  --health-check=web-health-check \
  --initial-delay=60
```

## Managing a MIG — Rolling Updates

Deploying a new Instance Template version to an existing MIG is a **rolling update**, controlled by:

| Parameter          | Meaning                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **Max surge**        | How many *extra* instances above target size can be created during the rollout (faster rollout, briefly costs more). |
| **Max unavailable**  | How many existing instances can be down/updating at once (faster rollout, less capacity during it). |
| **Update type**      | **Proactive** (MIG replaces instances immediately) vs **Opportunistic** (only replaced when an instance is recreated for another reason, e.g. autohealing). |

```bash
gcloud compute instance-groups managed rolling-action start-update web-mig \
  --region=us-central1 \
  --version=template=web-template-v2 \
  --max-surge=2 \
  --max-unavailable=0
```

`--max-surge=2 --max-unavailable=0` = zero-downtime rollout (always at or above target capacity, never below).

### Stateful vs stateless MIGs

Regular MIGs are **stateless** — any instance can be destroyed and recreated identically. A **stateful MIG** preserves per-instance state (a specific disk, a specific hostname/IP) across recreation — used for workloads where instance identity matters (e.g. a sharded database node), though this is uncommon on the exam compared to stateless.

## Scenarios (Advanced)

| Scenario                                                                    | Answer                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Deploy a new app version with zero downtime                                    | Rolling update with `max-unavailable=0`, `max-surge` > 0            |
| Roll out fast and don't mind brief reduced capacity                            | Rolling update with `max-unavailable` > 0                           |
| An instance's app crashed and stopped responding to health checks              | Autohealing recreates it (needs a health check attached)             |
| Scale out only during business hours, scale in at night                       | Schedule-based autoscaling policy                                    |
| Scale based on requests-per-second the load balancer is sending, not CPU       | Load balancing serving capacity autoscaling signal                   |

## Next

Continue to **Section 6 — Getting Started with Key Load Balancing Concepts**.
