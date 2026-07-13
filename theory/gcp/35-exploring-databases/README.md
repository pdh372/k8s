# Section 35 — Exploring Databases in Google Cloud Platform

## Getting Started with Cloud SQL

```bash
gcloud sql instances create my-instance \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create my-db --instance=my-instance
gcloud sql users set-password postgres --instance=my-instance --password=MY_PASSWORD

gcloud sql connect my-instance --user=postgres
```

## Cloud SQL Features

| Feature                    | Detail                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **Automated backups**          | Daily backups, plus binary/transaction logs for point-in-time recovery.          |
| **Automatic storage increase** | Storage grows automatically as needed — no manual resizing required.             |
| **Maintenance windows**        | You choose when Google applies patches/updates, to control disruption timing.     |
| **Private IP**                 | Connect via your VPC only, no public exposure needed.                             |

## Cloud SQL High Availability

An HA Cloud SQL instance keeps a **synchronous standby replica** in a different zone within the same region. On primary failure, Cloud SQL automatically fails over to the standby — application connects via the same instance IP/name, no manual reconfiguration.

```bash
gcloud sql instances patch my-instance --availability-type=REGIONAL
```

## Getting Started with Cloud Spanner

```bash
gcloud spanner instances create my-spanner-instance \
  --config=regional-us-central1 \
  --nodes=1 \
  --description="My Spanner Instance"

gcloud spanner databases create my-db --instance=my-spanner-instance

gcloud spanner databases execute-sql my-db --instance=my-spanner-instance \
  --sql="SELECT 1"
```

Spanner scales by adding **nodes** (or, in the newer model, **processing units**) — more nodes = more throughput and storage capacity, all while maintaining strong consistency globally.

## Getting Started with Datastore and Firestore

```bash
# Firestore in Native mode (recommended for new projects)
gcloud firestore databases create --location=us-central1 --type=firestore-native

# Basic document operations (typically done via client libraries, but gcloud can inspect)
gcloud firestore indexes composite list
```

Firestore replaced Datastore as the recommended document database; "Firestore in Datastore mode" exists purely for backward compatibility with existing Datastore applications.

## Getting Started with Bigtable

```bash
gcloud bigtable instances create my-bigtable-instance \
  --cluster=my-cluster \
  --cluster-zone=us-central1-a \
  --display-name="My Bigtable" \
  --instance-type=DEVELOPMENT

# Table/data operations use the cbt CLI or client libraries, not plain gcloud
cbt -instance=my-bigtable-instance createtable my-table
cbt -instance=my-bigtable-instance ls
```

## Getting Started with Memorystore

```bash
gcloud redis instances create my-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0

gcloud redis instances describe my-cache --region=us-central1   # shows the host/port to connect to
```

Memorystore instances are only reachable from within the same VPC network — there's no public endpoint, by design.

## Getting Started with BigQuery

```bash
bq mk my_dataset
bq load --source_format=CSV my_dataset.my_table gs://my-bucket/data.csv schema.json
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM my_dataset.my_table'
```

BigQuery separates **storage** (cheap, per-GB) from **query compute** (billed by data scanned, or a flat-rate slot reservation for predictable heavy usage) — a fundamentally different pricing model from the other databases here.

## Importing and Exporting Relational Databases

```bash
# Export Cloud SQL to a Cloud Storage bucket (SQL dump or CSV)
gcloud sql export sql my-instance gs://my-bucket/backup.sql --database=my-db

# Import it back
gcloud sql import sql my-instance gs://my-bucket/backup.sql --database=my-db
```

## Importing and Exporting NoSQL Databases

```bash
# Firestore export/import, via Cloud Storage
gcloud firestore export gs://my-bucket/firestore-backup
gcloud firestore import gs://my-bucket/firestore-backup
```

## Databases in GCP — Summary

Match the workload to the database by asking: relational or not? Transactional or analytical? Single-region or global? Need sub-millisecond caching? — the answer nearly always falls out of Section 34's decision tree.

## Next

Continue to **Section 36 — Managing Databases using Gcloud**.
