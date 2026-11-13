import re, base64, os, sys
css = open('src/engine.css').read()
eng = open('src/engine.js').read()
def page(name, case, title, chars):
    return f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>사건 파일: {title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700&display=swap">
<style>{css}</style>
</head>
<body>
<div class="game" id="game"></div>
<!-- 공통 캐릭터: src/characters.js -->
<script>
{chars}</script>
<!-- 사건 데이터: src/cases/{name}.js -->
<script>
{case}</script>
<!-- 추리 게임 엔진: src/engine.js (모든 사건 공통) -->
<script>
{eng}</script>
</body>
</html>
'''
def inline(case):
    def rep(m):
        path=m.group(1)
        if not os.path.exists(path): return m.group(0)
        mime='image/jpeg' if path.endswith('.jpg') else 'image/png'
        return '"data:%s;base64,%s"' % (mime, base64.b64encode(open(path,'rb').read()).decode())
    return re.sub(r'"(assets/[^"]+)"', rep, case)
for name in ['privacy','debug','ramen']:
    case = open(f'src/cases/{name}.js').read()
    title = re.search(r'title: "([^"]+)"', case).group(1)
    chars = open('src/characters.js').read()
    open(f'case-{name}.html','w').write(page(name, case, title, chars))           # 배포용: assets 폴더 참조
    open(f'preview-{name}.html','w').write(page(name, inline(case), title, inline(chars))) # 미리보기용: 그림을 파일 안에 넣음
print('built')
