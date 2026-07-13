# Section 10 — Managed Instance Groups From Command Line

## MIG From Command Line — Fundamentals

```bash
# Create a regional MIG from a template
gcloud compute instance-groups managed create web-mig \
  --template=web-template \
  --size=3 \
  --region=us-central1

# Resize
gcloud compute instance-groups managed resize web-mig \
  --region=us-central1 --size=5

# List instances currently in the group
gcloud compute instance-groups managed list-instances web-mig \
  --region=us-central1

# Delete
gcloud compute instance-groups managed delete web-mig --region=us-central1
```

## MIG From Command Line — Performing Updates

```bash
# Point the MIG at a new template version
gcloud compute instance-groups managed set-instance-template web-mig \
  --template=web-template-v2 \
  --region=us-central1
```

`set-instance-template` alone only affects **future** instances (new ones created by scaling) — it does **not** touch existing running instances. To actually replace the running fleet, trigger a rolling update.

## MIG From Command Line — Rolling Actions

```bash
# Roll the new template out across existing instances, zero downtime
gcloud compute instance-groups managed rolling-action start-update web-mig \
  --region=us-central1 \
  --version=template=web-template-v2 \
  --max-surge=2 \
  --max-unavailable=0

# Check rollout progress
gcloud compute instance-groups managed describe web-mig --region=us-central1

# Pause / resume / cancel an in-progress rollout
gcloud compute instance-groups managed rolling-action stop-proactive-update web-mig --region=us-central1
gcloud compute instance-groups managed rolling-action resume web-mig --region=us-central1

# Manually replace specific instances (e.g. force a refresh)
gcloud compute instance-groups managed rolling-action replace web-mig \
  --region=us-central1
```

## Scenarios

| Scenario                                                              | Answer                                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| New template set but running instances still show the old version         | Expected — `set-instance-template` doesn't affect existing instances; run a rolling update to actually replace them |
| Need to roll out a fix urgently and can tolerate brief reduced capacity     | `rolling-action start-update` with `--max-unavailable` > 0            |
| Need zero downtime during rollout                                          | `rolling-action start-update` with `--max-unavailable=0`, `--max-surge` > 0 |
| Rollout is causing problems and needs to stop                              | `rolling-action stop-proactive-update`                                |

## Next

Continue to **Section 11 — Getting Started with IaaS, PaaS and SaaS**.
