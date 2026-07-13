# Section 30 — Object Storage in Google Cloud Platform: Cloud Storage

## Exploring Cloud Storage

**Cloud Storage** is GCP's object storage service — durable, highly available storage for unstructured data (files, backups, media, logs), accessed via API/HTTP rather than mounted as a disk. It's the storage layer behind static websites, data lakes, backups, and countless other services.

## Objects and Buckets

| Term          | What it is                                                                    |
| --------------- | ------------------------------------------------------------------------------------ |
| **Bucket**      | A globally-uniquely-named container for objects; created in a specific location (region, dual-region, or multi-region). |
| **Object**      | An individual file, stored under a "key" (its path/name within the bucket) — flat storage, no real directories (paths with `/` are just naming convention, rendered as folders in the UI). |

```bash
gcloud storage buckets create gs://my-unique-bucket-name --location=us-central1
gcloud storage cp my-file.txt gs://my-unique-bucket-name/
gcloud storage ls gs://my-unique-bucket-name/
```

Bucket names are **globally unique across all of GCP**, not just within your project — a big reason bucket-creation scenarios in the exam mention naming conflicts.

## Storage Classes

| Class            | Minimum storage duration | Retrieval cost | Use case                                       |
| ------------------- | --------------------------- | ---------------- | ----------------------------------------------------- |
| **Standard**       | None                          | None              | Frequently accessed ("hot") data                        |
| **Nearline**       | 30 days                       | Yes               | Accessed roughly once a month                            |
| **Coldline**       | 90 days                       | Yes (higher)      | Accessed roughly once a quarter                          |
| **Archive**        | 365 days                      | Yes (highest)     | Long-term backup/archival, accessed rarely (once a year or less) |

All classes have the **same durability, latency, and throughput** — the only differences are storage cost (cheaper as you go down the table) and retrieval cost/minimum duration (more expensive to retrieve early, as you go down the table). Deleting/overwriting an object before its minimum duration incurs an early-deletion charge.

## Uploading and Downloading Options

```bash
gcloud storage cp local-file.txt gs://my-bucket/
gcloud storage cp gs://my-bucket/remote-file.txt ./
gcloud storage cp -r local-dir/ gs://my-bucket/dir/     # recursive
gcloud storage cp large-file.bin gs://my-bucket/ --do-not-decompress
```

For very large files, Cloud Storage automatically uses **resumable, parallel/chunked uploads** — if a large upload is interrupted, it resumes rather than restarting from zero.

## Versioning

When enabled on a bucket, every overwrite/delete keeps the prior version instead of destroying it — protects against accidental overwrite or deletion.

```bash
gcloud storage buckets update gs://my-bucket --versioning
gcloud storage ls -a gs://my-bucket/my-file.txt    # list all versions ("-a" = all)
```

Old versions still count toward storage cost — pair versioning with a **lifecycle rule** to auto-delete old versions after N days.

## Lifecycle Management

Automated rules that transition objects to a cheaper storage class, or delete them, based on conditions (age, number of newer versions, etc.) — no manual cleanup needed.

```json
{
  "rule": [
    {
      "action": { "type": "SetStorageClass", "storageClass": "COLDLINE" },
      "condition": { "age": 90 }
    },
    {
      "action": { "type": "Delete" },
      "condition": { "age": 365, "isLive": false }
    }
  ]
}
```

```bash
gcloud storage buckets update gs://my-bucket --lifecycle-file=lifecycle.json
```

## Encryption with KMS

Like Persistent Disks (Section 27), Cloud Storage objects are encrypted at rest by default with Google-managed keys, or optionally with **Customer-Managed Encryption Keys (CMEK)** via Cloud KMS for organizations needing to control/revoke the key themselves:

```bash
gcloud storage buckets create gs://my-cmek-bucket \
  --default-encryption-key=projects/PROJECT_ID/locations/us-central1/keyRings/my-keyring/cryptoKeys/my-key
```

## Scenarios

| Scenario                                                                | Answer                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Data accessed daily by a live application                                          | Standard storage class                                   |
| Compliance backup accessed maybe once a year                                       | Archive storage class                                     |
| Need to protect against an accidental `rm`/overwrite of critical files              | Enable Versioning                                          |
| Want data to automatically move to cheaper storage after 90 days, deleted after a year | Lifecycle rule (SetStorageClass + Delete conditions)       |
| Compliance requires the org to be able to revoke access to stored data entirely       | CMEK via Cloud KMS                                          |
| Serving a public static website's assets                                            | Cloud Storage bucket configured for static website hosting  |

## Next

Continue to **Section 31 — Playing with Cloud Storage From Command Line**.
