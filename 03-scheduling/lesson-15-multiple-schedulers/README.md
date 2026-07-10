# Lesson 15 — Multiple Schedulers

## Theory

Kubernetes allows you to run **multiple schedulers simultaneously**. Each scheduler has a name, and Pods can specify which scheduler should handle them via `spec.schedulerName`. If omitted, `default-scheduler` is used.

### When You'd Need a Custom Scheduler

- Special placement logic not supported by the default scheduler (e.g. GPU topology, rack-awareness)
- Academic / experimentation
- A legacy application with unusual affinity requirements

### How It Works

1. Deploy your custom scheduler as a regular Deployment.
2. Run it with a unique `--scheduler-name` flag.
3. Set `spec.schedulerName: my-custom-scheduler` on the Pods you want it to handle.

The default scheduler and the custom scheduler run independently — each only processes Pods with their own name in `schedulerName` (or blank, which defaults to `default-scheduler`).

---

## Lab

### 1. Identify the default scheduler

```bash
kubectl get pods -n kube-system | grep scheduler
kubectl describe pod kube-scheduler-minikube -n kube-system | head -30
```

Note the `--leader-elect` flags — in a multi-control-plane HA setup, schedulers use leader election to avoid conflicts.

### 2. Deploy a second (custom) scheduler

For this lab we re-use the official `kube-scheduler` image but register it under a different name.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-scheduler
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: my-scheduler-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:kube-scheduler
subjects:
  - kind: ServiceAccount
    name: my-scheduler
    namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-scheduler-config
  namespace: kube-system
data:
  my-scheduler-config.yaml: |
    apiVersion: kubescheduler.config.k8s.io/v1
    kind: KubeSchedulerConfiguration
    profiles:
      - schedulerName: my-custom-scheduler
    leaderElection:
      leaderElect: false
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-custom-scheduler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      component: my-custom-scheduler
  template:
    metadata:
      labels:
        component: my-custom-scheduler
    spec:
      serviceAccountName: my-scheduler
      containers:
        - name: my-custom-scheduler
          image: registry.k8s.io/kube-scheduler:v1.30.0
          command:
            - kube-scheduler
            - --config=/etc/kubernetes/my-scheduler-config.yaml
          volumeMounts:
            - name: config
              mountPath: /etc/kubernetes
      volumes:
        - name: config
          configMap:
            name: my-scheduler-config
EOF

kubectl get deployment my-custom-scheduler -n kube-system
kubectl get pods -n kube-system -l component=my-custom-scheduler
```

### 3. Create a Pod that uses the custom scheduler

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pod-default-scheduler
spec:
  containers:
    - name: nginx
      image: nginx:1.25
---
apiVersion: v1
kind: Pod
metadata:
  name: pod-custom-scheduler
spec:
  schedulerName: my-custom-scheduler    # use our custom scheduler
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pods
```

### 4. Confirm which scheduler placed the Pod

```bash
kubectl describe pod pod-custom-scheduler | grep -i scheduler
kubectl get events --field-selector reason=Scheduled
```

The event will show `my-custom-scheduler` as the source for `pod-custom-scheduler`.

### 5. Verify the scheduler name field

```bash
kubectl get pod pod-custom-scheduler -o jsonpath='{.spec.schedulerName}'
# → my-custom-scheduler
kubectl get pod pod-default-scheduler -o jsonpath='{.spec.schedulerName}'
# → default-scheduler
```

### Cleanup

```bash
kubectl delete pod pod-default-scheduler pod-custom-scheduler 2>/dev/null; true
kubectl delete deployment my-custom-scheduler -n kube-system 2>/dev/null; true
kubectl delete configmap my-scheduler-config -n kube-system 2>/dev/null; true
kubectl delete clusterrolebinding my-scheduler-crb 2>/dev/null; true
kubectl delete serviceaccount my-scheduler -n kube-system 2>/dev/null; true
```

---

## Next

Scheduling section complete. Move on to Lesson 16 — Monitoring (Metrics Server).
