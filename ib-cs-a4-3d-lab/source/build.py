import sys,glob,re
S='src/'
def rd(f):return open(S+f,encoding='utf8').read()
local = len(sys.argv)>1 and sys.argv[1]=='local'
three = '<script>'+open('test/node_modules/three/build/three.min.js',encoding='utf8').read()+'</script>' if local else '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
order=['core.js','helpers.js','scenes1.js']+sorted(glob.glob(S+'scenes[2-9]*.js') and [f.split('/')[-1] for f in glob.glob(S+'scenes[2-9]*.js')])+['content1.js']+sorted([f.split('/')[-1] for f in glob.glob(S+'content[2-9]*.js')])+['app.js']
js='\n'.join(rd(f) for f in order)
html=rd('head.html')+'\n'+rd('body.html')+'\n'+three+'\n<script>\n'+js+'\nboot();\n</script>\n'
out='test/index.html' if local else 'dist.html'
open(out,'w',encoding='utf8').write(html)
print(out,len(html)//1024,'KB',order)
