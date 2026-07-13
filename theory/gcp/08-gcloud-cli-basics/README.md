# Section 8 — Google Cloud Platform: Getting Started with gcloud (Command Line)

## Gcloud — Getting Started

`gcloud` is GCP's primary CLI — every action available in the Console has a `gcloud` equivalent, and it's the standard way to script/automate GCP.

```bash
gcloud version                     # confirm install + component versions
gcloud auth login                  # interactive browser login
gcloud auth list                   # show authenticated accounts
```

## Playing with `gcloud config set`

`gcloud` keeps a **configuration** — a set of defaults (project, region, zone, account) so you don't repeat `--project=...` on every command.

```bash
gcloud config set project my-project-id
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a

gcloud config list                 # show current config values
gcloud config get-value project    # read a single value
```

## Managing Multiple Configurations

If you work across multiple projects (personal, work, client), use **named configurations** instead of repeatedly re-running `config set`:

```bash
gcloud config configurations create work-project
gcloud config configurations activate work-project
gcloud config configurations list
gcloud config configurations describe work-project
```

Each named configuration keeps its own project/account/region defaults — switching is one command instead of resetting every value.

## Understanding gcloud Command Structure

```
gcloud <GROUP> <SUBGROUP> <COMMAND> [POSITIONAL-ARGS] [--FLAGS]
```

Example: `gcloud compute instances create my-vm --zone=us-central1-a`

| Part                | This example        |
| ---------------------- | ---------------------- |
| Group                | `compute`             |
| Subgroup              | `instances`            |
| Command               | `create`               |
| Positional argument   | `my-vm`                |
| Flag                  | `--zone=us-central1-a` |

Useful universal flags: `--format=json` / `--format=yaml` (structured output), `--filter="..."` (narrow results), `--help` (any group/command).

## Cloud Shell — Key Things to Remember

**Cloud Shell** is a free, browser-based VM with `gcloud`, `kubectl`, `docker`, and common tools pre-installed and pre-authenticated — no local setup required.

| Fact                          | Detail                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **Persistent home directory**  | `$HOME` (5 GB) persists across sessions.                                    |
| **The VM itself is ephemeral** | Everything outside `$HOME` resets after each session; the VM auto-recycles after ~20–60 min of inactivity. |
| **Free**                       | No charge for the Cloud Shell VM itself — only for GCP resources you create from it. |
| **Pre-authenticated**          | Already logged in as your Console user; no `gcloud auth login` needed.       |

## Scenarios

| Scenario                                                        | Answer                                              |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Constantly switching between a personal and a work GCP project        | Named `gcloud` configurations                               |
| Want to try gcloud without installing anything locally                | Cloud Shell                                                  |
| Need machine-parseable output for a script                            | `--format=json`                                              |
| Forgot which project is currently active                              | `gcloud config get-value project`                            |

## Next

Continue to **Section 9 — Compute Engine From Command Line**.
