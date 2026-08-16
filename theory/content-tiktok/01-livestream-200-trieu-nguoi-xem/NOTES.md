# Ôn nhanh — livestream scale

> Bản rút gọn để lướt lại. Số mục ở đây **khớp đúng với [`README.md`](./README.md)** — thấy `4.4` thì mở mục 4.4 trong README là có bản đầy đủ.
> Chỗ đang học dở nằm ở cuối file.

---

## Ý gốc — nhớ cái này là suy ra hết phần còn lại

| | **VIDEO** | **CHAT / QUÀ** |
|---|---|---|
| Hướng | Một chiều | Hai chiều |
| Mọi người nhận | **Giống hệt nhau** | **Khác nhau** |
| Cache được? | Được | Không |
| Độ khó | **Dễ** | **Khó — đây là chỗ sập** |

---

## Từ vựng

| Từ | Nghĩa |
|---|---|
| **Ingest** | Server nhận stream từ streamer. Đặt **gần streamer**. |
| **Transcode** | Cắt 1 stream thành nhiều rendition (1080p → 240p). |
| **Origin** | Bản gốc, chỗ CDN lên lấy. Đặt ở **chỗ trung tâm, không gần ai**. |
| **CDN** | Mạng lưới server rải khắp thế giới giữ bản sao. |
| **Edge** | Server ngoài rìa CDN, đặt **gần viewer**. |
| **PoP** | *Point of Presence* — một điểm hiện diện của CDN. |
| **Segment** | Mẩu video 2–6 giây, mỗi mẩu là một file có URL. |
| **Chunk** | Mẩu nhỏ hơn nữa, ~0,2 giây. Dùng trong LL-HLS. |
| **Buffer** | Kho video dự trữ sẵn trong player. |
| **ABR** | Tự đổi rendition theo internet của viewer. |
| **Mbps** | Video 720p ≈ 2 Mbps ≈ 900 MB mỗi tiếng xem. |

---

# 1. Đề bài

Một streamer, 2 triệu viewer. Cách nghĩ ngây thơ: server gửi ra 2 triệu bản.

```
2.000.000 × 2 Mbps = 4 Tbps = 500 GB mỗi giây
```

Không server nào làm nổi.

---

# 2. Cây phân phối

**2.1 — Chèn một lớp ở giữa.** Đường đi đầy đủ có 4 chặng, không phải 2:

```
điện thoại → INGEST → transcode → ORIGIN → CDN → viewer
```

Ba chỗ đặt theo **ba tiêu chí khác nhau** (chỗ hay nhầm):

| | Đặt ở đâu |
|---|---|
| Ingest | Gần **streamer** — đường upload ngắn thì ít rớt |
| Origin | Chỗ trung tâm, **không gần ai** — chỉ cần ổn định |
| Edge | Gần **viewer** — đường download ngắn thì nhanh |

→ *Origin không nằm trên đường đi của viewer. Nó chỉ bị hỏi ~8 lần/giây khi cache miss.*

**2.2 — Đoạn upload là single point of failure.** Từ CDN xuống viewer có nhiều đường (edge chết thì đổi edge khác). Từ điện thoại streamer lên ingest chỉ có **một** đường, và lúc đó video **chưa tồn tại ở đâu khác trên đời**. Rớt là cả 2 triệu người freeze.
→ *Vì vậy ingest đặt gần streamer — rút ngắn đúng đoạn không có dự phòng.*

**2.3 — Lặp lại đúng chiêu đó.** Origin cũng overload nếu 100.000 edge cùng hỏi → chèn regional tier vào giữa.

```
ORIGIN → REGIONAL TIER (vài trăm) → EDGE (hàng chục nghìn) → viewer (hàng triệu)
```

Mỗi tầng nhân ~10 lần, 9 tầng ra một tỷ. **Không ai phải nói chuyện với quá nhiều người cùng lúc.**
→ *Đây là lý do video KHÔNG phải phần khó.*

