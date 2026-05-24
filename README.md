# ☸️ Certified Kubernetes Administrator (CKA) - Detailed Self-Study Progress Tracking

Kho lưu trữ này được tạo ra để lưu trữ tài liệu, ghi chú (notes), các file cấu hình YAML và theo dõi tiến độ chi tiết từng bài học trong khóa học **Certified Kubernetes Administrator (CKA) with Practice Tests** trên Udemy.

---

## 📊 Chi Tiết Lộ Trình Học & Tiến Độ (Detailed Course Agenda)

### 🧩 Core Concepts & Scheduling

#### 📂 Section 1: Introduction
- [ ] 1. Introduction
- [ ] 2. Certification Overview
- [ ] 3. Kubernetes Architecture
- [ ] 4. **Lab** - Accessing the Lab Environment
- [ ] 5. Course Resources

#### 📂 Section 2: Core Concepts
- [ ] 6. Cluster Architecture
- [ ] 7. API Primitives
- [ ] 8. Introduction to Pods
- [ ] 9. Pods with YAML
- [ ] 10. **Lab** - Pods
- [ ] 11. ReplicaSets
- [ ] 12. **Lab** - ReplicaSets
- [ ] 13. Deployments
- [ ] 14. **Lab** - Deployments
- [ ] 15. Namespaces
- [ ] 16. **Lab** - Namespaces
- [ ] 17. Services - Introduction
- [ ] 18. Services - ClusterIP
- [ ] 19. Services - NodePort
- [ ] 20. Services - LoadBalancer
- [ ] 21. **Lab** - Services
- [ ] 22. Imperative vs Declarative
- [ ] 23. Certification Tip: Imperative Commands
- [ ] 24. **Lab** - Imperative Commands
- [ ] *Kiến trúc nâng cao:* Kube-API Server, Kube-Controller-Manager, Kube-Scheduler, Kubelet, Kube-Proxy

#### 📂 Section 3: Scheduling
- [ ] 25. Manual Scheduling
- [ ] 26. **Lab** - Manual Scheduling
- [ ] 27. Labels and Selectors
- [ ] 28. **Lab** - Labels and Selectors
- [ ] 29. Taints and Tolerations
- [ ] 30. **Lab** - Taints and Tolerations
- [ ] 31. Node Affinity
- [ ] 32. **Lab** - Node Affinity
- [ ] 33. Taints and Tolerations vs Node Affinity
- [ ] 34. **Lab** - Resource Limits
- [ ] 35. DaemonSets
- [ ] 36. **Lab** - DaemonSets
- [ ] 37. Static Pods
- [ ] 38. **Lab** - Static Pods
- [ ] 39. Multiple Schedulers
- [ ] 40. **Lab** - Multiple Schedulers

---

### 🛠️ Operation & Lifecycle Management

#### 📂 Section 4: Logging & Monitoring
- [ ] 41. Monitor Cluster Components
- [ ] 42. **Lab** - Monitor Cluster Components
- [ ] 43. Managing Application Logs
- [ ] 44. **Lab** - Managing Application Logs

#### 📂 Section 5: Application Lifecycle Management
- [ ] 45. Rolling Updates and Rollbacks
- [ ] 46. **Lab** - Rolling Updates and Rollbacks
- [ ] 47. Configuring Applications
- [ ] 48. Environment Variables
- [ ] 49. Configuring ConfigMaps
- [ ] 50. **Lab** - ConfigMaps
- [ ] 51. Configuring Secrets
- [ ] 52. **Lab** - Secrets
- [ ] 53. Encrypting Secret Data at Rest
- [ ] 54. **Lab** - Encrypting Secret Data at Rest
- [ ] 55. Multi-Container Pods
- [ ] 56. **Lab** - Multi-Container Pods
- [ ] 57. Init Containers
- [ ] 58. **Lab** - Init Containers

#### 📂 Section 6: Cluster Maintenance
- [ ] 59. OS Upgrades
- [ ] 60. **Lab** - OS Upgrades
- [ ] 61. Kubernetes Software Versions
- [ ] 62. Cluster Upgrade Process
- [ ] 63. **Lab** - Cluster Upgrade
- [ ] 64. Backup and Restore Methods
- [ ] 65. Backup and Restore - ETCD
- [ ] 66. **Lab** - Backup and Restore ETCD

---

### 🔐 Security & Storage

#### 📂 Section 7: Security
- [ ] 67. Kubernetes Security Prerequisites
- [ ] 68. Authentication
- [ ] 69. TLS Introduction & TLS Certificates
- [ ] 70. TLS in Kubernetes
- [ ] 71. Certificate API
- [ ] 72. **Lab** - Certificate API
- [ ] 73. Kubeconfig
- [ ] 74. **Lab** - Kubeconfig
- [ ] 75. API Groups
- [ ] 76. Authorization - RBAC
- [ ] 77. **Lab** - RBAC
- [ ] 78. Cluster Roles and Cluster Role Bindings
- [ ] 79. **Lab** - Cluster Roles and Cluster Role Bindings
- [ ] 80. Admission Controllers
- [ ] 81. Custom Admission Controllers
- [ ] 82. API Versions
- [ ] 83. Custom Resource Definitions (CRD)

