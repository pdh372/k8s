# Section 2 — Google Cloud Regions and Zones

## What is a Region

A **Region** is an independent geographic area (e.g. `us-central1`, `asia-southeast1`, `europe-west1`) that contains multiple isolated data centers. Regions are largely independent of each other — a failure in one region shouldn't affect another.

## What is a Zone (Availability Zone)

A **Zone** is a deployment area *within* a Region (e.g. `us-central1-a`, `us-central1-b`, `us-central1-c`) — think of it as one data center, or a small cluster of data centers, with its own independent power, cooling, and networking. Most regions have 3+ zones.

```
Region: us-central1
├── Zone: us-central1-a
├── Zone: us-central1-b
└── Zone: us-central1-c
```

Zones within the same region have low-latency, high-bandwidth network connections between them, so spreading resources across zones in one region is cheap (or free) and fast.

## Choosing the Right Region — Factors

| Factor                  | Why it matters                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Latency to users**     | Closer region = lower latency. Pick a region near your majority user base.                              |
| **Price**                 | The same service can cost differently across regions (power, land, local taxes vary).                   |
| **Service/resource availability** | Not every GCP service or machine type is available in every region — check before committing. |
| **Compliance / data residency** | Some regulations (data sovereignty laws) require data to stay within a specific country/region.    |
| **Carbon footprint**      | Google publishes the carbon-free energy percentage per region if sustainability is a factor.             |

## Why Use Multiple Regions

- **Disaster recovery** — an entire region can (rarely) go down; a multi-region setup keeps you running.
- **Lower global latency** — serve users on different continents from a nearby region each.
- **Compliance** — data residency requirements may force certain data to live in a specific region while you still serve global users from others.

The tradeoff: multi-region architectures are more complex (data replication, cross-region networking cost, consistency) — don't reach for multi-region until you actually need it.

## Region and Zone — Common Misconceptions

| Misconception                                       | Reality                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| "More zones = more redundancy automatically"          | Only if you actually deploy resources across multiple zones — a single-zone VM has zero zone redundancy. |
| "Regions are physically one building"                 | A region is a collection of physically separate data centers (the zones) in the same geographic area. |
| "Global resources exist in a specific zone"            | Some resources are **global** (e.g. images, snapshots), some are **regional** (e.g. static external IPs, some subnets), some are **zonal** (e.g. a VM, a persistent disk). |

### Scope of GCP resources — quick reference

| Scope        | Examples                                              |
| -------------- | ---------------------------------------------------------- |
| **Zonal**     | Compute Engine VM, Persistent Disk, GKE node                |
| **Regional**  | Regional Managed Instance Group, some subnets, regional Cloud Storage bucket |
| **Global**    | Images, Snapshots, VPC network (the network itself spans all regions), global HTTP(S) Load Balancer |

## Scenarios

| Scenario                                                                         | Answer                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| App must survive an entire data center outage                                     | Deploy across multiple zones in a region (minimum)      |
| App must survive an entire region going down                                      | Deploy across multiple regions                          |
| Users are 90% in Southeast Asia                                                   | Pick a region physically close, e.g. `asia-southeast1`  |
| Law requires customer data to never leave the country                             | Pick a region inside that country, avoid multi-region replication outside it |
| Deploying a VM — which do you pick, a region or a zone?                          | A zone (VMs are zonal resources) — the region is implied by the zone |

## Exploring Regions and Zones — gcloud

```bash
# List all available regions
gcloud compute regions list

# List all available zones
gcloud compute zones list

# List zones within a specific region
gcloud compute zones list --filter="region:us-central1"

# Check your current default region/zone
gcloud config get-value compute/region
gcloud config get-value compute/zone

# Set a default region/zone (used when a command doesn't specify one)
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

## Next

Continue to **Section 3 — Google Cloud: Managing VMs with Compute Engine**.
