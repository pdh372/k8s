# Section 32 — Authentication and Authorization in Google Cloud with Cloud IAM

## Getting Started with Cloud IAM

**Cloud IAM (Identity and Access Management)** controls **who** (identity) can do **what** (role/permissions) **on which resource** — the mechanism behind every access decision in GCP.

## Cloud IAM — An Example

> "Alice needs to be able to view (but not modify) objects in the `my-bucket` Cloud Storage bucket."

This single sentence maps directly onto IAM's three building blocks:

- **Who** — Alice (a Member/Principal)
- **What** — view objects (a Role, bundling the necessary permissions)
- **Where** — `my-bucket` (the Resource the binding applies to)

## Cloud IAM — Roles

| Role type            | Detail                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| **Basic roles**          | `Owner`, `Editor`, `Viewer` — broad, project-wide, legacy. Generally **too permissive** for production — avoid except for the smallest personal projects. |
| **Predefined roles**     | Google-curated, service-specific, narrowly-scoped (e.g. `roles/compute.instanceAdmin`, `roles/storage.objectViewer`) — the recommended default for most needs. |
| **Custom roles**         | You define the exact permission set yourself, when no predefined role fits — most flexible, most maintenance burden. |

> **Exam framing:** "least privilege" almost always points to a **predefined** (or custom, if truly needed) role — never Basic roles in a production scenario.

## Playing with IAM Roles

```bash
# List all predefined roles matching a keyword
gcloud iam roles list --filter="name:roles/storage"

# Describe a role — see exactly which permissions it grants
gcloud iam roles describe roles/storage.objectViewer

# Create a custom role
gcloud iam roles create myCustomRole --project=PROJECT_ID \
  --permissions=storage.objects.get,storage.objects.list \
  --title="My Custom Viewer"
```

## Members, Role, and Policy

| Term          | Meaning                                                                          |
| --------------- | --------------------------------------------------------------------------------------- |
| **Member (Principal)** | The identity — a Google Account, a Service Account, a Google Group, or `allUsers`/`allAuthenticatedUsers`. |
| **Role**        | A named bundle of permissions.                                                            |
| **Policy**      | A **binding** — attaches a Role to a Member, on a specific Resource.                       |

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=user:alice@example.com \
  --role=roles/storage.objectViewer

gcloud projects get-iam-policy PROJECT_ID
gcloud projects remove-iam-policy-binding PROJECT_ID \
  --member=user:alice@example.com \
  --role=roles/storage.objectViewer
```

## Getting Started with Service Accounts

A **Service Account** is an identity for a *workload* (a VM, a Cloud Run service, a script) rather than a human — used so applications can authenticate to GCP APIs without a human's personal credentials.

```bash
gcloud iam service-accounts create my-app-sa --display-name="My App Service Account"
gcloud iam service-accounts list
```

## Playing with Service Accounts

```bash
# Grant the service account a role
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:my-app-sa@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.objectViewer

# Attach the service account to a VM at creation (preferred over key files)
gcloud compute instances create my-vm \
  --service-account=my-app-sa@PROJECT_ID.iam.gserviceaccount.com \
  --scopes=cloud-platform \
  --zone=us-central1-a
```

## Service Account Use Cases

| Use case                                                            | How                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A VM needs to read from Cloud Storage                                | Attach a service account to the VM (no key file needed)              |
| A GKE Pod needs to call a GCP API                                     | Workload Identity — the Pod impersonates a service account, no key file (Section 23) |
| A CI/CD pipeline outside GCP needs to deploy resources                | A service account key file (JSON) — last resort, since key files are a standing credential that must be rotated/secured carefully |
| One service needs to act on behalf of another                        | Service account impersonation (`roles/iam.serviceAccountTokenCreator`), short-lived, no key file |

> **Exam framing:** service account **key files** are the least-preferred option — always prefer attaching a service account directly (to a VM, Cloud Run, or GKE via Workload Identity) or impersonation over generating/downloading a key.

## Scenarios — Service Accounts

| Scenario                                                                 | Answer                                                     |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| App on Compute Engine needs to write logs to Cloud Storage                          | Attach a service account to the VM with the right role               |
| External CI system (outside GCP) needs to deploy to GCP                             | Service account key file (necessary here — no GCP-native identity)   |
| GKE Pod needs to read a Secret from Secret Manager                                  | Workload Identity, not a key file                                     |

## Cloud Storage — ACLs (Access Control Lists)

**ACLs** are a legacy, finer-grained (per-object) permission system predating uniform IAM-based bucket permissions. Modern buckets default to **Uniform bucket-level access** (IAM only, no ACLs) — simpler and the recommended setting; ACLs still exist for buckets using "Fine-grained" access control.

```bash
gcloud storage buckets add-iam-policy-binding gs://my-bucket \
  --member=user:alice@example.com --role=roles/storage.objectViewer
```

## Cloud Storage — Signed URLs

A **Signed URL** grants time-limited access to a specific object, to *anyone with the link*, without making the object public and without requiring the requester to have a GCP identity at all.

```bash
gcloud storage sign-url gs://my-bucket/private-file.pdf \
  --duration=1h \
  --private-key-file=service-account-key.json
```

## Exposing a Public Website Using Cloud Storage

```bash
gcloud storage buckets create gs://www.example.com --location=us-central1
gcloud storage buckets update gs://www.example.com --web-main-page-suffix=index.html --web-error-page=404.html
gcloud storage cp -r ./site/* gs://www.example.com/
gcloud storage buckets add-iam-policy-binding gs://www.example.com \
  --member=allUsers --role=roles/storage.objectViewer
```

`allUsers` = literally anyone on the internet, unauthenticated — the standard way to serve fully public static content from a bucket.

## Next

Continue to **Section 33 — Exploring IAM using Gcloud**.
