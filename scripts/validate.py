"""활동지 데이터 검사: 정답 키, 구조 규칙, 교육과정 연결. 사용: python3 validate.py"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parent.parent
cur = json.loads((R / 'data/curriculum.json').read_text(encoding='utf-8'))
UNITS = {u['code'] for u in cur['units']}
TYPES = {'concept', 'escape', 'mystery', 'practice', 'analysis', 'discussion'}
METHODS = {'객관식', '단답형', '서술형', '빈칸 채우기', '문장 고치기', '표 채우기', '매칭', '분류하기', '순서 정하기',
           '이름 붙이기', '그림에서 찾기', '비교하기', '미로', '갈림길 이야기', '비트 카드', '확인 안내'}
SITU = {'wrap', 'quiz', 'level', 'focus'}
errs, warns = [], []

def E(s, b, m): errs.append(f"{s}{' / ' + b if b else ''}: {m}")
def W(s, b, m): warns.append(f"{s}{' / ' + b if b else ''}: {m}")
def perm(x, n): return sorted(x) == list(range(n))

files = sorted((R / 'data/sheets').glob('*.json'))
seen_units, seen_ids = {}, set()
for f in files:
    s = json.loads(f.read_text(encoding='utf-8'))
    sid = s.get('id', f.name)
    for k in ['id', 'unit', 'title', 'type', 'minutes', 'goal', 'keywords', 'situations', 'sections']:
        if k not in s: E(sid, '', f'필드 없음 {k}')
    if sid in seen_ids: E(sid, '', 'id 중복')
    seen_ids.add(sid)
    if s['unit'] not in UNITS: E(sid, '', f"없는 단원 {s['unit']}")
    seen_units.setdefault(s['unit'], []).append(sid)
    if s['type'] not in TYPES: E(sid, '', f"유형 {s['type']}")
    if not re.search(r'수 있다\.$', s['goal'].strip()): E(sid, '', '학습목표가 "~할 수 있다."로 안 끝남')
    if not set(s['situations']) <= SITU: E(sid, '', f"상황 키 {s['situations']}")
    roles = [x['role'] for x in s['sections']]
    if roles != ['start', 'main', 'wrap']: E(sid, '', f'섹션 순서 {roles}')
    bids = set(); gates = []
    for sec in s['sections']:
        for b in sec['blocks']:
            bid = b.get('id'); k = b.get('kind')
            if bid in bids: E(sid, bid, 'id 중복')
            bids.add(bid)
            if b.get('method') not in METHODS: E(sid, bid, f"활동 방법 이름 {b.get('method')}")
            if not b.get('prompt'): E(sid, bid, '지시문 없음')
            if b.get('gate'):
                gates.append(b)
                if not re.fullmatch(r'\d', str(b.get('reward', ''))): E(sid, bid, '관문 보상 숫자 1자리 필요')
            try:
                if k in ('choice', 'oddone', 'reveal', 'chart'):
                    assert isinstance(b['answer'], int) and 0 <= b['answer'] < len(b['options']), '정답 번호'
                    assert len(set(b['options'])) == len(b['options']), '보기 중복'
                elif k == 'multi':
                    assert b['answer'] and all(0 <= i < len(b['options']) for i in b['answer']), '정답 번호'
                    assert len(b['answer']) < len(b['options']), '전부 정답'
                elif k == 'codediff':
                    assert 0 <= b['answer'] < len(b['options']) and all(0 <= i < len(b['b']) for i in b['diff']) and b['diff']
                elif k == 'short':
                    assert (b['answer'] if isinstance(b['answer'], list) else [b['answer']]), '정답'
                elif k == 'table':
                    cells = [c for r in b['rows'] for c in r if isinstance(c, dict)]
                    assert cells, '정답 칸 없음'
                    for r in b['rows']: assert len(r) == len(b['columns']), '열 수'
                    for c in cells:
                        assert str(c['answer']) != '', '빈 정답'
                        if 'options' in c: assert c['answer'] in c['options'], '정답이 선택지에 없음'
                elif k in ('fixsentence', 'cloze'):
                    slots = [p for p in b['parts'] if isinstance(p, dict)]
                    assert slots
                    for p in slots: assert p['answer'] in p['options'], f"정답 {p['answer']} 없음"
                    if k == 'fixsentence':
                        assert any(p['now'] != p['answer'] for p in slots), '처음부터 다 맞음'
                        for p in slots: assert p['now'] in p['options'], '처음 낱말이 보기에 없음'
                    else:
                        for p in slots: assert p.get('now') is None, '빈칸은 now=null'
                elif k == 'bitcards':
                    for t in b['targets']:
                        assert t['answer'] == format(t['value'], f"0{len(b['cards'])}b"), f"{t['value']} 이진수"
                elif k == 'maze':
                    for st in b['steps']: assert len(st['doors']) == 2 and st['answer'] in (0, 1)
                elif k == 'sort':
                    assert len({it['t'] for it in b['items']}) == len(b['items']), '카드 중복'
                    assert all(0 <= it['g'] < len(b['groups']) for it in b['items'])
                    assert all(any(it['g'] == g for it in b['items']) for g in range(len(b['groups']))), '빈 그룹'
                elif k == 'venn':
                    assert all(it['z'] in ('A', 'AB', 'B') for it in b['items'])
                elif k == 'match':
                    assert len(set(b['left'])) == len(b['left']) and len(set(b['right'])) == len(b['right']), '짝 중복'
                    n = len(b['left']); assert len(b['right']) == n and perm(b['answer'], n) and perm(b.get('shuffle', list(range(n))), n)
                    sh = b.get('shuffle'); assert sh and [b['answer'][i] for i in range(n)] != sh, '섞기가 정답 순서와 같음'
                elif k == 'order':
                    assert len({x.strip() for x in b['items']}) == len(b['items']), '같은 문장이 두 번 (순서 채점이 틀어짐)'
                    assert perm(b['start'], len(b['items'])) and b['start'] != list(range(len(b['items']))), '시작 순서'
                elif k == 'label':
                    assert all(m['answer'] in b['bank'] for m in b['markers'])
                elif k == 'hotspot':
                    ids = re.findall(r'\[\[([^|\]]+)\|', b['text'])
                    assert all(a in ids for a in b['answer']) and len(ids) > len(b['answer']), '표시 위치'
                elif k == 'story':
                    N = b['nodes']; assert b['start'] in N
                    for n in N.values():
                        for c in n.get('choices', []): assert c[1] in N, f'없는 장면 {c[1]}'
                    assert any(n.get('end') == 'good' for n in N.values()), '좋은 결말 없음'
                elif k == 'write':
                    kw = b.get('keywords') or []
                    need = b.get('minKeywords', len(kw))
                    if kw and b.get('sample'):
                        hit = [x for x in kw if x in b['sample']]
                        assert len(hit) >= need, f'예시 답이 핵심 단어 {need}개 미만'
                elif k == 'note':
                    pass
                else:
                    E(sid, bid, f'모르는 kind {k}')
            except (AssertionError, KeyError, TypeError) as e:
                E(sid, bid, f'{k}: {e}')
            if 'explain' not in b and k not in ('write', 'note', 'story'):
                W(sid, bid, '설명 없음')
    if s['type'] == 'escape':
        if len(gates) < 2: E(sid, '', '관문 2개 이상')
        if 'lock' not in s: E(sid, '', 'lock 없음')
        w = s['sections'][2]['blocks']
        if not (w and w[0]['kind'] == 'cloze' and w[0].get('afterLock')): E(sid, '', '탈출: 금고 속 메시지(cloze, afterLock) 필요')
        if not s.get('story'): E(sid, '', '탈출: 미션 글 필요')
    if s['type'] == 'mystery':
        w = s['sections'][2]['blocks']
        if not (w and w[0]['kind'] == 'cloze'): E(sid, '', '추리: 사건 보고서(cloze) 필요')
        if not s.get('story'): E(sid, '', '추리: 사건 개요 필요')
    if s['type'] not in ('escape', 'mystery'):
        w = s['sections'][2]['blocks']
        if not (w and w[0]['kind'] == 'write'): W(sid, '', '한 줄 정리가 서술형이 아님')

missing = sorted(UNITS - set(seen_units))
dup = {u: v for u, v in seen_units.items() if len(v) > 1}
print(f'활동지 {len(files)}개 · 단원 {len(seen_units)}/{len(UNITS)}')
if dup: print('단원 중복:', dup)
if missing and '--all' in sys.argv: print('빠진 단원:', missing)
for e in errs: print('ERR ', e)
for w in warns: print('WARN', w)
sys.exit(1 if errs else 0)
