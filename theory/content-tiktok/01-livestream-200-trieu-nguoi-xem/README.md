# Content series: "NẾU 200 TRIỆU NGƯỜI CÙNG XEM MỘT LIVESTREAM"

> **Định vị:** bài toán kỹ thuật **giả định**, không phải bản tin. Không dựa vào sự kiện nào, không dùng số liệu của ai, không nhắc nhân vật nào. Đăng lúc nào cũng được, không hết hạn.
>
> **Vì sao khung "Nếu" mạnh hơn khung "sự kiện":** nó biến bài thành câu đố thay vì tin tức. Người xem không kiểm chứng được, họ chỉ có thể *nghĩ theo*. Và mình không nợ ai một cái nguồn nào.

---

## 1. Con số nền — thang leo ba bậc

Không mở thẳng bằng con số giả định. Đi qua hai con số **thật** trước, để 200 triệu thành *bước tiếp theo hợp lý* thay vì số bịa.

| Bậc | Con số | Sự kiện | Vai trò |
|---|---|---|---|
| 1 | **2.100.000** | Kỷ lục livestream Việt Nam, 8/2026 | Quen thuộc → dừng lướt |
| 2 | **9.334.179** | Ibai Llanos, La Velada del Año **V**, 7/2025, Twitch — kỷ lục cao nhất từng ghi nhận cho **một kênh livestream**, mọi nền tảng | Sốc, gấp 4,4 lần → lật đổ bậc 1 |
| 3 | **200.000.000** | **Giả định** | Cực đoan, gấp ~21 lần trần thực tế → vào bài toán |

Chọn 200 triệu vì: đủ xa kỷ lục để không ai nhầm là chuyện có thật, và là con số tròn dễ nhân chia trên slide.

### Vì sao so với Ibai chứ không so với Netflix

Đây là điểm phân hạng quan trọng nhất, và cũng là kiến thức đáng dạy nhất của bài mở màn:

| Hạng | Kỷ lục | Bản chất |
|---|---|---|
| **Kênh cá nhân** — một người, một kênh | **9,33 triệu CCU** (Ibai, 7/2025) | Cùng hạng với phiên live Việt Nam. So sánh mới công bằng. |
| **Sự kiện doanh nghiệp phát toàn cầu** | **65 triệu luồng** (Tyson–Jake Paul, Netflix 11/2024) | Cả một tập đoàn đứng sau. **Khác hạng — đem so là khập khiễng.** |

Đem một phiên live cá nhân so với Netflix thì vừa không công bằng vừa không dạy được gì. So với Ibai thì apples-to-apples, và tự nó đặt ra câu hỏi "vậy trần của một kênh cá nhân là bao nhiêu?" — chính là thứ series này trả lời.

### Ba cái bẫy số liệu

- **9.334.179 là La Velada V (2025), không phải IV.** La Velada **IV** (2024) chỉ 3.846.256 — chênh hơn gấp đôi. La Velada **VI** (7/2026) đạt 8,73 triệu đa nền tảng, **không** phá được kỷ lục của V.
- **Đừng dùng cricket.** Chung kết IPL 2025 đạt 55 triệu concurrent — có thật, nhưng khán giả Việt gần như không theo dõi môn này nên con số không tạo cảm xúc. Và **IPL ≠ LPL**: IPL là Indian Premier League (cricket, Ấn Độ), LPL là giải LMHT Trung Quốc. Viết nhầm là dân esports vào cười ngay.
- **34 triệu ≠ 8,73 triệu.** La Velada VI có hơn 34 triệu thiết bị độc nhất cả buổi nhưng chỉ 8,73 triệu xem cùng lúc. Cùng một sự kiện, hai con số chênh 4 lần — đây là ví dụ thật tốt nhất để dạy CCU vs tổng lượt xem.

### Khái niệm phải nói đúng ngay từ đầu

