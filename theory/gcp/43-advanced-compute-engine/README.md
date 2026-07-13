# Section 43 — Going Advanced with Google Compute Engine

## Project and Instance Custom Metadata

**Metadata** is key-value data attached to a VM (or to the whole project, inherited by every VM in it) — readable from inside the VM via the special metadata server, without any authentication needed from localhost.

```bash
# Set instance-level metadata
gcloud compute instances add-metadata my-vm \
  --zone=us-central1-a \
  --metadata=environment=production,owner=platform-team

# Set project-wide metadata (applies to every VM in the project)
gcloud compute project-info add-metadata --metadata=org=acme-corp
```

From inside a VM:

```bash
curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/environment" \
  -H "Metadata-Flavor: Google"
```

This is exactly the mechanism behind **startup scripts** (Section 3) — a startup script is just metadata under the special key `startup-script` that the guest agent knows to execute on boot.

## Executing a Shutdown Script

Just like a startup script runs on boot, a **shutdown script** runs when the VM receives a stop/terminate signal — useful for graceful cleanup (deregistering from a load balancer, flushing logs, closing DB connections) before the VM actually stops.

```bash
gcloud compute instances add-metadata my-vm \
  --zone=us-central1-a \
  --metadata-from-file shutdown-script=shutdown.sh
```

> Shutdown scripts have a limited time budget before the platform force-stops the VM regardless — don't rely on them for anything slow.

## Troubleshooting VM Startup

| Check                                  | Command                                                        |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Full boot console output (including kernel/cloud-init logs) | `gcloud compute instances get-serial-port-output my-vm --zone=...` |
| Did the startup script itself run/error?       | Same serial port output — startup script output is logged there too  |
| Is the VM actually `RUNNING`?                  | `gcloud compute instances describe my-vm --zone=... --format="value(status)"` |

## SSH Access Options for Linux VMs

| Method                     | Detail                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **`gcloud compute ssh`**       | Simplest — automatically manages SSH keys and IAP tunneling for you.                     |
| **OS Login**                   | Ties SSH access directly to IAM — grant/revoke via IAM roles (`roles/compute.osLogin`), no manual key management. Recommended for teams. |
| **Metadata-based SSH keys**    | Manually add public keys via project/instance metadata — older approach, keys must be managed by hand. |
| **Identity-Aware Proxy (IAP) tunneling** | SSH to a VM with **no external IP at all** — traffic tunnels through IAP, authenticated by IAM, without opening any public port. |

## Connecting to Compute Engine VMs — Scenarios

| Scenario                                                             | Answer                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Team wants SSH access controlled centrally via IAM, no manual key management  | OS Login                                                       |
| VM has no external IP but still needs occasional SSH access                    | IAP tunneling                                                   |
| Quick one-off SSH access from the CLI                                          | `gcloud compute ssh`                                            |

## Compute Engine — Other Key Features

- **Shielded VMs** — secure boot, virtual trusted platform module (vTPM), and integrity monitoring to protect against boot-level rootkits/malware.
- **Confidential VMs** — encrypts data *in use* (in memory), not just at rest/in transit (Section 27's "data in use" gap).
- **Preemption notice (Spot VMs)** — GCP gives roughly a 30-second warning before reclaiming a Spot VM, deliverable via a shutdown script, so the app can attempt graceful cleanup.

## Next

Continue to **Section 44 — Other Important Google Cloud Services**.