#### 📂 Section 8: Storage
- [ ] 84. Storage in Docker
- [ ] 85. Volume Modes
- [ ] 86. Volumes
- [ ] 87. Persistent Volumes (PV)
- [ ] 88. Persistent Volume Claims (PVC)
- [ ] 89. **Lab** - Persistent Volumes and Claims
- [ ] 90. Storage Classes
- [ ] 91. **Lab** - Storage Classes

---

### 🌐 Networking (Trọng tâm)

#### 📂 Section 9: Networking
- [ ] 204. Networking - Introduction
- [ ] 205. Prerequisite Switching, Routing, Gateways CNI
- [ ] 206. Prerequisite DNS
- [ ] 207. Prerequisite - CoreDNS
- [ ] 208. Prerequisite Network Namespaces
- [ ] 209. FAQ / Docker Networking & CNI Basics
- [ ] 212. Cluster Networking
- [ ] 214. **Lab** - Explore Environment
- [ ] 216. Pod Networking
- [ ] 217. CNI in Kubernetes (WeaveNet, Flannel, Calico...)
- [ ] 220. **Lab** - CNI
- [ ] 223. **Lab** - Networking CNIs
- [ ] 224. Service Networking
- [ ] 225. **Lab** - Service Networking
- [ ] 227. DNS & CoreDNS in Kubernetes
- [ ] 229. **Lab** - CoreDNS in Kubernetes
- [ ] 231. Ingress Architecture
- [ ] 233. Ingress - Annotations and rewrite-target
- [ ] 234. **Lab** - CKA Ingress Networking - 1
- [ ] 236. **Lab** - CKA Ingress Networking - 2
- [ ] 238. Introduction to Gateway API
- [ ] 240. **Lab** - Gateway API

---

### 🏗️ Cluster Architecture & Advanced Tools

#### 📂 Section 10: Design and Install a Kubernetes Cluster
- [ ] 241. Design a Kubernetes Cluster
- [ ] 242. Choosing Kubernetes Infrastructure
- [ ] 243. Configure High Availability (HA)
- [ ] 244. Provisioning Infrastructure

#### 📂 Section 11: Install "Kubernetes the kubeadm way"
- [ ] 245. Introduction to Kubeadm
- [ ] 246. Demo - Deployment with Kubeadm
- [ ] 248. **Lab** - Deploy a cluster using kubeadm

#### 📂 Section 12: Helm Basics
- [ ] 249. Introduction to Helm
- [ ] 250. Helm Concepts (Charts, Repositories, Releases)
- [ ] 251. Helm Commands (install, upgrade, rollback, uninstall)
- [ ] 252. **Lab** - Helm Basics

#### 📂 Section 13: Kustomize Basics
- [ ] 253. Introduction to Kustomize
- [ ] 254. Kustomize Concepts (Bases and Overlays)
- [ ] 255. Kustomize Management & Configuration
- [ ] 256. **Lab** - Kustomize Basics

---

### 🚨 Troubleshooting & Exams (Thực chiến)

#### 📂 Section 14: Troubleshooting
- [ ] 257. Application Failure
- [ ] 258. **Lab** - Troubleshooting Application Failure
- [ ] 259. Control Plane Failure
- [ ] 260. **Lab** - Troubleshooting Control Plane Failure
- [ ] 261. Worker Node Failure
- [ ] 262. **Lab** - Troubleshooting Worker Node Failure
- [ ] 263. Network Troubleshooting
- [ ] 264. **Lab** - Network Troubleshooting

#### 📂 Section 15: Other Topics
- [ ] 265. Advanced kubectl Commands
- [ ] 266. JSONPath Overview
- [ ] 267. **Lab** - JSONPath Quiz

#### 📂 Section 16 & 17: Practice & Exams
- [ ] 268. **Lightning Lab 1** (Thực hành tốc độ cao)
- [ ] 269. **Lightning Lab 2**
- [ ] 270. **Mock Exam 1** (Thi thử chuẩn cấu trúc CKA)
- [ ] 271. **Mock Exam 2**
- [ ] 272. **Mock Exam 3**

---

## 📝 Tips & Câu lệnh Kubectl "Bỏ Túi" Cho Kỳ Thi

> 💡 **Mẹo:** Trong phòng thi CKA, việc dùng lệnh Imperative (lệnh trực tiếp) giúp bạn tiết kiệm đến 80% thời gian so với việc tự viết YAML từ đầu.

### 1. Tạo nhanh file Template YAML
```bash
# Tạo cấu hình Pod mẫu không chạy trực tiếp
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml

# Tạo cấu hình Deployment mẫu
kubectl create deployment my-deploy --image=nginx --replicas=3 --dry-run=client -o yaml > deploy.yaml