# Livestream scale — làm sao gánh được hàng triệu người xem cùng lúc

> Toàn bộ lý thuyết, một mạch từ đầu tới cuối. Ví dụ chạy suốt bài: **2 triệu người xem cùng lúc**.
>
> Học tới đâu ghi tới đó ở [`NOTES.md`](./NOTES.md).

---

## Ý gốc — nhớ được cái này là suy ra hết phần còn lại

Trong một livestream có **hai loại dữ liệu hoàn toàn khác nhau**:

| | **VIDEO** | **CHAT / QUÀ** |
|---|---|---|
| Hướng | Một chiều | Hai chiều |
| Mọi người nhận | **Giống hệt nhau** | **Khác nhau** |
| Cache được? | Được | Không |
| Cách nhân bản | Copy một lần, phát cho tất cả | Phải gửi riêng từng người |
| Độ khó | **Dễ** — giải quyết xong từ lâu | **Khó** — đây là chỗ sập |

Trực giác ai cũng có là *"2 triệu người xem thì video nặng lắm"*. Sai. Video là phần dễ nhất. Cả tài liệu này đi chứng minh điều đó, rồi chỉ ra chỗ thật sự khó.

---

# Phần 1 — Đề bài

Một người cầm điện thoại quay. Hai triệu người ngồi xem.

**Video đi từ một cái điện thoại tới hai triệu cái điện thoại bằng cách nào?**

### Video live là gì

Không giống tải một file phim rồi mở. File có điểm đầu điểm cuối; livestream là **dòng chảy liên tục** — cứ đổ ra, hứng tới đâu xem tới đó.

Đo bằng **Mbps** (*megabit mỗi giây*) — mỗi giây video cần bao nhiêu dữ liệu:

```
video 720p ≈ 2 Mbps
           = 2 triệu bit mỗi giây
           = 250 KB mỗi giây          (8 bit = 1 byte)
           = 15 MB mỗi phút
           ≈ 900 MB cho một tiếng xem
```

### Cách nghĩ ngây thơ, và vì sao nó chết

Điện thoại đẩy lên server, server gửi cho hai triệu người:

```
2.000.000 người × 2 Mbps = 4.000.000 Mbps = 4 Tbps = 500 GB mỗi giây
```

Không server nào làm nổi. Cần cách khác.

---

# Phần 2 — Cây phân phối

## 2.1 Chèn một lớp ở giữa

Điện thoại **chỉ đẩy lên đúng một nơi**: **origin** — bản gốc. Từ origin mới toả ra nhiều server.

```
Điện thoại  →  ORIGIN  →  N server  →  người xem
              (bản gốc)
```

**CDN** = *Content Delivery Network*, mạng phân phối nội dung. Một mạng lưới server rải khắp thế giới, giữ sẵn bản sao để người dùng lấy ở chỗ gần nhất.

**Edge server** = một server trong CDN, nằm ngoài rìa, gần người xem nhất. Bạn ở TP.HCM thì video lấy từ edge ở TP.HCM hoặc Singapore, không bay từ Mỹ về.

> **Ẩn dụ:** cả xóm cần một quyển sách. Không ai chạy lên nhà xuất bản. Quán photo đầu hẻm lấy về **một** bản rồi photo cho cả xóm.
> Nhà xuất bản = origin. Quán photo = edge. Hệ thống quán photo khắp nơi = CDN.

## 2.2 Lặp lại đúng chiêu đó

Origin cũng gặp y hệt vấn đề: nếu 100.000 edge cùng hỏi nó, nó lại quá tải. Chèn thêm tầng nữa:

```
ORIGIN
   ↓
tầng vùng          (vài trăm)
   ↓
EDGE               (hàng chục nghìn)
   ↓
người xem          (hàng triệu)
```

**Không ai phải nói chuyện với quá nhiều người cùng lúc.**

Gọi là **fan-out tree** — cây toả ra. Mỗi tầng nhân lên ~10 lần:

```
1 → 10 → 100 → 1.000 → 10.000 → ...
```

9 tầng là ra một tỷ. **Cây cao lên rất chậm, nhưng phủ rộng ra rất nhanh.**

Đây là lý do video không phải phần khó.

## 2.3 Không tự dựng — đi thuê

Không ai tự đặt 100.000 server khắp thế giới. Cái cây đã có sẵn: Cloudflare, Akamai, Fastly, AWS CloudFront, Google Cloud CDN.

