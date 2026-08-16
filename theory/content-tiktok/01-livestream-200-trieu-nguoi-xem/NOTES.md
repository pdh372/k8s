# Sổ học — livestream scale

## 15/08/2026 — Buổi 1: Video đi từ 1 điện thoại tới 2 triệu người kiểu gì

**Đề bài:** một người quay, hai triệu người xem.

**Cách nghĩ ngây thơ:** server nhận 1 bản rồi gửi ra 2 triệu bản → quá tải.

### Từ vựng

| Từ | Nghĩa |
|---|---|
| **Ingest** | Cửa vào. Server nhận luồng từ người phát. Đặt gần người phát nhất có thể, vì đường upload từ điện thoại là chặng yếu nhất hệ thống. |
| **Transcode** | Cắt 1 luồng thành nhiều mức chất lượng (1080p → 240p). |
| **Origin** | Bản gốc. Nơi CDN lên lấy. |
| **CDN** | *Content Delivery Network*. Mạng lưới server rải khắp thế giới, giữ bản sao để người dùng lấy ở chỗ gần nhất. |
| **Edge server** | Một server trong CDN, nằm ngoài rìa, gần người xem nhất. |
| **Fan-out tree** | Cây toả ra. Cách CDN nhân bản video qua nhiều tầng. |
| **Mbps** | Megabit mỗi giây. Video 720p ≈ 2 Mbps ≈ 250 KB/giây ≈ 900 MB mỗi tiếng xem. |

### Ý chính 1 — Chèn lớp ở giữa, rồi lặp lại chiêu đó

Đường đi đầy đủ:

```
điện thoại  →  INGEST  →  transcode  →  ORIGIN  →  CDN  →  người xem
```

**Ba chỗ này đặt theo ba tiêu chí KHÁC nhau** (chỗ hay nhầm):

| | Đặt ở đâu | Chọn theo |
|---|---|---|
| **Ingest** | Gần **người phát** | Đường upload càng ngắn càng ít rớt |
| **Origin** | Một chỗ trung tâm, thường trong một cloud region | Ổn định, để CDN lên lấy |
| **Edge** | Gần **người xem** | Đường download càng ngắn càng nhanh |

```
người phát Sài Gòn → INGEST Sài Gòn → ORIGIN Singapore → EDGE Tokyo/Frankfurt/São Paulo → người xem
```

**Origin không gần ai hết.** Nó chỉ cần ổn định để cả cây CDN biết đường lên lấy.
(Hệ thống nhỏ hay gộp ingest + origin làm một máy — không sai, nhưng mổ xẻ latency thì phải tách.)

Riêng khúc CDN thì lại là nhiều tầng:

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

## 15/08/2026 — Buổi 2: Stream nhỏ thì sao?

**Câu hỏi:** stream chỉ 100 view nhưng rải 50 quốc gia.

### Ý chính 4 — Cây CDN chỉ đáng tiền khi đông người đứng hứng

| | 2 triệu người, tập trung | 100 người, rải 50 nước |
|---|---|---|
| Số edge phải kéo video về | ~50 | ~50 |
| Mỗi edge phục vụ | 40.000 người | **2 người** |
| Origin bị hỏi | 50 lần | **50 lần** |

**Cùng tải lên origin, nhưng một bên phục vụ 2 triệu, bên kia 100.**
→ chi phí trên mỗi người xem chênh **20.000 lần**.

**Cách xử lý:** stream ít người thì không đẩy xuống edge thành phố, mà gom lên phục vụ từ **tầng vùng**. Trễ thêm vài chục ms, nhưng thay vì 3 nhánh cây thì chỉ tốn 1.
(Quán photo: thay vì mỗi hẻm một quán thì cả quận một quán.)

### Ý chính 5 — Pull-based: edge chỉ kéo khi có người hỏi

```
Không ai ở Brazil mở stream  →  edge Brazil không kéo gì, không tốn gì
Có 1 người mở                →  lúc đó edge mới lên origin lấy về
```

Không đẩy sẵn đi khắp nơi. Nên không có chuyện "phí edge" — cái phí là edge kéo **cả luồng** về chỉ để phục vụ 1 người.

### Ý chính 6 — Transcode: chi phí stream nhỏ không trốn được

Người phát đẩy lên 1 luồng. Người xem internet mỗi người một kiểu → phải giải mã rồi **mã hoá lại** thành nhiều bản:

```
1 luồng vào  →  [ TRANSCODE ]  →  1080p / 720p / 480p / 360p / 240p
```

