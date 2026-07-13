# Lesson 45 — Ingress

## Theory

A **Service** of type NodePort/LoadBalancer gives you one external IP/port per Service. If you have 20 microservices, you'd need 20 LoadBalancers — expensive and hard to manage.

**Ingress** solves this with a single entry point that routes HTTP(S) traffic to multiple Services based on **hostname** and **path rules**.

```
Internet
    ↓
LoadBalancer (one external IP)
    ↓
Ingress Controller (nginx, traefik, haproxy…)
    ↓ matches rules
    ├── /api/*        → api-service
    ├── /app/*        → frontend-service
    └── other.com/*   → other-service
```

### Two Components

| Component              | What it is                                       | Created by        |
| ---------------------- | ------------------------------------------------ | ----------------- |
| **Ingress resource**   | YAML that defines routing rules                  | You (developer)   |
| **Ingress Controller** | The actual proxy Pod(s) that implement the rules | Platform/ops team |

> ⚠️ Kubernetes does NOT include an Ingress Controller by default. You must install one. The Ingress resource alone does nothing without a controller.

### Popular Ingress Controllers

| Controller             | Notes                                           |
| ---------------------- | ----------------------------------------------- |
| **ingress-nginx**      | Most common; maintained by Kubernetes community |
| **Traefik**            | Dynamic config, good for microservices          |
| **HAProxy**            | High performance                                |
| **Kong**               | API gateway features                            |
| **GKE Ingress**        | GCP native; uses Cloud Load Balancer            |
| **AWS ALB Controller** | AWS native; uses Application Load Balancer      |

### IngressClass

Multiple Ingress Controllers can coexist. `IngressClass` tells each Ingress which controller handles it:

```yaml
spec:
    ingressClassName: nginx
```

---

## YAML

**Path-based routing:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: app-ingress
    annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /
spec:
    ingressClassName: nginx
    rules:
        - http:
              paths:
                  - path: /app
                    pathType: Prefix
                    backend:
                        service:
                            name: frontend-svc
                            port:
                                number: 80
                  - path: /api
                    pathType: Prefix
                    backend:
                        service:
                            name: api-svc
                            port:
                                number: 8080
```

**Host-based routing:**

```yaml
spec:
    rules:
        - host: myapp.example.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: frontend-svc
                            port:
                                number: 80
        - host: api.example.com
          http:
              paths:
                  - path: /
                    pathType: Prefix
                    backend:
                        service:
                            name: api-svc
                            port:
                                number: 8080
```

**TLS termination:**

```yaml
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls-secret    # Secret with tls.crt and tls.key
  rules:
    - host: myapp.example.com
      ...
```

---

## Lab

### 1. Enable Ingress on Minikube

```bash
minikube addons enable ingress
kubectl get pods -n ingress-nginx    # ingress-nginx-controller Pod
kubectl get ingressclass
```

### 2. Create backend services

```bash
kubectl create deployment app1 --image=nginx:1.25
kubectl create deployment app2 --image=httpd:2.4

kubectl expose deployment app1 --port=80 --name=app1-svc
kubectl expose deployment app2 --port=80 --name=app2-svc
```

### 3. Create an Ingress with path-based routing

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          - path: /app1
            pathType: Prefix
            backend:
              service:
                name: app1-svc
                port:
                  number: 80
          - path: /app2
            pathType: Prefix
            backend:
              service:
                name: app2-svc
                port:
                  number: 80
EOF

kubectl get ingress
kubectl describe ingress demo-ingress
```

### 4. Test the Ingress

```bash
INGRESS_IP=$(minikube ip)
echo "Ingress IP: $INGRESS_IP"

curl http://$INGRESS_IP/app1    # → nginx welcome page
curl http://$INGRESS_IP/app2    # → Apache test page
```

### 5. Host-based routing with /etc/hosts

```bash
INGRESS_IP=$(minikube ip)

# Add fake DNS entries to /etc/hosts (on your host machine)
echo "$INGRESS_IP  app1.local app2.local" | sudo tee -a /etc/hosts

cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: app1.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app1-svc
                port:
                  number: 80
    - host: app2.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app2-svc
                port:
                  number: 80
EOF

curl http://app1.local
curl http://app2.local
```

### 6. TLS Ingress

```bash
# Generate a self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=app1.local/O=demo"

kubectl create secret tls app1-tls --key=tls.key --cert=tls.crt

cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app1.local
      secretName: app1-tls
  rules:
    - host: app1.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app1-svc
                port:
                  number: 80
EOF

curl -k https://app1.local    # -k ignores self-signed cert warning
```

### Cleanup

```bash
kubectl delete deployment app1 app2 2>/dev/null; true
kubectl delete service app1-svc app2-svc 2>/dev/null; true
kubectl delete ingress demo-ingress host-ingress tls-ingress 2>/dev/null; true
kubectl delete secret app1-tls 2>/dev/null; true
rm -f tls.key tls.crt
sudo sed -i '/app1.local/d' /etc/hosts
sudo sed -i '/app2.local/d' /etc/hosts
```

---

## Next

Networking section complete. Move on to Lesson 46 — Designing HA Clusters.