Việc của mình: đẩy **một luồng** vào endpoint của họ. Hết.

## 2.4 "CPU quá 80% thì thêm server" — vô dụng với livestream

Mô hình autoscale quen thuộc:

```
traffic tăng dần → CPU lên 80% → báo động → bật server mới
   → chờ boot → health check → load balancer nhận

tổng: 2–5 phút
```

Nó hoạt động vì **traffic web tăng từ từ**. Livestream thì **nổ**:

```
giây 0   →  50.000 người
giây 30  →  550.000 người
```

Server mới còn đang boot. Lúc nó sẵn sàng thì hoặc đã sập, hoặc sóng đã đi qua.

| | Web thường | Livestream |
|---|---|---|
| Cách làm | Phản ứng sau khi tải tăng | **Phải có sẵn trước** |
| Đơn vị thời gian | Phút | Giây |

Nhà cung cấp CDN nuôi sẵn năng lực khổng lồ đang nằm không, dùng chung mọi khách. Mình không kích hoạt scale-up — mình xin một lát của cái đã dựng sẵn.

Cộng thêm **pre-warming**: hệ thống đoán trước phiên sẽ đông (lịch sử creator, số người bấm nhắc, tốc độ tăng 5 phút đầu) rồi cấp tài nguyên trước.

---

# Phần 3 — Kinh tế của cái cây

## 3.1 Stream nhỏ TỐN HƠN stream lớn

Trường hợp trớ trêu: stream chỉ 100 người xem nhưng rải khắp 50 quốc gia.

| | 2 triệu người, tập trung | 100 người, rải 50 nước |
|---|---|---|
| Số edge phải kéo video về | ~50 | ~50 |
| Mỗi edge phục vụ | 40.000 người | **2 người** |
| Origin bị hỏi | 50 lần | **50 lần** |

**Cùng một mức tải lên origin, nhưng một bên phục vụ 2 triệu người, bên kia 100.** Chi phí trên mỗi người xem chênh **20.000 lần**.

Cây CDN chỉ đáng tiền khi có đông người đứng dưới hứng. Rải mỏng thì mỗi nhánh gánh đúng 2 người.

**Cách xử lý:** stream ít người thì không đẩy xuống edge thành phố, mà gom lên phục vụ từ **tầng vùng**. 2 người ở Brazil, 3 ở Argentina, 1 ở Chile cùng lấy từ một PoP Nam Mỹ. Trễ thêm vài chục ms, nhưng thay vì 3 nhánh cây thì chỉ tốn 1.

## 3.2 Pull-based — edge chỉ kéo khi có người hỏi

```
Không ai ở Brazil mở stream  →  edge Brazil không kéo gì, không tốn gì
Có 1 người mở                →  lúc đó edge mới lên origin lấy về
```

Không đẩy sẵn đi khắp nơi. Nên không có chuyện "phí edge" — cái phí là edge kéo **cả luồng** về chỉ để phục vụ 1 người.

## 3.3 Transcode — chi phí stream nhỏ không trốn được

Người phát đẩy lên một luồng, ví dụ 1080p. Nhưng người xem internet mỗi người một kiểu. Nên hệ thống phải giải mã rồi **mã hoá lại** thành nhiều phiên bản:

```
1 luồng vào  →  [ TRANSCODE ]  →  1080p / 720p / 480p / 360p / 240p
```

Internet khoẻ nhận bản to, internet yếu tự tụt xuống bản nhỏ, không ai đứng hình. Cơ chế tự đổi này gọi là **ABR** (*adaptive bitrate*).

**Chỗ đau:** transcode tốn CPU/GPU nặng, và tốn **theo luồng phát**, không theo người xem.

| | Transcode | Bandwidth |
|---|---|---|
| Tính theo | **Mỗi luồng phát** | Mỗi người xem |
| 100 người xem | Tốn y hệt | Gần như bằng 0 |
| 2 triệu người xem | **Tốn y hệt** | Rất nhiều |

Với stream nhỏ, transcode gần như là **toàn bộ hoá đơn**. Đó là lý do nhiều nền tảng bắt đủ follower mới cho live, hoặc stream nhỏ thì cho xem thẳng bản gốc không transcode.

---

# Phần 4 — Vì sao cache được, và vì sao càng đông càng rẻ

