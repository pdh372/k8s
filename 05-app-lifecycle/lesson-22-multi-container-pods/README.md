# Lesson 22 — Multi-Container Pods

## Theory

While most Pods run a single container, you can co-locate multiple containers in a Pod when they need to work closely together. All containers in a Pod:

- Share the **same network namespace** (same IP, same port space — they talk via `localhost`)
- Can share **volumes** (passed to each container via `volumeMounts`)
- Are scheduled **together** on the same Node
- Start and stop together (Pod lifecycle)

### Three Design Patterns

**Sidecar**
The sidecar enhances or extends the main container without changing it. The main container does its job; the sidecar adds a capability alongside it.

```
[main app] ←─ shares volume ─→ [log-shipper sidecar]
```

Examples:

- Log collector reading from a shared volume and shipping to Elasticsearch
- Service mesh proxy (Envoy in Istio) intercepting network traffic
- Config reloader watching for ConfigMap changes and signaling the main process

**Ambassador**
The ambassador acts as a proxy between the main container and the outside world. The main container always connects to `localhost`, and the ambassador handles routing/load-balancing to the real backend.

```
[main app] → localhost:5432 → [ambassador] → [right DB environment]
```

Example: main app always connects to `localhost:5432`; the ambassador routes to the correct database (dev/staging/prod) based on environment.

**Adapter**
The adapter transforms the output of the main container into a standard format expected by an external system.

```
[main app writes custom metrics] → [adapter normalizes to Prometheus format] → Prometheus scraper
```

---

## YAML — Sidecar Example

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: sidecar-pod
spec:
    volumes:
        - name: shared-logs
          emptyDir: {}
    containers:
        - name: main-app
          image: nginx:1.25
          volumeMounts:
              - name: shared-logs
                mountPath: /var/log/nginx
        - name: log-sidecar
          image: busybox:1.36
          command: ['/bin/sh', '-c', 'tail -f /logs/access.log']
          volumeMounts:
              - name: shared-logs
                mountPath: /logs
```

---

## Lab

### 1. Basic multi-container Pod with shared volume

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: shared-vol-pod
spec:
  volumes:
    - name: shared
      emptyDir: {}
  containers:
    - name: writer
      image: busybox
      command: ["/bin/sh", "-c", "while true; do echo $(date) >> /data/log.txt; sleep 2; done"]
      volumeMounts:
        - name: shared
          mountPath: /data
    - name: reader
      image: busybox
      command: ["/bin/sh", "-c", "while true; do cat /data/log.txt 2>/dev/null; sleep 5; done"]
      volumeMounts:
        - name: shared
          mountPath: /data
EOF

kubectl get pod shared-vol-pod
# Access logs from each container separately
kubectl logs shared-vol-pod -c writer
kubectl logs shared-vol-pod -c reader
```

### 2. Shared network namespace (localhost communication)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: network-share-pod
spec:
  containers:
    - name: server
      image: nginx:1.25
    - name: client
      image: busybox
      command: ["/bin/sh", "-c", "while true; do wget -qO- localhost:80 | head -3; sleep 10; done"]
EOF

kubectl logs network-share-pod -c client    # client reaches nginx via localhost
```

### 3. Sidecar — log shipping pattern

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-logging
spec:
  volumes:
    - name: logs
      emptyDir: {}
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "i=1; while true; do echo \"Request $i processed\" >> /var/log/app.log; i=$((i+1)); sleep 1; done"]
      volumeMounts:
        - name: logs
          mountPath: /var/log
    - name: log-shipper
      image: busybox
      command: ["/bin/sh", "-c", "tail -f /logs/app.log"]
      volumeMounts:
        - name: logs
          mountPath: /logs
EOF

kubectl logs sidecar-logging -c log-shipper --tail=5
# Shows logs written by the app container
```

### 4. Init container (preview — next lesson in detail)

Note: init containers always complete before app containers start, unlike sidecar containers which run alongside.

### 5. Exec into a specific container

```bash
kubectl exec -it shared-vol-pod -c writer -- /bin/sh
ls /data
exit

kubectl exec -it shared-vol-pod -c reader -- /bin/sh
cat /data/log.txt
exit
```

### 6. Get the list of containers in a Pod

```bash
kubectl get pod shared-vol-pod -o jsonpath='{.spec.containers[*].name}'
kubectl describe pod shared-vol-pod | grep 'Container ID' -A2
```

### Cleanup

```bash
kubectl delete pod shared-vol-pod network-share-pod sidecar-logging 2>/dev/null; true
```

---

## Next

Move on to Lesson 23 — Init Containers.
