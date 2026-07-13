# Section 33 — Exploring IAM using Gcloud

## IAM — Command Line Reference

```bash
# Roles
gcloud iam roles list
gcloud iam roles describe roles/storage.objectViewer

# Service accounts
gcloud iam service-accounts create my-sa --display-name="My SA"
gcloud iam service-accounts list
gcloud iam service-accounts delete my-sa@PROJECT_ID.iam.gserviceaccount.com

# Policy bindings (grant/revoke) — works the same at project, folder, or resource level
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=user:alice@example.com --role=roles/viewer
gcloud projects remove-iam-policy-binding PROJECT_ID \
  --member=user:alice@example.com --role=roles/viewer
gcloud projects get-iam-policy PROJECT_ID
```

## Managing Projects — `gcloud projects`

```bash
gcloud projects create my-new-project --name="My New Project"
gcloud projects list
gcloud projects describe my-new-project
gcloud projects delete my-new-project     # ~30-day recovery window before permanent deletion
gcloud projects undelete my-new-project   # within that window
```

## Managing Projects and IAM — Scenarios

| Scenario                                                              | Answer                                                        |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Need to see exactly who has access to a project and what role they have       | `gcloud projects get-iam-policy PROJECT_ID`                              |
| Accidentally deleted a project, need it back within the recovery window        | `gcloud projects undelete`                                               |
| Need to grant a contractor temporary, narrowly-scoped access                   | Bind a predefined role scoped to the specific resource, not project-wide  |

## Managing Active Services — `gcloud services`

Most GCP APIs must be explicitly **enabled** on a project before they can be used (a safety/cost-control default).

```bash
gcloud services list --available          # every API GCP offers
gcloud services list --enabled            # what's currently enabled on this project
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com   # GKE
gcloud services disable compute.googleapis.com
```

> If a `gcloud`/API call fails with a permission-looking error but the account clearly has the right IAM role, check whether the API itself is **enabled** on the project first — a very common early troubleshooting trap.

## Next

Continue to **Section 34 — Choosing a Database in Google Cloud Platform**.