## 4.1 Livestream không phải dòng chảy — nó là một đống file nhỏ

Video bị cắt thành **segment** 2–6 giây, mỗi segment là **một file có URL riêng**:

```
/live/abc/seg-041.ts
/live/abc/seg-042.ts
/live/abc/seg-043.ts
```

Máy bạn tải lần lượt từng file, phát nối lại, mắt thấy liền mạch:

```
tải seg-041  →  phát seg-041   (trong lúc phát thì đã tải seg-042)
             →  phát seg-042  →  ...
```

Tên gọi: **HLS** (*HTTP Live Streaming*). Chữ HTTP quan trọng — livestream chạy bằng **đúng giao thức tải file thông thường của web**, không có giao thức thần thánh nào cả.

## 4.2 Cache cần một CÁI TÊN để tra

Cache về bản chất là bảng tra `key → value`. Không có key thì không cache được.

| | gRPC stream | HLS |
|---|---|---|
| Hình dạng | Ống mở, giữ liên tục | Từng file rời |
| Có tên để tra? | Không | **Có — URL** |
| Máy ở giữa cache được? | Không | **Được** |

Cùng một URL = cùng một mớ bytes cho mọi người trên đời → bất kỳ máy nào nằm giữa đường cũng giữ lại được một bản.

> **Ghi nhớ:** cái ô comment chính là kiểu **ống mở như gRPC** — mỗi người một nội dung, không có tên để tra, không cache được. Đây là lý do gốc rễ: video thì dễ, chat thì sập.

## 4.3 Cache ở MỌI tầng, không chỉ edge

```
người xem  →  EDGE       có sẵn? → trả luôn
                 ↓ không có
              tầng vùng   có sẵn? → trả luôn
                 ↓ không có
              ORIGIN      lúc này mới phải hỏi bản gốc
```

- **cache hit** — có sẵn, trả liền
- **cache miss** — chưa có, phải đi xin tầng trên

Người đầu tiên trong khu vực gây cache miss, nhưng edge giữ lại một bản. Người thứ 2 đến thứ 40.000 đều được trả ngay tại chỗ. **Origin không hề biết những người đó tồn tại.**

## 4.4 Con số — nén 40.000 lần

2 triệu người xem, segment 6 giây:

| | Số request |
|---|---|
| Ở rìa (người xem hỏi edge) | 2.000.000 ÷ 6 ≈ **333.000 / giây** |
| Tới origin (50 điểm CDN, mỗi điểm xin 1 lần) | 50 ÷ 6 ≈ **8 / giây** |

Origin — máy giữ bản gốc — chỉ trả lời 8 câu hỏi mỗi giây. Bằng một con VPS rẻ tiền.

> **Chốt:** tải lên origin phụ thuộc **số điểm CDN**, KHÔNG phụ thuộc số người xem.
> Thêm 1 triệu người nữa, origin vẫn 8 request/giây.

| | Web app thường | Livestream |
|---|---|---|
| Gấp đôi người dùng | Server gánh gấp đôi | **Origin không đổi** |
| Vì sao | Mỗi người hỏi một thứ khác | Ai cũng xin **đúng một file giống nhau** |

Feed TikTok là vế trái — mỗi người lướt một video khác nhau, cache trượt liên tục. Livestream là vế phải.

**Nói cho chuẩn, không miễn phí hoàn toàn:**

| Khoản | Tăng theo người xem? |
|---|---|
| Transcode | Không — tính theo luồng |
| Tải lên origin | **Không** |
| Bandwidth edge | Có |

→ Chi phí **trên mỗi người xem** giảm dần khi càng đông, chứ không bằng 0. Hai trong ba khoản đứng yên, chỉ khoản rẻ nhất là tăng.

## 4.5 Thundering herd và request collapsing

Nãy giờ giả định cache **đã có sẵn**. Nhưng có một khoảnh khắc nó chưa có: lúc segment vừa đẻ ra.

`seg-100` vừa sinh, chưa edge nào có. Mà 40.000 người trong khu vực đang chờ đúng nó. Edge làm kiểu ngây thơ (thiếu thì đi xin) → bắn 40.000 request lên origin cùng lúc. Nhân 50 điểm CDN = 2 triệu request trong một giây. **Origin chết, cache thành vô dụng.**

Hiện tượng: **thundering herd** — đàn trâu giẫm đạp.

