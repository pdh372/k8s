# Livestream scale — làm sao gánh được hàng triệu viewer cùng lúc

> Toàn bộ lý thuyết, một mạch từ đầu tới cuối. Ví dụ chạy suốt bài: **2 triệu viewer cùng lúc**.
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

Trực giác ai cũng có là *"2 triệu viewer thì video nặng lắm"*. Sai. Video là phần dễ nhất. Cả tài liệu này đi chứng minh điều đó, rồi chỉ ra chỗ thật sự khó.

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

Điện thoại **chỉ đẩy lên đúng một nơi**. Từ đó mới toả ra nhiều server.

Đường đi đầy đủ có bốn chặng, không phải hai:

```
điện thoại  →  INGEST  →  transcode  →  ORIGIN  →  CDN  →  viewer
               (nhận)     (cắt 5 bản)  (bản gốc)
```

| | Việc của nó |
|---|---|
| **Ingest** | Nhận luồng từ streamer. Chỉ hứng thôi. |
| **Transcode** | Cắt 1 luồng thành nhiều rendition |
| **Origin** | Giữ bản chuẩn để CDN lên lấy |

**CDN** = *Content Delivery Network*, mạng phân phối nội dung. Một mạng lưới server rải khắp thế giới, giữ sẵn bản sao để người dùng lấy ở chỗ gần nhất.

**Edge server** = một server trong CDN, nằm ngoài rìa, gần viewer nhất. Bạn ở TP.HCM thì video lấy từ edge ở TP.HCM hoặc Singapore, không bay từ Mỹ về.

> **Ẩn dụ:** cả xóm cần một quyển sách. Không ai chạy lên nhà xuất bản. Quán photo đầu hẻm lấy về **một** bản rồi photo cho cả xóm.
> Nhà xuất bản = origin. Quán photo = edge. Hệ thống quán photo khắp nơi = CDN.

### Ba chỗ này đặt theo ba tiêu chí khác nhau

Đây là chỗ rất hay nhầm — nhiều người tưởng origin nằm gần streamer.

| | Đặt ở đâu | Chọn theo |
|---|---|---|
| **Ingest** | Gần **streamer** | Đường upload càng ngắn càng ít rớt |
| **Origin** | Một chỗ trung tâm, thường trong một cloud region | Ổn định, để CDN lên lấy |
| **Edge** | Gần **viewer** | Đường download càng ngắn càng nhanh |

```
streamer Sài Gòn
      ↓
INGEST Sài Gòn                          ← gần streamer
      ↓
ORIGIN Singapore                        ← chỗ trung tâm, không gần ai cả
      ↓
EDGE Tokyo / Frankfurt / São Paulo      ← gần từng viewer
      ↓
viewer khắp thế giới
```

**Origin không gần ai hết**, và điều đó không sao — vì nó **không nằm trên đường đi của viewer**. Viewer lấy video từ edge; origin chỉ bị hỏi khi cache miss, khoảng 8 lần mỗi giây bất kể có 2 triệu hay 10 triệu viewer (xem mục 4.4).

Nói thêm cho công bằng: hệ thống nhỏ hay gộp luôn ingest và origin làm một máy. Không sai — nhưng khi mổ xẻ latency thì phải tách ra, vì mỗi chặng ăn một khúc thời gian riêng.

## 2.2 Đoạn upload là single point of failure

Nhìn lại sơ đồ trên và đếm số đường ở mỗi chặng:

```
streamer ──(chỉ 1 đường)──> INGEST ──> ORIGIN ──> EDGE ─┬──> viewer
                                                        ├──> viewer
                                                        └──> viewer
   ↑                                                 ↑
   không có đường nào khác                    edge Tokyo chết thì
                                              chuyển sang edge Seoul
```

Từ CDN xuống viewer có **rất nhiều đường**. Một edge chết thì viewer được đẩy sang edge khác, họ còn không biết là vừa có sự cố.

Nhưng từ điện thoại streamer lên ingest chỉ có **đúng một đường** — cái 4G hoặc wifi của họ. Không có đường thứ hai.

Và quan trọng nhất: **lúc đó video chưa tồn tại ở bất kỳ đâu khác trên đời.** Nó mới chỉ nằm trong cái điện thoại kia. Rớt là mất luôn, không lấy lại được từ đâu cả.

→ Đường đó rớt = cả 2 triệu người ngồi nhìn màn hình đứng.

Tên gọi kiểu chỗ này: **single point of failure** — một điểm mà hỏng nó là hỏng cả hệ thống.

**Vì sao đặt ingest gần streamer thì đỡ:** đường càng dài thì đi qua càng nhiều thiết bị trung gian, mỗi cái là một chỗ có thể hỏng.