| Khái niệm | Nghĩa |
|---|---|
| **Follower** | Người bấm theo dõi. Tích luỹ. Hạ tầng không quan tâm. |
| **View / lượt xem** | Tổng số lần xem cộng dồn. Một người vào ra nhiều lần đếm nhiều lần. |
| **Concurrent viewer (CCU)** | Số người **đang xem tại cùng một thời điểm**. Đây mới là con số quyết định hạ tầng. |

200 triệu ở đây là **CCU**. Đây là phân biệt quan trọng nhất của cả series — dùng sai chữ là hỏng tiền đề.

> Riêng việc phân biệt 3 con số này đã đủ một bài ngắn, và nó lọc ra khán giả nghiêm túc.

---

## 2. Xương sống lý thuyết — bắt đầu từ đâu, dẫn đi đâu

Nguyên tắc: **không đi từ dễ đến khó. Đi từ chỗ khán giả đang nghĩ SAI.**

Hầu hết mọi người mặc định: *"200 triệu người xem thì server phải khoẻ kinh khủng để đẩy 200 triệu luồng video."*

Sai ở bốn tầng — và bốn tầng sai đó là toàn bộ series:

```
Người xem nghĩ:                    Thực tế:
─────────────────                  ─────────
Video là phần khó        ────►     Video là phần DỄ NHẤT (cacheable, một chiều)
Comment là phần phụ      ────►     Comment mới là chỗ sập (stateful, fan-out N×M)
Con số 200 triệu là thật ────►     Nó là số ƯỚC LƯỢNG, và cố tình ước lượng
Dữ liệu nào cũng quan trọng ─►     Comment được phép mất. Tiền thì không.
```

### Chuỗi khái niệm, theo đúng thứ tự nên dạy

| # | Khái niệm | Câu hỏi nó trả lời |
|---|---|---|
| 1 | **Fan-out tree / multi-tier CDN** | Một người phát, 200 triệu người nhận — nhân bản ở đâu? |
| 2 | **Segment caching + request collapsing** | Vì sao càng đông người xem thì CDN càng NHÀN? |
| 3 | **Latency vs buffer trade-off** (HLS → LL-HLS) | Vì sao chủ live đọc comment của bạn trễ 5 giây? |
| 4 | **Fan-out on write vs on read, sampling, local echo** | Vì sao không ai thấy comment của bạn? |
| 5 | **Approximate counting** (HyperLogLog, sharded counter) | Con số hiển thị chính xác tới đâu? |
| 6 | **Tiered consistency** (hot path vs money path, idempotency) | Comment mất thì thôi, nhưng tiền tặng quà thì sao? |
| 7 | **Graceful degradation / load shedding** | Nếu vẫn quá tải thì hệ thống hy sinh cái gì trước? |

Bảy khái niệm = bảy tập. Mỗi tập đúng **một** ý.

---

## 3. Toàn bộ phép tính ở mốc 200 triệu

Đây là "đạn" của series. Mỗi con số tự nó là một hook.

### 3.1 Băng thông video

```
200.000.000 người  ×  ~2 Mbps (720p mobile)
  = 400.000.000 Mbps
  = 400 Tbps
  = 50 TB mỗi giây
  = 180 PB mỗi giờ
```

**Cách nói cho sờ được** (chọn một, đừng dùng cả hai):
- "Mỗi giây đẩy ra lượng dữ liệu đủ làm đầy **390 cái điện thoại 128GB**."
- "Mỗi giây bằng khoảng **10.000 bộ phim Full HD**."

> 2 Mbps là ước lượng giữa. Thực tế ABR sẽ tụt xuống 500 Kbps với người mạng yếu. Ghi "ước tính" trên slide.

### 3.2 Vì sao con số trên KHÔNG làm sập ai

Video được cắt thành segment (HLS cổ điển 2–6 giây; low-latency: chunk 200ms–1s). **Tất cả người xem đều xem cùng một segment.**

```
Ở edge:      200.000.000 / segment 6s   ≈ 33.000.000 request/giây
Lên origin:  ~200 PoP × 1 request / 6s  ≈ 33 request/giây

Tỉ lệ nén:   1.000.000 : 1
```

