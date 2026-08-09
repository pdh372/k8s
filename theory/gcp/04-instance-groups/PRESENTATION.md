> **Lưu ý:** File này gộp nội dung thuyết trình của **Section 4 (Managing VM Groups with Instance Groups)** và **Section 5 (Going Deeper with Instance Groups)** làm một, vì hai section này thực chất là một câu chuyện liền mạch (MIG cơ bản → MIG nâng cao). File giống hệt nhau được đặt ở cả hai thư mục `04-instance-groups/` và `05-instance-groups-deeper/` — chỉ có 1 bản nội dung, đừng chỉnh sửa lệch nhau giữa hai chỗ.

# Thuyết trình: Instance Groups — từ cơ bản đến nâng cao (GCP Section 4 + 5)

> Đối tượng: anh em đã biết sơ sơ về GCP, đã nghe qua Compute Engine/Instance Template (Section 3).
> Thời lượng gợi ý: ~25-30 phút trình bày + 10 phút demo/hỏi đáp.

---

## 0. Mở đầu (1 phút)

**Hook:** "Instance Template (Section 3) cho mình 1 bản blueprint để tạo VM giống hệt nhau. Nhưng tạo tay 5-10 VM từ template đó, rồi tự theo dõi con nào chết, tự thêm VM khi traffic tăng — không ai làm vậy cả. Đó là lý do có **Managed Instance Group**."

**Agenda:**
1. Instance Group là gì — Unmanaged vs Managed
2. MIG làm được gì: autoscaling, autohealing, rolling update, load balancer integration
3. Zonal vs Regional MIG
4. Cấu hình MIG nâng cao: autoscaling policy, health check, autohealing delay
5. Rolling update: max surge / max unavailable, proactive vs opportunistic
6. Stateful vs stateless MIG
7. Demo nhanh + best practices
8. Bắc cầu qua Load Balancing (Section 6)

---

## 1. Instance Group là gì

**Instance Group** = một nhóm VM được quản lý như một thể thống nhất. 2 loại:

| Loại | Đặc điểm |
|---|---|
| **Unmanaged Instance Group** | Nhóm VM rời rạc, không giống nhau — thường là setup cũ/import lại. Không autoscale, không self-heal. Không nên dùng cho thiết kế mới. |
| **Managed Instance Group (MIG)** | Nhóm VM **giống hệt nhau**, tạo từ 1 Instance Template — có autoscaling, autohealing, rolling update, tích hợp load balancer. Đây là ý nghĩa thực tế của "instance group" trên thi và trong thực tế. |

> Điểm nhấn: nếu ai hỏi "instance group" mà không nói rõ, mặc định hiểu là MIG.

---

## 2. MIG làm được gì

MIG lấy 1 **Instance Template** (Section 3) và giữ đúng số lượng VM giống hệt nhau đang chạy, tự động:

- **Autoscaling** — thêm/bớt VM dựa theo CPU, khả năng chịu tải của load balancer, hoặc custom metric từ Cloud Monitoring.
- **Autohealing** — health check fail → MIG tự tạo lại instance đó.
- **Rolling update** — deploy Instance Template phiên bản mới dần dần, zero downtime.
- **Load balancer integration** — MIG là backend chuẩn cho Cloud Load Balancing (Section 6-7, phần sau).

### Zonal vs Regional MIG

| Mode | Đặc điểm |
|---|---|
| **Zonal MIG** | Tất cả instance trong 1 zone. Đơn giản, nhưng zone đó sập là mất cả nhóm. |
| **Regional MIG** | Instance trải qua nhiều zone trong 1 region — sống sót khi 1 zone sập. **Mặc định nên dùng cho production.** |

### Bảng chọn nhanh — quiz anh em trước khi qua slide sau

| Tình huống | Chọn gì |
|---|---|
| Fleet web server giống hệt nhau, cần scale theo traffic | Managed Instance Group (regional) |
| Nhóm VM linh tinh, tự tay build, chỉ cần gom lại xem chung | Unmanaged Instance Group (legacy, không phải đáp án khuyến khích cho thiết kế mới) |
| 1 instance cứ crash liên tục cần tự thay | MIG autohealing (cần gắn health check) |
| Deploy instance sau load balancer, trải rộng cả region để chịu lỗi | Regional MIG |

---

## 3. Cấu hình MIG nâng cao (Section 5)

Khi tạo MIG thật (production-grade), cần set các thứ sau:

| Setting | Ý nghĩa |
|---|---|
| **Instance Template** | Blueprint mọi instance trong nhóm được tạo từ đó |
| **Target size** | Số instance cần duy trì (cố định, hoặc 1 khoảng nếu bật autoscaling) |
| **Location** | 1 zone, hoặc nhiều zone trong 1 region (regional MIG — khuyến khích để chịu lỗi) |
| **Autoscaling policy** | Metric để scale (CPU utilization, load balancing serving capacity, custom Cloud Monitoring metric, hoặc theo lịch) + min/max instance |
| **Health check** | Probe HTTP/TCP/gRPC dùng cho **autohealing** — fail liên tục thì MIG tạo lại instance |
| **Autohealing initial delay** | Thời gian ân hạn sau khi instance start, trước khi health check bắt đầu tính — để app khởi động chậm không bị recreate oan |

```bash
# Gắn autoscaling policy
gcloud compute instance-groups managed set-autoscaling web-mig \
  --region=us-central1 \
  --max-num-replicas=10 \
  --min-num-replicas=2 \
  --target-cpu-utilization=0.6

# Gắn health check cho autohealing
gcloud compute health-checks create http web-health-check --port=80

gcloud compute instance-groups managed update web-mig \
  --region=us-central1 \
  --health-check=web-health-check \
  --initial-delay=60
```

