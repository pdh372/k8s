# Lesson 23 — Init Containers

## Theory

**Init containers** run and complete **before** any app containers in the same Pod start. They are used to perform initialization tasks that must finish successfully before the main app is allowed to run.

### Key Properties

- Init containers run **sequentially** (one at a time, in order).
- Each init container must **exit with code 0** before the next one starts.
- If an init container fails, Kubernetes restarts it (respecting the Pod's `restartPolicy`).
- App containers don't start until **all** init containers have completed.
- Init containers can use **different images** from the app containers (e.g. `curl`, `git`, `busybox` for setup tasks).

### Common Use Cases

| Use case                             | Example                                       |
| ------------------------------------ | --------------------------------------------- |
| Wait for a dependency                | `nslookup db-service` until DNS resolves      |
| Pre-populate a volume                | Clone a git repo before the web server starts |
| Register with a service registry     | POST to Consul before app starts              |
| Wait for another service to be ready | `wget http://db:5432` until it responds       |
| Set filesystem permissions           | `chmod`/`chown` a volume before app mounts it |

### Init vs Sidecar

|          | Init Container        | Sidecar Container           |
| -------- | --------------------- | --------------------------- |
| Runs     | Before app containers | Alongside app containers    |
| Duration | Completes and exits   | Runs for the Pod's lifetime |
| Purpose  | One-time setup        | Ongoing support function    |

---

## YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: init-demo
spec:
    initContainers:
        - name: wait-for-db
          image: busybox:1.36
          command:
              [
                  'sh',
                  '-c',
                  'until nslookup db-service; do echo waiting for db; sleep 2; done',
              ]
        - name: init-data
          image: busybox:1.36
          command: ['sh', '-c', 'echo "init data" > /data/init.txt']
          volumeMounts:
              - name: data
                mountPath: /data
    containers:
        - name: app
          image: nginx:1.25
          volumeMounts:
              - name: data
                mountPath: /data
    volumes:
        - name: data
          emptyDir: {}
```

---

## Lab

### 1. Basic init container

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: init-basic
spec:
  initContainers:
    - name: setup
      image: busybox
      command: ["/bin/sh", "-c", "echo 'Init container running'; sleep 3; echo 'Init done'"]
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo 'App container started'; sleep 3600"]
EOF

# Watch the Pod start — you'll see Init:0/1 then Running
kubectl get pod init-basic --watch
```

### 2. Init container prepares a volume for the app

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: init-volume
spec:
  initContainers:
    - name: fetch-config
      image: busybox
      command:
        - /bin/sh
        - -c
        - |
          echo "APP_ENV=production" > /config/app.env
          echo "MAX_CONN=100" >> /config/app.env
          echo "Config written by init container"
      volumeMounts:
        - name: config
          mountPath: /config
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /config/app.env; sleep 3600"]
      volumeMounts:
        - name: config
          mountPath: /config
  volumes:
    - name: config
      emptyDir: {}
EOF

kubectl logs init-volume -c fetch-config
kubectl logs init-volume -c app
```

### 3. Init container waiting for a service

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: wait-for-service
spec:
  initContainers:
    - name: wait-nginx
      image: busybox
      command: ['sh', '-c', 'until wget -q --spider http://nginx-svc; do echo waiting...; sleep 3; done; echo service ready']
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo 'Connected! App running'; sleep 3600"]
EOF

kubectl get pod wait-for-service    # Init:0/1 (waiting for nginx-svc)

# Create the service it's waiting for
kubectl run nginx --image=nginx:1.25 --labels=app=nginx
kubectl expose pod nginx --port=80 --name=nginx-svc

# Watch the init container unblock
kubectl get pod wait-for-service --watch
kubectl logs wait-for-service -c wait-nginx
```

### 4. Multiple sequential init containers

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: multi-init
spec:
  initContainers:
    - name: step-1
      image: busybox
      command: ["/bin/sh", "-c", "echo 'Step 1: checking dependencies'; sleep 2"]
    - name: step-2
      image: busybox
      command: ["/bin/sh", "-c", "echo 'Step 2: fetching config'; sleep 2"]
    - name: step-3
      image: busybox
      command: ["/bin/sh", "-c", "echo 'Step 3: warming cache'; sleep 2"]
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo 'App started after all init steps'; sleep 3600"]
EOF

kubectl get pod multi-init --watch
# Observe: Init:0/3 → Init:1/3 → Init:2/3 → Running

kubectl logs multi-init -c step-1
kubectl logs multi-init -c step-2
kubectl logs multi-init -c step-3
kubectl logs multi-init -c app
```

### 5. Describe shows init container status

```bash
kubectl describe pod multi-init | grep -A20 "Init Containers:"
```

### Cleanup

```bash
kubectl delete pod init-basic init-volume wait-for-service multi-init nginx 2>/dev/null; true
kubectl delete service nginx-svc 2>/dev/null; true
```

---

## Next

Application Lifecycle Management complete. Move on to Lesson 24 — OS Upgrades (Cluster Maintenance).
