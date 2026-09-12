from pathlib import Path

p = Path("index.html")
t = p.read_text(encoding="utf-8")
css = Path(".github/record-card-assets/record-book.css").read_text(encoding="utf-8")
rec = Path(".github/record-card-assets/record-section.html").read_text(encoding="utf-8")
helpers = Path(".github/record-card-assets/record-card-helpers.js").read_text(encoding="utf-8")
meta = '<meta name="cdhq-release-feature" content="record-book-coach-trading-cards-v1">'

if 'record-book-trading-cards-v1' not in t:
    t = t.replace('</head>', css + '\n' + meta + '\n</head>', 1)
elif 'cdhq-release-feature" content="record-book-coach-trading-cards-v1' not in t:
    t = t.replace('</head>', meta + '\n</head>', 1)

a = t.find('<section id="records" class="view">')
b = t.find('<section id="admin" class="view">', a)
assert a >= 0 and b >= 0, f"record/admin boundary missing: records={a}, admin={b}"
t = t[:a] + rec + t[b:]

if 'const COACH_CARD_PORTRAITS=' not in t:
    q = t.find('function renderRecordBook(){')
    assert q >= 0, "renderRecordBook missing"
    t = t[:q] + helpers + t[q:]

f = t.find('function renderRecordBook(){')
a = t.find('$("coachRecordCards").innerHTML=', f)
b = t.find('\n\n const wins=', a)
assert a >= 0 and b >= 0, f"coach render boundary missing: assignment={a}, wins={b}"
assignment = '$("coachRecordCards").innerHTML=career.map((c,i)=>coachTradingCard(c,i,games)).join("")||\'<div class="empty">No career records yet.</div>\';\n initCoachTradingCards();'
t = t[:a] + assignment + t[b:]

p.write_text(t, encoding="utf-8")
print("Record Book coach card upgrade applied")