Đây là **luận điểm đắt nhất của cả series**: livestream là workload cacheable lý tưởng. Nghịch lý — người xem càng đông, cache hit ratio càng cao, chi phí biên trên mỗi người xem càng RẺ. Ngược hoàn toàn với feed TikTok (mỗi người một video khác nhau → cache miss cao).

Cộng thêm **request collapsing**: một triệu request cùng lúc hỏi một segment chưa có sẵn → edge chỉ gửi **1** request lên upstream, số còn lại xếp hàng chờ chung.

### 3.3 Chỗ thật sự chết: fan-out comment

```
Giả sử 10.000 comment mỗi giây
(chỉ 0,3% người xem gõ một câu mỗi phút — rất khiêm tốn)

Mỗi comment muốn tới tay tất cả:

10.000 × 200.000.000 = 2.000.000.000.000 tin nhắn / giây
```

**2 nghìn tỷ tin nhắn mỗi giây.** Không hạ tầng nào trên hành tinh làm nổi con số này ở dạng thô.

Còn **kết nối** thì không phải phần khó: một server tinh chỉnh tốt giữ được vài trăm nghìn kết nối persistent, nên 200 triệu kết nối chỉ cần cỡ vài trăm đến vài nghìn gateway server. Cái chết nằm ở **số tin nhắn phải nhân bản**, không phải số kết nối. Đây là điểm nhiều người nhầm.

### 3.4 Cách hệ thống thoát ra

| Kỹ thuật | Làm gì | Hệ quả người xem thấy |
|---|---|---|
| **Sampling** | Chỉ đẩy một mẫu comment cho mỗi người | Bạn và người bên cạnh thấy hai ô comment khác nhau |
| **Batching** | Gom comment 0,5–1s thành một gói | Comment trôi thành từng cụm, không mượt liên tục |
| **Fan-out on read** | Client tự kéo về gói comment mới nhất, gói này cache được ở CDN | Chi phí từ O(N×M) xuống O(N) |
| **Local echo** | Máy bạn tự vẽ comment của bạn ra, không chờ server | Bạn **luôn** thấy comment mình → tưởng ai cũng thấy |
| **Rate limit** | Chặn spam ở tầng gateway | Gõ nhanh quá thì bị nuốt |

**Local echo là điểm "aha" mạnh nhất của toàn series.** Nó giải thích một trải nghiệm mà gần như 100% khán giả từng có, bằng một sự thật hơi phũ.

### 3.5 Con số 200 triệu chính xác tới đâu

Đếm **chính xác** số người đang xem theo thời gian thực là bài toán đắt (phải khử trùng lặp 200 triệu ID mỗi giây). Ngành thường dùng:

- **HyperLogLog** — đếm số phần tử duy nhất bằng vài KB bộ nhớ, sai số ~1–2%
- **Sharded counter** — mỗi shard đếm riêng, gom lại mỗi vài giây

Trên 200 triệu, sai số 1–2% là **±2 đến 4 triệu người**. Cộng thêm độ trễ tổng hợp vài giây và làm mượt cho số khỏi nhảy loạn.

→ Chốt cho tập này: *"sai số của con số đó lớn hơn dân số cả một thành phố. Và hệ thống cố tình chấp nhận điều đó."*

### 3.6 Đường tiền — chỗ duy nhất không được phép sai

Giả sử 1% người xem tặng quà: **2 triệu giao dịch**. Đây là chỗ kiến trúc rẽ đôi:

| | Hot path (comment, tim, hiệu ứng) | Money path (quà, nạp xu) |
|---|---|---|
| Mất dữ liệu | **Chấp nhận được** | Tuyệt đối không |
| Nhất quán | Eventual | Strong / transactional |
| Trùng lặp | Kệ | Chặn bằng **idempotency key** |
| Lưu trữ | In-memory, TTL ngắn | Ghi DB, audit log, đối soát |
| Khi quá tải | Bỏ bớt (load shedding) | Xếp hàng, không bỏ |