```
ingest ở Sài Gòn  →  đi ~10 km
ingest ở Mỹ       →  đi ~15.000 km, qua cáp quang biển
```

Đặt ingest gần streamer = **rút ngắn đúng cái đoạn duy nhất không có dự phòng**. Từ ingest trở đi thì đi xa bao nhiêu cũng được, vì chỗ đó đã có nhiều đường thay thế.

## 2.3 Lặp lại đúng chiêu đó

Origin cũng gặp y hệt vấn đề: nếu 100.000 edge cùng hỏi nó, nó lại overload. Chèn thêm tầng nữa:

```
ORIGIN
   ↓
REGIONAL TIER      (vài trăm)
   ↓
EDGE               (hàng chục nghìn)
   ↓
viewer             (hàng triệu)
```

**Không ai phải nói chuyện với quá nhiều người cùng lúc.**

Gọi là **fan-out tree** — cây toả ra. Mỗi tầng nhân lên ~10 lần:

```
1 → 10 → 100 → 1.000 → 10.000 → ...
```

9 tầng là ra một tỷ. **Cây cao lên rất chậm, nhưng phủ rộng ra rất nhanh.**

Đây là lý do video không phải phần khó.

## 2.4 Không tự dựng — đi thuê

Không ai tự đặt 100.000 server khắp thế giới. Cái cây đã có sẵn: Cloudflare, Akamai, Fastly, AWS CloudFront, Google Cloud CDN.

Việc của mình: đẩy **một luồng** vào endpoint của họ. Hết.

## 2.5 "CPU quá 80% thì thêm server" — vô dụng với livestream

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

Trường hợp trớ trêu: stream chỉ 100 viewer nhưng rải khắp 50 quốc gia.

| | 2 triệu người, tập trung | 100 người, rải 50 nước |
|---|---|---|
| Số edge phải kéo video về | ~50 | ~50 |
| Mỗi edge phục vụ | 40.000 người | **2 người** |
| Origin bị hỏi | 50 lần | **50 lần** |

**Cùng một mức tải lên origin, nhưng một bên phục vụ 2 triệu người, bên kia 100.** Chi phí trên mỗi viewer chênh **20.000 lần**.

Cây CDN chỉ đáng tiền khi có đông người đứng dưới hứng. Rải mỏng thì mỗi nhánh gánh đúng 2 người.

**Cách xử lý:** stream ít người thì không đẩy xuống edge thành phố, mà gom lên phục vụ từ **regional tier**. 2 người ở Brazil, 3 ở Argentina, 1 ở Chile cùng lấy từ một PoP Nam Mỹ. Trễ thêm vài chục ms, nhưng thay vì 3 nhánh cây thì chỉ tốn 1.

## 3.2 Pull-based — edge chỉ kéo khi có người hỏi

```
Không ai ở Brazil mở stream  →  edge Brazil không kéo gì, không tốn gì
Có 1 người mở                →  lúc đó edge mới lên origin lấy về
```

Không đẩy sẵn đi khắp nơi. Nên không có chuyện "phí edge" — cái phí là edge kéo **cả luồng** về chỉ để phục vụ 1 người.

## 3.3 Transcode — chi phí stream nhỏ không trốn được

Streamer đẩy lên một luồng, ví dụ 1080p. Nhưng viewer internet mỗi người một kiểu. Nên hệ thống phải decode rồi **re-encode** thành nhiều rendition:

```
1 luồng vào  →  [ TRANSCODE ]  →  1080p / 720p / 480p / 360p / 240p
```

Internet khoẻ nhận bản to, internet yếu tự tụt xuống bản nhỏ, không ai freeze. Cơ chế tự đổi này gọi là **ABR** (*adaptive bitrate*).

**Chỗ đau:** transcode tốn CPU/GPU nặng, và tốn **theo luồng phát**, không theo viewer.

| | Transcode | Bandwidth |
|---|---|---|
| Tính theo | **Mỗi luồng phát** | Mỗi viewer |
| 100 viewer | Tốn y hệt | Gần như bằng 0 |
| 2 triệu viewer | **Tốn y hệt** | Rất nhiều |

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
viewer  →  EDGE       có sẵn? → trả luôn
                 ↓ không có
              regional tier   có sẵn? → trả luôn
                 ↓ không có
              ORIGIN      lúc này mới phải hỏi bản gốc
