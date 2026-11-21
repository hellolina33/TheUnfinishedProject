from playwright.sync_api import sync_playwright
import os; os.makedirs('shots/v5',exist_ok=True)
import json
A='http://localhost:8765/day-08-safa/'
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='fr-FR',timezone_id='Europe/Paris')
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('console:'+m.text))
    n=[0]
    def snap(name,full=False):
        n[0]+=1;pg.screenshot(path=f'shots/v5/{n[0]:02d}_{name}.png',full_page=full)
    pg.goto(A+'app/#/welcome');pg.wait_for_timeout(900);snap('onb1');pg.click('#go');pg.wait_for_timeout(700);pg.click('.citys [data-s="0"]');pg.wait_for_timeout(400);pg.click('#done');pg.wait_for_timeout(1000)
    pg.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('safa.app.v1'));s.lastSeen='2026-10-01';s.level='reg';localStorage.setItem('safa.app.v1',JSON.stringify(s));}""")
    pg.goto(A+'app/#/today');pg.reload();pg.wait_for_timeout(1300);snap('today_back')
    pg.goto(A+'app/#/learn');pg.wait_for_timeout(900);snap('learn',True)
    pg.click('[data-wk="0"]');pg.wait_for_timeout(300)
    pg.goto(A+'app/#/learn/salat/guided');pg.wait_for_timeout(2600);snap('guided')
    pg.goto(A+'app/#/quran');pg.wait_for_timeout(900);snap('qlist')
    pg.goto(A+'app/#/quran/112/1/coach-1-4');pg.wait_for_timeout(1500);snap('coach0')
    pg.click('#cskip');pg.wait_for_timeout(300)
    for _ in range(3): pg.click('#c1');pg.wait_for_timeout(150)
    snap('coach2');pg.click('#c2');pg.wait_for_timeout(300);snap('coach_next')
    pg.click('#rset');pg.wait_for_timeout(500);snap('aa')
    pg.keyboard.press('Escape')
    pg.goto(A+'app/#/quran/1');pg.wait_for_timeout(1200);pg.click('[data-ctx="2"]');pg.wait_for_timeout(1500);snap('tafsir')
    pg.keyboard.press('Escape')
    pg.goto(A+'app/#/hifz');pg.wait_for_timeout(900);pg.click('#hadd');pg.wait_for_timeout(400);snap('hifz')
    pg.goto(A+'app/#/settings/times');pg.wait_for_timeout(1300);pg.click('details.adv > summary');pg.click('.mosq summary');pg.wait_for_timeout(200);pg.fill('#mq-isha','20:00');pg.click('#smq');pg.wait_for_timeout(600);snap('settings_mosq')
    pg.goto(A+'app/#/settings/offline');pg.wait_for_timeout(600);snap('settings_audio');pg.goto(A+'app/#/settings/data');pg.wait_for_timeout(600);pg.click('.howto summary');pg.wait_for_timeout(300);snap('sync_howto')
    pg.goto(A+'ar/');pg.wait_for_timeout(1200);snap('landing_ar',True)
    pg.goto(A+'fr/');pg.wait_for_timeout(1000);snap('landing_fr')
    print(json.dumps({'errors':errs}))
    b.close()
