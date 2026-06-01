CKA Study Tools — Project Notes
📁 Structure
.claude/
├── todo.md         ← file này (agent context)
index.html          ← shell HTML only (no inline CSS/JS)
css/
├── styles.css      ← tất cả styles
js/
├── data/
│   ├── s1.js       ← S1 Architecture
│   ├── s2.js       ← S2 Core Concepts
│   ├── s3.js       ← S3 Scheduling
│   ├── s4.js       ← S4 Logging & Monitoring
│   ├── s5.js       ← S5 App Lifecycle
│   ├── s6.js       ← S6 Cluster Maintenance
│   ├── s7.js       ← S7 Security (3 sub-topics: S7·TLS, S7·RBAC, S7·EXT)
│   ├── s8.js       ← S8 Storage
│   └── s9.js       ← S9 Networking (4 sub-topics: PRE/CORE/SVC/ING)
└── app.js          ← toàn bộ logic UI
README.md           ← mô tả agenda khóa học, tiến độ

Deploy: GitHub Pages — main branch, root /


✅ Đã làm
index.html (cka_prompt_gen — bản production)

Click topic → tự gen prompt đầy đủ context ngay lập tức
11 topics cover toàn bộ CKA course (S1 → S9)
Hint chips gợi ý nhanh điểm hay nhầm theo từng section
Text area để thêm note cá nhân (live update prompt)
Copy button 1-click
Format đáp án ẩn: AI in 10 câu trước → dòng phân cách → đáp án phía dưới

Refactor thành multi-file (mỗi section = 1 file data)

index.html → shell thuần HTML
css/styles.css → tách riêng
js/data/sX.js → mỗi section 1 file
js/app.js → logic UI

S7 Security tách 3 sub-topics có trọng tâm:

S7·TLS: TLS Certificates, Certificate API, Kubeconfig
S7·RBAC: API Groups, RBAC, ServiceAccounts
S7·EXT: Admission Controllers, CRD, API Versions

Button "🔐 Gen prompt ôn tập nhanh Security" (chỉ hiện khi chọn S7·*)

Toggle giữa prompt 10 câu đầy đủ ↔ prompt 5 câu quick review


🔜 TODO
Tính năng

 Merge study plan vào: tích hợp checklist progress (tick từng topic) vào cùng index.html
 Session tracker: ghi lại topic đã ôn + ngày → "lần cuối ôn S7: 3 ngày trước"
 Weak spot tag: đánh dấu topic còn yếu → badge ⚠️
 Countdown đến thi: nhập ngày thi → hiện "còn X ngày"
 Prompt tuỳ chỉnh: chọn số câu (5/10/15), chọn dạng câu hỏi muốn focus
 Mock exam prompt: gen 20 câu tổng hợp nhiều section, simulate thi thật

Nội dung

 Thêm topics S10–S15 (Design, kubeadm, Helm, Kustomize, Troubleshooting, JSONPath)
 Thêm hint chips cho S9 (hiện còn ít)

Technical

 Responsive mobile tốt hơn (layout 2 cột topic grid hơi chật)
 localStorage lưu note cá nhân giữa các session


🧠 Context học tập

Khoá học: Udemy — "CKA with Practice Tests"
Tiến độ: đã xong S1–S8 (Storage), đang vào S9 (Networking)
Thời gian: 30–45 phút/ngày
Lộ trình: Ôn S1–S7 (~7 ngày) → Ôn S8 (~2 ngày) → Học S9 (~10–12 ngày)
Ưu tiên cao: S7 Security, S9 Networking, S14 Troubleshooting
Workflow: dùng prompt gen → copy → paste vào AI → tự làm 10 câu → kéo xuống xem đáp án


💡 Ghi chú kỹ thuật

Multi-file: HTML shell + css/styles.css + js/data/sX.js + js/app.js
Google Fonts là dependency duy nhất (JetBrains Mono + Syne)
Hoàn toàn offline, không gọi API
window.TOPICS_DATA global array, mỗi data file push vào
app.js dùng buildTopics() để group theo phase trước khi render
localStorage chưa dùng ở bản hiện tại