```

- **cache hit** — có sẵn, trả liền
- **cache miss** — chưa có, phải đi xin tầng trên

Người đầu tiên trong khu vực gây cache miss, nhưng edge giữ lại một bản. Người thứ 2 đến thứ 40.000 đều được trả ngay tại chỗ. **Origin không hề biết những người đó tồn tại.**

## 4.4 Con số — nén 40.000 lần

2 triệu viewer, segment 6 giây:

| | Số request |
|---|---|
| Ở rìa (viewer hỏi edge) | 2.000.000 ÷ 6 ≈ **333.000 / giây** |
| Tới origin (50 PoP, mỗi điểm xin 1 lần) | 50 ÷ 6 ≈ **8 / giây** |

Origin — máy giữ bản gốc — chỉ trả lời 8 câu hỏi mỗi giây. Bằng một con VPS rẻ tiền.

> **Chốt:** tải lên origin phụ thuộc **số PoP**, KHÔNG phụ thuộc số viewer.
> Thêm 1 triệu người nữa, origin vẫn 8 request/giây.

| | Web app thường | Livestream |
|---|---|---|
| Gấp đôi người dùng | Server gánh gấp đôi | **Origin không đổi** |
| Vì sao | Mỗi người hỏi một thứ khác | Ai cũng xin **đúng một file giống nhau** |

Feed TikTok là vế trái — mỗi người lướt một video khác nhau, cache trượt liên tục. Livestream là vế phải.

**Nói cho chuẩn, không miễn phí hoàn toàn:**

| Khoản | Tăng theo viewer? |
|---|---|
| Transcode | Không — tính theo luồng |
| Tải lên origin | **Không** |
| Bandwidth edge | Có |

→ Chi phí **trên mỗi viewer** giảm dần khi càng đông, chứ không bằng 0. Hai trong ba khoản đứng yên, chỉ khoản rẻ nhất là tăng.

## 4.5 Thundering herd và request collapsing

Nãy giờ giả định cache **đã có sẵn**. Nhưng có một khoảnh khắc nó chưa có: lúc segment vừa đẻ ra.

`seg-100` vừa sinh, chưa edge nào có. Mà 40.000 người trong khu vực đang chờ đúng nó. Edge làm kiểu ngây thơ (thiếu thì đi xin) → bắn 40.000 request lên origin cùng lúc. Nhân 50 PoP = 2 triệu request trong một giây. **Origin chết, cache thành vô dụng.**

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
| Viewer đang ở đâu | Mỗi người một phút khác nhau | **Tất cả cùng một khoảnh khắc** |
| Request phân bố | Rải đều hàng nghìn segment | **Dồn hết vào 1 segment** |
| File có trước khi ai hỏi? | Có — quay xong từ lâu | **Không — vừa mới đẻ** |
| Bơm sẵn xuống edge được? | Được, trước ngày phát hành | **Không thể** |

> **Live không phải "thỉnh thoảng dính thundering herd".**
> **Live LÀ thundering herd, cứ 6 giây một lần, suốt buổi.**

---

# Phần 5 — Latency

## 5.1 Latency bắt đầu từ trước khi video rời khỏi camera

Muốn gửi một file thì file đó phải tồn tại đã. Mà `seg-100` chứa giây thứ 600 đến 606 của buổi live — nên camera phải **quay xong đủ 6 giây** cái đã.

```
camera quay  600 → 601 → 602 → 603 → 604 → 605 → 606
                                                  ↑
                                     tới đây file mới xong,
                                     lúc này mới gửi đi được
```

Ngay khoảnh khắc file vừa xong, nội dung bên trong nó **đã cũ 6 giây rồi**. Chưa tính network, chưa tính CDN.

## 5.2 Cộng dồn ra ~26 giây

```
quay đủ 1 segment                6,0 giây
đẩy lên ingest                   0,3
transcode (decode + re-encode)     1,5
chạy qua cây CDN                 0,7
                                ─────
                                 8,5 giây
buffer trong player (3 segment) 18,0
                                ─────
                                ~26 giây
```

**Phần lớn latency nằm ngay trong máy viewer, không phải ở network.**

Player **không phát ngay** khi nhận được segment. Nó gom 2–3 cái rồi mới bắt đầu:

```
nhận seg-100  →  giữ lại, chưa phát
nhận seg-101  →  giữ lại, chưa phát
nhận seg-102  →  giờ mới phát seg-100
```

> **Nối với mục 3.3:** bỏ transcode (pass-through) thì cắt luôn 1,5 giây đó — 8,5 xuống 7,0. Đổi lại là mất ABR: internet yếu không có bản nhẹ nào để tụt xuống, chỉ còn cách giật.
> Nên pass-through **không chỉ để tiết kiệm tiền, nó còn là một cách giảm latency.**

## 5.3 Vì sao player cố tình chờ — buffer là kho video dự trữ

Internet không đều, thỉnh thoảng khựng một hai giây.

```
Không buffer:  internet khựng 2 giây  →  FREEZE ngay
Có buffer:     internet khựng 2 giây  →  vẫn còn 18 giây trong kho,
                                         bạn không hề hay biết
                                      →  internet hồi lại, kho nạp đầy tiếp
