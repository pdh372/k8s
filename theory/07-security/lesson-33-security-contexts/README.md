# Lesson 33 — Security Contexts

## Theory

A **Security Context** defines privilege and access control settings for a Pod or a single container. It controls:

- Which user/group the process runs as
- Whether the root filesystem is read-only
- Linux capabilities (add or drop)
- Whether a container runs in privileged mode (full host access — avoid!)
- `allowPrivilegeEscalation` — whether a process can gain more privileges than its parent

### Pod vs Container Security Context

- `spec.securityContext` applies to **all containers** in the Pod (Pod-level).
- `spec.containers[].securityContext` applies to **one container** and overrides the Pod-level.

### Key Fields

| Field                      | Level           | Meaning                                                        |
| -------------------------- | --------------- | -------------------------------------------------------------- |
| `runAsUser`                | Pod / Container | UID the container process runs as                              |
| `runAsGroup`               | Pod / Container | GID the container process runs as                              |
| `fsGroup`                  | Pod only        | GID applied to mounted volumes (files are owned by this group) |
| `runAsNonRoot`             | Pod / Container | Fail if container tries to run as root                         |
| `readOnlyRootFilesystem`   | Container       | Make the root FS read-only                                     |
| `allowPrivilegeEscalation` | Container       | Prevent `setuid` binaries from gaining root                    |
| `privileged`               | Container       | Give full host access (avoid!)                                 |
| `capabilities.add`         | Container       | Add Linux capabilities                                         |
| `capabilities.drop`        | Container       | Drop Linux capabilities                                        |

### Linux Capabilities

Instead of running as root, grant specific capabilities:

| Capability         | What it allows                          |
| ------------------ | --------------------------------------- |
| `NET_ADMIN`        | Manage network interfaces, routes, etc. |
| `SYS_TIME`         | Set the system clock                    |
| `CHOWN`            | Change file ownership                   |
| `NET_BIND_SERVICE` | Bind to ports < 1024 without root       |

Best practice: **drop `ALL`**, then add back only what you need.

---

## Lab

### 1. Run as a specific user

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: security-ctx-demo
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "id; ls -la /data; sleep 3600"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      emptyDir: {}
EOF

kubectl logs security-ctx-demo
# uid=1000 gid=3000 groups=2000,3000
# /data is owned by group 2000 (fsGroup)
```

### 2. Read-only root filesystem

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: readonly-fs
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo test > /tmp/file; sleep 3600"]
      securityContext:
        readOnlyRootFilesystem: true
EOF

kubectl logs readonly-fs
# /bin/sh: can't create /tmp/file: Read-only file system

# Allow writes to /tmp via an emptyDir volume
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: readonly-with-tmp
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo test > /tmp/file; cat /tmp/file; sleep 3600"]
      securityContext:
        readOnlyRootFilesystem: true
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
EOF

kubectl logs readonly-with-tmp    # → test
```

### 3. Drop and add capabilities

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: capabilities-demo
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "sleep 3600"]
      securityContext:
        capabilities:
          drop:
            - ALL
          add:
            - NET_BIND_SERVICE    # allow binding to ports < 1024
EOF

kubectl exec -it capabilities-demo -- /bin/sh
# Try: cat /proc/1/status | grep Cap
exit
```

### 4. Prevent privilege escalation

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: no-priv-escalation
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "sleep 3600"]
      securityContext:
        allowPrivilegeEscalation: false
        runAsNonRoot: true
        runAsUser: 1000
EOF

kubectl get pod no-priv-escalation
```

### 5. Verify that privileged mode is NOT set

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: check-privileged
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /proc/1/status | grep CapEff; sleep 3600"]
      securityContext:
        privileged: false    # explicit false (also the default)
EOF

kubectl logs check-privileged
# CapEff should be a small value (not ffffffffffffffff which means full root)
```

### 6. Pod Security Standards (PodSecurity admission)

Kubernetes 1.25+ has built-in Pod Security Standards applied per namespace:

```bash
# Label a namespace to enforce the restricted policy
kubectl label namespace default pod-security.kubernetes.io/enforce=restricted
kubectl label namespace default pod-security.kubernetes.io/warn=restricted

# Try to create a Pod without a security context
kubectl run plain-pod --image=nginx:1.25
# → Warning or Error about policy violation

# Clean up the label
kubectl label namespace default pod-security.kubernetes.io/enforce- pod-security.kubernetes.io/warn-
```

### Cleanup

```bash
kubectl delete pod security-ctx-demo readonly-fs readonly-with-tmp \
  capabilities-demo no-priv-escalation check-privileged plain-pod 2>/dev/null; true
```

---

## Next

Move on to Lesson 34 — Network Policies.