| | Transcode | Bandwidth |
|---|---|---|
| Tính theo | **Mỗi luồng phát** | Mỗi người xem |
| 100 người xem | Tốn y hệt | Gần như bằng 0 |
| 2 triệu người xem | **Tốn y hệt** | Rất nhiều |

→ Với stream nhỏ, **transcode gần như là toàn bộ hoá đơn**.
→ Lý do nhiều nền tảng bắt đủ follower mới cho live, hoặc stream nhỏ thì cho xem thẳng bản gốc không transcode (internet yếu thì chịu giật).

---

## 15/08/2026 — Buổi 3: Segment caching

### Ý chính 7 — Livestream không phải dòng chảy, nó là một đống file nhỏ

Video bị cắt thành **segment** 2–6 giây, mỗi segment là **một file có URL riêng**:

```
/live/abc/seg-041.ts
/live/abc/seg-042.ts
/live/abc/seg-043.ts
```

Máy mình tải lần lượt từng file, phát nối lại → mắt thấy liền mạch.
Tên gọi: **HLS** (*HTTP Live Streaming*). Chạy bằng đúng HTTP tải file thường của web.

### Ý chính 8 — Cache cần một CÁI TÊN để tra

Cache = bảng tra `key → value`. Không có key thì không cache được.

| | gRPC stream | HLS |
|---|---|---|
| Hình dạng | Ống mở, giữ liên tục | Từng file rời |
| Có tên để tra? | Không | **Có — URL** |
| Máy ở giữa cache được? | Không | **Được** |

Cùng một URL = cùng một mớ bytes cho mọi người → máy nào nằm giữa đường cũng giữ lại được một bản.

> **Ghi nhớ:** ô comment trong livestream chính là kiểu **ống mở như gRPC** — mỗi người một nội dung, không có tên để tra, không cache được.
> Đây là lý do gốc rễ: video thì dễ, chat thì sập.

### Ý chính 9 — Cache ở MỌI tầng, không chỉ edge

```
người xem  →  EDGE       có sẵn? → trả luôn
                 ↓ không có
              tầng vùng   có sẵn? → trả luôn
                 ↓ không có
              ORIGIN      lúc này mới phải hỏi bản gốc
```

- **cache hit** — có sẵn, trả liền
- **cache miss** — chưa có, phải đi xin tầng trên

Người đầu tiên trong khu vực gây cache miss, nhưng edge giữ lại một bản. Người thứ 2 → thứ 1.000 đều được trả ngay tại chỗ. **Origin không hề biết những người đó tồn tại.**

### Ý chính 10 — Càng đông càng RẺ

2 triệu người, segment 6 giây:

| | Số request |
|---|---|
| Ở rìa (người xem hỏi edge) | 2.000.000 ÷ 6 ≈ **333.000 / giây** |
| Tới origin (50 điểm CDN, mỗi điểm xin 1 lần) | 50 ÷ 6 ≈ **8 / giây** |

**Nén 40.000 lần.** Origin chỉ cần một con VPS rẻ tiền.

> **Chốt:** tải lên origin phụ thuộc **số điểm CDN**, KHÔNG phụ thuộc số người xem.
> Thêm 1 triệu người nữa, origin vẫn 8 request/giây.

| | Web app thường | Livestream |
|---|---|---|
| Gấp đôi người dùng | Server gánh gấp đôi | **Origin không đổi** |
| Vì sao | Mỗi người hỏi một thứ khác | Ai cũng xin **đúng một file giống nhau** |

(Feed TikTok = vế trái — mỗi người lướt video khác nhau, cache trượt liên tục.)

**Nói cho chuẩn — không miễn phí hoàn toàn:**

| Khoản | Tăng theo người xem? |
|---|---|
| Transcode | Không — tính theo luồng |
| Tải lên origin | **Không** |
| Bandwidth edge | Có |

→ Chi phí **trên mỗi người xem** giảm dần khi càng đông, chứ không phải bằng 0. Hai trong ba khoản đứng yên, chỉ khoản rẻ nhất là tăng.

### Ý chính 11 — Request collapsing & thundering herd

Lúc segment mới **vừa đẻ ra** thì chưa edge nào có nó. Mà 40.000 người trong khu vực đang chờ đúng nó.

Edge làm kiểu ngây thơ (thiếu thì đi xin) → bắn 40.000 request lên origin cùng lúc. Nhân 50 điểm CDN = 2 triệu request đập vào origin trong một giây → **origin chết, cache thành vô dụng**.