```

> **Ẩn dụ:** bồn nước trên mái nhà. Nước máy lúc mạnh lúc yếu, có khi cúp, nhưng có bồn thì mở vòi lúc nào cũng chảy đều. Bồn càng to càng yên tâm — đổi lại nước trong bồn là nước cũ, không phải nước vừa bơm lên.

**Đánh đổi cốt lõi:**

| Buffer | Latency | Độ mượt |
|---|---|---|
| To (3 segment = 18s) | Trễ nhiều | Mượt, chịu được internet phập phù |
| Nhỏ (1 chunk = 0,5s) | Trễ ít | Dễ giật khi internet xấu |

Không có lựa chọn "vừa nhanh vừa mượt". Chỉ có chọn nghiêng về bên nào.

> **Latency đó là CỐ Ý, không phải internet viewer yếu.**

## 5.4 Hai chỗ internet yếu, khác nhau hoàn toàn

Buffer trong player chỉ che được cho **viewer**. Internet streamer yếu là chuyện khác hẳn.

```
streamer → [ upload ] → INGEST → ... → EDGE → [ download ] → viewer
                 ↑                                   ↑
           rớt ở đây =                          rớt ở đây =
           cả 2 triệu người chết                mình bạn chết
```

| | Internet **viewer** yếu | Internet **streamer** yếu |
|---|---|---|
| Ai bị ảnh hưởng | Chỉ mình người đó | **Tất cả viewer** |
| Cứu bằng gì | Buffer trong player + ABR tụt chất lượng | Ingest đặt gần (mục 2.2) |
| Nếu tệ quá | Xem 240p hoặc giật | **Cả buổi live freeze, không ai cứu nổi** |

## 5.5 LL-HLS — cắt chunk nhỏ hơn, tụt xuống ~3 giây

Hai chỗ ăn thời gian nhiều nhất đều có chung một nguyên nhân: **mọi thứ đều tính theo đơn vị "một segment 6 giây"**.

Vậy làm cho đơn vị đó nhỏ lại. Segment được cắt tiếp thành **chunk** ~0,2 giây, và **gửi đi ngay khi vừa quay xong nó**, không chờ đủ segment.

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

## 5.6 Ba cái giá của LL-HLS

**Giá 1 — Số request tăng 30 lần.**

```
HLS:     2.000.000 ÷ 6      ≈    333.000 request/giây
LL-HLS:  2.000.000 ÷ 0,2    ≈ 10.000.000 request/giây
```

Vẫn từng đó bytes video, nhưng bị chẻ thành gấp 30 lần số lần hỏi. CDN tính tiền và chịu tải theo **cả số byte lẫn số request**.

Hệ quả kéo theo: **thundering herd (mục 4.5) xảy ra dày hơn 30 lần**, mà quy mô mỗi lần vẫn to y như cũ — vẫn là toàn bộ viewer cùng ập vào. Nên request collapsing càng bắt buộc; không có nó thì LL-HLS không chạy nổi.

**Giá 2 — Buffer mỏng thì dễ giật.** Đánh đổi không biến mất, nó chỉ bị đẩy sang phía khác.

```
HLS:     buffer 18 giây  →  internet khựng 5 giây, bạn không hay biết
LL-HLS:  buffer  1 giây  →  internet khựng 5 giây, FREEZE
```

Bồn nước nhỏ lại thì nước mới hơn, nhưng cúp nước một cái là hết ngay.

**Giá 3 — Cả hệ thống phải cùng hỗ trợ.** Player, CDN, origin — thiếu một mắt xích là không chạy. Máy cũ, player cũ thì chịu.

**Chọn cái nào:**

| Tình huống | Chọn | Vì |
|---|---|---|
| Bán hàng, đấu giá, gaming, chủ live đọc comment | **LL-HLS** | Trễ 26 giây là hỏng trải nghiệm |
| Concert, xem một chiều, không tương tác | **HLS** | Rẻ hơn, mượt hơn, trễ chút không sao |

## 5.7 Chunk vẫn cache được — chỗ khôn nhất của thiết kế

Mỗi chunk **vẫn có URL riêng của nó**:

```
/live/abc/seg-041.part-1.mp4
/live/abc/seg-041.part-2.mp4
/live/abc/seg-041.part-3.mp4
```

Có URL nghĩa là **có cái tên để tra** — đúng cái điều kiện ở mục 4.2. Nên toàn bộ cây CDN vẫn hoạt động y như cũ, không phải sửa gì.

> Người ta **cố tình không phát minh giao thức mới**. Họ chỉ cắt file nhỏ hơn, để cả thế giới CDN đang có sẵn vẫn dùng được.

## 5.8 WebRTC — nhanh hơn nữa nhưng bỏ luôn mô hình file

WebRTC cho latency dưới 1 giây. Nhưng nó quay lại kiểu **ống mở** — không file, không URL, không có gì để cache. Đúng cái tình huống gRPC ở mục 4.2.

Không cache được nghĩa là mỗi viewer phải được phục vụ riêng, cần một mạng server chuyên dụng chứ không xài CDN thường được.

| | HLS | LL-HLS | WebRTC |
|---|---|---|---|
| Đơn vị gửi | segment 6s | chunk 0,2s | dòng liên tục |
| Có URL? | Có | Có | **Không** |
| Cache được? | Được | Được | **Không** |
| Latency | 20–30 giây | 2–3 giây | dưới 1 giây |
| Chi phí mỗi viewer | Rẻ nhất | Rẻ | **Đắt nhất** |
| Lên được hàng triệu người? | Được | Được | Rất khó |

**WebRTC dùng cho việc gì:**

| Loại | Ví dụ |
|---|---|
| Gọi video / họp online | Google Meet, Discord. Đây là mục đích gốc. |
| Cloud gaming | GeForce Now, Xbox Cloud. Bấm nút xong màn hình phải đổi ngay. |
| Casino live dealer | Đặt cược rồi người chia bài chia. Trễ 5 giây là gian lận được. |
| Đấu giá trực tuyến | Trả giá theo thời gian thực. |
| Camera an ninh, drone | Vừa nhìn vừa bẻ lái. |

Quy luật phân biệt:

```
Bạn chỉ NGỒI XEM                      →  HLS / LL-HLS
Bạn phải PHẢN ỨNG lại cái đang thấy   →  WebRTC
```

Livestream là một chiều, video call là hai chiều. Dùng WebRTC cho livestream 2 triệu người là **xài sai mục đích thiết kế** — chạy được, nhưng tốn kinh khủng.

> **Quy luật xuyên suốt phần này:** muốn latency thấp thì phải trả bằng tiền, bằng độ mượt, hoặc cả hai. Không có bữa trưa miễn phí.

---

# Phần 6 — Comment: chỗ thật sự chết

## 6.1 Video là one-to-many, comment là many-to-many

Hai bài toán khác nhau ngay từ **hình dạng**, trước khi tính toán gì.

```
VIDEO:    1 streamer            ──→  2.000.000 viewer
COMMENT:  2.000.000 người gửi   ──→  2.000.000 người nhận
```

Với video, chỉ **một** người tạo ra data và ai cũng nhận thứ giống hệt nhau — nên mới copy ra rồi phát được.

Với comment, **mỗi viewer vừa là nguồn vừa là đích**. Ai cũng có thể tạo data, ai cũng cần nhận data của người khác. Đây không còn là one-to-many, mà là **many-to-many**.

## 6.2 Vấn đề không phải người ta gõ nhiều — là fan-out ratio

Đây là ý cốt lõi. Hiểu cái này là hiểu cả phần.

```
nhắn cho 1 người bạn        →  gõ 1 câu  →  hệ thống gửi đi          1 bản
nhắn vào group 5 người      →  gõ 1 câu  →  hệ thống gửi đi          5 bản
comment trong live 2 triệu  →  gõ 1 câu  →  hệ thống gửi đi  2.000.000 bản
```

**Bạn chỉ gõ MỘT lần. Nhưng hệ thống phải làm việc 2 triệu lần.**

Con số nhân bản đó gọi là **fan-out ratio**. WhatsApp có fan-out ratio là 1 (chat riêng) hoặc 50 (group). Livestream có fan-out ratio là **2.000.000**.

Nhân lên khi nhiều người cùng gõ. Giả sử mỗi giây có 1.000 người comment — chỉ khoảng 0,05% viewer:

```
1.000 × 2.000.000 = 2.000.000.000 bản / giây
```

**Hai tỷ bản mỗi giây.** Không phải "khó" — là **không thể**.

> **Từ vựng cho đúng:** 2 tỷ là số **bản gửi đi** — mỗi bản copy tới một máy là một **delivery**. Không phải số comment (comment chỉ có 1.000/giây), cũng không phải **request** (request là client hỏi server, còn đây là server đẩy xuống client).

Lưu ý ngược lại một chỗ nhiều người nhầm: **giữ 2 triệu persistent connection KHÔNG phải phần khó.** Một server tune tốt giữ được vài trăm nghìn connection, nên chỉ cần vài chục gateway server. Cái chết nằm ở **số delivery phải nhân bản**, không phải số connection.

## 6.3 Sampling — bỏ bớt requirement thay vì tìm máy mạnh hơn

Đây là chỗ đáng học nhất của cả tài liệu này.

Khi một requirement bất khả thi, engineer **không đi tìm máy mạnh hơn**. Họ quay lại nhìn cái requirement rồi hỏi: *"cái này có thật sự cần không?"*

Nhìn lại đề bài, chữ tạo ra con số 2 tỷ nằm ngay đây:

> "Nếu muốn **tất cả** mọi người đều thấy **mọi** comment..."

Bỏ chữ "tất cả" đi. Mỗi viewer chỉ được đẩy ~20 comment mỗi giây thay vì đủ 1.000:

```
Trước:  1.000 comment × 2.000.000 viewer  =  2.000.000.000 delivery/giây
Sau:       20 comment × 2.000.000 viewer  =     40.000.000 delivery/giây
```

Giảm 50 lần. Từ "không thể" thành "làm được".

**Và bỏ 980 comment kia không mất gì cả.** Mắt người không đọc nổi hơn ~20 comment mỗi giây. Gửi đủ 1.000 xuống thì nó chỉ trôi vèo qua trong tích tắc, viewer không kịp thấy gì.

> Requirement "mọi người thấy mọi comment" ngay từ đầu đã **vô nghĩa**. Không ai consume nổi lượng đó.

## 6.4 Hệ quả: mỗi viewer thấy một ô chat khác nhau

20 comment được sample cho bạn khác 20 cái sample cho người bên cạnh. Hai người ngồi cạnh nhau, cùng xem một buổi live, **ô chat hiện ra hoàn toàn khác nhau**.

> **Ẩn dụ:** sân vận động 2 triệu người, tất cả cùng hét. Bạn hét lên một câu — chỉ vài người ngồi quanh bạn nghe thấy. Khán đài đối diện không nghe gì cả.

Cái ô chat bạn đang nhìn không phải "cuộc trò chuyện của buổi live". Nó là **một sample bốc riêng cho bạn**.

## 6.5 Local echo — vì sao comment của mình luôn hiện

Mỗi giây có 1.000 comment mà hệ thống chỉ sample 20 cái. Xác suất comment của bạn được bốc trúng là **2%**.

Vậy tại sao lần nào bạn cũng thấy comment của mình? Vì có **hai nhánh chạy độc lập**:

```
bạn bấm gửi
     ├──→  client TỰ RENDER comment lên màn hình NGAY   (không hỏi server)
     └──→  gửi lên server  →  vào pool chung 1.000 comment/giây
                           →  may thì được sample vào ô chat của vài người
