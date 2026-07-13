# Section 44 — Google Cloud Platform: Other Important Services

## Getting Started with Cloud Deployment Manager

**Cloud Deployment Manager** is GCP's native **Infrastructure as Code (IaC)** tool — declare resources in YAML/Jinja2/Python templates, and it creates/updates/deletes them as a single managed "deployment," the same declarative philosophy as Kubernetes manifests, applied to GCP resources themselves.

```yaml
# config.yaml
resources:
  - name: my-vm
    type: compute.v1.instance
    properties:
      zone: us-central1-a
      machineType: zones/us-central1-a/machineTypes/e2-medium
      disks:
        - deviceName: boot
          boot: true
          initializeParams:
            sourceImage: projects/debian-cloud/global/images/family/debian-12
```

```bash
gcloud deployment-manager deployments create my-deployment --config=config.yaml
gcloud deployment-manager deployments update my-deployment --config=config.yaml
gcloud deployment-manager deployments delete my-deployment    # deletes everything it created
```

## Understanding Cloud Deployment Manager

Key benefit: **repeatability** — recreate an identical environment (dev, staging, a DR region) from the same template, and deletions are equally declarative (delete the deployment, every resource it owns is cleaned up together) instead of manually hunting down individual resources.

> **Beyond the exam:** Terraform is the far more common IaC tool in real-world GCP usage today, though Deployment Manager remains GCP-native and can appear on the exam.

## Getting Started with Cloud Marketplace

**Cloud Marketplace** is a catalog of pre-configured, ready-to-deploy solutions (VM images, Kubernetes apps, SaaS products) from Google and third-party vendors — deploy a fully-configured WordPress site, a database cluster, or a security tool in a few clicks instead of building it from scratch.

## Cloud Marketplace and Deployment Manager Together

Many Marketplace solutions are themselves implemented *using* Deployment Manager templates under the hood — clicking "Deploy" on a Marketplace listing often just runs a pre-built Deployment Manager configuration on your behalf.

## Getting Started with Cloud DNS

**Cloud DNS** is GCP's managed DNS hosting — both for public zones (hosting a domain's DNS records for the internet) and **private zones** (internal-only DNS resolution within a VPC, e.g. resolving `db.internal` to a Cloud SQL private IP).

```bash
gcloud dns managed-zones create my-zone \
  --dns-name=example.com. \
  --description="My public zone"

gcloud dns record-sets create www.example.com. \
  --zone=my-zone --type=A --ttl=300 --rrdatas=203.0.113.10
```

## Getting Started with Cloud Dataflow

**Cloud Dataflow** is a fully-managed service for running **Apache Beam** data processing pipelines — both **batch** (process a fixed dataset) and **streaming** (process data continuously as it arrives) — commonly used for ETL (Extract, Transform, Load) work, e.g. reading from Pub/Sub, transforming, and writing into BigQuery.

## Getting Started with Cloud Dataproc

**Cloud Dataproc** is GCP's managed **Hadoop/Spark** service — for teams with existing Hadoop/Spark workloads/expertise who want that ecosystem without managing the cluster infrastructure themselves.

| Aspect            | Dataflow                              | Dataproc                                     |
| --------------------- | -------------------------------------------- | -------------------------------------------------- |
| **Programming model**  | Apache Beam (unified batch + streaming)         | Hadoop/Spark (existing big-data ecosystem)            |
| **Best for**            | New pipelines, especially with streaming needs   | Migrating existing Hadoop/Spark jobs to GCP with minimal rewrite |

## Scenarios

| Scenario                                                                | Answer                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Need repeatable, version-controlled infrastructure provisioning                    | Cloud Deployment Manager (or Terraform)                  |
| Want to deploy a pre-packaged WordPress site quickly                              | Cloud Marketplace                                         |
| Need internal-only DNS resolution for services inside a VPC                        | Cloud DNS, private zone                                    |
| Existing team has Spark jobs and wants to lift-and-shift to GCP                    | Cloud Dataproc                                              |
| Building a new streaming pipeline from Pub/Sub into BigQuery                        | Cloud Dataflow                                              |

## Next

Continue to **Section 45 — Getting Ready for the Google Cloud Associate Cloud Engineer Certification**.
