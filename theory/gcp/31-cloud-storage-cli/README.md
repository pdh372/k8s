# Section 31 — Playing with Cloud Storage From Command Line

## `gcloud storage` — the Modern CLI

```bash
gcloud storage buckets create gs://my-bucket --location=us-central1 --default-storage-class=STANDARD
gcloud storage buckets list
gcloud storage buckets describe gs://my-bucket
gcloud storage buckets delete gs://my-bucket

gcloud storage cp file.txt gs://my-bucket/
gcloud storage cp gs://my-bucket/file.txt ./
gcloud storage cp -r ./local-dir gs://my-bucket/dir/
gcloud storage mv gs://my-bucket/old.txt gs://my-bucket/new.txt
gcloud storage rm gs://my-bucket/file.txt
gcloud storage rm -r gs://my-bucket/dir/

gcloud storage ls gs://my-bucket/
gcloud storage ls -l gs://my-bucket/         # with size/date detail
gcloud storage du gs://my-bucket/            # disk usage summary
```

## Miscellaneous — Useful Operations

```bash
# Make an object publicly readable
gcloud storage objects update gs://my-bucket/file.txt --add-acl-grant=entity=allUsers,role=READER

# Generate a time-limited signed URL (temporary access without making it public)
gcloud storage sign-url gs://my-bucket/file.txt --duration=1h --private-key-file=key.json

# Enable versioning / set a lifecycle policy (Section 30)
gcloud storage buckets update gs://my-bucket --versioning
gcloud storage buckets update gs://my-bucket --lifecycle-file=lifecycle.json

# Sync a local directory with a bucket (only transfers changed/new files)
gcloud storage rsync ./local-dir gs://my-bucket/dir/ --recursive
```

## `gsutil` — the Legacy CLI

`gsutil` is the older Cloud Storage CLI — `gcloud storage` is its modern replacement (faster, better-integrated), but `gsutil` still appears in older docs and some exam questions.

| `gsutil` command                  | `gcloud storage` equivalent          |
| -------------------------------------- | ------------------------------------------- |
| `gsutil mb gs://my-bucket`             | `gcloud storage buckets create gs://my-bucket` |
| `gsutil cp file.txt gs://my-bucket/`   | `gcloud storage cp file.txt gs://my-bucket/`  |
| `gsutil ls gs://my-bucket/`            | `gcloud storage ls gs://my-bucket/`           |
| `gsutil rsync -r ./dir gs://my-bucket/` | `gcloud storage rsync ./dir gs://my-bucket/ --recursive` |
| `gsutil rm gs://my-bucket/file.txt`    | `gcloud storage rm gs://my-bucket/file.txt`   |

> Both work today — `gcloud storage` is the recommended default for anything new.

## Next

Continue to **Section 32 — Authentication and Authorization with Cloud IAM**.
