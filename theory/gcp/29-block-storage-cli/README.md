# Section 29 — Playing with Block Storage From Command Line

## Managing Disks and Snapshots

```bash
gcloud compute disks create data-disk --size=100GB --type=pd-balanced --zone=us-central1-a
gcloud compute disks list
gcloud compute disks describe data-disk --zone=us-central1-a
gcloud compute disks resize data-disk --size=200GB --zone=us-central1-a   # grow only, live
gcloud compute disks delete data-disk --zone=us-central1-a

gcloud compute snapshots create data-disk-snap --source-disk=data-disk --source-disk-zone=us-central1-a
gcloud compute snapshots list
gcloud compute snapshots delete data-disk-snap

# Restore a disk from a snapshot
gcloud compute disks create data-disk-restored --source-snapshot=data-disk-snap --zone=us-central1-a
```

## Managing Images

```bash
# Custom boot-disk image, built from an existing disk (see Section 3)
gcloud compute images create my-custom-image --source-disk=data-disk --source-disk-zone=us-central1-a
gcloud compute images list --filter="family:debian-12"     # list public images in a family
gcloud compute images describe my-custom-image
gcloud compute images delete my-custom-image

# Deprecate an old image instead of deleting it outright (keeps it usable via explicit reference)
gcloud compute images deprecate my-custom-image --state=DEPRECATED --replacement=my-custom-image-v2
```

## Managing Machine Images

```bash
gcloud compute machine-images create my-machine-image --source-instance=my-vm --zone=us-central1-a
gcloud compute machine-images list
gcloud compute machine-images describe my-machine-image
gcloud compute machine-images delete my-machine-image

# Launch a fully-cloned VM from a Machine Image
gcloud compute instances create vm-clone --source-machine-image=my-machine-image --zone=us-central1-a
```

## Next

Continue to **Section 30 — Object Storage in Google Cloud Platform: Cloud Storage**.