Hiện tượng: **thundering herd** (đàn trâu giẫm đạp).

**Cách chữa — request collapsing** (còn gọi *request coalescing*):

```
1.  edge nhận ra 40.000 request hỏi CÙNG một URL
2.  gửi ĐÚNG 1 request lên tầng trên
3.  bắt 39.999 cái còn lại xếp hàng chờ chung
4.  có kết quả → trả cho cả 40.000 người một lượt
```

### Ý chính 12 — Vì sao live cần cái này hơn mọi thứ khác

| | Netflix (VOD) | Live |
|---|---|---|
| Người xem đang ở đâu | Mỗi người một phút khác nhau | **Tất cả cùng một khoảnh khắc** |
| Request phân bố | Rải đều hàng nghìn segment | **Dồn hết vào 1 segment** |
| File có trước khi ai hỏi? | Có — quay xong từ lâu | **Không — vừa mới đẻ** |
| Bơm sẵn xuống edge được? | Được, trước ngày phát hành | **Không thể** |

> **Live không phải "thỉnh thoảng dính thundering herd".**
> **Live LÀ thundering herd, cứ 6 giây một lần, suốt buổi.**

---

## 15/08/2026 — Buổi 4: Latency

### Ý chính 13 — Latency bắt đầu từ trước khi video rời khỏi camera

Muốn gửi một file thì file đó phải tồn tại đã. Mà `seg-100` chứa giây 600→606, nên camera phải **quay xong đủ 6 giây** mới đóng gói được.

```
camera quay 600 → 601 → ... → 606
                               ↑ tới đây file mới xong, giờ mới gửi đi được
```

→ Ngay lúc file vừa xong, nội dung bên trong **đã cũ 6 giây**. Chưa tính network gì cả.

### Ý chính 14 — Cộng dồn ra ~26 giây

```
quay đủ 1 segment              6,0 giây
đẩy lên ingest                 0,3
transcode (giải mã + mã lại)   1,5
chạy qua cây CDN               0,7
                              ─────
                               8,5 giây
buffer trong player (3 segment) 18,0
                              ─────
                              ~26 giây
```

**Phần lớn latency nằm ngay trong máy mình, không phải ở network.**

> **Nối với buổi 2:** bỏ transcode (pass-through) thì cắt luôn 1,5 giây đó → 8,5 còn 7,0 giây.
>
> | | Có transcode | Pass-through |
> |---|---|---|
> | Số bản chất lượng | 5 (1080p → 240p) | **1 bản duy nhất** |
> | Người internet yếu | Tự tụt xuống 240p | **Không có gì để tụt → giật, đứng hình** |
> | Latency | +1,5 giây | Nhanh hơn |
> | Chi phí | Tốn theo luồng | Gần như 0 |
>
> → Pass-through **không chỉ để tiết kiệm tiền, nó còn là một cách giảm latency.** Đổi lại là mất ABR.

Player **không phát ngay** khi nhận được segment — nó gom 2–3 cái rồi mới bắt đầu:

```
nhận seg-100  →  giữ lại, chưa phát
nhận seg-101  →  giữ lại, chưa phát
nhận seg-102  →  giờ mới phát seg-100
```

### Ý chính 15 — Vì sao player cố tình chờ: buffer là kho dự trữ

Đường internet không đều, thỉnh thoảng khựng một hai giây.

```
Không buffer:  internet khựng 2 giây  →  ĐỨNG HÌNH ngay
Có buffer:     internet khựng 2 giây  →  vẫn còn 18 giây trong kho, bạn không hay biết
                                  →  internet hồi lại, kho nạp đầy tiếp
```

Ẩn dụ: **bồn nước trên mái nhà.** Nước máy lúc mạnh lúc yếu, có khi cúp, nhưng có bồn thì vòi luôn chảy đều. Bồn càng to càng yên tâm — đổi lại nước trong bồn là nước cũ.

**Đánh đổi cốt lõi:**

| Buffer | Latency | Độ mượt |
|---|---|---|
| To (3 segment = 18s) | Trễ nhiều | Mượt, chịu được internet phập phù |
| Nhỏ (1 chunk = 0,5s) | Trễ ít | Dễ giật khi internet xấu |

Không có lựa chọn "vừa nhanh vừa mượt". Chỉ có chọn nghiêng về bên nào.

> **Latency đó là CỐ Ý, không phải internet mình yếu.**

### Ý chính 16 — Hai chỗ internet yếu, khác nhau hoàn toàn

