import subprocess

def set_env(name, value):
    p = subprocess.Popen(
        ['vercel', 'env', 'add', name, 'production', '--scope', 'anndh55s-projects', '--yes'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = p.communicate(input=value.encode('utf-8'))
    status = 'OK' if p.returncode == 0 else 'FAIL'
    print(status + ' - ' + name)

set_env('QINIU_BUCKET', 'an-huan-photos')
set_env('QINIU_ACCESS_KEY', 'pr4FE7tH9lLEZke1zC60x5iywPvq2Lr3Xd4XPFsS')
set_env('QINIU_SECRET_KEY', 'AYJpEWuOXJyM0XOcXPzUegkv_27GSIoZ6-MaGZla')
set_env('QINIU_ZONE', 'z2')
print('Done')
