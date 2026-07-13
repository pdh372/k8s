# Lesson 19 — Commands and Arguments

## Theory

Understanding how Docker's `CMD` and `ENTRYPOINT` map to Kubernetes `command` and `args` is essential for configuring containers correctly.

### Docker: CMD vs ENTRYPOINT

| Instruction  | Role                                                                      | Can be overridden at runtime?         |
| ------------ | ------------------------------------------------------------------------- | ------------------------------------- |
| `ENTRYPOINT` | The executable / main process                                             | Yes, with `docker run --entrypoint`   |
| `CMD`        | Default arguments to the ENTRYPOINT (or default command if no ENTRYPOINT) | Yes, append args after the image name |

**Example Dockerfile:**

```dockerfile
FROM ubuntu
ENTRYPOINT ["sleep"]
CMD ["5"]
```

```bash
docker run my-image           # runs: sleep 5
docker run my-image 10        # runs: sleep 10   (CMD overridden)
docker run --entrypoint date my-image    # runs: date (ENTRYPOINT overridden)
```

### Kubernetes: command vs args

| K8s field                   | Overrides Docker's |
| --------------------------- | ------------------ |
| `spec.containers[].command` | `ENTRYPOINT`       |
| `spec.containers[].args`    | `CMD`              |

```yaml
spec:
    containers:
        - name: sleeper
          image: ubuntu
          command: ['sleep'] # overrides ENTRYPOINT
          args: ['100'] # overrides CMD
```

### Decision Table

| ENTRYPOINT in image | CMD in image | K8s command | K8s args | What runs  |
| ------------------- | ------------ | ----------- | -------- | ---------- |
| `[sleep]`           | `[5]`        | (none)      | (none)   | `sleep 5`  |
| `[sleep]`           | `[5]`        | (none)      | `["10"]` | `sleep 10` |
| `[sleep]`           | `[5]`        | `["echo"]`  | `["hi"]` | `echo hi`  |
| (none)              | `[sleep, 5]` | (none)      | (none)   | `sleep 5`  |
| (none)              | `[sleep, 5]` | `["echo"]`  | (none)   | `echo`     |

---

## Lab

### 1. Default image command

```bash
# busybox's default CMD is "sh" — the container exits immediately without a command to run
kubectl run busybox-default --image=busybox
kubectl get pod busybox-default    # Completed / CrashLoopBackOff (exits right away)
kubectl logs busybox-default
```

### 2. Override CMD (args only)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: sleeper
spec:
  containers:
    - name: sleeper
      image: busybox
      args: ["sleep", "3600"]    # sets CMD, no ENTRYPOINT in busybox
EOF

kubectl get pod sleeper    # Running
```

### 3. Override ENTRYPOINT and CMD (command + args)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: echo-pod
spec:
  containers:
    - name: echo
      image: ubuntu
      command: ["/bin/echo"]
      args: ["Hello from Kubernetes!"]
EOF

kubectl logs echo-pod
# → Hello from Kubernetes!
```

### 4. Multi-word shell command (use sh -c)

When you need pipes, redirects, or complex shell logic:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: shell-cmd
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c"]
      args: ["echo start && sleep 5 && echo done"]
EOF

kubectl logs shell-cmd
# → start
# → done
```

### 5. Same thing imperative style

```bash
kubectl run sleeper2 --image=busybox -- sleep 3600
# Everything after -- becomes args to the container
```

```bash
kubectl run env-printer --image=busybox \
  --command -- /bin/sh -c "env | sort"
kubectl logs env-printer
```

### 6. Inspect what command a running container uses

```bash
kubectl get pod sleeper -o jsonpath='{.spec.containers[0].args}'
kubectl describe pod echo-pod | grep -A3 Command
```

### Cleanup

```bash
kubectl delete pod busybox-default sleeper echo-pod shell-cmd sleeper2 env-printer 2>/dev/null; true
```

---

## Next

Move on to Lesson 20 — Environment Variables.
