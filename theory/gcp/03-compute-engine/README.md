# Section 3 — Google Cloud: Managing VMs with Compute Engine

## Virtualization Basics

**Virtualization** lets one physical machine run multiple isolated virtual machines (VMs), each with its own OS, via a **hypervisor** that partitions CPU, RAM, disk, and network across them. This is the foundation every cloud VM product is built on — when you "create a VM in the cloud," you're really requesting a slice of the provider's physical hardware, carved out by their hypervisor.

**Compute Engine (GCE)** is GCP's Infrastructure-as-a-Service (IaaS) product for VMs — you get full control of the OS, unlike managed platforms (App Engine, Cloud Run) where the provider abstracts the OS away.

## Getting Started with Compute Engine

### Choosing VM hardware and OS

| Choice              | What it controls                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Machine family**    | The broad category — General-purpose (E2, N2, N2D), Compute-optimized (C2), Memory-optimized (M2), Accelerator-optimized (A2, for GPUs). |
| **Machine type**      | Specific vCPU/RAM combo within a family, e.g. `e2-medium` (2 vCPU, 4 GB), `n2-standard-4` (4 vCPU, 16 GB). |
| **Image**             | The OS + preinstalled software the boot disk starts from — public images (Debian, Ubuntu, Windows Server), or your own custom image. |

### Create your first VM

```bash
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud
```

SSH into it:

```bash
gcloud compute ssh my-vm --zone=us-central1-a
```

### Hands-on: setting up an HTTP server

```bash
gcloud compute instances create web-vm \
  --zone=us-central1-a \
  --machine-type=e2-small \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server \
  --metadata=startup-script='#! /bin/bash
apt-get update
apt-get install -y apache2'
```

Allow HTTP traffic to instances tagged `http-server`:

```bash
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server \
  --direction=INGRESS
```

### Troubleshooting a VM that isn't serving traffic

| Check                                             | Command                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| Is the VM running?                                 | `gcloud compute instances describe web-vm --zone=... \| grep status` |
| Did the startup script run/fail?                   | `gcloud compute instances get-serial-port-output web-vm --zone=...` |
| Is a firewall rule actually allowing port 80?      | `gcloud compute firewall-rules list`                            |
| Is the tag on the firewall rule matching the VM's tag? | `gcloud compute instances describe web-vm --zone=... \| grep tags` -f |

### Scenarios

| Scenario                                             | Answer                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| Need max compute per core for a CPU-bound workload       | Compute-optimized (C2) machine family                            |
| Running an in-memory database needing huge RAM            | Memory-optimized (M2) machine family                              |
| ML training needing GPUs                                  | Accelerator-optimized (A2) machine family                        |
| Cheapest general-purpose option for dev/test              | E2 machine family                                                 |

## IP Addresses

| Type                    | Detail                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Internal IP**          | Private, only reachable within the VPC (and peered/connected networks). Always assigned.    |
| **External IP — ephemeral** | Public, released back to the pool when the VM stops (default for new VMs).             |
| **External IP — static**  | Public, reserved and kept even if the VM stops. Costs money while **not** attached to a running VM (an incentive not to hoard unused static IPs). |

```bash
# Reserve a static external IP
gcloud compute addresses create my-static-ip --region=us-central1

# Assign it when creating a VM
gcloud compute instances create my-vm \
  --address=my-static-ip \
  --zone=us-central1-a
```

### Scenarios

| Scenario                                                    | Answer                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| DNS record must keep pointing to the same IP across VM restarts | Static external IP                                          |
| Short-lived batch-processing VM, IP doesn't matter            | Ephemeral external IP (default) — cheaper                    |
| VM should not be reachable from the internet at all             | No external IP — internal only                               |

## Bootstrapping with a VM Startup Script

A **startup script** runs automatically every time the VM boots — the standard way to install software, pull config, or register the VM with something at boot, without baking a custom image.

```bash
gcloud compute instances create app-vm \
  --metadata-from-file startup-script=startup.sh \
  --zone=us-central1-a
```

Because it runs on *every* boot (not just the first), keep it idempotent (safe to re-run).

## Reducing Launch Time with a Custom Image

If a startup script installs the same heavy dependencies every single boot, that's wasted time. Instead: boot a VM, install everything once, then **snapshot the disk into a custom image** — new VMs launch from that image already fully configured, no startup script wait.

```bash
# Stop the VM first, then create an image from its disk
gcloud compute images create my-custom-image \
  --source-disk=app-vm \
  --source-disk-zone=us-central1-a

# Launch a new VM from it
gcloud compute instances create app-vm-2 \
  --image=my-custom-image \
  --zone=us-central1-a
```