Buffer trong player chỉ che được cho **người xem**. Internet người phát yếu là chuyện khác hẳn.

```
người phát → [ upload ] → INGEST → ... → EDGE → [ download ] → người xem
                  ↑                                     ↑
            rớt ở đây =                            rớt ở đây =
            cả 2 triệu người chết                  mình bạn chết
```

| | Internet **người xem** yếu | Internet **người phát** yếu |
|---|---|---|
| Ai bị ảnh hưởng | Chỉ mình người đó | **Tất cả người xem** |
| Cứu bằng gì | Buffer trong player + ABR tụt chất lượng | Ingest đặt gần, app người phát cũng có buffer khi upload |
| Nếu tệ quá | Xem 240p hoặc giật | **Cả buổi live đứng hình, không ai cứu nổi** |

### Ý chính 17 — Vì sao đoạn upload là chỗ nguy hiểm nhất

**Phía dưới có nhiều đường, phía trên chỉ có một:**

```
người phát ──(chỉ 1 đường)──> INGEST ──> ORIGIN ──> EDGE ─┬──> người xem
                                                          ├──> người xem
                                                          └──> người xem
   ↑                                                   ↑
   không có đường nào khác                      edge Tokyo chết thì
                                                chuyển sang edge Seoul
```

Từ CDN xuống người xem có **rất nhiều đường**. Một edge chết thì người xem được đẩy sang edge khác, họ còn không biết là vừa có sự cố.

Nhưng từ điện thoại người phát lên ingest chỉ có **đúng một đường** — cái 4G hoặc wifi của họ. Không có đường thứ hai.

Và quan trọng nhất: **lúc đó video chưa tồn tại ở bất kỳ đâu khác trên đời.** Nó mới chỉ nằm trong cái điện thoại kia. Rớt là mất luôn, không lấy lại được từ đâu cả.

→ Đường đó rớt = cả 2 triệu người ngồi nhìn màn hình đứng.

Tên gọi kiểu chỗ này: **single point of failure** — một điểm mà hỏng nó là hỏng cả hệ thống.

**Vì sao đặt ingest gần người phát thì đỡ:**

Đường càng dài thì đi qua càng nhiều thiết bị trung gian, mỗi cái là một chỗ có thể hỏng.

```
ingest ở Sài Gòn  →  đi ~10 km
ingest ở Mỹ       →  đi ~15.000 km, qua cáp quang biển
```

Đặt ingest gần người phát = **rút ngắn đúng cái đoạn duy nhất không có dự phòng**. Từ ingest trở đi thì đi xa bao nhiêu cũng được, vì chỗ đó đã có nhiều đường thay thế.

### Ý chính 18 — Phá đánh đổi: từ 26 giây xuống 3 giây bằng chunk

Hai chỗ ăn thời gian nhiều nhất đều có chung một nguyên nhân: **mọi thứ tính theo đơn vị "một segment 6 giây"**.

```
chờ quay đủ 1 segment      6 giây
buffer trong player       18 giây
```

Vậy làm cho đơn vị đó nhỏ lại. Segment 6 giây được cắt tiếp thành **chunk**, mỗi chunk ~0,2 giây. Và **gửi chunk đi ngay khi vừa quay xong nó**, không chờ đủ segment.

```
Cách cũ:
  quay giây 0 → 6  →  đóng gói cả cục  →  gửi
  (phải chờ đủ 6 giây mới có gì để gửi)

Cách mới:
  quay 0,2 giây  →  gửi ngay
  quay 0,2 giây  →  gửi ngay
  ...
```

Player cũng không cần giữ 3 segment nữa, chỉ giữ vài chunk (~1 giây).

```
chờ 1 chunk          0,2 giây
đẩy lên ingest       0,3
transcode            1,0
chạy qua cây CDN     0,5
buffer trong player  1,0
                    ─────
                    ~3 giây
```

Tên gọi: **LL-HLS** (*Low-Latency HLS*). Cách cũ tên là **HLS**.

### Ý chính 19 — Ba cái giá của LL-HLS

**Giá 1 — Số request tăng 30 lần.**

```
HLS:     2.000.000 ÷ 6      ≈    333.000 request/giây
LL-HLS:  2.000.000 ÷ 0,2    ≈ 10.000.000 request/giây
```

Vẫn từng đó bytes video, nhưng bị chẻ thành gấp 30 lần số lần hỏi. CDN tính tiền và chịu tải theo **cả số byte lẫn số request**.

