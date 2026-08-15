# Sổ học — livestream scale

## 15/08/2026 — Buổi 1: Video đi từ 1 điện thoại tới 2 triệu người kiểu gì

**Đề bài:** một người quay, hai triệu người xem.

**Cách nghĩ ngây thơ:** server nhận 1 bản rồi gửi ra 2 triệu bản → quá tải.

### Từ vựng

| Từ | Nghĩa |
|---|---|
| **Origin** | Bản gốc. Nơi duy nhất người phát đẩy luồng lên. |
| **CDN** | *Content Delivery Network*. Mạng lưới server rải khắp thế giới, giữ bản sao để người dùng lấy ở chỗ gần nhất. |
| **Edge server** | Một server trong CDN, nằm ngoài rìa, gần người xem nhất. |
| **Fan-out tree** | Cây toả ra. Cách CDN nhân bản video qua nhiều tầng. |
| **Mbps** | Megabit mỗi giây. Video 720p ≈ 2 Mbps ≈ 250 KB/giây ≈ 900 MB mỗi tiếng xem. |

### Ý chính 1 — Chèn lớp ở giữa, rồi lặp lại chiêu đó

```
ORIGIN
   ↓
tầng vùng        (vài trăm)
   ↓
EDGE             (hàng chục nghìn)
   ↓
người xem        (hàng triệu)
```

Mỗi tầng nhân lên ~10 lần → 9 tầng là ra một tỷ.
**Không ai phải nói chuyện với quá nhiều người cùng lúc.**

Ẩn dụ: cả xóm cần một quyển sách, không ai chạy lên nhà xuất bản. Quán photo đầu hẻm lấy **một** bản rồi photo cho cả xóm.
→ nhà xuất bản = origin, quán photo = edge.

**Đây là lý do video KHÔNG phải phần khó.**

### Ý chính 2 — Không tự dựng CDN, đi thuê

Cloudflare · Akamai · Fastly · AWS CloudFront · Google Cloud CDN.
Việc của mình: đẩy **một luồng** vào endpoint của họ. Hết.

### Ý chính 3 — Autoscale kiểu "CPU > 80% thì thêm server" KHÔNG dùng được

| | Web thường | Livestream |
|---|---|---|
| Traffic | Tăng từ từ | **Nổ** — 50k → 550k trong 30 giây |
| Cách làm | Phản ứng sau khi tải tăng | **Phải có sẵn trước** |
| Đơn vị thời gian | Phút (boot + health check) | Giây |

Autoscale phản ứng trong *phút*, sóng livestream ập đến trong *giây* → server mới boot xong thì đã sập hoặc đã hết sóng.
Nhà cung cấp CDN nuôi sẵn năng lực khổng lồ đang nằm không, dùng chung mọi khách. Mình xin một lát của cái đã dựng sẵn.

---

## Còn nợ, buổi sau học tiếp

- [ ] **Câu đang hỏi dở:** stream chỉ 100 view nhưng rải 50 quốc gia thì sao?
- [ ] Segment caching + request collapsing — vì sao càng đông càng RẺ
- [ ] Độ trễ: vì sao chủ live đọc comment trễ 5 giây (buffer trade-off)
- [ ] **Comment fan-out** — chỗ thật sự chết, sampling + local echo
- [ ] Đếm xấp xỉ — con số người xem là số ước lượng
- [ ] Hot path vs money path — comment được mất, tiền thì không
- [ ] Thang giảm cấp khi quá tải