> **Điểm nhấn:** `--initial-delay` hay bị bỏ qua và gây ra vòng lặp recreate vô tận nếu app khởi động chậm hơn thời gian mặc định — rất đáng nói to trước anh em.

---

## 4. Rolling Update — deploy version mới không downtime

Deploy Instance Template phiên bản mới lên MIG hiện có gọi là **rolling update**, điều khiển bởi:

| Tham số | Ý nghĩa |
|---|---|
| **Max surge** | Số instance *thêm* được tạo vượt target size trong lúc rollout (rollout nhanh hơn, tốn thêm chi phí tạm thời) |
| **Max unavailable** | Số instance hiện có được phép down/đang update cùng lúc (rollout nhanh hơn, giảm capacity tạm thời) |
| **Update type** | **Proactive** (MIG thay instance ngay lập tức) vs **Opportunistic** (chỉ thay khi instance bị recreate vì lý do khác, vd autohealing) |

```bash
gcloud compute instance-groups managed rolling-action start-update web-mig \
  --region=us-central1 \
  --version=template=web-template-v2 \
  --max-surge=2 \
  --max-unavailable=0
```

`--max-surge=2 --max-unavailable=0` = **zero-downtime rollout** (luôn ở mức hoặc trên target capacity, không bao giờ dưới).

> Cách nhớ nhanh cho anh em: muốn zero-downtime → `max-unavailable=0`, muốn rollout nhanh chấp nhận giảm capacity tạm thời → tăng `max-unavailable`.

### Stateful vs Stateless MIG

- **Stateless MIG** (mặc định, phổ biến nhất): bất kỳ instance nào cũng có thể bị hủy và tạo lại y hệt — không quan tâm "danh tính" instance.
- **Stateful MIG**: giữ state riêng của từng instance (1 disk cụ thể, 1 hostname/IP cụ thể) qua các lần recreate — dùng khi danh tính instance quan trọng (vd 1 node database sharded). Hiếm gặp hơn stateless trên thi và thực tế.

---

## 5. Bảng tổng hợp scenario (dùng để quiz nhanh cuối bài)

| Tình huống | Chọn gì |
|---|---|
| Deploy version mới, tuyệt đối không downtime | Rolling update với `max-unavailable=0`, `max-surge` > 0 |
| Rollout nhanh, chấp nhận giảm capacity tạm thời | Rolling update với `max-unavailable` > 0 |
| App trong instance crash, không phản hồi health check | Autohealing tự tạo lại (cần gắn health check) |
| Chỉ scale out giờ hành chính, scale in ban đêm | Schedule-based autoscaling policy |
| Scale theo request/giây từ load balancer, không phải CPU | Autoscaling theo load balancing serving capacity |

---

## 6. Demo nhanh (script chạy live, ~5-7 phút)

```bash
# 1. Tạo template (Section 3)
gcloud compute instance-templates create web-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud

# 2. Tạo Regional MIG từ template
gcloud compute instance-groups managed create web-mig \
  --template=web-template \
  --size=3 \
  --region=us-central1

# 3. Kiểm tra
gcloud compute instance-groups managed describe web-mig --region=us-central1
gcloud compute instance-groups managed list-instances web-mig --region=us-central1

# 4. Gắn autoscaling
gcloud compute instance-groups managed set-autoscaling web-mig \
  --region=us-central1 --max-num-replicas=10 --min-num-replicas=2 \
  --target-cpu-utilization=0.6

# 5. (Nếu muốn demo rolling update) Tạo template v2 rồi rollout zero-downtime
gcloud compute instance-groups managed rolling-action start-update web-mig \
  --region=us-central1 \
  --version=template=web-template-v2 \
  --max-surge=2 --max-unavailable=0

# 6. Dọn dẹp — QUAN TRỌNG, tránh phát sinh bill sau demo
gcloud compute instance-groups managed delete web-mig --region=us-central1
gcloud compute instance-templates delete web-template
```

---

## 7. Best Practices — slide tổng kết

- Dùng **Regional MIG** thay vì Zonal cho bất kỳ workload production nào — chịu được mất 1 zone.
- Luôn gắn **health check** cho autohealing, và set **initial delay** đúng với thời gian app thật sự cần để khởi động.
- Zero-downtime deploy → `max-unavailable=0`; ưu tiên tốc độ hơn uptime tuyệt đối → tăng `max-unavailable`.
- Autoscale theo đúng tín hiệu phù hợp với workload (CPU cho compute-bound, load balancing serving capacity cho traffic-bound, schedule cho pattern biết trước).
- Stateless là mặc định nên dùng — chỉ dùng Stateful MIG khi thực sự cần giữ danh tính instance.
- Luôn dọn MIG + Instance Template sau demo/lab để tránh phát sinh chi phí.

---

## 8. Bắc cầu sang phần tiếp theo

"MIG của mình giờ tự scale, tự heal, deploy không downtime. Nhưng traffic vào từ đâu, phân phối vào MIG như thế nào? → **Cloud Load Balancing**, Section 6-7, phần tiếp theo."

---

## Ghi chú riêng cho người trình bày

- Phần 3 (autoscaling/health check config) và phần 4 (rolling update) là phần dễ gây nhầm lẫn nhất — nên dừng lại hỏi anh em trước khi qua slide tiếp, đảm bảo mọi người theo kịp.
- `--initial-delay` và `max-surge/max-unavailable` là 2 chỗ hay bị hỏi xoáy nhất — chuẩn bị ví dụ số cụ thể để giải thích nếu bị hỏi thêm.
- Nếu thời gian ngắn, có thể gộp phần 1+2 lướt nhanh (anh em đã biết Section 3 rồi), dồn thời gian cho phần 3-4 (nâng cao) và demo.
- Luôn nhớ bước dọn dẹp cuối demo.
