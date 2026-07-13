# Section 41 — Organizations and IAM: Organizing Google Cloud Resources

## Organizing Google Cloud Resources: Projects, Folders, and Organization

```
Organization (the company — root node, tied to a Google Workspace/Cloud Identity domain)
└── Folder (optional — groups projects by team, department, or environment)
    └── Folder (folders can nest)
        └── Project (the actual container for resources — VMs, buckets, etc.)
```

- **Organization** — the root node representing the whole company; requires a Google Workspace or Cloud Identity domain to exist.
- **Folder** — an optional grouping layer, commonly one per department (`Engineering`, `Finance`) or environment (`Prod`, `Dev`) — folders can nest inside folders.
- **Project** — where resources actually live (this is the level covered in Section 1).

A personal/learning setup with no Organization is just a standalone Project with no parent — completely valid, just without the org-wide policy features below.

## Exploring Billing Accounts

A **Billing Account** is linked to one or more Projects and is what's actually charged. One Billing Account can fund many Projects; a Project has exactly one active Billing Account at a time.

```bash
gcloud billing accounts list
gcloud billing projects link PROJECT_ID --billing-account=XXXXXX-XXXXXX-XXXXXX
gcloud billing projects describe PROJECT_ID   # shows which billing account is linked
```

## IAM Best Practices

- **Least privilege** — grant the narrowest predefined role that does the job, not Basic roles (`Owner`/`Editor`).
- **Grant roles to Groups, not individual users**, where possible — easier to manage as people join/leave (add/remove group membership instead of editing every resource's policy).
- **Prefer service accounts over personal credentials** for workloads (Section 32).
- **Audit regularly** — use `get-iam-policy` and audit logs to periodically review who has access to what.
- **Use the resource hierarchy** — grant broad roles at the Organization/Folder level for org-wide needs, narrow roles at the Project/resource level for everything else, rather than repeating the same binding on every single project.

## User Identity Management in GCP

| Identity type              | Detail                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------- |
| **Google Account**             | A personal or Workspace-managed Google identity — a human user.                          |
| **Google Group**                | A collection of accounts — grant one role to the group, everyone in it inherits it.        |
| **Service Account**             | A workload identity (Section 32) — for applications, not humans.                           |
| **Cloud Identity**              | Lets you manage users/groups on GCP even without a full Google Workspace subscription.      |

## IAM Members and Identities

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=group:engineering@example.com \
  --role=roles/viewer

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=domain:example.com \
  --role=roles/viewer   # grants to EVERY account in the entire domain — use with caution
```

## Understanding Organization Policy Service

While IAM controls **who can do what**, **Organization Policy** controls **what's allowed to exist at all**, regardless of who's asking — a guardrail layer above IAM.

```bash
# Example: disallow creating VMs with public IPs, enforced org-wide
gcloud resource-manager org-policies enable-enforce \
  compute.vmExternalIpAccess --organization=ORG_ID
```

| IAM                                     | Organization Policy                                  |
| -------------------------------------------- | ---------------------------------------------------------- |
| "Can Alice create a VM?"                    | "Are VMs with public IPs allowed to exist in this org at all?" |
| Identity-based                              | Resource-configuration-based                                 |
| Even an Owner is still bound by IAM grants   | Even an Owner **cannot** override an Organization Policy constraint |

## IAM Policy at Multiple Levels — Resource Hierarchy

IAM policies are **inherited downward** through the resource hierarchy — a role granted at the Organization level applies to every Folder and Project beneath it, automatically:

```
Organization (role granted here) 
    ↓ inherited by
  Folder
    ↓ inherited by
  Project
    ↓ inherited by
  Resource (e.g. a specific bucket)
```

**Effective permissions = union of everything granted at every level above** — you cannot *remove* a permission at a lower level that was granted higher up; you can only *add* more at the lower level.

> **Exam trap:** "How do I revoke a permission a user has at the Project level, that was actually granted at the Organization level?" — you can't do it at the Project level; you must change the binding at the Organization level (or move the Project out of that Organization's scope, which usually isn't practical).

## The Right Mindset for IAM Roles

Don't think "what role sounds right" — think "what's the smallest set of permissions this identity needs to do its actual job, for exactly as long as it needs it." Predefined roles exist so you rarely need to build a custom role from scratch.

## Predefined Roles — Organization, Billing, and Project

| Role                                | Grants                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `roles/resourcemanager.organizationAdmin` | Full control over the Organization resource itself                        |
| `roles/billing.admin`                    | Manage billing accounts, link/unlink projects, view costs                   |
| `roles/owner`                            | Full control over a Project (Basic role — broad, avoid in production)       |
| `roles/editor`                            | Modify most resources in a Project, but not IAM policy (Basic role)          |
| `roles/viewer`                            | Read-only access to a Project (Basic role)                                    |

## Predefined Roles — By Service

| Service            | Common predefined roles                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Compute Engine**    | `roles/compute.admin` (full control), `roles/compute.instanceAdmin.v1` (manage instances only), `roles/compute.viewer` |
| **App Engine**         | `roles/appengine.appAdmin`, `roles/appengine.deployer`, `roles/appengine.viewer`         |
| **GKE**                | `roles/container.admin`, `roles/container.developer` (deploy workloads, no cluster admin), `roles/container.viewer` |
| **Cloud Storage**      | `roles/storage.admin`, `roles/storage.objectAdmin`, `roles/storage.objectViewer` (read-only, common for app service accounts) |
| **BigQuery**           | `roles/bigquery.admin`, `roles/bigquery.dataViewer`, `roles/bigquery.jobUser` (run queries without owning the data) |
| **Logging & Service Accounts** | `roles/logging.viewer`, `roles/logging.admin`, `roles/iam.serviceAccountUser` (deploy resources *as* a service account, without managing the account itself) |

## Other Important IAM Roles

| Role                                    | Why it's notable                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `roles/iam.serviceAccountUser`              | Lets a user deploy a resource *using* a service account, without granting them full control over that service account. |
| `roles/iam.serviceAccountTokenCreator`      | Lets an identity generate short-lived credentials for a service account (impersonation, Section 32). |
| `roles/run.invoker`                          | Lets an identity call a private Cloud Run service.                              |

## IAM Scenarios

| Scenario                                                                    | Answer                                                        |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Team needs to deploy to GKE but not administer the cluster itself                  | `roles/container.developer`                                                |
| A user should be able to run BigQuery queries against data they don't own          | `roles/bigquery.jobUser` (plus `dataViewer` on the specific dataset)       |
| Company-wide rule: no VM should ever get a public IP, no matter who requests it     | Organization Policy constraint, not an IAM role                            |
| 50 new engineers need the same Viewer access across all projects                    | Grant the role to a Google Group they're all members of, at the Org/Folder level |
| An app needs to be deployed using a specific service account, by a CI pipeline user | Grant that user `roles/iam.serviceAccountUser` on the service account       |

## Next

Continue to **Section 42 — Exploring the Google Cloud Pricing Calculator**.
