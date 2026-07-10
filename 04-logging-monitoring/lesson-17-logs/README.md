# Lesson 17 — Managing Application Logs

## Theory

Kubernetes captures `stdout` and `stderr` from each container and makes them available via `kubectl logs`. There is no built-in persistent log store — logs are held on the Node's disk and rotated.

> For production, ship logs to a centralized system (Elasticsearch, Loki, CloudWatch, etc.) using a DaemonSet log collector (Fluentd, Filebeat, Promtail).

### How Kubernetes Handles Logs

1. Container writes to `stdout`/`stderr`.
2. Container runtime (containerd) writes the output to a log file on the Node's disk (typically `/var/log/pods/<pod>/<container>/*.log`).
3. `kubectl logs` reads that file via the kubelet's log API.
4. When a Pod is deleted, the log files are eventually cleaned up.

### Logging from Within Your Application

Best practice for K8s: write logs to **stdout/stderr only**. Do not write to log files inside the container — they are ephemeral and not accessible via `kubectl logs`.

---

## Lab

### 1. Basic log viewing

```bash
kubectl run nginx-log --image=nginx:1.25
kubectl logs nginx-log
```

### 2. Streaming logs

```bash
kubectl logs nginx-log --follow    # stream, Ctrl-C to stop
kubectl logs nginx-log -f          # same, short flag

# Tail last N lines
kubectl logs nginx-log --tail=20
```

### 3. Logs from a previous (crashed) container

```bash
kubectl run crasher --image=busybox -- /bin/sh -c "echo 'about to crash'; exit 1"
kubectl get pod crasher    # CrashLoopBackOff

kubectl logs crasher               # logs from current (latest) container
kubectl logs crasher --previous    # logs from the PREVIOUS run (before crash)
```

### 4. Logs with timestamps

```bash
kubectl logs nginx-log --timestamps
kubectl logs nginx-log --timestamps --tail=10
```

### 5. Logs from a specific time window

```bash
kubectl logs nginx-log --since=1h     # last 1 hour
kubectl logs nginx-log --since=5m     # last 5 minutes
kubectl logs nginx-log --since-time="2024-01-01T00:00:00Z"
```

### 6. Multi-container Pod — specify container with `-c`

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: multi-container
spec:
  containers:
    - name: nginx
      image: nginx:1.25
    - name: sidecar
      image: busybox:1.36
      command: ["/bin/sh", "-c", "while true; do echo 'sidecar running'; sleep 10; done"]
EOF

kubectl logs multi-container -c nginx      # logs from nginx container
kubectl logs multi-container -c sidecar    # logs from sidecar container
kubectl logs multi-container --all-containers=true    # all containers combined
```

### 7. Logs from all Pods of a Deployment/Label

```bash
kubectl create deployment web --image=nginx:1.25 --replicas=3

# Logs from all Pods matching a label
kubectl logs -l app=web --all-containers=true
kubectl logs -l app=web --tail=5
```

### 8. Log location on the Node

```bash
minikube ssh
ls /var/log/pods/
ls /var/log/containers/    # symlinks to the above
exit
```

### 9. Structured logging (JSON)

Applications should emit JSON logs for easier parsing in a log aggregation system. Example:

```json
{
	"time": "2024-01-01T12:00:00Z",
	"level": "info",
	"msg": "request handled",
	"path": "/api/users",
	"status": 200
}
```

`kubectl logs` will display this as raw text, but a log aggregator (Loki, Elasticsearch) can index each field.

### Cleanup

```bash
kubectl delete pod nginx-log crasher multi-container 2>/dev/null; true
kubectl delete deployment web 2>/dev/null; true
```

---

## Next

Logging & Monitoring section complete. Move on to Lesson 18 — Rolling Updates and Rollbacks (Application Lifecycle).
