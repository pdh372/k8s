# Prompt + caption — copy dán thẳng

Mỗi bài: nạp **đúng một** file trong `source/` vào NotebookLM, rồi dán prompt tương ứng. Không nạp thêm file nào khác — càng nhiều source, NotebookLM càng tự viết lại theo ý nó.

Quy trình đầy đủ và yêu cầu hiển thị: [`NOTEBOOKLM.md`](./NOTEBOOKLM.md)

---

## Prompt chung (dùng cho mọi bài)

Đây là phần cố định. Chỉ đổi **số slide** ở dòng cuối theo từng bài.

```
Tạo một slide deck từ file nguồn.

Yêu cầu bắt buộc:
- Mỗi mục "### Slide N" trong file là ĐÚNG MỘT slide. Không gộp, không tách.
- Giữ NGUYÊN VĂN chữ của mỗi slide. Không viết lại, không diễn giải,
  không thêm câu, không thêm bullet, không thêm ví dụ.
- Dòng bắt đầu bằng "PHỤ ĐỀ:" là chú thích nhỏ đặt ở chân slide,
  cỡ chữ nhỏ nhất, màu mờ. Bỏ chữ "PHỤ ĐỀ:" đi, chỉ giữ nội dung sau nó.
- Không thêm slide tiêu đề, slide mục lục, slide kết luận, slide cảm ơn.
- Không thêm ghi chú diễn giả.
- Chữ căn giữa, cỡ chữ lớn nhất có thể. Các dòng số phải là phần to nhất slide.
- Nền tối, chữ sáng. Không ảnh nền, không icon, không hình minh hoạ.
- Toàn bộ chữ nằm gọn trong vùng giữa slide, chừa lề rộng hai bên trái phải.
- Ngôn ngữ: tiếng Việt.

Tổng cộng đúng {N} slide.
```

| Bài | File nguồn | Thay `{N}` bằng |
|---|---|---|
| 1 | `source/bai-01.md` | **11** |
| 2 | `source/bai-02.md` | **12** |

> Nếu NotebookLM vẫn tự viết thêm: tạo notebook mới, nạp **chỉ mình** file nguồn đó, chạy lại. Ít ngữ cảnh thì nó ít sáng tạo hơn.

---

## Bài 1 — "Cái gì sập trước?"

**Nguồn:** `source/bai-01.md` · **11 slide** · ~33 giây

### Caption

```
2,1 triệu người xem cùng lúc — kỷ lục livestream Việt Nam,
lập hồi đầu tháng 8 trong phiên live của bà Nguyễn Phương Hằng.

Nghe khủng, nhưng kỷ lục thế giới cho một kênh cá nhân là
9.334.179 — của Ibai Llanos (Tây Ban Nha), 7/2025. Gấp 4,4 lần.

Vậy nếu 200 triệu người cùng xem một livestream thì cái gì sập trước?
Không phải video đâu 👀

#tech #systemdesign #livestream #lậptrình #côngnghệ
```

### Checklist

- [ ] Slide 4 có chữ "giả định" — 200 triệu **chưa từng xảy ra thật**
- [ ] Slide 3 ghi đúng **La Velada del Año V** (2025), không phải IV — IV chỉ 3.846.256
- [ ] Slide 8 có chữ "ước tính"
- [ ] Slide 2 chỉ ba chữ "Chưa là gì." — đừng thêm gì
- [ ] Tên bà Phương Hằng chỉ nằm trong caption, không lên slide
- [ ] Slide 8 và 9 là hai slide đáng share nhất

---

## Bài 2 — "Bấm Phát trực tiếp xong thì sao?"

**Nguồn:** `source/bai-02.md` · **12 slide** · ~36 giây

### Caption

```
Bấm "Phát trực tiếp" xong thì tín hiệu đi đâu?

Điện thoại bạn chỉ đẩy lên 1 luồng ~3 Mbps.
Ở mốc 200 triệu người xem, hệ thống nhả ra ~400 Tbps.
Nhân 133 triệu lần — nhờ CDN là một cái cây, không phải một server.

Và video, chat, tiền đi ba đường hoàn toàn khác nhau.
Đó là lý do thứ sập trước không bao giờ là video.

#tech #systemdesign #livestream #cdn #lậptrình
```

### Checklist

- [ ] Slide 10 có chữ "ước tính" và nhắc mốc 200 triệu là giả định
- [ ] Slide 8 và 11 là hai slide đáng share nhất
- [ ] Không khẳng định nền tảng nào cụ thể làm gì

### Sơ đồ cho slide 11 (nếu tự vẽ)

Slide 11 đáng tự vẽ thay vì để NotebookLM chế:

```
                    ┌──────────────┐
   Người phát ─────►│    INGEST    │
      3 Mbps        └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │  TRANSCODE   │  1 luồng → 5 chất lượng
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │    ORIGIN    │
                    └──────┬───────┘
                           ▼
              ┌────────────┴────────────┐
              ▼            ▼            ▼
           [ CDN ]      [ CDN ]      [ CDN ]     ← nhiều tầng
              ▼            ▼            ▼
            edge         edge         edge
              ▼            ▼            ▼
         200.000.000 người xem


   CHAT  ──►  gateway WebSocket  ──►  đường riêng, không qua CDN video
   TIỀN  ──►  transaction DB     ──►  đường riêng, không được phép sai
```

---

## Checklist chung cho mọi bài

- [ ] Slide 1 đọc được ở dạng thumbnail nhỏ xíu (thu ảnh xuống 20% xem còn đọc nổi không)
- [ ] Không slide nào quá 12 từ
- [ ] Không có ảnh nào lấy từ buổi live có thật
- [ ] Dùng đúng chữ "người xem cùng lúc", không phải "follower" hay "lượt xem"
- [ ] Đã crop về 9:16, chữ không bị cắt
- [ ] Slide cuối tự chốt, **không** có "bài sau →"

---

## Chọn nhạc

| Tiêu chí | Lý do |
|---|---|
| Nhạc trend đang lên, không lời hoặc lời tiếng Anh | Lời tiếng Việt tranh chấp với chữ trên slide |
| Không beat drop mạnh | Người xem đang đọc số, drop làm mất tập trung |
| Nhịp đều, tối thiểu 40 giây | Khớp 11–12 slide |

Chọn nhạc **trước** khi chốt số slide — lấy độ dài đoạn nhạc chia cho 3 giây rồi cắt cho vừa.
