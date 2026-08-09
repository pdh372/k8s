# Thuyết trình: Quản lý VM với Compute Engine (GCP Section 3)

> Đối tượng: anh em đã biết sơ sơ về GCP (đã nghe qua project, region/zone). Không cần giảng lại "cloud là gì" — đi thẳng vào Compute Engine.
> Thời lượng gợi ý: ~20-25 phút trình bày + 10 phút demo/hỏi đáp.

---

## 0. Mở đầu (1 phút)

**Hook:** "Mọi người tạo VM trên GCP xong để vậy chạy, ít khi để ý là mình đang trả tiền cho 4 thứ khác nhau, và có cách setup VM nhanh hơn gấp 10 lần so với cách hầu hết người mới hay làm." → dẫn vào nội dung.

**Agenda:**
1. Compute Engine là gì, chọn cấu hình VM ra sao
2. IP address — 3 loại, chọn sai tốn tiền oan
3. Bootstrap VM: startup script vs custom image vs instance template
4. Cách tính tiền & 3 cách tiết kiệm chi phí
5. Best practices + demo nhanh
6. Bắc cầu qua Instance Groups (Section 4)

---

## 1. Compute Engine là gì

- **Compute Engine (GCE)** = sản phẩm IaaS của GCP cho VM — bạn toàn quyền kiểm soát OS (khác với App Engine/Cloud Run là managed, GCP tự lo OS).
- Nền tảng: **hypervisor** chia 1 máy vật lý thành nhiều VM cô lập (CPU/RAM/disk/network). "Tạo VM trên cloud" = xin một lát cắt phần cứng của Google.

### 3 lựa chọn khi tạo VM

| Chọn | Ý nghĩa |
|---|---|
| **Machine family** | Nhóm lớn: General-purpose (E2, N2, N2D), Compute-optimized (C2), Memory-optimized (M2), Accelerator-optimized (A2 — GPU) |
| **Machine type** | Cấu hình vCPU/RAM cụ thể trong family, vd `e2-medium` (2 vCPU/4GB), `n2-standard-4` (4 vCPU/16GB) |
| **Image** | OS + phần mềm cài sẵn trên boot disk — public image (Debian/Ubuntu/Windows) hoặc custom image của mình |

**Câu hỏi gợi mở cho anh em:** "Team mình đang chạy service nào trên E2 mà lẽ ra nên là C2 hoặc ngược lại?" (nếu có context thực tế của team thì chèn vào đây — điểm nhấn để không khô khan).

### Bảng chọn nhanh (dùng để quiz nhanh anh em)

| Tình huống | Chọn gì |
|---|---|
| Workload CPU-bound cần nén tối đa | Compute-optimized (C2) |
| In-memory DB cần RAM khủng | Memory-optimized (M2) |
| Train ML cần GPU | Accelerator-optimized (A2) |
| Dev/test rẻ nhất | E2 |

---

## 2. IP Address — chỗ dễ tốn tiền oan nhất

| Loại | Đặc điểm |
|---|---|
| **Internal IP** | Private, chỉ dùng trong VPC (và network peer/connect). Luôn có. |
| **External — ephemeral** | Public, mất khi VM stop. Mặc định cho VM mới. |
| **External — static** | Public, giữ nguyên dù VM stop. **Tốn tiền khi KHÔNG gắn vào VM đang chạy** — đây là chỗ nhiều người dính bill lạ. |

**Điểm nhấn thuyết trình:** static IP không gắn VM = vẫn bị charge. Đây là nguyên nhân phổ biến của "ủa sao tháng này bill GCP tăng mà không có VM nào chạy?" — rất đáng nói to trước anh em vận hành.

```bash
# Reserve static IP
gcloud compute addresses create my-static-ip --region=us-central1

# Gắn khi tạo VM
gcloud compute instances create my-vm \
  --address=my-static-ip \
  --zone=us-central1-a
```

| Tình huống | Chọn gì |
|---|---|
| DNS phải trỏ cố định qua các lần restart VM | Static external IP |
| Batch job ngắn hạn, IP không quan trọng | Ephemeral (mặc định, rẻ hơn) |
| VM không cần internet truy cập vào | Không gắn external IP |

---

## 3. Bootstrap VM — 3 cách, chọn đúng cách sẽ tiết kiệm rất nhiều thời gian

Đây là phần "aha moment" của bài — nhiều người chỉ biết 1 trong 3 cách.

### a) Startup script
Chạy lại **mỗi lần boot** — phải viết idempotent (an toàn khi chạy lại nhiều lần).

```bash
gcloud compute instances create web-vm \
  --metadata=startup-script='#! /bin/bash
apt-get update
apt-get install -y apache2'
```

Vấn đề: nếu script cài đặt nặng (build tool, dependency lớn) → mỗi lần boot đều chờ cài lại → chậm.

### b) Custom Image
Cài 1 lần → snapshot disk thành image → VM mới launch từ image này, khỏi chờ startup script.

```bash
gcloud compute images create my-custom-image \
  --source-disk=app-vm --source-disk-zone=us-central1-a

gcloud compute instances create app-vm-2 --image=my-custom-image
```

### c) Instance Template
Blueprint **bất biến** (machine type, image, disk, network, metadata) — không phải sửa lại cấu hình mỗi lần tạo VM, và là input bắt buộc cho Managed Instance Group (Section 4, phần tiếp theo).

```bash
gcloud compute instance-templates create my-template \
  --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud

gcloud compute instances create vm-from-template \
  --source-instance-template=my-template
```

> Immutable — muốn đổi config thì tạo template version mới, VM cũ từ template cũ không bị ảnh hưởng.