**Bài học kiến trúc lớn nhất của series:** không phải mọi dữ liệu đều xứng đáng cùng một mức độ tin cậy. Trả tiền cho độ tin cậy đúng chỗ cần nó.

### 3.7 Khi vẫn quá tải — thang giảm cấp

Hệ thống không sập một phát. Nó **rơi từng nấc** theo thứ tự định sẵn:

```
1. Tắt hiệu ứng quà hoành tráng      (rẻ nhất, ít ai để ý)
2. Giãn tần suất đẩy comment          1s → 3s
3. Giảm số comment mỗi gói
4. Hạ chất lượng video mặc định       1080p → 720p → 480p
5. Tắt hẳn chat, giữ video
6. Chặn người xem mới vào             (cứu người đang xem)
```

Cộng thêm **pre-warming**: hệ thống đoán trước phiên sẽ đông (lịch sử creator, số người bấm nhắc, tốc độ tăng CCU 5 phút đầu) → cấp sẵn tài nguyên. Autoscale phản ứng sau thì đã muộn.

---

## 4. Cách dựng cho hấp dẫn — 6 nguyên tắc

1. **Nghịch lý trước, kiến thức sau.** Đừng dạy. Để khán giả sai trước, rồi sửa. Mỗi tập mở bằng một câu phủ định điều họ đang tin.
2. **Một bài một ý.** Nhồi hai khái niệm vào một bài là mất cả hai.
3. **Một ẩn dụ xuyên suốt cả series.** Dùng **"sân vận động 200 triệu người"** ở mọi tập. Lặp lại tạo nhận diện.
4. **Số phải sờ được.** Đừng để trần "400 Tbps". Viết "đầy 390 cái điện thoại mỗi giây".
5. **Kết bằng móc câu, không bằng lời chào.** Slide cuối dẫn sang tập sau. Không "cảm ơn đã xem".
6. **Cài comment bait có chủ đích.** Cố ý để một chi tiết đơn giản hoá cho dân trong ngành vào "sửa lưng" → comment tăng, và có sẵn nguyên liệu cho bài trả lời.

### Ẩn dụ dùng được ngay

| Khái niệm | Ẩn dụ |
|---|---|
| Fan-out tree | Không phải một người phát 200 triệu tờ rơi. Một người đưa cho 10, mỗi người lại đưa 10 — 9 tầng là ra một tỷ. |
| CDN caching | Quán photocopy đầu hẻm: cả xóm không ai chạy lên nhà xuất bản. Quán photo 1 bản, phát cho cả xóm. |
| Comment sampling | Sân vận động 200 triệu người cùng hét. Bạn hét một câu — chỉ vài người ngồi cạnh nghe thấy. |
| Local echo | Nhưng giọng **của bạn** thì bạn nghe rõ nhất. Nên bạn tưởng cả sân đều nghe. |
| Latency vs buffer | Xem live như uống nước bằng ống hút: hút gấp thì sặc (giật), hút chậm thì trễ. |
| Hot path vs money path | Nói chuyện thì nghe lọt tai cũng được. Nhưng đưa tiền thì phải ký nhận. |

---

## 5. Kịch bản series — 7 tập

**Thứ tự quan trọng:** bài 1 phải là bài **mạnh nhất**, không phải bài nền tảng. Bài 1 không nổ thì không ai xem bài 2. Vì vậy đặt cú "aha" cá nhân nhất (comment) lên đầu, rồi mới kéo về kiến trúc.

