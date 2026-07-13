# Section 19 — Managing Google Cloud Run using gcloud

## Deploying and Inspecting

```bash
gcloud run deploy my-service --source=. --region=us-central1 --allow-unauthenticated
gcloud run services list
gcloud run services describe my-service --region=us-central1
gcloud run services delete my-service --region=us-central1
```

## Revisions and Traffic Management

```bash
# List revisions (created automatically on every deploy)
gcloud run revisions list --service=my-service --region=us-central1

# Deploy a new revision without shifting traffic to it yet
gcloud run deploy my-service --image=... --no-traffic --tag=canary

# Split traffic between revisions
gcloud run services update-traffic my-service \
  --to-revisions=my-service-00002=90,my-service-00003=10 \
  --region=us-central1

# Send 100% of traffic back to a known-good revision (instant rollback)
gcloud run services update-traffic my-service \
  --to-revisions=my-service-00002=100 \
  --region=us-central1
```

## Configuration and IAM

```bash
# Update scaling/concurrency/resources on an existing service
gcloud run services update my-service \
  --min-instances=1 --max-instances=20 --concurrency=80 \
  --memory=512Mi --cpu=1 \
  --region=us-central1

# Set environment variables
gcloud run services update my-service \
  --set-env-vars=DB_HOST=10.0.0.5 \
  --region=us-central1

# Grant a user permission to invoke a private service
gcloud run services add-iam-policy-binding my-service \
  --member=user:someone@example.com \
  --role=roles/run.invoker \
  --region=us-central1
```

## Next

Continue to **Section 20 — Going Deeper with Containers**.
