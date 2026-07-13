# Section 39 — Private Networks in Google Cloud: Cloud VPC

## Understanding the Need for a VPC

A **VPC (Virtual Private Cloud)** is your own private, isolated network within GCP — resources inside it (VMs, GKE clusters) get private IPs and can talk to each other securely, without any of that traffic touching the public internet unless you explicitly expose it.

## Understanding the Need for VPC Subnets

A VPC is split into **subnets** — each tied to a specific **region** (unlike GCP's global VPC network object itself). Subnets let you control where resources live and apply different IP ranges/policies per region, while all subnets in the same VPC can still route to each other by default.

## Creating VPCs and Subnets

```bash
gcloud compute networks create my-vpc --subnet-mode=custom

gcloud compute networks subnets create my-subnet \
  --network=my-vpc \
  --region=us-central1 \
  --range=10.0.0.0/24
```

| VPC mode          | Detail                                                                       |
| --------------------- | ------------------------------------------------------------------------------- |
| **Auto mode**         | GCP automatically creates one subnet per region with predefined ranges — simplest, but less control. |
| **Custom mode**       | You define exactly which regions get subnets, and their IP ranges — the production-recommended choice. |

## Understanding CIDR Blocks

**CIDR** notation (`10.0.0.0/24`) defines an IP range: the number after `/` is how many leading bits are fixed (the network portion) — the rest are available for individual addresses.

| CIDR            | Usable addresses (roughly) |
| ------------------ | ------------------------------ |
| `/24`              | 256                             |
| `/16`               | 65,536                          |
| `/8`                | 16.7 million                    |

Smaller number after `/` = bigger range. Plan subnet ranges so they **don't overlap** with each other or with any network you'll later peer/connect to (VPN, on-prem) — overlapping ranges make routing ambiguous.

## Understanding Firewall Rules

VPC firewall rules are **stateful**, apply at the VPC level (not per-VM), and are evaluated by **priority** (lower number = higher priority, evaluated first). By default, a new custom-mode VPC **denies all ingress** and **allows all egress** — you must explicitly create ingress rules for anything you want to reach your VMs.

```bash
gcloud compute firewall-rules create allow-ssh \
  --network=my-vpc \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:22 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=ssh-allowed
```

Target by **tag** (as above) or by **service account** — scoping rules to exactly the instances that need them, not the whole VPC.

## Getting Started with Shared VPC

A **Shared VPC** lets one project (the "host" project) own the VPC network, while other projects ("service" projects) create resources that use that shared network — centralizing network administration/security while still letting different teams manage their own projects' resources.

## Getting Started with VPC Peering

**VPC Peering** connects two separate VPCs (even across different projects/organizations) so resources in each can communicate via private IPs — without going through the public internet, and without a VPN.

| Aspect                | Detail                                                                    |
| -------------------------- | ---------------------------------------------------------------------------- |
| **Non-transitive**         | If VPC A peers with B, and B peers with C, A **cannot** reach C automatically. |
| **No overlapping ranges**  | Peered VPCs must have non-overlapping IP ranges (this is exactly why CIDR planning above matters). |

## Implementing Hybrid Cloud with Cloud VPN and Cloud Interconnect

| Option                  | Detail                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| **Cloud VPN**               | Encrypted tunnel over the public internet, connecting your on-prem network to a GCP VPC — fastest to set up, subject to internet variability. |
| **Cloud Interconnect**       | A dedicated, private physical connection between on-prem and GCP — higher bandwidth, more consistent latency, more expensive/complex to provision. |

> **Exam framing:** "quick to set up, moderate bandwidth" → Cloud VPN. "High bandwidth, low latency, willing to invest in dedicated infrastructure" → Cloud Interconnect.

## Next

Continue to **Section 40 — Operations in Google Cloud Platform**.