**Giá 2 — Buffer mỏng thì dễ giật.** Đánh đổi không biến mất, chỉ bị đẩy sang phía khác.

```
HLS:     buffer 18 giây  →  internet khựng 5 giây, bạn không hay biết
LL-HLS:  buffer  1 giây  →  internet khựng 5 giây, ĐỨNG HÌNH
```

Bồn nước nhỏ lại thì nước mới hơn, nhưng cúp nước một cái là hết ngay.

**Giá 3 — Phải cả hệ thống cùng hỗ trợ.** Player, CDN, origin — thiếu một mắt xích là không chạy.

**Chọn cái nào:**

| Tình huống | Chọn | Vì |
|---|---|---|
| Bán hàng, đấu giá, gaming, chủ live đọc comment | **LL-HLS** | Trễ 26 giây là hỏng trải nghiệm |
| Concert, xem một chiều, không tương tác | **HLS** | Rẻ hơn, mượt hơn, trễ chút không sao |

### Ý chính 20 — Chunk vẫn cache được, và vì sao đó là chỗ khôn nhất

Mỗi chunk **vẫn có URL riêng**:

```
/live/abc/seg-041.part-1.mp4
/live/abc/seg-041.part-2.mp4
```

Có URL nghĩa là có cái tên để tra — đúng điều kiện ở **ý chính 8**. Nên toàn bộ cây CDN vẫn hoạt động y như cũ, không phải sửa gì.

→ Người ta **cố tình không phát minh giao thức mới**. Chỉ cắt file nhỏ hơn, để cả thế giới CDN đang có sẵn vẫn dùng được.

### Ý chính 21 — WebRTC: nhanh hơn nữa nhưng bỏ luôn mô hình file

WebRTC cho latency dưới 1 giây, nhưng quay lại kiểu **ống mở** — không file, không URL, không cache được. Đúng tình huống gRPC ở ý chính 8.

Không cache được nghĩa là mỗi người xem phải được phục vụ riêng, cần mạng server chuyên dụng chứ không xài CDN thường.

| | HLS | LL-HLS | WebRTC |
|---|---|---|---|
| Đơn vị gửi | segment 6s | chunk 0,2s | dòng liên tục |
| Có URL? | Có | Có | **Không** |
| Cache được? | Được | Được | **Không** |
| Latency | 20–30 giây | 2–3 giây | dưới 1 giây |
| Chi phí mỗi người xem | Rẻ nhất | Rẻ | **Đắt nhất** |
| Lên được hàng triệu người? | Được | Được | Rất khó |

**WebRTC dùng cho dự án gì:**

| Loại | Ví dụ |
|---|---|
| Gọi video / họp online | Google Meet, Discord. Đây là mục đích gốc. |
| Cloud gaming | GeForce Now, Xbox Cloud. Bấm nút xong màn hình phải đổi ngay. |
| Casino live dealer | Bạn đặt cược, người chia bài chia. Trễ 5 giây là gian lận được. |
| Đấu giá trực tuyến | Trả giá theo thời gian thực. |
| Camera an ninh, drone | Vừa nhìn vừa bẻ lái. |

Quy luật phân biệt:

```
Bạn chỉ NGỒI XEM                      →  HLS / LL-HLS
Bạn phải PHẢN ỨNG lại cái đang thấy   →  WebRTC
```

Livestream một chiều, video call hai chiều. Dùng WebRTC cho livestream 2 triệu người là **xài sai mục đích thiết kế** — chạy được nhưng tốn kinh khủng.

> **Quy luật xuyên suốt phần này:** muốn latency thấp thì phải trả bằng tiền, bằng độ mượt, hoặc cả hai. Không có bữa trưa miễn phí.

---

## Còn nợ, buổi sau học tiếp

- [ ] **Comment fan-out** — chỗ thật sự chết. 2 tỷ tin nhắn/giây, sampling, local echo
- [ ] Đếm xấp xỉ — con số người xem là số ước lượng (HyperLogLog)
- [ ] Hot path vs money path — comment được mất, tiền thì không
- [ ] Thang giảm cấp khi quá tải
- [ ] Latency: vì sao chủ live đọc comment trễ 5 giây (buffer trade-off)
- [ ] **Comment fan-out** — chỗ thật sự chết, sampling + local echo
- [ ] Đếm xấp xỉ — con số người xem là số ước lượng
- [ ] Hot path vs money path — comment được mất, tiền thì không
- [ ] Thang giảm cấp khi quá tải
