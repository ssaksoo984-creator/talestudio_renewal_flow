"""전달용 단일 파일 만들기: python3 tools/build.py → dist/
- TaleStudio_리뉴얼_프로토타입.html : 프로토타입 + 사용자 플로우 (먼저 열 파일)
- TaleStudio_프로토타입_전체화면.html : 프로토타입만 크게 (플로우는 서랍)
CSS · JS를 파일 안에 넣는다. 플로우 그림 도구(mermaid)만 인터넷에서 불러온다."""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN, FULL = 'TaleStudio_리뉴얼_프로토타입.html', 'TaleStudio_프로토타입_전체화면.html'
css = open(os.path.join(ROOT, 'src/base.css'), encoding='utf-8').read()
js = {f: open(os.path.join(ROOT, 'src', f), encoding='utf-8').read() for f in ['flow.js', 'flowview.js', 'screens.js']}

def bundle(src, out):
    s = open(os.path.join(ROOT, src), encoding='utf-8').read()
    s = s.replace('<link rel="stylesheet" href="src/base.css">', '<style>\n' + css + '\n</style>')
    for f, c in js.items():
        s = s.replace('<script src="src/' + f + '"></script>', '<script>\n' + c.replace('</script', '<\\/script') + '\n</script>')
    s = re.sub(r"(['\"])flow\.html", r'\1' + MAIN, s)
    s = re.sub(r"(['\"])index\.html", r'\1' + FULL, s)
    if not s.lstrip().lower().startswith('<!doctype'):
        s = '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tale Studio 프로토타입</title>\n' + s
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    open(os.path.join(ROOT, 'dist', out), 'w', encoding='utf-8').write(s)

bundle('flow.html', MAIN)
bundle('index.html', FULL)
print('dist/' + MAIN, 'dist/' + FULL)

# 파일 하나로 끝: 프로토타입 + 사용자 플로우, 플로우 그림 도구까지 넣어서 인터넷 없이도 열린다
SINGLE = 'TaleStudio_리뉴얼_프로토타입_단일파일.html'
mm = os.path.join(ROOT, 'vendor/mermaid-10.9.1.min.js')
if os.path.exists(mm):
    s = open(os.path.join(ROOT, 'dist', MAIN), encoding='utf-8').read()
    s = re.sub(r'<a class="btn" id="protoOpen"[^>]*>[^<]*</a>', '', s)
    s = s.replace("$('protoOpen').href = ", "void ")
    s = s.replace('<script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>',
                  '<script>\n' + open(mm, encoding='utf-8').read().replace('</script', '<\\/script') + '\n</script>')
    open(os.path.join(ROOT, 'dist', SINGLE), 'w', encoding='utf-8').write(s)
    print('dist/' + SINGLE)
