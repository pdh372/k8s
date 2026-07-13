# Section 37 — Asynchronous Communication in Google Cloud with Cloud Pub/Sub

## Understanding the Need for Asynchronous Communication

In **synchronous** communication, a service calls another and waits for a response — if the callee is slow or down, the caller is blocked too, and a spike in traffic hits every downstream service at once. **Asynchronous messaging** decouples services: the sender publishes a message and moves on immediately; the receiver processes it whenever it's ready. This absorbs traffic spikes (the queue buffers the burst) and means one service being down doesn't cascade into the caller failing too.

## Getting Started with Cloud Pub/Sub

**Pub/Sub** is GCP's fully-managed, serverless messaging service, built around the publish-subscribe pattern:

| Term              | Meaning                                                                       |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Topic**            | A named channel that messages are published to.                                       |
| **Publisher**        | Anything that sends messages to a Topic.                                              |
| **Subscription**     | A named "feed" of a Topic's messages for a specific consumer — a Topic can have multiple independent Subscriptions, each receiving a full copy of every message. |
| **Subscriber**       | Anything that reads messages from a Subscription (by pulling, or via push to an HTTP endpoint). |

```
Publisher → Topic ─┬─→ Subscription A → Subscriber A
                    └─→ Subscription B → Subscriber B
```

Each Subscription gets **every** message independently — this is how Pub/Sub fans a single event out to multiple, unrelated consumers (e.g. one order event triggering both an email service and an analytics pipeline).

## Publishing and Consuming a Message

- **Push subscription** — Pub/Sub calls an HTTP endpoint (e.g. a Cloud Run service) with each message as it arrives.
- **Pull subscription** — the subscriber actively polls Pub/Sub for new messages, at its own pace.

**Delivery is at-least-once** — a message might be delivered more than once (rarely), so consumers should be **idempotent** (safe to process the same message twice without side effects like double-charging a customer).

## Playing with Cloud Pub/Sub

```bash
gcloud pubsub topics create my-topic
gcloud pubsub subscriptions create my-sub --topic=my-topic

gcloud pubsub topics publish my-topic --message="hello world"

# Pull messages (and acknowledge them so they aren't redelivered)
gcloud pubsub subscriptions pull my-sub --auto-ack --limit=5
```

## Next

Continue to **Section 38 — Managing Pub/Sub From Command Line**.