### Bảng chọn nhanh — chỗ này nên cho anh em đoán trước khi bấm next slide

| Tình huống | Chọn gì |
|---|---|
| Cần launch lặp lại 50 VM giống hệt nhau | Instance Template |
| VM nào cũng cần cài phần mềm nặng để chạy nhanh | Custom Image |
| VM cần pull config mới nhất mỗi lần boot | Startup script |

---

## 4. Tính tiền & tối ưu chi phí

**Công thức:**
```
Chi phí = (machine type rate × uptime) + (disk size × rate) + (network egress nếu có) + (static IP không gắn VM)
```

> Lưu ý quan trọng: **VM stop rồi vẫn tốn tiền disk**, chỉ hết tiền compute thôi.

### 3 cách giảm chi phí

| Cơ chế | Cách hoạt động |
|---|---|
| **Sustained Use Discount** | Tự động giảm giá càng chạy liên tục lâu trong tháng — không cần commit gì |
| **Committed Use Discount** | Cam kết dùng 1-3 năm, giảm tới ~57% — hợp workload ổn định |
| **Spot VM** | Dùng capacity dư, giảm tới ~91%, nhưng Google có thể thu hồi bất cứ lúc nào — hợp batch job/CI runner chịu được gián đoạn |

```bash
gcloud compute instances create spot-vm \
  --provisioning-model=SPOT \
  --instance-termination-action=STOP
```

| Tình huống | Chọn gì |
|---|---|
| DB production chạy 24/7 | Committed Use Discount |
| Batch job đêm, chịu được bị kill | Spot VM |
| VM dev/test dùng lai rai trong tháng | Sustained Use (tự động, khỏi làm gì) |
| VM đã stop mà vẫn bị charge | Do disk (hoặc static IP chưa gỡ) |

---

## 5. Best Practices — slide tổng kết trước khi demo

- Dùng **Instance Template + Managed Instance Group** thay vì tạo tay từng VM, nếu cần scale/self-heal.
- **Spot VM** cho batch/fault-tolerant, **Committed Use** cho workload ổn định lâu dài.
- **Label mọi resource** ngay từ đầu để dễ track chi phí.
- Ưu tiên **custom image** hơn startup script nếu setup nặng lặp lại.
- Dọn **static IP không dùng** và **VM stop có disk to** — cả hai đều âm thầm tốn tiền.
- Set **budget alert** trước khi làm lab/demo thật.

---

## 6. Demo nhanh (script để chạy live, ~5 phút)

```bash
# 1. Tạo VM với startup script
gcloud compute instances create web-vm \
  --zone=us-central1-a --machine-type=e2-small \
  --image-family=debian-12 --image-project=debian-cloud \
  --tags=http-server \
  --metadata=startup-script='#! /bin/bash
apt-get update && apt-get install -y apache2'

# 2. Mở firewall
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 --target-tags=http-server --direction=INGRESS

# 3. Kiểm tra VM chạy tốt chưa
gcloud compute instances describe web-vm --zone=us-central1-a | grep status
gcloud compute instances get-serial-port-output web-vm --zone=us-central1-a

# 4. Dọn dẹp — QUAN TRỌNG, tránh phát sinh bill sau demo
gcloud compute instances delete web-vm --zone=us-central1-a
gcloud compute firewall-rules delete allow-http
```

**Bảng troubleshooting để dùng nếu demo bị lỗi ngay trên sân khấu (đỡ quê):**

| Check | Lệnh |
|---|---|
| VM có đang chạy không? | `gcloud compute instances describe web-vm --zone=... \| grep status` |
| Startup script chạy/lỗi ở đâu? | `gcloud compute instances get-serial-port-output web-vm --zone=...` |
| Firewall có rule mở port 80 chưa? | `gcloud compute firewall-rules list` |
| Tag firewall có khớp tag VM không? | `gcloud compute instances describe web-vm --zone=... \| grep tags` |

---

## 7. Kiến thức thêm nếu bị hỏi xoáy (Q&A backup)

| Khái niệm | Trả lời ngắn |
|---|---|
| VM và disk scope ở đâu? | Zonal — sống trong đúng 1 zone |
| Internal DNS name | `<vm-name>.<zone>.c.<project-id>.internal`, khỏi hardcode internal IP |
| Sole-tenant Node | Server vật lý riêng cho project, không share hardware với ai — dùng cho BYOL/compliance |
| Live Migration | GCP tự chuyển VM đang chạy sang hardware khác khi maintenance, không tắt VM, mặc định bật |
| Licensing cost | Windows/RHEL/SUSE cộng thêm phí license theo giờ; Debian/Ubuntu/CentOS free |

---

## 8. Bắc cầu sang phần tiếp theo

"Giờ mình có Instance Template rồi — nhưng nếu muốn 3, 5, 10 VM giống hệt nhau, tự scale theo tải, tự thay khi có con nào chết? → đó là **Managed Instance Group**, Section 4, để buổi sau/phần sau mình đi tiếp."

---

## Ghi chú riêng cho người trình bày

- Phần 2 (IP) và phần 4 (billing) là chỗ dễ gây "aha" nhất vì đụng vào tiền — nhấn mạnh kỹ hai chỗ này.
- Nếu anh em đã biết sơ GCP, có thể lướt nhanh phần 1, dồn thời gian cho phần 3 (3 cách bootstrap) và phần 6 (demo).
- Luôn nhớ chạy bước dọn dẹp ở cuối demo — tránh để VM/firewall rule chạy quên gây phát sinh chi phí thật.