| Tập | Tiêu đề | Khái niệm | Độ mạnh |
|---|---|---|---|
| **1** | Cái gì sập trước? | Sampling + local echo | ★★★★★ |
| **2** | Bấm "Phát trực tiếp" xong thì sao? | Kiến trúc: ingest → transcode → origin → CDN → edge, và ba đường dữ liệu tách biệt | ★★★★☆ |
| **3** | Càng đông càng rẻ | Segment cache, request collapsing | ★★★★☆ |
| **4** | 5 giây đó đi đâu | HLS → LL-HLS, buffer trade-off | ★★★★☆ |
| **5** | Con số 200 triệu là số đoán | HyperLogLog, sharded counter | ★★★★☆ |
| **6** | Comment được mất, tiền thì không | Hot path vs money path | ★★★★☆ |
| **7** | Hệ thống rơi từng nấc | Degradation ladder, pre-warming | ★★★☆☆ |

> **Không làm bài "so sánh số liệu" riêng.** Đã thử và bỏ: 11 slide đi so con số truyền thông, không có tí kỹ thuật nào — lệch hẳn khỏi kênh tech. Phần so sánh gói gọn trong 3 slide đầu bài 1, đủ dựng bối cảnh rồi vào việc ngay.

**Khuyến nghị:** làm **bài 1** trước rồi xem phản ứng. Nếu rút gọn cả series thì bộ ba `1 → 2 → 5` là gọn nhất mà vẫn đủ ba cú lật độc lập.

**Đã viết xong slide:** bài 1, 2. Bài 3–7 mới có ý tưởng và khái niệm, chưa có nội dung slide.

### Format: photo carousel, không voiceover

Mỗi tập là một bài đăng dạng **ảnh chụp slide + nhạc trend**. Khoảng 10–11 slide, ~3 giây mỗi ảnh, tổng 30 giây.

```
Slide 1       COVER      Toàn bộ cú hook. Vừa là ảnh bìa, vừa quyết định người ta có vuốt tiếp không.
Slide 2–3     ĐẶT CƯỢC   "Bạn nghĩ X. Thực ra Y."
Slide 4–6     CON SỐ     Một phép tính, tách ra từng slide một dòng.
Slide 7–9     ẨN DỤ      Kéo về đời thường. Đây là chỗ người ta chụp màn hình đi share.
Slide 10      TWIST      Chi tiết lật ngược lần hai.
Slide 11      MÓC CÂU    Dẫn sang tập sau.
```

### Luật viết slide câm

Không có giọng đọc thì **chữ phải gánh 100%**. Bốn ràng buộc:

1. **Tối đa ~12 từ / slide.** Người xem có 2–3 giây. Quá 12 từ là bị lướt.
2. **Mỗi slide đúng một ý.** Không câu nối, không "và", không "nhưng mà".
3. **Slide 1 là toàn bộ cú hook** — vừa là ảnh bìa, vừa quyết định người ta có vuốt tiếp không. Dồn 80% công sức vào đây.
4. **Đọc được khi tắt tiếng, không cần ngữ cảnh.** Không viết "như đã nói ở trên".

**Nhịp:** ngắn → ngắn → dài (chỗ cần dừng) → ngắn. Đừng để 3 slide dài liền nhau.

### Có nên nêu tên bà Phương Hằng không

| | Nêu tên trên slide | Chỉ để con số |
|---|---|---|
| Lượt tiếp cận | Cao hơn — ăn theo lượt tìm kiếm | Thấp hơn |
| Phần bình luận | Bị drama chiếm, nội dung tech chìm | Sạch, đúng khán giả |
| Rủi ro kiểm duyệt | Có (phiên gốc đã bị TikTok khoá) | Gần như không |

**Cách lấy cả hai:** để **tên trong caption** (được lượt tìm kiếm), **slide chỉ để con số** (hình sạch, không mời drama). Người Việt nào từng thấy tin đó nhìn số là biết ngay.

### Comment bait

Mỗi bài cài sẵn một chỗ để dân trong ngành nhảy vào cãi — cãi ở comment thì bài đi xa hơn, và mình có sẵn nguyên liệu cho bài trả lời.

| Bài | Chỗ cài |
|---|---|
| 1 | Slide 6 — "riêng trên TikTok thì Việt Nam cao hơn" (sẽ có người cãi so sánh khập khiễng) |
| 2 | Slide 6 — "Bạn nghĩ: video. Sai." (CDN, multicast, pub/sub fan-out…) |
| 3 | Slide 8 — cây nhân 10 mỗi tầng (sẽ có người cãi CDN không xếp tầng kiểu đó) |