## Instance Templates

An **Instance Template** is a reusable, immutable blueprint (machine type, image, disks, network, metadata) for creating VMs — you don't fill out the same config every time, and it's the required input for Managed Instance Groups (next section).

```bash
gcloud compute instance-templates create my-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud

gcloud compute instances create vm-from-template \
  --source-instance-template=my-template \
  --zone=us-central1-a
```

Templates are immutable — to change config, create a new template version; existing VMs from the old template are unaffected.

### Scenarios

| Scenario                                                          | Answer                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| Need to launch 50 identical VMs repeatedly                         | Instance Template                              |
| Every VM needs heavy software preinstalled to launch fast          | Custom Image                                    |
| VM needs to pull the latest config at every boot                   | Startup script                                  |

## Reducing Costs on Compute Engine VMs

| Mechanism                    | How it works                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Sustained Use Discounts**    | Automatic discount that kicks in the longer a VM runs continuously within a billing month — no commitment needed. |
| **Committed Use Discounts**    | You commit to 1 or 3 years of usage for a discount (up to ~57%) — for stable, predictable workloads.        |
| **Spot VMs**                    | Spare capacity at a steep discount (up to ~91% off); Google can reclaim them with short notice — for fault-tolerant, interruptible workloads (batch jobs, CI runners). |

```bash
# Create a Spot VM
gcloud compute instances create spot-vm \
  --provisioning-model=SPOT \
  --instance-termination-action=STOP \
  --zone=us-central1-a
```

### Understanding billing and costs

Compute Engine cost = (machine type rate × uptime) + (persistent disk size × rate) + (network egress, if any) + (any static IP not attached to a running VM). Stopped VMs still incur disk cost, just not compute cost.

### Cost optimization scenarios

| Scenario                                                     | Answer                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| Long-running production DB server, always on                     | Committed Use Discount                                 |
| Nightly batch job that can tolerate being killed and restarted    | Spot VM                                                |
| Dev/test VM used sporadically through the month                  | Sustained Use Discount (automatic, no action needed)   |
| VM is stopped but you're still being billed for something        | Persistent disk storage (and any unattached static IP) |

## Observability for Compute Engine

Compute Engine integrates with **Cloud Monitoring** (CPU, disk, network metrics — collected out of the box) and, with the **Ops Agent** installed, memory and disk-usage metrics plus log forwarding to **Cloud Logging**.

```bash
# Install the Ops Agent on a running VM
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install
```

## Other Key Compute Engine Concepts

| Concept                  | Detail                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| **Scope of resources**     | A VM and its persistent disk are **zonal** — they live in exactly one zone.                        |
| **Internal DNS name**      | Every VM gets an internal DNS name (`<vm-name>.<zone>.c.<project-id>.internal`) resolvable from within the VPC — no need to hardcode internal IPs. |
| **Licensing costs**        | Premium OS images (Windows Server, RHEL, SUSE) add a per-hour licensing fee on top of the compute rate; free Linux distros (Debian, Ubuntu, CentOS) don't. |
| **Custom Machine Types**   | Pick an exact vCPU/RAM combo instead of a fixed predefined machine type — useful when your workload doesn't fit a standard shape. |
| **Sole-tenant Nodes**      | Physical servers dedicated entirely to your project — no other customer's VMs share that hardware. Used for licensing (bring-your-own-license) or strict compliance requirements. |
| **Live Migration**         | GCP transparently moves a running VM to different physical hardware (for host maintenance/failure) without shutting it down — no action needed from you, on by default for most machine types. |
| **Labels**                 | Key-value metadata attached to resources (`env: prod`, `team: billing`) — used for cost-tracking, filtering, and organizing resources at scale. Best practice: label everything from day one. |

## Compute Engine — Best Practices Quick Review

- Use **Instance Templates + Managed Instance Groups** instead of hand-rolled individual VMs for anything that needs to scale or self-heal.
- Use **Spot VMs** for fault-tolerant/batch workloads; **Committed Use** for stable long-running workloads.
- **Label everything** for cost visibility.
- Prefer a **custom image** over a slow startup script when the same heavy setup repeats on every VM launch.
- Don't leave **unattached static IPs** or **stopped VMs with large disks** around — both still cost money.
- Set a **budget alert** before doing any hands-on labs in this section.

## Next

Continue to **Section 4 — Managing VM Groups with Instance Groups**.
