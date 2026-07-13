# Section 9 — Compute Engine From Command Line

## `gcloud compute instances create` — Common Flags

```bash
gcloud compute instances create my-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-balanced \
  --tags=http-server,ssh-allowed \
  --labels=env=dev,team=platform
```

| Flag                | Purpose                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `--zone`              | Which zone (required — VMs are zonal)                                |
| `--machine-type`      | vCPU/RAM shape                                                        |
| `--image-family` / `--image-project` | OS image and which project owns it (public images live in `debian-cloud`, `ubuntu-os-cloud`, etc.) |
| `--boot-disk-size` / `--boot-disk-type` | Disk size and type (`pd-standard`, `pd-balanced`, `pd-ssd`) |
| `--tags`               | Network tags — used to target firewall rules                         |
| `--labels`             | Key-value metadata for cost tracking/filtering                       |

## Configuring Default Region & Zone

Avoid repeating `--zone`/`--region` on every command:

```bash
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

Now `gcloud compute instances create my-vm` works without an explicit `--zone`.

## List and Describe Commands

```bash
# List — summary table of all instances
gcloud compute instances list

# List with a filter
gcloud compute instances list --filter="zone:us-central1-a"

# Describe — full detail of one instance
gcloud compute instances describe my-vm --zone=us-central1-a

# Describe, extracting just one field
gcloud compute instances describe my-vm --zone=us-central1-a --format="value(status)"
```

`list` = many resources, summary view. `describe` = one resource, full detail. This `list`/`describe` pattern is consistent across nearly every `gcloud compute` resource type (disks, networks, firewall-rules, images, ...).

## Playing with Compute Instances — gcloud

```bash
gcloud compute instances start my-vm --zone=us-central1-a
gcloud compute instances stop my-vm --zone=us-central1-a
gcloud compute instances reset my-vm --zone=us-central1-a     # hard reboot
gcloud compute instances delete my-vm --zone=us-central1-a

# Change machine type (VM must be stopped)
gcloud compute instances stop my-vm --zone=us-central1-a
gcloud compute instances set-machine-type my-vm \
  --zone=us-central1-a --machine-type=e2-standard-4
gcloud compute instances start my-vm --zone=us-central1-a

# SSH in
gcloud compute ssh my-vm --zone=us-central1-a

# Copy files to/from a VM
gcloud compute scp local-file.txt my-vm:~/remote-file.txt --zone=us-central1-a
```

## Playing with Instance Templates

```bash
gcloud compute instance-templates create web-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server

gcloud compute instance-templates list
gcloud compute instance-templates describe web-template

# Create a standalone VM from a template
gcloud compute instances create vm-from-template \
  --source-instance-template=web-template \
  --zone=us-central1-a

gcloud compute instance-templates delete web-template
```

Remember: templates are **immutable** — there's no `update` command. To change config, create a new template (often name-versioned, e.g. `web-template-v2`).

## Next

Continue to **Section 10 — Managed Instance Groups From Command Line**.
