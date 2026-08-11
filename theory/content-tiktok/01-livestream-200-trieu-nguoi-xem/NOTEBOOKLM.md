# Quy trình NotebookLM → ảnh → TikTok

## Vấn đề cần xử lý trước: tỉ lệ khung hình

NotebookLM xuất slide **16:9 ngang**. TikTok là **9:16 dọc**. Chụp thẳng rồi đăng thì slide nằm bé tí giữa màn hình, hai đầu là khoảng trống mờ — chữ nhỏ, người xem lướt qua.

Ba cách xử lý, xếp theo độ tốn công:

| Cách | Làm sao | Đánh giá |
|---|---|---|
| **Crop giữa** *(khuyến nghị)* | Viết slide sao cho toàn bộ chữ nằm gọn ở **vùng vuông giữa slide**. Chụp xong crop về 1:1 hoặc 9:16, chữ vẫn đủ. | Nhanh, kết quả ổn. Chỉ cần kỷ luật lúc viết: ít chữ, dồn vào giữa. |
| **Chụp rồi đặt lên nền dọc** | Ảnh 16:9 dán lên canvas 9:16 nền đen, phóng to hết cỡ chiều ngang. | Chữ to hơn nhưng thừa nhiều khoảng đen trên dưới. |
| **Bỏ NotebookLM, tự dựng** | Canva / Google Slides đặt khổ 1080×1920. | Tốn công nhất nhưng khung hình chuẩn ngay từ đầu. |

Nếu chỉ làm tập 1 để thử phản ứng thì cứ crop giữa — đủ dùng. Nếu series chạy tốt thì chuyển sang tự dựng khổ dọc từ tập 3 trở đi.

---

## Quy trình

**1. Tạo notebook mới cho từng bài, nạp đúng MỘT file** — `source/bai-01.md` hoặc `source/bai-02.md`.

Đừng nạp `README.md` hay `PROMPTS.md`. Hai file đó đầy ghi chú, NotebookLM sẽ nuốt luôn và chế ra slide rác. File trong `source/` cố ý chỉ chứa chữ sẽ lên slide.

**2. Sinh slide.** Dán prompt từ [`PROMPTS.md`](./PROMPTS.md), nhớ đổi số slide cho đúng bài.

**3. Đối chiếu.** So từng slide với file nguồn. NotebookLM hay tự thêm câu, tự nối ý, tự "làm cho đầy đủ" — đó chính là thứ giết slide TikTok. Slide nào bị viết dài ra thì sửa lại đúng bản gốc.

**4. Chụp.** Chụp full màn hình từng slide, tắt hết thanh công cụ / sidebar.

**5. Crop.** Về 9:16 (hoặc 1:1), chữ nằm giữa.

**6. Đăng.** TikTok → chế độ ảnh → thả ảnh đúng thứ tự → chọn nhạc → dán caption từ [`PROMPTS.md`](./PROMPTS.md).

---

## Yêu cầu hiển thị

| Hạng mục | Chốt |
|---|---|
| **Nền** | Tối (đen hoặc xám rất đậm). Nền sáng làm chữ chìm trong feed TikTok. |
| **Chữ** | Sans-serif đậm. Không dùng font mảnh — thu nhỏ là biến mất. |
| **Con số** | To nhất slide, tối thiểu gấp đôi cỡ chữ thường. |
| **Nhấn mạnh** | Đổi màu (một màu nhấn duy nhất cho cả series). Không in nghiêng, không gạch chân. |
| **Số slide / logo / watermark** | Không. Chiếm chỗ vô ích. |
| **Vùng an toàn** | Chừa lề rộng hai bên — chỗ đó sẽ bị crop mất. |

Một màu nhấn duy nhất dùng xuyên suốt 7 tập sẽ tạo nhận diện — người ta lướt qua là biết kênh nào.

---

## Sau khi đăng tập 1

Trước khi làm tiếp 6 tập, xem hai chỉ số:

- **Tỉ lệ xem hết** — thấp nghĩa là mất người ở giữa. Xem slide nào rơi nhiều, thường là slide chữ dài.
- **Tỉ lệ giữ lại ở slide 1→2** — thấp nghĩa là cover hỏng. Đổi cover, đăng lại cùng nội dung ruột, so kết quả.

Slide 1 là biến đáng test nhất. Cùng một bài mà đổi cover có thể chênh nhau vài lần lượt xem.