**2.4 — Không tự dựng CDN, đi thuê.** Cloudflare, Akamai, Fastly, CloudFront, Cloud CDN. Việc của mình: đẩy một stream vào endpoint của họ.

**2.5 — Autoscale "CPU > 80%" vô dụng.** Autoscale phản ứng trong *phút*, sóng livestream ập tới trong *giây* (50k → 550k trong 30 giây). Phải có năng lực sẵn trước, không phản ứng sau.

---

# 3. Kinh tế của cái cây

**3.1 — Stream nhỏ TỐN HƠN stream lớn.**

| | 2 triệu viewer, tập trung | 100 viewer, rải 50 nước |
|---|---|---|
| Origin bị hỏi | 50 lần | **50 lần** |
| Mỗi edge phục vụ | 40.000 người | **2 người** |

Cùng tải lên origin nhưng chia cho 2 triệu thay vì 100 → chi phí mỗi viewer chênh **20.000 lần**.
→ *Cách chữa: stream ít viewer thì phục vụ từ regional tier thay vì edge thành phố.*

**3.2 — Pull-based.** Edge chỉ kéo video về khi có người ở đó hỏi. Không ai xem thì không tốn gì.

**3.3 — Transcode tính theo STREAM, không theo viewer.** 100 hay 2 triệu viewer, hoá đơn transcode y hệt. Với stream nhỏ nó gần như là toàn bộ hoá đơn.
→ *Lý do nhiều nền tảng bắt đủ follower mới cho live, hoặc pass-through không transcode.*

---

# 4. Cache

**4.1 — Livestream là một đống file nhỏ, không phải dòng chảy.** Mỗi segment một URL riêng (`/live/abc/seg-041.ts`). Tên gọi **HLS** — chạy bằng đúng HTTP tải file thường của web.

**4.2 — Cache cần một CÁI TÊN để tra.** Cache = bảng tra `key → value`.

| | gRPC stream | HLS |
|---|---|---|
| Hình dạng | Ống mở, không tên | File rời, **có URL** |
| Cache được? | Không | **Được** |

→ *Ô comment chính là kiểu ống mở như gRPC. Đây là lý do gốc rễ: video dễ, chat sập.*

**4.3 — Cache ở MỌI tầng.** edge → regional tier → origin. **cache hit** = có sẵn trả liền, **cache miss** = phải xin tầng trên. Người đầu tiên gây miss, người thứ 2 → 40.000 đều được trả tại chỗ.

**4.4 — Càng đông càng RẺ.** 2 triệu viewer, segment 6 giây:

```
ở edge:     2.000.000 ÷ 6   ≈  333.000 request/giây
tới origin: 50 PoP ÷ 6      ≈        8 request/giây     → nén 40.000 lần
```

→ *Tải lên origin phụ thuộc **số PoP**, KHÔNG phụ thuộc số viewer. Thêm 1 triệu người, origin vẫn 8 req/giây.*

Không miễn phí hoàn toàn — **bandwidth ở edge vẫn tăng theo viewer**. Transcode và origin đứng yên. Hai trong ba khoản không đổi, chỉ khoản rẻ nhất là tăng.

**4.5 — Thundering herd & request collapsing.** Segment vừa đẻ ra thì chưa edge nào có, mà 40.000 người đang chờ đúng nó → nếu edge cứ thiếu là đi xin thì bắn 40.000 request lên origin cùng lúc.
→ *Chữa bằng **request collapsing**: edge thấy 40.000 request cùng một URL → gửi đúng 1 lên trên, 39.999 cái xếp hàng chờ chung.*

**4.6 — Live LÀ thundering herd, cứ 6 giây một lần.** Netflix thoát được vì mỗi viewer ở một phút khác nhau, request rải đều hàng nghìn segment. Live thì tất cả ở cùng một khoảnh khắc — đó là định nghĩa của live. Netflix còn bơm sẵn file xuống edge trước ngày phát hành; live thì file chưa tồn tại cho tới đúng giây nó được cần.