**Cách chữa — request collapsing** (còn gọi *request coalescing*):

```
1.  edge nhận ra 40.000 request hỏi CÙNG một URL
2.  gửi ĐÚNG 1 request lên tầng trên
3.  bắt 39.999 cái còn lại xếp hàng chờ chung
4.  có kết quả → trả cho cả 40.000 người một lượt
```

## 4.6 Vì sao live cần cái này hơn mọi thứ khác

| | Netflix (VOD) | Live |
|---|---|---|
| Người xem đang ở đâu | Mỗi người một phút khác nhau | **Tất cả cùng một khoảnh khắc** |
| Request phân bố | Rải đều hàng nghìn segment | **Dồn hết vào 1 segment** |
| File có trước khi ai hỏi? | Có — quay xong từ lâu | **Không — vừa mới đẻ** |
| Bơm sẵn xuống edge được? | Được, trước ngày phát hành | **Không thể** |

> **Live không phải "thỉnh thoảng dính thundering herd".**
> **Live LÀ thundering herd, cứ 6 giây một lần, suốt buổi.**

---

# Phần 5 — Latency

Video phải gom đủ segment mới phát được. Đó là nguồn gốc của latency.

```
HLS cổ điển:   segment 6s × 3 segment buffer  →  trễ 20–30 giây
LL-HLS / chunked:                              →  trễ 1–3 giây
```

**LL-HLS** (*Low-Latency HLS*) không chờ segment hoàn chỉnh — nó cắt segment thành **chunk** nhỏ hơn (200ms–1s) và đẩy đi ngay khi có.

**Đánh đổi cốt lõi:**

| Buffer | Latency | Độ mượt |
|---|---|---|
| Lớn | Cao | Mượt, chịu được internet phập phù |
| Nhỏ | Thấp | Dễ giật khi internet xấu |

> Latency đó được **cố ý** thêm vào. Không phải internet bạn yếu.

Ẩn dụ: xem live như uống nước bằng ống hút. Hút gấp thì sặc, hút chậm thì trễ.

Vì sao phải giảm trễ: livestream là **tương tác**. Chủ live đọc comment rồi trả lời. Trễ 30 giây thì hỏng hẳn trải nghiệm.

---

# Phần 6 — Comment: chỗ thật sự chết

## 6.1 Phép tính

```
Giả sử 1.000 comment mỗi giây.
Mỗi comment muốn tới tay tất cả:

1.000 × 2.000.000 = 2.000.000.000 tin nhắn / giây
```

**Hai tỷ tin nhắn mỗi giây.** Không hạ tầng nào làm nổi ở dạng thô.

Lưu ý: **giữ 2 triệu kết nối persistent không phải phần khó** — một server tinh chỉnh tốt giữ được vài trăm nghìn kết nối, nên chỉ cần vài chục gateway server. Cái chết nằm ở **số tin nhắn phải nhân bản**, không phải số kết nối. Đây là chỗ nhiều người nhầm.

## 6.2 Bốn cách thoát

| Kỹ thuật | Làm gì | Hệ quả người xem thấy |
|---|---|---|
| **Sampling** | Chỉ đẩy một mẫu comment cho mỗi người | Bạn và người bên cạnh thấy hai ô comment khác nhau |
| **Batching** | Gom comment 0,5–1s thành một gói | Comment trôi thành từng cụm |
| **Fan-out on read** | Client tự kéo gói comment mới nhất về, gói đó cache được ở CDN | Chi phí từ O(N×M) xuống O(N) |
| **Local echo** | Máy bạn tự vẽ comment của bạn ra, không chờ server | Bạn **luôn** thấy comment mình |

> **Local echo** là điểm "aha" mạnh nhất. Comment của bạn hiện lên ngay không chứng minh được ai khác nhìn thấy nó — máy bạn tự vẽ ra thôi. Bạn tưởng cả phòng đang đọc; thật ra gần như chỉ mình bạn.

Ẩn dụ: sân vận động 2 triệu người cùng hét. Bạn hét một câu — chỉ vài người ngồi cạnh nghe thấy. Nhưng giọng **của bạn** thì bạn nghe rõ nhất, nên tưởng cả sân đều nghe.

---

# Phần 7 — Con số người xem là ước lượng

Đếm **chính xác** số người đang xem theo thời gian thực rất đắt — phải khử trùng lặp 2 triệu ID mỗi giây.

