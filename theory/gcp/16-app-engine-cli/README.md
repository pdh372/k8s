# Section 16 — Managing App Engine using gcloud

## App Engine — Command Line Reference

```bash
gcloud app create --region=us-central          # one-time app init, picks region permanently
gcloud app deploy                               # deploy from app.yaml in current dir
gcloud app deploy --version=v2 --no-promote     # deploy without sending it traffic
gcloud app browse                               # open the app in a browser
gcloud app logs tail -s default                 # stream logs for a service
```

## Services, Versions and Instances

```bash
# Services
gcloud app services list
gcloud app services describe default
gcloud app services set-traffic default --splits=v1=0.5,v2=0.5
gcloud app services delete api

# Versions
gcloud app versions list
gcloud app versions describe v2 --service=default
gcloud app versions stop v1 --service=default    # stop serving (Manual/Basic scaling)
gcloud app versions start v1 --service=default
gcloud app versions delete v1 --service=default

# Instances
gcloud app instances list
gcloud app instances describe INSTANCE_ID --service=default --version=v2
gcloud app instances delete INSTANCE_ID --service=default --version=v2  # force-restart one instance
```

### Quick mental model

`services` (list/describe/set-traffic/delete) → `versions` (list/describe/stop/start/delete) → `instances` (list/describe/delete) — the CLI command groups mirror the Application → Service → Version → Instance hierarchy from Section 14 exactly.

## Next

Continue to **Section 17 — Getting Started with Google Cloud Run**.