Mỗi bài **tự chốt**, không kết bằng "bài sau →". Người xem hết một bài là có trọn một ý.

### Cấu trúc file

```
README.md              ← file này: lý thuyết, số liệu, kế hoạch. KHÔNG nạp vào NotebookLM.
PROMPTS.md             ← prompt + caption + checklist mọi bài. Copy dán thẳng.
NOTEBOOKLM.md          ← quy trình dựng slide, xử lý tỉ lệ khung hình, yêu cầu hiển thị.
source/
  ├── bai-01.md        ← CHỈ nội dung slide. Đây là thứ nạp vào NotebookLM.
  └── bai-02.md
```

**Quy tắc:** file trong `source/` chỉ chứa chữ sẽ lên slide, không một dòng ghi chú nào. Nạp nhầm file có ghi chú thì NotebookLM nuốt luôn phần đó và chế ra slide rác.

---

## 6. Mức độ tin cậy của từng luận điểm

Phân loại này để biết chỗ nào nói chắc, chỗ nào phải nói "thường thì". Dân IT sẽ soi.

| Loại | Nội dung | Cách nói |
|---|---|---|
| **A — Giả định của mình** | Con số 200 triệu CCU, 10.000 comment/giây, 1% tặng quà | Đóng khung bằng chữ **"Nếu"** hoặc **"Giả sử"**. Không bao giờ nói như chuyện có thật. |
| **B — Số học thuần** | 400 Tbps, 2 nghìn tỷ msg/giây, tỉ lệ nén 1.000.000:1 | Nói chắc — đây chỉ là nhân chia từ giả định ở trên. Ghi "ước tính" vì bitrate là ước lượng. |
| **C — Nguyên lý công khai** | HLS/LL-HLS, CDN multi-tier, request collapsing, WebSocket, HyperLogLog, idempotency, load shedding | Nói chắc. Đây là kiến thức ngành, tra được. |
| **D — Nền tảng cụ thể làm sao** | TikTok/YouTube thực tế cấu hình thế nào, sampling ratio bao nhiêu | **Tránh hẳn.** Series này là bài toán giả định, không cần đụng tới. |

> Không có tài liệu kiến trúc nội bộ nào của các nền tảng lớn được công bố. Khung "Nếu" giúp mình khỏi phải đoán — đó là lợi thế lớn nhất của việc bỏ sự kiện thật đi.

---

## 7. Số liệu mở đầu — dùng cái nào

Xếp theo độ mạnh khi làm chữ chạy trên slide:

1. `200.000.000` — người xem cùng lúc. Con số nền của cả series.
2. `2.000.000.000.000` — tin nhắn/giây nếu fan-out comment kiểu thô. Dãy số 0 đổ dốc rất đã mắt.
3. `1.000.000 : 1` — tỉ lệ nén request nhờ cache.
4. `50 TB/giây` — băng thông, hoặc "390 cái điện thoại mỗi giây".
5. `±2 triệu` — sai số của chính con số 200 triệu.
6. `2,1 triệu → 65 triệu → 200 triệu` — thang leo ba bậc, dùng mở màn bài 1.

---

## 8. Nguyên tắc an toàn

Bốn điều:

1. **Không bao giờ trình bày 200 triệu như chuyện có thật.** Slide vào bài toán phải có chữ "giả định" / "thử". Kỷ lục thật là 65 triệu — ai cũng tra được trong 10 giây, và mất uy tín một lần là mất luôn.
2. **Tên người chỉ nằm trong caption, không lên slide.** Đặt tên trong caption thì vẫn ăn được lượt tìm kiếm; để lên slide thì phần bình luận bị drama chiếm và nội dung tech chìm nghỉm. Phiên live gốc đã bị TikTok khoá vì vi phạm tiêu chuẩn cộng đồng — không có lý do gì đứng gần chỗ đó hơn mức cần thiết.
3. **Không nhắc tên nền tảng cụ thể khi mô tả kiến trúc.** Viết "hệ thống livestream" thay vì "TikTok làm thế này". Vừa đúng, vừa khỏi bị bắt bẻ.
4. **Không dùng hình ảnh/clip của bất kỳ buổi live nào.** Animation số, sơ đồ, nền tối chữ sáng — hợp chất tech hơn nhiều và không dính bản quyền.