---

# 5. Latency

**5.1 — Latency bắt đầu trước khi video rời camera.** Muốn gửi file thì file phải tồn tại đã. `seg-100` chứa giây 600→606, nên phải quay xong đủ 6 giây mới đóng gói được. Lúc file vừa xong, nội dung bên trong **đã cũ 6 giây**.

**5.2 — Cộng dồn ra ~26 giây.**

```
quay đủ 1 segment               6,0
ingest + transcode + CDN        2,5
buffer trong player (3 segment) 18,0   ← khoản to nhất, nằm trong máy mình
                               ─────
                               ~26 giây
```

→ *Bỏ transcode (pass-through) cắt được 1,5 giây, nhưng mất ABR — internet yếu không có rendition nhẹ để tụt xuống.*

**5.3 — Buffer là kho video dự trữ. Latency là CỐ Ý.**

```
không buffer:  internet khựng 2 giây → FREEZE ngay
có buffer:     internet khựng 2 giây → còn 18 giây trong kho, không hay biết
```

Ẩn dụ **bồn nước trên mái**: bồn to thì cúp nước vẫn có xài, đổi lại nước trong bồn là nước cũ. Buffer to = mượt nhưng trễ. Buffer nhỏ = nhanh nhưng dễ giật.

**5.4 — Hai chỗ internet yếu, khác nhau hoàn toàn.**

| | Internet **viewer** yếu | Internet **streamer** yếu |
|---|---|---|
| Ai bị ảnh hưởng | Chỉ mình người đó | **Tất cả viewer** |
| Cứu bằng | Buffer + ABR | Ingest đặt gần |

**5.5 — LL-HLS: cắt chunk 0,2 giây → tụt xuống ~3 giây.** Không chờ đủ segment, quay được 0,2 giây là gửi ngay. Player cũng chỉ giữ ~1 giây buffer thay vì 18.

**5.6 — Ba cái giá của LL-HLS.**
- **Request tăng 30 lần** — `2.000.000 ÷ 0,2 = 10 triệu req/giây` thay vì 333.000. Cùng số byte, gấp 30 lần số lần hỏi. Kéo theo **thundering herd dày hơn 30 lần**.
- **Buffer mỏng thì dễ giật** — khựng 5 giây là freeze ngay.
- **Cả hệ thống phải hỗ trợ** — player, CDN, origin, thiếu một mắt xích là không chạy.

→ *Chọn LL-HLS khi có tương tác (bán hàng, đấu giá, đọc comment). Chọn HLS khi xem một chiều.*

**5.7 — Chunk vẫn cache được, chỗ khôn nhất.** Mỗi chunk vẫn có URL riêng (`seg-041.part-1.mp4`) → vẫn có tên để tra → cả cây CDN chạy y như cũ. Người ta **cố tình không phát minh giao thức mới**.

**5.8 — WebRTC: dưới 1 giây nhưng bỏ luôn mô hình file.**

| | HLS | LL-HLS | WebRTC |
|---|---|---|---|
| Có URL / cache được? | Có | Có | **Không** |
| Latency | 20–30s | 2–3s | dưới 1s |
| Chi phí mỗi viewer | Rẻ nhất | Rẻ | **Đắt nhất** |

```
Bạn chỉ NGỒI XEM                     →  HLS / LL-HLS
Bạn phải PHẢN ỨNG lại cái đang thấy  →  WebRTC
```

Dùng cho: video call, cloud gaming, casino live dealer, đấu giá, điều khiển drone.

> **Quy luật:** muốn latency thấp thì trả bằng tiền, bằng độ mượt, hoặc cả hai.

---

# 6. Comment

**6.1 — Video là one-to-many, comment là many-to-many.** Video chỉ có một người tạo data và ai cũng nhận thứ giống hệt. Comment thì **mỗi viewer vừa là nguồn vừa là đích**.

