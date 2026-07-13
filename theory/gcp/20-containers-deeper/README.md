# Section 20 — Going Deeper with Containers

## Creating Container Images with a Dockerfile

A **Dockerfile** is the recipe for building a container image — a sequence of instructions describing the base image, what to copy in, and how to run the app.

```dockerfile
FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
```

```bash
docker build -t my-app:v1 .
docker run -p 8080:8080 my-app:v1
```

## Understanding How to Reuse Container Layers

Each instruction in a Dockerfile creates an immutable **layer**. Docker caches layers and reuses them on subsequent builds *if nothing above them in the file changed* — so ordering matters:

```dockerfile
# GOOD: dependency files copied (and installed) BEFORE the rest of the source.
# Code changes (which happen constantly) don't invalidate the expensive
# `npm ci` layer — only changing package.json does.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

```dockerfile
# BAD: copying everything first means ANY code change invalidates the cache
# for npm ci too, forcing a full reinstall on every single build.
COPY . .
RUN npm ci
```

This caching is why Docker builds get dramatically faster once you've built once and only changed application code — the dependency-install layer is reused unchanged.

## Best Practices with Docker

| Practice                          | Why                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Use a small base image**          | `node:20-slim` / `-alpine` over the full image — smaller attack surface, faster pulls.       |
| **Order layers from least → most frequently changing** | Maximizes cache reuse (dependencies before app code, as above).             |
| **Use `.dockerignore`**             | Exclude `node_modules`, `.git`, secrets, build artifacts from the build context.             |
| **Multi-stage builds**              | Compile/build in one stage, copy only the final artifact into a slim runtime stage — keeps the final image small and free of build tools. |
| **Don't run as root**               | Add a non-root `USER` — limits blast radius if the container is compromised.                |
| **Pin specific image tags**         | Avoid `:latest` in production — it's not reproducible; a rebuild months later could pull a different image entirely. |
| **One process per container**       | Keep containers single-purpose — easier to scale, debug, and reason about independently.     |

## Next

Continue to **Section 21 — Getting Started with Kubernetes**.