```

Nhánh trên **luôn** chạy. Nhánh dưới thì hên xui.

Tên gọi: **local echo**. Trong frontend nói chung đây là **optimistic update** — cùng một pattern với cái nút like đổi màu ngay lúc bấm, chứ không chờ server confirm.

> **Comment của bạn hiện lên KHÔNG chứng minh được điều gì hết.**
>
> Không chứng minh server nhận được. Không chứng minh viewer khác thấy. Không chứng minh streamer đọc được.
>
> Nó chỉ chứng minh **client của bạn đã tự render nó ra**.

Cả 2 triệu người trong buổi live đó đều đang thấy comment của mình hiện lên, và đều tin là mình đang tham gia một cuộc trò chuyện chung. Thực ra mỗi người đang ngồi trong một ô chat riêng.

## 6.6 Batching — giảm số LẦN gửi, không giảm số comment

Sau sampling vẫn còn 40 triệu delivery/giây. Chỗ lãng phí nằm ở đây:

```
Mỗi viewer, mỗi giây, nhận 20 comment.
Nhưng server gửi 20 LẦN riêng biệt cho từng người.
```

**Batching:** gom 20 comment trong 1 giây thành **một batch**, gửi một lần.

```
Trước:  20 comment × 2.000.000 viewer  =  40.000.000 lần gửi/giây
Sau:     1 batch   × 2.000.000 viewer  =   2.000.000 lần gửi/giây
```

Giảm 20 lần. **Số byte gần như không đổi** — vẫn từng đó comment — nhưng số *lần gửi* giảm 20 lần. Mỗi lần gửi đều có overhead riêng (packet, syscall), và với payload bé xíu thì overhead mới là thứ tốn.

> **Ẩn dụ:** 20 đơn hàng cùng một địa chỉ. Giao 20 chuyến hay gom vào 1 chuyến? Cùng từng đó hàng, ít hơn 20 lần số chuyến xe.

Cái giá: comment không trôi mượt nữa mà nhảy thành từng cụm mỗi giây. Gần như không ai để ý.

## 6.7 Fan-out on read — biến comment thành thứ cache được

Batch giờ là **một file có nội dung cố định**, nên nó có URL:

```
/live/abc/comments/batch-0847.json
```

Có URL → có tên để tra (mục 4.2) → **cache được** → cả cây CDN phát được. Đúng y hệt mô hình video ở Phần 4.

```
Fan-out on WRITE:  server tự đẩy riêng cho từng viewer   →  2.000.000 lần gửi/giây
Fan-out on READ:   viewer tự pull batch về, CDN cache    →       ~50 request/giây
```

Chat từ chỗ đắt nhất hệ thống tụt xuống **rẻ ngang video**.

### Nhưng sampling và cache chửi nhau

- **Sampling** nói: mỗi viewer nhận 20 comment **khác nhau**.
- **Cache** nói: cache được chỉ khi mọi người nhận **giống hệt nhau**.

Không thể vừa cá nhân hoá vừa cache. Hệ thống **hy sinh sampling cá nhân hoá** — làm một batch chung duy nhất mỗi giây, giống hệt cho mọi người.

> **Ẩn dụ:** mỗi giây hệ thống "in một tờ báo" chứa 20 comment mới nhất. **Một tờ duy nhất**, photo ra 2 triệu bản, phát cho tất cả. Không ai có tờ báo riêng.
>
> In một tờ rồi photo 2 triệu bản thì rẻ. Ngồi viết 2 triệu tờ khác nhau thì không đời nào làm nổi.

**Đính chính mục 6.4:** vì vậy hai viewer cùng khu vực thật ra thấy **gần như giống nhau**, chứ không "khác nhau hoàn toàn". Khác nhau chỉ ở ba chỗ: local echo (comment của chính mình), lệch region (PoP Tokyo và Frankfurt có thể lệch một hai batch), và kênh riêng ở mục 6.8.

Cả hai thiết kế đều tồn tại ngoài đời — nhưng cái **cache được** mới là cái lên nổi hàng triệu viewer.

## 6.8 Hai kênh: tờ báo chung và thư riêng

Vẫn còn những thứ **bắt buộc** phải tới đúng một người, không nhét vào batch chung được:

| Việc | Ai cần thấy |
|---|---|
| Streamer đọc tên bạn rồi trả lời | Bạn |
| Xác nhận "đã trừ 100 xu" khi bạn tặng quà | Chỉ bạn |
| Mod cấm bạn chat 5 phút | Chỉ bạn |
| Comment của bạn được ghim lên đầu | **Cả phòng** → cái này vô batch chung |

Cách phân loại chỉ có một câu hỏi: **thứ này ai cần thấy?**

Nên chat tách làm **hai hệ thống chạy trên hai công nghệ khác hẳn nhau**:

| | Kênh chung (tờ báo) | Kênh riêng (thư) |
|---|---|---|
| Chạy bằng gì | File có URL, phát qua CDN — **giống hệt video** | WebSocket giữ mở tới từng người |
| Lượng | To: 20 comment mỗi giây | Nhỏ: vài tin mỗi phút |
| Cache được? | Được | Không |
| Chi phí | Rẻ, vì cache | Đắt trên mỗi tin — nhưng ít tin nên tổng vẫn rẻ |

> **Nguyên tắc:** đường nào **TO** thì làm cho nó copy được. Đường nào **không copy được** thì làm cho nó **NHỎ**.

Cái ô chat viewer nhìn thấy là **hai luồng data trộn lại rồi vẽ chung lên một chỗ**. Người dùng không phân biệt được, và cũng không cần.

> **Nguyên tắc lớn hơn cả bài này:** một tính năng người dùng thấy là "một", bên dưới có thể là nhiều hệ thống tách rời — **tách theo đặc tính của data, không tách theo giao diện**.
>
> Phần 8 chính là nguyên tắc này lần nữa, nhưng tách giữa *comment* và *tiền*.

## 6.9 Sơ đồ tổng — ba lane

Video và comment chung **không dùng chung server, nhưng DÙNG CHUNG CDN**. Origin của hai bên là hai service khác nhau; cái cây phân phối bên dưới thì xài chung, vì nó vốn chỉ làm một việc: copy file có URL rồi phát đi. Nó không quan tâm bên trong file là video hay comment.

```
LANE 1 — VIDEO
────────────────────────────────────────────────────────────────
  streamer ──► INGEST ──► TRANSCODE ──► ORIGIN video ──┐
                                                        │