**6.2 — Vấn đề không phải người ta gõ nhiều, mà là FAN-OUT RATIO.**

```
nhắn 1 người bạn        →  gõ 1 câu  →  gửi đi          1 bản
nhắn group 5 người      →  gõ 1 câu  →  gửi đi          5 bản
comment live 2 triệu    →  gõ 1 câu  →  gửi đi  2.000.000 bản
```

Nhân lên: `1.000 người gõ/giây × 2.000.000 = 2 tỷ delivery/giây`. Không thể.

> **Từ vựng:** 2 tỷ là số **delivery** (mỗi bản copy tới một máy), không phải số comment — comment chỉ có 1.000/giây. Cũng không phải **request**: request là client hỏi server, đây là server đẩy xuống client.

Ngược lại, **giữ 2 triệu persistent connection KHÔNG phải phần khó** — một server tune tốt giữ được vài trăm nghìn connection. Cái chết là số delivery, không phải số connection.

**6.3 — Sampling: bỏ bớt requirement thay vì tìm máy mạnh hơn.**

```
Trước:  1.000 comment × 2.000.000 viewer  =  2.000.000.000 delivery/giây
Sau:       20 comment × 2.000.000 viewer  =     40.000.000 delivery/giây
```

Giảm 50 lần. Và bỏ 980 comment kia **không mất gì** — mắt người không đọc nổi hơn ~20 comment/giây.
→ *Bài học lớn nhất: requirement bất khả thi thì quay lại hỏi "cái này có thật sự cần không?", đừng đi tìm máy mạnh hơn.*

**6.4 — Hệ quả: mỗi viewer thấy một ô chat khác nhau.** 20 cái sample cho bạn khác 20 cái sample cho người bên cạnh. Ẩn dụ **sân vận động 2 triệu người cùng hét** — bạn hét một câu, chỉ vài người quanh bạn nghe.

**6.5 — Local echo: vì sao comment của mình luôn hiện.** Xác suất được sample chỉ ~2%, nhưng lần nào cũng thấy, vì có hai nhánh độc lập:

```
bấm gửi ├──→ client TỰ RENDER lên màn hình ngay   (không hỏi server)
        └──→ gửi lên server → vào pool chung → may thì được sample
```

Trong frontend gọi là **optimistic update** — cùng pattern với nút like đổi màu ngay lúc bấm.

> **Comment của bạn hiện lên không chứng minh được gì hết.** Không chứng minh server nhận, không chứng minh viewer khác thấy, không chứng minh streamer đọc. Chỉ chứng minh client của bạn đã tự render nó ra.

**6.6 — Batching: giảm số LẦN gửi, không giảm số comment.** Gom 20 comment trong 1 giây thành **một batch**, gửi một lần.

```
Trước:  20 comment × 2.000.000 viewer  =  40.000.000 lần gửi/giây
Sau:     1 batch   × 2.000.000 viewer  =   2.000.000 lần gửi/giây
```

Số byte gần như không đổi, nhưng số *lần gửi* giảm 20 lần. Mỗi lần gửi có overhead riêng (packet, syscall) — với tin bé xíu thì overhead mới là thứ tốn.
Ẩn dụ: 20 đơn hàng cùng một địa chỉ, giao 1 chuyến thay vì 20 chuyến.

**6.7 — Fan-out on read: biến comment thành thứ cache được.** Batch là file có nội dung cố định → có URL (`/live/abc/comments/batch-0847.json`) → cache được → cả cây CDN phát được.

```
Fan-out on WRITE:  server đẩy riêng cho từng viewer   →  2.000.000 lần gửi/giây
Fan-out on READ:   viewer tự pull, CDN cache          →       ~50 request/giây
```

→ *Chat từ chỗ đắt nhất hệ thống tụt xuống rẻ ngang video.*

