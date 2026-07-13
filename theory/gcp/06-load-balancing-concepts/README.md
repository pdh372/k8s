# Section 6 — Getting Started with Key Load Balancing Concepts

## How Do Computers Communicate

Two computers talk over a network using **protocols** — agreed-upon rules for formatting and exchanging data — layered on top of each other (the OSI/TCP-IP model). The two layers that matter most for load balancing:

| Layer                  | Protocol examples     | What it knows about                                          |
| ------------------------- | ------------------------ | ------------------------------------------------------------------ |
| **Layer 4 (Transport)**  | TCP, UDP                 | Source/destination IP and port only — no idea what's inside the packet. |
| **Layer 7 (Application)** | HTTP, HTTPS, gRPC, WebSocket | The actual content — URL path, headers, cookies, method.       |

## Different Applications Have Different Needs

- A **web app** wants routing decisions based on the URL path (`/api/*` → backend A, `/static/*` → backend B) — needs Layer 7 visibility.
- A **raw TCP service** (a database, a game server, a custom protocol) has no HTTP semantics to route on — Layer 4 is the only option, and often the only thing needed.
- **SSL/TLS termination** (decrypting HTTPS before it reaches the backend) requires understanding the connection at Layer 7 or purpose-built Layer 4 SSL proxying.

## Layer 7 vs Layer 4 Load Balancing

| Aspect                  | Layer 4 (Network/TCP)                            | Layer 7 (HTTP/Application)                                  |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| **Routing decision based on** | IP + port only                                     | URL path, host header, HTTP method, cookies                        |
| **Protocol awareness**     | None — blind to payload content                     | Full understanding of HTTP semantics                                |
| **Use case**               | Non-HTTP TCP/UDP traffic, or when you just need raw connection distribution | Web apps, microservices needing path/host-based routing            |
| **GCP product**            | Network Load Balancer (passthrough), TCP/SSL Proxy Load Balancer | HTTP(S) Load Balancer                                               |

## Layers, Protocols and Load Balancing — Scenarios

| Scenario                                                                | Answer                                       |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| Route `/api` and `/images` paths of the same domain to different backend services | Layer 7 — HTTP(S) Load Balancer                     |
| Load balance a custom TCP-based game server protocol                      | Layer 4 — Network (passthrough) Load Balancer        |
| Terminate SSL/TLS at the load balancer, backends only see plain HTTP       | Layer 7 (or SSL Proxy for non-HTTP TLS traffic)       |
| Route based on which domain name was requested (multiple sites, one IP)   | Layer 7 — host-based routing                          |
| Need the absolute lowest latency, protocol-agnostic passthrough           | Layer 4 — Network Load Balancer                       |

## Next

Continue to **Section 7 — Getting Started with Cloud Load Balancing**.
