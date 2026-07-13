# Section 28 — Block and File Storage in Google Cloud Platform

## Exploring Block and File Storage in GCP

GCP's storage products split by *how the data is accessed*:

| Storage type    | Accessed as                    | GCP product(s)                        |
| ------------------ | ----------------------------------- | ------------------------------------------ |
| **Block storage** | A raw disk device attached to one VM  | Persistent Disk, Local SSD                   |
| **File storage**  | A shared filesystem, mounted by multiple VMs at once | Filestore                                    |
| **Object storage** | Files ("objects") accessed via API/HTTP, not mounted as a disk | Cloud Storage (Section 30)                    |

## Local SSDs

Physically attached to the specific host machine the VM runs on.

| Property        | Detail                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| **Performance**    | Very high IOPS/throughput — the fastest disk option on GCP                  |
| **Durability**      | **Ephemeral** — data is lost if the VM stops, crashes, or is migrated to different hardware |
| **Use case**        | Scratch space, caches, temporary processing data — never your source of truth |

## Persistent Disks

Network-attached block storage — independent of any single physical machine.

| Property        | Detail                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| **Performance**    | Good, but lower than Local SSD                                             |
| **Durability**      | Survives VM stop/delete (if not explicitly deleted with the VM), can be detached and reattached to a different VM |
| **Use case**        | Boot disks, application data, anything that needs to survive the VM's lifecycle |

## Persistent Disks vs Local SSDs

| Aspect              | Persistent Disk                     | Local SSD                          |
| ---------------------- | ---------------------------------------- | --------------------------------------- |
| **Survives VM deletion** | Yes (unless configured to auto-delete)     | No — always ephemeral                    |
| **Resizable**            | Yes, live, without downtime                 | No — fixed at VM creation                |
| **Snapshots**             | Yes                                          | No                                        |
| **Performance**           | Good                                          | Highest                                   |

## Persistent Disk Types

| Type            | Detail                                                     |
| ------------------ | ----------------------------------------------------------------- |
| `pd-standard`     | HDD-backed — cheapest, lowest performance                            |
| `pd-balanced`      | SSD-backed — good default balance of cost/performance                 |
| `pd-ssd`           | SSD-backed — higher performance than balanced, more expensive          |
| `pd-extreme`       | SSD-backed — highest performance, for the most demanding workloads    |

## Snapshots for Persistent Disks

A **Snapshot** is an incremental, point-in-time backup of a Persistent Disk — only the *changed* blocks since the last snapshot are stored, keeping storage cost low even with frequent snapshots.

```bash
gcloud compute disks snapshot my-disk \
  --snapshot-names=my-disk-snap-1 \
  --zone=us-central1-a

# Create a new disk from a snapshot (e.g. to restore, or to clone into a new VM)
gcloud compute disks create my-disk-restored \
  --source-snapshot=my-disk-snap-1 \
  --zone=us-central1-a
```

## Playing with Persistent Disks and Snapshots

```bash
gcloud compute disks create data-disk --size=100GB --type=pd-balanced --zone=us-central1-a
gcloud compute instances attach-disk my-vm --disk=data-disk --zone=us-central1-a
gcloud compute disks list
gcloud compute snapshots list
gcloud compute disks delete data-disk --zone=us-central1-a
```

## Machine Images

A **Machine Image** captures an entire VM — all its disks, metadata, and machine configuration — not just one disk (unlike a plain disk snapshot or a boot-disk Image, Section 3). Used to fully clone or restore a whole VM at once.

```bash
gcloud compute machine-images create my-machine-image --source-instance=my-vm --zone=us-central1-a
gcloud compute instances create vm-clone --source-machine-image=my-machine-image --zone=us-central1-a
```

## Snapshots vs Images vs Machine Images

| Concept               | Captures                                       | Used to                                          |
| -------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| **Snapshot**              | One disk's data, point-in-time, incremental             | Backup/restore a single disk                               |
| **Image**                  | A boot disk's OS + software, used as a launch template   | Launch new VMs preconfigured (Section 3)                    |
| **Machine Image**          | An entire VM — all disks + config                        | Clone or fully restore a whole VM at once                    |

## Scenarios — Persistent Disks

| Scenario                                                          | Answer                            |
| ----------------------------------------------------------------------- | ---------------------------------------- |
| Need the absolute fastest possible disk I/O, data loss is acceptable      | Local SSD                                 |
| Need a disk that survives VM deletion and can move to another VM          | Persistent Disk                           |
| Want a cheap, frequent backup strategy for a disk                        | Snapshots (incremental)                    |
| Need to clone an entire VM (all disks + settings) for a new environment   | Machine Image                              |

## Exploring File Storage with Filestore

**Filestore** is GCP's managed **NFS** file storage — unlike Persistent Disk (attached to exactly one VM), a Filestore instance can be mounted by *many* VMs simultaneously, sharing the same filesystem. Used for shared config, shared uploads directories, or legacy apps expecting a POSIX filesystem shared across machines.

```bash
gcloud filestore instances create my-filestore \
  --zone=us-central1-a \
  --tier=BASIC_HDD \
  --file-share=name="share1",capacity=1TB \
  --network=name="default"
```

## Exploring Global, Regional and Zonal Resources

Revisiting Section 2's scope concept, now applied to storage specifically:

| Scope        | Storage example                                                     |
| -------------- | ---------------------------------------------------------------------- |
| **Zonal**     | Persistent Disk, Local SSD (both tied to a specific zone)                |
| **Regional**  | Regional Persistent Disk (synchronously replicated across 2 zones in a region — higher availability, higher cost), Filestore |
| **Global**    | Disk Images, Snapshots, Machine Images, Cloud Storage (multi-region buckets) |

## Scenarios — Block and File Storage

| Scenario                                                                | Answer                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Multiple VMs need to read/write the same shared directory concurrently             | Filestore                                                |
| A VM's boot disk must survive even if the whole zone fails                          | Regional Persistent Disk                                  |
| Need a disk snapshot copied to another region for disaster recovery                 | Snapshots can be stored/copied across regions             |

## Next

Continue to **Section 29 — Playing with Block Storage From Command Line**.
