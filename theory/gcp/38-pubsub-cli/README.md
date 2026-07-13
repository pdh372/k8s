# Section 38 — Managing Pub/Sub From Command Line

## Topics

```bash
gcloud pubsub topics create my-topic
gcloud pubsub topics list
gcloud pubsub topics describe my-topic
gcloud pubsub topics delete my-topic
```

## Subscriptions

```bash
# Pull subscription (default)
gcloud pubsub subscriptions create my-pull-sub --topic=my-topic

# Push subscription — delivers to an HTTP endpoint instead of being polled
gcloud pubsub subscriptions create my-push-sub \
  --topic=my-topic \
  --push-endpoint=https://my-service-url/pubsub-handler

gcloud pubsub subscriptions list
gcloud pubsub subscriptions describe my-pull-sub
gcloud pubsub subscriptions delete my-pull-sub
```

## Publishing and Pulling Messages

```bash
gcloud pubsub topics publish my-topic --message="order-created" --attribute=orderId=123

# Pull without auto-ack (message stays "in-flight" until acked, else redelivered after the ack deadline)
gcloud pubsub subscriptions pull my-pull-sub --limit=10

# Acknowledge specific messages by their ack ID (from the pull output)
gcloud pubsub subscriptions ack my-pull-sub --ack-ids=ACK_ID_1,ACK_ID_2

# Or pull-and-acknowledge in one step
gcloud pubsub subscriptions pull my-pull-sub --auto-ack --limit=10
```

## Next

Continue to **Section 39 — Private Networks in Google Cloud: Cloud VPC**.