**Nhưng sampling và cache chửi nhau:** sampling muốn mỗi viewer nhận thứ khác nhau, cache chỉ chạy khi mọi người nhận giống hệt nhau. Hệ thống **hy sinh sampling cá nhân hoá** — một batch chung duy nhất cho tất cả.

> Ẩn dụ **tờ báo**: mỗi giây in **một tờ** chứa 20 comment mới nhất, photo ra 2 triệu bản phát cho tất cả. Không ai có tờ riêng. In 1 tờ photo 2 triệu bản thì rẻ; viết 2 triệu tờ khác nhau thì không làm nổi.

→ *Đính chính 6.4: hai viewer cùng khu vực thật ra thấy **gần như giống nhau**. Khác nhau chỉ ở local echo, lệch region, và kênh riêng (6.8).*

**6.8 — Hai kênh: tờ báo chung và thư riêng.** Vài thứ bắt buộc chỉ tới một người (streamer reply đích danh, xác nhận trừ xu khi tặng quà, mod cấm chat).

| | Kênh chung (tờ báo) | Kênh riêng (thư) |
|---|---|---|
| Chạy bằng gì | File có URL qua CDN — **giống hệt video** | WebSocket giữ mở tới từng người |
| Lượng | To: 20 comment/giây | Nhỏ: vài tin/phút |
| Cache được? | Được | Không |

Phân loại chỉ bằng một câu hỏi: **thứ này ai cần thấy?** Cả phòng → báo chung. Một mình bạn → thư riêng.

> **Nguyên tắc:** đường nào **TO** thì làm cho nó copy được. Đường nào **không copy được** thì làm cho nó **NHỎ**.
>
> **Nguyên tắc lớn hơn:** một tính năng người dùng thấy là "một", bên dưới có thể là nhiều hệ thống tách rời — **tách theo đặc tính của data, không tách theo giao diện**. (Phần 8 là nguyên tắc này lần nữa, tách giữa comment và tiền.)

**6.9 — Sơ đồ tổng, ba lane.** Video và comment chung **không dùng chung server, nhưng DÙNG CHUNG CDN**.

```
LANE 1 — VIDEO
  streamer ──► INGEST ──► TRANSCODE ──► ORIGIN video ──┐
                                                        │
LANE 2 — COMMENT CHUNG (tờ báo)                         │
  viewer gõ ──► CHAT SERVICE ──► gom batch ──► ORIGIN comment ──┐
                (lọc, chọn 20)   mỗi giây 1 file                │
                                                        ▼       ▼
                                        ┌───────────────────────────────┐
                                        │   CDN — DÙNG CHUNG            │
                                        │   regional tier → edge        │
                                        └───────────────┬───────────────┘
                                                        │  viewer PULL về
                                                        ▼
                                                    ┌────────┐
                                                    │ VIEWER │
                                                    └────────┘
                                                        ▲
LANE 3 — COMMENT RIÊNG (thư)                            │
  reply, xác nhận quà, mod ──► GATEWAY WebSocket ───────┘
                                    KHÔNG qua CDN
```

- Lane 1 + 2 đổ vào **cùng một cây CDN**. Với cây đó, `seg-041.ts` và `batch-0847.json` chỉ là hai file có URL.
- Lane 3 **đi vòng qua CDN**, cắm thẳng vào viewer.
- **CHAT SERVICE** là thứ video không có — nơi sampling và batching xảy ra.

> **Đáng nhớ:** cây CDN là **hạ tầng dùng chung, không phải "đồ của video"**. Bất cứ thứ gì nhét được vào file có URL thì đều nhờ nó phát giùm được. Fan-out on read đắt giá vì nó biến comment thành dạng cache được, chỉ để **dùng ké cái cây đã có sẵn**.

---

## Chưa học

- [ ] **7** — Đếm xấp xỉ, con số viewer là số ước lượng (HyperLogLog)
- [ ] **8** — Hot path vs money path: comment được mất, tiền thì không
- [ ] **9** — Graceful degradation: thang giảm cấp khi overload
