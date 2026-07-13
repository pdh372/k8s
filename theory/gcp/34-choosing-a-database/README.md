# Section 34 — Choosing a Database in Google Cloud Platform

## Getting Started with Databases

GCP offers a managed database for nearly every data model — the exam consistently tests whether you can match a workload's requirements to the *right* one, not deep internals of any single database.

## Database Fundamentals

### Snapshot, Standby

| Term            | Meaning                                                                        |
| ------------------ | -------------------------------------------------------------------------------- |
| **Snapshot**       | A point-in-time backup of the database's data.                                    |
| **Standby**        | A live, continuously-updated replica ready to take over immediately if the primary fails (used for high availability, not just backup). |

### Availability and Durability

- **Availability** — the database is reachable and serving traffic when needed (measured as uptime %).
- **Durability** — once data is written and acknowledged, it's never lost (measured as % of data retained over time, e.g. via replication).

These are independent: a database can be highly durable (never loses data) while briefly unavailable (down for maintenance), or vice versa.

### Increasing Availability and Durability

| Technique                | Increases            |
| ---------------------------- | ----------------------- |
| **Standby/failover replica** | Availability (fast failover if primary dies) |
| **Multiple synchronous copies across zones/regions** | Both — data is safe (durable) even if a zone dies, and a replica can take over (available) |
| **Automated backups**       | Durability (recoverable even from application-level mistakes, e.g. accidental `DROP TABLE`) |

### RTO and RPO

| Term                             | Question it answers                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| **RTO (Recovery Time Objective)**    | "How long can we be down before we're back up?" (time to recover)    |
| **RPO (Recovery Point Objective)**   | "How much data can we afford to lose?" (measured as time — data since the last backup/replication point) |

Lower RTO/RPO = more resilient architecture = more expensive/complex to achieve (more frequent backups, synchronous replicas, automated failover).

### Read Replicas

A **read replica** is a copy of the database that serves read-only queries, offloading read traffic from the primary (which still handles all writes) — improves read scalability and read latency (especially placed near geographically distant users), but does **not** by itself improve write capacity or serve as a true HA failover target unless explicitly promoted.

### Data Consistency

| Model                     | Detail                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **Strong consistency**       | Every read reflects the most recent write, immediately, everywhere.                          |
| **Eventual consistency**     | Reads *might* momentarily return stale data right after a write, but all replicas converge to the same value given enough time. |

Trade-off: strong consistency is simpler to reason about but usually costs latency/throughput; eventual consistency scales further/faster but requires your application to tolerate brief staleness.

### Choosing Databases — the Big Fork

```
Is your data relational (tables, joins, transactions)?
├── Yes → Relational (SQL)
│    ├── Transactional workload (OLTP: many small reads/writes) → Cloud SQL or Cloud Spanner
│    └── Analytical workload (OLAP: big aggregate queries over huge datasets) → BigQuery
└── No → NoSQL
     ├── Document/flexible schema, mobile/web apps → Firestore
     ├── Massive scale, low-latency, single-key lookups (IoT, time-series, ad-tech) → Bigtable
     └── Need sub-millisecond in-memory caching/lookups → Memorystore
```

## OLTP Relational Databases — Cloud SQL and Cloud Spanner

| Aspect                | Cloud SQL                                          | Cloud Spanner                                              |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| **Engines**               | MySQL, PostgreSQL, SQL Server                             | Its own engine (Spanner SQL, PostgreSQL-compatible interface)         |
| **Scale**                 | Vertical scaling mainly; regional                          | Horizontally scalable, globally distributed                          |
| **Consistency**           | Strong (single-region)                                     | Strong, even across regions (its signature feature)                   |
| **Cost**                  | Lower                                                        | Higher — pay for global scale and strong consistency                 |
| **Best for**               | Typical transactional apps that fit on one region/instance    | Global-scale apps needing strong consistency across regions (e.g. global financial ledgers) |

## OLAP Relational Database — BigQuery

**BigQuery** is a fully-managed, **serverless** data warehouse built for **analytical** queries (aggregations over billions of rows) — not for transactional, row-by-row updates. You don't provision servers; you just load data and query with standard SQL, billed by data scanned/processed.

## NoSQL Databases — Firestore, Datastore, and Bigtable

| Database          | Model                             | Best for                                                       |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| **Firestore**        | Document store, strong consistency, real-time sync | Mobile/web app backends needing live-updating data                       |
| **Datastore**        | Predecessor to Firestore (Firestore in Datastore mode is its modern form) | Legacy App Engine-era apps — new projects should use Firestore directly |
| **Bigtable**         | Wide-column, massive scale, single-digit-millisecond latency | IoT sensor data, time-series, ad-tech, huge-scale analytical workloads needing very fast key-based lookups |

## In-Memory Database — Memorystore

**Memorystore** is GCP's managed in-memory data store, compatible with **Redis** or **Memcached** — used for caching (reducing load on a primary database) and sub-millisecond lookups. Data typically isn't the source of truth — it's a fast layer in front of one.

## Databases in GCP — Quick Review

| Need                                                     | Reach for                          |
| --------------------------------------------------------------- | -------------------------------------- |
| Standard relational app, single region                            | Cloud SQL                                |
| Relational app needing global scale + strong consistency          | Cloud Spanner                            |
| Big-data analytics/reporting over huge datasets                   | BigQuery                                 |
| Mobile/web app with real-time sync needs                          | Firestore                                |
| Massive-scale, low-latency key-value/time-series                  | Bigtable                                 |
| Caching layer / sub-millisecond lookups                           | Memorystore                              |

## Scenarios

| Scenario                                                                  | Answer                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------ |
| E-commerce app's product catalog and orders (standard relational, one region)      | Cloud SQL                                          |
| Global banking ledger needing strong consistency across continents                 | Cloud Spanner                                       |
| Analyzing 5 years of clickstream logs for business intelligence                    | BigQuery                                            |
| Mobile app's chat feature needs real-time data sync to clients                     | Firestore                                            |
| IoT platform ingesting millions of sensor readings per second                      | Bigtable                                             |
| Reduce database load by caching frequent query results                            | Memorystore                                          |
| Legal requires data loss on failure to be under 5 minutes                          | Low RPO — frequent backups / synchronous replication |

## Next

Continue to **Section 35 — Exploring Databases in Google Cloud Platform**.
