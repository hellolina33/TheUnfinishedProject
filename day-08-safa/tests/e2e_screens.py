from playwright.sync_api import sync_playwright
import os; os.makedirs('shots/v2',exist_ok=True); os.makedirs('shots/v4',exist_ok=True); os.makedirs('shots/v3',exist_ok=True)
A='http://localhost:8765/day-08-safa/app/'
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='fr-FR',timezone_id='Europe/Paris',geolocation={'latitude':48.857,'longitude':2.352},permissions=['geolocation'])
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(A);pg.wait_for_timeout(900);pg.click('#go');pg.click('#geo');pg.wait_for_timeout(2000);pg.click('#done');pg.wait_for_timeout(1500)
    n=0
    def snap(nm,full=False):
        global n;n+=1;pg.screenshot(path=f'shots/v2/w3_{n:02d}_{nm}.png',full_page=full)
    snap('today',True)
    for h,nm in [('#/learn','learn'),('#/learn/salat','salat1'),('#/qibla','qibla'),('#/calendar','cal'),('#/qada','qada'),('#/flight','flight'),('#/hifz','hifz'),('#/mydua','mydua'),('#/duas','duas')]:
        pg.goto(A+h);pg.wait_for_timeout(1200);snap(nm)
    pg.goto(A+'#/learn/salat');pg.wait_for_timeout(800)
    for _ in range(3): pg.click('#sn')
    snap('salat_ruku')
    for _ in range(8): pg.click('#sn')
    pg.click('#sfin');pg.wait_for_timeout(500);snap('salat_done')
    pg.goto(A+'#/duas');pg.wait_for_timeout(900);pg.click('[data-feel="Anxiety"]');pg.wait_for_timeout(600);snap('anx')
    pg.goto(A+'#/quran');pg.wait_for_timeout(900);pg.fill('#qs','kursi');pg.wait_for_timeout(900);snap('kursi')
    pg.goto(A+'#/settings');pg.wait_for_timeout(900);snap('settings',True)
    # back button returns to previous
    pg.goto(A+'#/duas');pg.wait_for_timeout(700);pg.goto(A+'#/duas/1');pg.wait_for_timeout(900);pg.click('header.sub > a.ib');pg.wait_for_timeout(700);print('back→',pg.url)
    print('errors',errs);b.close()
