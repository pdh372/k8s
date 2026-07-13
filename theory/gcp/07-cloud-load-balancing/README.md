# Section 7 — Getting Started with Cloud Load Balancing

## Getting Started with Cloud Load Balancing

**Cloud Load Balancing** is GCP's fully-managed load balancing service — no VMs to run yourself, scales automatically, and (for the global HTTP(S) variant) is a single anycast IP that routes to the nearest healthy backend worldwide.

### The load balancer family

| Load Balancer type              | Layer   | Scope           | Use case                                          |
| ------------------------------------ | --------- | ----------------- | ----------------------------------------------------- |
| **Global external HTTP(S)**         | 7        | Global            | Public web apps/APIs, path/host-based routing, CDN integration |
| **Regional external HTTP(S)**       | 7        | Regional          | Regional-only web apps                                 |
| **SSL Proxy / TCP Proxy**           | 4 (with TLS termination) | Global | Non-HTTP TCP/SSL traffic that still wants a global anycast IP |
| **External passthrough Network LB** | 4        | Regional          | Raw TCP/UDP, lowest latency, backend sees real client IP |
| **Internal HTTP(S) / Internal passthrough Network LB** | 7 / 4 | Regional (internal-only) | Load balancing between internal microservices, never exposed to the internet |

## Cloud Load Balancing Terminology

| Term                    | Meaning                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| **Forwarding rule**       | Binds a public/internal IP + port to a target proxy — the entry point traffic actually hits.        |
| **Target proxy**          | Terminates the client connection (and SSL, if HTTPS) and consults the URL map for routing.           |
| **URL map**               | The routing rule set — maps URL paths/hosts to backend services (Layer 7 only).                       |
| **Backend service**       | A named group of backends (usually a MIG) plus its health check and load balancing settings.          |
| **Backend bucket**        | Like a backend service, but points at a Cloud Storage bucket instead of compute backends — for serving static content. |
| **Health check**          | Periodic probe GCP uses to decide if a backend instance should keep receiving traffic.                 |

Request flow for a global HTTP(S) LB: `Client → Forwarding Rule → Target HTTP(S) Proxy → URL Map → Backend Service → MIG instance`.

## Playing with Google Cloud Load Balancing

```bash
# 1. Health check
gcloud compute health-checks create http web-health-check --port=80

# 2. Backend service, attach the MIG from Section 4/5 as a backend
gcloud compute backend-services create web-backend-service \
  --protocol=HTTP \
  --health-checks=web-health-check \
  --global

gcloud compute backend-services add-backend web-backend-service \
  --instance-group=web-mig \
  --instance-group-region=us-central1 \
  --global

# 3. URL map — routes everything to the one backend service
gcloud compute url-maps create web-url-map \
  --default-service=web-backend-service

# 4. Target HTTP proxy
gcloud compute target-http-proxies create web-http-proxy \
  --url-map=web-url-map

# 5. Global forwarding rule — the actual public IP
gcloud compute forwarding-rules create web-forwarding-rule \
  --global \
  --target-http-proxy=web-http-proxy \
  --ports=80
```

Check the assigned IP and test it:

```bash
gcloud compute forwarding-rules describe web-forwarding-rule --global
curl http://<assigned-ip>
```

## Next

Continue to **Section 8 — Getting Started with gcloud (Command Line)**.
