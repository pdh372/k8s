# Section 36 — Managing Databases using Gcloud

## Quick-Reference: `list` / `describe` / `delete` Across Every Database Service

The same CRUD pattern from Compute Engine (Section 9) holds across every managed database — worth internalizing once:

```bash
# Cloud SQL
gcloud sql instances list
gcloud sql instances describe my-instance
gcloud sql instances delete my-instance

# Cloud Spanner
gcloud spanner instances list
gcloud spanner instances describe my-spanner-instance
gcloud spanner instances delete my-spanner-instance

# Bigtable
gcloud bigtable instances list
gcloud bigtable instances describe my-bigtable-instance
gcloud bigtable instances delete my-bigtable-instance

# Memorystore (Redis)
gcloud redis instances list --region=us-central1
gcloud redis instances describe my-cache --region=us-central1
gcloud redis instances delete my-cache --region=us-central1

# Firestore
gcloud firestore databases list
gcloud firestore databases describe --database='(default)'

# BigQuery (uses the separate `bq` CLI, not `gcloud`)
bq ls
bq show my_dataset.my_table
bq rm -t my_dataset.my_table
```

> **Exam-relevant pattern:** every `gcloud <service> instances list/describe/delete` follows this same shape — if you know the service's command group name, you already know most of its CLI surface.

## Next

Continue to **Section 37 — Asynchronous Communication in Google Cloud with Cloud Pub/Sub**.