LANE 2 — COMMENT CHUNG  (tờ báo)                        │
────────────────────────────────────────────────────────┼───────
  viewer gõ ──► CHAT SERVICE ──► gom batch ──► ORIGIN comment ──┐
                (nhận, lọc,      mỗi giây                       │
                 chọn 20 cái)    một file                       │
                                                        │       │
                                                        ▼       ▼
                                        ┌───────────────────────────────┐
                                        │   CDN — DÙNG CHUNG            │
                                        │   regional tier → edge        │
                                        │   (cache cả hai loại file)    │
                                        └───────────────┬───────────────┘
                                                        │  viewer PULL về
                                                        ▼
                                                    ┌────────┐
                                                    │ VIEWER │
                                                    └────────┘
                                                        ▲
LANE 3 — COMMENT RIÊNG  (thư)                           │
────────────────────────────────────────────────────────┤
  reply, xác nhận quà, mod ──► GATEWAY WebSocket ───────┘
                                (giữ 2 triệu connection)
                                    KHÔNG qua CDN
```

**Đọc sơ đồ theo ba ý:**

1. Lane 1 và lane 2 **đổ vào cùng một cây CDN**. Với cái cây đó, `seg-041.ts` và `batch-0847.json` chỉ là hai file có URL — cache và phát y như nhau.
2. Lane 3 **đi vòng qua CDN**, cắm thẳng vào viewer. Nội dung riêng từng người thì không có gì để cache.
3. **CHAT SERVICE** là thứ mới hoàn toàn, video không có: nhận comment viewer gõ lên, lọc bậy, chọn 20 cái, gói thành file. Đây là nơi sampling và batching xảy ra.

> **Điểm đáng nhớ:** cây CDN là **hạ tầng dùng chung, không phải "đồ của video"**. Bất cứ thứ gì nhét được vào một file có URL thì đều nhờ nó phát giùm được.
>
> Đó là lý do fan-out on read đắt giá tới vậy — nó biến comment từ dạng không cache được thành dạng cache được, chỉ để **được dùng ké cái cây đã có sẵn**.

---

# Phần 7 — Con số viewer là ước lượng

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
| Khi overload | Bỏ bớt (load shedding) | Xếp hàng, không bỏ |

> **Bài học kiến trúc lớn nhất:** không phải mọi dữ liệu đều xứng đáng cùng một mức độ tin cậy. Trả tiền cho độ tin cậy đúng chỗ cần nó.

Ẩn dụ: nói chuyện thì nghe lọt tai cũng được. Nhưng đưa tiền thì phải ký nhận.

---

# Phần 9 — Khi vẫn overload: rơi từng nấc

Hệ thống không sập một phát. Nó rơi theo thứ tự định sẵn:

```
1. Tắt hiệu ứng quà hoành tráng      (rẻ nhất, ít ai để ý)
2. Giãn tần suất đẩy comment          1s → 3s
3. Giảm số comment mỗi gói
4. Hạ chất lượng video mặc định       1080p → 720p → 480p
5. Tắt hẳn chat, giữ video
6. Chặn viewer mới vào             (cứu người đang xem)
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
| 5 | **Transcode theo luồng** | 100 hay 2 triệu viewer, hoá đơn transcode y hệt. |
| 6 | **Segment = file có URL** | Livestream chạy bằng HTTP tải file thường. Có URL nên mới cache được. |
| 7 | **Cache cần tên** | gRPC stream là ống mở không tên → chịu. Chat cũng vậy → đó là chỗ sập. |
| 8 | **Càng đông càng rẻ** | Origin phụ thuộc số PoP, không phụ thuộc số viewer. Nén 40.000:1. |
| 9 | **Request collapsing** | Live LÀ thundering herd cứ 6 giây một lần. Gộp 40.000 request thành 1. |
| 10 | **Buffer trade-off** | Latency được cố ý thêm vào. Buffer nhỏ = trễ ít nhưng dễ giật. |
| 11 | **Comment fan-out** | 2 tỷ msg/giây nếu làm thô. Thoát bằng sampling + local echo. |
| 12 | **Đếm xấp xỉ** | HyperLogLog, sai số ±20.000 người. Cố tình chấp nhận. |
| 13 | **Hot path vs money path** | Comment được phép mất. Tiền thì không. |
| 14 | **Graceful degradation** | Rơi từng nấc: hiệu ứng → comment → chất lượng → chat → chặn người mới. |

---
