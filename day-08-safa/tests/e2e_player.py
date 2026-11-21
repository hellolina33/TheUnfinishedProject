from playwright.sync_api import sync_playwright
import os; os.makedirs('shots/v6',exist_ok=True)
import json
A='http://localhost:8765/day-08-safa/app/'
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,locale='fr-FR',timezone_id='Europe/Paris')
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and 'net::' not in m.text and errs.append('console:'+m.text))
    pg.goto(A+'#/welcome');pg.wait_for_timeout(800);pg.click('#go');pg.wait_for_timeout(600);pg.fill('#city input','Paris');pg.wait_for_timeout(600);pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.click('#done');pg.wait_for_timeout(800)
    pg.goto(A+'#/quran/2');pg.wait_for_timeout(1500);pg.screenshot(path='shots/v6/01_reader.png')
    pg.evaluate('window.scrollTo(0,20000)');pg.wait_for_timeout(600)
    r=pg.evaluate("()=>{const r=document.querySelector('#pl').getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),innerHeight,scrollY]}");print('player',r)
    pg.screenshot(path='shots/v6/02_scrolled.png')
    pg.click('#pmore');pg.click('#pmode');pg.wait_for_timeout(400);pg.screenshot(path='shots/v6/03_modes.png');pg.click('[data-grp="10"]');pg.click('[data-pm="repeat"]');pg.wait_for_timeout(200);pg.screenshot(path='shots/v6/04_modes_set.png');pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    pg.evaluate("()=>window.scrollTo(0,0)");pg.wait_for_timeout(300);pg.click('#tjleg');pg.wait_for_timeout(400);pg.screenshot(path='shots/v6/05_tjleg.png');pg.keyboard.press('Escape')
    pg.goto(A+'#/quran/113');pg.wait_for_timeout(1300);pg.screenshot(path='shots/v6/06_falaq.png')
    # auto-advance: set mode next, group 0, simulate last verse ended
    res=pg.evaluate("""async()=>{const PL=await import('./js/player.js');PL.setMode('next',0);PL.P.v=5;PL.P.mode='off';PL.P.gB=0;PL.__ended();await new Promise(r=>setTimeout(r,1500));return [PL.P.s,location.hash]}""");print('auto',res)
    pg.wait_for_timeout(800);pg.screenshot(path='shots/v6/07_next.png')
    res=pg.evaluate("""async()=>{const PL=await import('./js/player.js');PL.stop();PL.setMode('stop',2);PL.playFrom(1);await new Promise(r=>setTimeout(r,200));const a=[PL.P.gA,PL.P.gB];PL.P.v=2;PL.__ended();return [a,PL.P.v]}""");print('group stop',res)
    res=pg.evaluate("""async()=>{const PL=await import('./js/player.js');PL.setMode('repeat',2);PL.playFrom(3);PL.P.v=4;PL.__ended();return [PL.P.gA,PL.P.gB,PL.P.v]}""");print('group repeat',res)
    pg.click('#psprev');pg.wait_for_timeout(1300);print('prev btn',pg.evaluate('location.hash'))
    pg.click('#psnext');pg.wait_for_timeout(1300);print('next btn',pg.evaluate('location.hash'))
    pg.goto(A+'#/today');pg.wait_for_timeout(600);print('player gone',pg.evaluate("document.querySelectorAll('.player').length"))
    print(json.dumps({'errors':errs}))
    b.close()