Ngành dùng:
- **HyperLogLog** — đếm số phần tử duy nhất bằng vài KB bộ nhớ, sai số ~1–2%
- **Sharded counter** — mỗi shard đếm riêng, gom lại mỗi vài giây

Trên 2 triệu, sai số 1–2% là **±20.000 đến 40.000 người**. Cộng thêm latency tổng hợp vài giây và làm mượt cho số khỏi nhảy loạn.

→ Con số bạn nhìn thấy không sai, nhưng nó là **số ước lượng** — và hệ thống cố tình chấp nhận điều đó, vì đếm chính xác không đáng tiền.

---

# Phần 8 — Đường tiền: chỗ duy nhất không được phép sai

Kiến trúc rẽ đôi:

| | Hot path (comment, tim, hiệu ứng) | Money path (quà, nạp xu) |
|---|---|---|
| Mất dữ liệu | **Chấp nhận được** | Tuyệt đối không |
| Nhất quán | Eventual | Strong / transactional |
| Trùng lặp | Kệ | Chặn bằng **idempotency key** |
| Lưu trữ | In-memory, TTL ngắn | Ghi DB, audit log, đối soát |
| Khi quá tải | Bỏ bớt (load shedding) | Xếp hàng, không bỏ |

> **Bài học kiến trúc lớn nhất:** không phải mọi dữ liệu đều xứng đáng cùng một mức độ tin cậy. Trả tiền cho độ tin cậy đúng chỗ cần nó.

Ẩn dụ: nói chuyện thì nghe lọt tai cũng được. Nhưng đưa tiền thì phải ký nhận.

---

# Phần 9 — Khi vẫn quá tải: rơi từng nấc

Hệ thống không sập một phát. Nó rơi theo thứ tự định sẵn:

```
1. Tắt hiệu ứng quà hoành tráng      (rẻ nhất, ít ai để ý)
2. Giãn tần suất đẩy comment          1s → 3s
3. Giảm số comment mỗi gói
4. Hạ chất lượng video mặc định       1080p → 720p → 480p
5. Tắt hẳn chat, giữ video
6. Chặn người xem mới vào             (cứu người đang xem)
```

Gọi là **graceful degradation** / **load shedding**. Bạn đã từng ngồi trong một hệ thống đang tự giảm cấp mà không hề biết.

---

# Tóm tắt một trang

| # | Khái niệm | Ý một câu |
|---|---|---|
| 1 | **Fan-out tree** | Chèn lớp ở giữa, rồi lặp lại chiêu đó. Mỗi tầng nhân 10, 9 tầng ra một tỷ. |
| 2 | **Thuê CDN** | Không ai tự dựng. Đẩy một luồng vào endpoint nhà cung cấp. |
| 3 | **Không autoscale được** | Sóng tới trong giây, autoscale phản ứng trong phút. Phải có sẵn trước. |
| 4 | **Stream nhỏ đắt hơn** | Cùng tải origin nhưng chia cho 100 người thay vì 2 triệu → chênh 20.000 lần. |
| 5 | **Transcode theo luồng** | 100 hay 2 triệu người xem, hoá đơn transcode y hệt. |
| 6 | **Segment = file có URL** | Livestream chạy bằng HTTP tải file thường. Có URL nên mới cache được. |
| 7 | **Cache cần tên** | gRPC stream là ống mở không tên → chịu. Chat cũng vậy → đó là chỗ sập. |
| 8 | **Càng đông càng rẻ** | Origin phụ thuộc số điểm CDN, không phụ thuộc số người xem. Nén 40.000:1. |
| 9 | **Request collapsing** | Live LÀ thundering herd cứ 6 giây một lần. Gộp 40.000 request thành 1. |
| 10 | **Buffer trade-off** | Latency được cố ý thêm vào. Buffer nhỏ = trễ ít nhưng dễ giật. |
| 11 | **Comment fan-out** | 2 tỷ msg/giây nếu làm thô. Thoát bằng sampling + local echo. |
| 12 | **Đếm xấp xỉ** | HyperLogLog, sai số ±20.000 người. Cố tình chấp nhận. |
| 13 | **Hot path vs money path** | Comment được phép mất. Tiền thì không. |
| 14 | **Graceful degradation** | Rơi từng nấc: hiệu ứng → comment → chất lượng → chat → chặn người mới. |

---
