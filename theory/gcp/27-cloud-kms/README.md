# Section 27 — Encryption in Google Cloud with Cloud KMS

## Understanding Data States

| State                  | Meaning                                             | GCP default protection                                      |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| **Data at rest**           | Stored on disk (a Persistent Disk, a Cloud Storage object) | Encrypted automatically by Google, always, even without you doing anything |
| **Data in transit**        | Moving over a network (client ↔ GCP, or between GCP services) | Encrypted automatically via TLS on all Google-managed connections    |
| **Data in use**            | Actively being processed in memory/CPU                    | Generally not encrypted by default — Confidential Computing (encrypted memory) is an opt-in advanced feature |

**Key takeaway for the exam:** GCP encrypts data at rest and in transit **by default**, with no action required — the KMS content below is about *who controls the encryption keys*, not about turning encryption itself on.

## Symmetric vs Asymmetric Encryption

| Type              | How it works                                                   | Used for                                        |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| **Symmetric**       | Same key encrypts and decrypts                                        | Fast, bulk data encryption (this is what most default GCP encryption uses) |
| **Asymmetric**      | A public key encrypts / verifies, a separate private key decrypts / signs | Signing, identity verification, key exchange              |

## Getting Started with Cloud KMS

**Cloud KMS (Key Management Service)** lets you create and control your own encryption keys, instead of relying purely on Google's default, fully-managed encryption. Three levels of "who manages the key":

| Option                              | Who manages the key                       | Control level                     |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------- |
| **Google-managed encryption keys**      | Google, entirely                             | None needed — the default, zero setup |
| **Customer-managed encryption keys (CMEK)** | You, via Cloud KMS                          | You control rotation, and can revoke/disable the key to make the data unreadable |
| **Customer-supplied encryption keys (CSEK)** | You, entirely outside GCP                    | Maximum control, maximum operational burden — you must supply the key on every access |

> **Exam framing:** "Compliance requires the customer to control and be able to revoke the encryption key" → CMEK (Cloud KMS).

## Playing with Cloud KMS

```bash
# Create a Key Ring (a container for keys, tied to a location)
gcloud kms keyrings create my-keyring --location=us-central1

# Create a symmetric encryption key inside it
gcloud kms keys create my-key \
  --keyring=my-keyring \
  --location=us-central1 \
  --purpose=encryption

# Use the key to create a CMEK-encrypted Cloud Storage bucket
gcloud storage buckets create gs://my-cmek-bucket \
  --default-encryption-key=projects/PROJECT_ID/locations/us-central1/keyRings/my-keyring/cryptoKeys/my-key

# Rotate a key (creates a new key version; old data stays decryptable with old versions)
gcloud kms keys versions create --key=my-key --keyring=my-keyring --location=us-central1 --primary
```

Disabling or destroying a Cloud KMS key key version makes any data encrypted with it permanently unreadable — this is the deliberate mechanism behind "crypto-shredding" (destroy the key instead of hunting down every copy of the data).

## Next

Continue to **Section 28 — Block and File Storage in Google Cloud Platform**.
