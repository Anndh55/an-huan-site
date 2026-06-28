import sys, json
with open('/dev/stdin', 'r' if sys.platform != 'win32' else 'rb') as f:
    raw = f.read() if sys.platform != 'win32' else f.read().decode('utf-8')
    d = json.loads(raw)
for dep in d['deployments'][:5]:
    msg = dep['meta'].get('githubCommitMessage', 'no-git')[:50]
    print(f"{dep['url']} state={dep['state']} target={dep.get('target','?')} msg={msg}")
