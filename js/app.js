// Nhóm TOPICS_DATA (từ các file data/) thành phases để render
function buildTopics(data) {
  const phaseMap = {};
  const phaseOrder = [];
  data.forEach(function(t) {
    if (!phaseMap[t.phase]) {
      phaseMap[t.phase] = { phase: t.phase, pLabel: t.pLabel, pClass: t.pClass, items: [] };
      phaseOrder.push(t.phase);
    }
    phaseMap[t.phase].items.push({ tag: t.tag, name: t.name, desc: t.desc, hints: t.hints });
  });
  return phaseOrder.map(function(k) { return phaseMap[k]; });
}

var currentTopic = null;
var currentNote = '';

function renderTopics() {
  var TOPICS = buildTopics(window.TOPICS_DATA || []);
  var container = document.getElementById('topic-list');
  TOPICS.forEach(function(phase) {
    var block = document.createElement('div');
    block.className = 'phase-block';
    block.innerHTML =
      '<div class="phase-label"><span class="phase-badge ' + phase.pClass + '">' + phase.pLabel + '</span></div>' +
      '<div class="topic-grid">' +
      phase.items.map(function(t) {
        return '<div class="topic-btn" id="tbtn-' + t.tag + '" onclick="selectTopic(\'' + t.tag + '\')">' +
          '<div class="tb-tag">' + t.tag + '</div>' +
          '<div class="tb-name">' + t.name + '</div>' +
          '</div>';
      }).join('') +
      '</div>';
    container.appendChild(block);
  });
}

function selectTopic(tag) {
  document.querySelectorAll('.topic-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('tbtn-' + tag).classList.add('active');

  var all = (window.TOPICS_DATA || []);
  currentTopic = all.find(function(t) { return t.tag === tag; }) || null;
  currentNote = '';
  document.getElementById('note-input').value = '';

  // render hint chips
  var hints = (currentTopic && currentTopic.hints) ? currentTopic.hints : [];
  var chipContainer = document.getElementById('hint-chips');
  chipContainer.innerHTML = hints.map(function(h) {
    return '<span class="hint-chip" onclick="addHint(\'' + h.replace(/'/g, "\\'") + '\')">' + h + '</span>';
  }).join('');

  // show review-btn for all topics
  var reviewBtn = document.getElementById('review-btn');
  reviewBtn.style.display = 'block';
  reviewBtn.classList.remove('active');
  reviewBtn.textContent = '📖 Ôn lí thuyết topic này';

  document.getElementById('output-panel').classList.add('show');
  renderPrompt(false);

  setTimeout(function() {
    document.getElementById('output-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function addHint(text) {
  var inp = document.getElementById('note-input');
  inp.value = inp.value ? inp.value + '; ' + text : text;
  currentNote = inp.value.trim();
  renderPrompt(document.getElementById('review-btn').classList.contains('active'));
}

function applyNote() {
  currentNote = document.getElementById('note-input').value.trim();
  renderPrompt(document.getElementById('review-btn').classList.contains('active'));
}

function renderPrompt(isReview) {
  if (!currentTopic) return;
  var t = currentTopic;
  var noteSection = currentNote ? '\n📌 Tôi đang bị nhầm / cần tập trung thêm vào: ' + currentNote + '\n' : '';

  var prompt;
  if (isReview) {
    prompt =
'You are a CKA (Certified Kubernetes Administrator) instructor. Explain the following topic clearly and concisely.\n' +
'\n📚 TOPIC: [' + t.tag + '] ' + t.name + '\n' +
'\n🔍 CONTENT TO COVER:\n' + t.desc + '\n' +
noteSection +
'\n📋 FORMAT REQUIREMENTS:\n' +
'1. Core concepts summary (bullet points, 1-2 lines each)\n' +
'2. Comparisons / differences between easily confused concepts (table or bullets)\n' +
'3. Key YAML examples (code block with inline comments explaining each important line)\n' +
'4. kubectl verify/debug commands — present EACH command in this exact format:\n' +
'   $ <full command>\n' +
'   → What it does: <purpose of the command>\n' +
'   → Flags explained: <what each flag/option means>\n' +
'   → Sample output: <what the real output looks like>\n' +
'   → Reading output: <what each value means, how to confirm correct/incorrect>\n' +
'5. Common exam traps / things people forget (⚠️ prefix each line)\n' +
'\nWrite in English. Keep all technical terms, field names, and Kubernetes-specific words in English. Concise and CKA-focused.';
  } else {
    prompt =
'You are a CKA (Certified Kubernetes Administrator) instructor. Create 10 practice questions for the topic below, alternating 3 types in order: multiple choice → open-ended → fill-in-the-blank.\n' +
'\n📚 TOPIC: [' + t.tag + '] ' + t.name + '\n' +
'\n🔍 CONTENT TO COVER:\n' + t.desc + '\n' +
noteSection +
'\n📋 FORMAT REQUIREMENTS (10 questions, exact order):\n' +
'Q1  [Multiple choice]  — 4 options A/B/C/D, only 1 correct answer\n' +
'Q2  [Open-ended]       — explain a concept or compare two things\n' +
'Q3  [Fill-in-blank]    — complete a kubectl command or missing YAML field\n' +
'Q4  [Multiple choice]\n' +
'Q5  [Open-ended]\n' +
'Q6  [Fill-in-blank]\n' +
'Q7  [Multiple choice]\n' +
'Q8  [Open-ended]\n' +
'Q9  [Fill-in-blank]\n' +
'Q10 [Multiple choice]\n' +
'\n⚠️ IMPORTANT — ANSWER FORMAT:\n' +
'- List ALL 10 questions FIRST (no answers yet)\n' +
'- Then print a separator line: ════════════ ANSWERS ════════════\n' +
'- Then print the answer + explanation for each question in order\n' +
'\nGoal: the learner reads all 10 questions, thinks first, then scrolls down to see answers.\n' +
'Write in English. Keep all technical terms, field names, and Kubernetes-specific words in English.';
  }

  document.getElementById('prompt-box').textContent = prompt;
  var btn = document.getElementById('copy-btn');
  btn.textContent = '📋 Copy prompt';
  btn.classList.remove('copied');
}

function toggleReview() {
  var reviewBtn = document.getElementById('review-btn');
  var isNowActive = !reviewBtn.classList.contains('active');
  reviewBtn.classList.toggle('active', isNowActive);
  reviewBtn.textContent = isNowActive
    ? '✕ Quay lại prompt luyện đề'
    : '📖 Ôn lí thuyết topic này';
  renderPrompt(isNowActive);
}

function copyPrompt() {
  var text = document.getElementById('prompt-box').textContent;
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Đã copy! Paste vào AI bất kỳ';
    btn.classList.add('copied');
    setTimeout(function() {
      btn.textContent = '📋 Copy prompt';
      btn.classList.remove('copied');
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('note-input').addEventListener('input', function() {
    currentNote = this.value.trim();
    renderPrompt(document.getElementById('review-btn').classList.contains('active'));
  });
  renderTopics();
});