### Checklist trước khi đăng mỗi bài

- [ ] Slide giả định có chữ "giả định" / "thử"
- [ ] Slide không có tên người, không có ảnh buổi live
- [ ] Dùng đúng chữ "người xem cùng lúc", không nhầm sang "follower" hay "lượt xem"
- [ ] Mọi phép tính có chữ "ước tính" trên slide
- [ ] Không khẳng định nền tảng nào cụ thể làm gì
- [ ] Không có ảnh nào lấy từ buổi live có thật
- [ ] Slide cuối là móc câu sang bài sau, không phải lời cảm ơn

---

## 9. Nguồn

Chỉ hai con số thật cần nguồn — hai bậc đầu của thang leo:

**Bậc 1 — 2,1 triệu, kỷ lục Việt Nam (5/8/2026)**
- [Phiên livestream 2,1 triệu người xem cùng lúc trên TikTok, 84.000 người tặng quà — Người Quan Sát](https://nguoiquansat.vn/phien-livestream-2-1-trieu-nguoi-xem-cung-luc-tren-tiktok-84-000-nguoi-tang-qua-dbqh-dat-van-de-co-loi-dung-de-rua-tien-309009.html)
- [Vì sao TikTok khoá phiên livestream này — VietnamNet](https://vietnamnet.vn/vi-sao-tiktok-khoa-phien-livestream-cua-ba-nguyen-phuong-hang-2542619.html)

**Bậc 2 — 9.334.179, kỷ lục kênh cá nhân (7/2025)**
- [La Velada del Año V phá kỷ lục Twitch với 9,3 triệu người xem đỉnh — Streams Charts](https://streamscharts.com/news/la-velada-del-ano-v-ibai-records)
- [Ibai tự phá kỷ lục của mình với gần 10 triệu người xem đồng thời — Tubefilter](https://www.tubefilter.com/2025/07/28/ibai-llanos-la-velada-del-ano-v-twitch-record-influencer-boxing/)

**La Velada del Año VI (7/2026) — dùng dạy CCU vs tổng lượt xem**
- [La Velada VI đạt hơn 34 triệu thiết bị độc nhất — Sevilla Actualidad](https://www.sevillaactualidad.com/sevilla/596487-la-velada-del-ano-vi-bate-su-record-de-audiencia-con-mas-de-34-millones-de-dispositivos-unicos/)
- [Gần 8 triệu người xem La Velada VI, chia theo nền tảng — Marketing4eCommerce](https://marketing4ecommerce.net/la-velada-del-ano-vi/) — YouTube 5,08tr · Twitch 2,07tr · TikTok 827k · đỉnh cộng gộp 8,73tr

**Mốc đối chiếu khác hạng (chỉ dùng ở slide "đừng nhầm")**
- [Jake Paul vs Mike Tyson: hơn 108 triệu người xem trực tiếp toàn cầu — Netflix](https://about.netflix.com/en/news/jake-paul-vs-mike-tyson-over-108-million-live-global-viewers) — đỉnh 65 triệu luồng đồng thời
- [Chung kết IPL 2025 — 55 triệu peak concurrency trên JioHotstar](https://www.business-standard.com/industry/news/ipl-2025-breaks-viewership-records-rcb-final-draws-840-billion-minutes-125061900901_1.html)

Phần còn lại của series là số học thuần từ giả định 200 triệu, cộng với nguyên lý công khai của ngành (HLS, CDN, HyperLogLog…). Không cần trích nguồn cho những thứ đó.
