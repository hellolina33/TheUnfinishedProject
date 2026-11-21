from playwright.sync_api import sync_playwright
import os; os.makedirs('shots/v2',exist_ok=True); os.makedirs('shots/v4',exist_ok=True); os.makedirs('shots/v3',exist_ok=True)
import json
A='http://localhost:8765/day-08-safa/'
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='fr-FR',timezone_id='Europe/Paris',accept_downloads=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('console:'+m.text))
    n=[0]
    def snap(name,full=False):
        n[0]+=1;pg.screenshot(path=f'shots/v4/{n[0]:02d}_{name}.png',full_page=full)
    pg.goto(A+'app/#/welcome');pg.wait_for_timeout(1000);pg.click('#go');pg.wait_for_timeout(900);snap('onb2_suggest')
    pg.fill('#city input','Lyo');pg.wait_for_timeout(700);pg.keyboard.press('ArrowDown');pg.wait_for_timeout(200);snap('onb_kbd')
    pg.keyboard.press('Enter');pg.wait_for_timeout(500);pg.click('#done');pg.wait_for_timeout(1200)
    # seed 3 empty days in the past, so pause hint shows
    pg.evaluate("""()=>{const s=JSON.parse(localStorage.getItem('safa.app.v1'));const d=new Date(Date.now()-5*864e5);s.since=d.toISOString().slice(0,10);localStorage.setItem('safa.app.v1',JSON.stringify(s));}""")
    pg.goto(A+'app/#/today');pg.reload();pg.wait_for_timeout(1500);snap('today',True)
    pg.goto(A+'app/#/quran/2/10');pg.wait_for_timeout(1500);pg.goto(A+'app/#/quran');pg.wait_for_timeout(500);pg.goto(A+'app/#/quran/2');pg.wait_for_timeout(1500);snap('reader_resume')
    pg.click('#pmore');pg.click('#psl');pg.wait_for_timeout(400);snap('timer');pg.click('[data-sl=end]');pg.wait_for_timeout(400);snap('timer_set')
    pg.click('#prc');pg.wait_for_timeout(400);snap('reciters');pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    pg.click('[data-ctx="3"]');pg.wait_for_timeout(1500);snap('tafsir')
    if pg.query_selector('[data-more]'): pg.click('[data-more]');pg.wait_for_timeout(300);snap('tafsir_more')
    pg.click('#tcmp');pg.wait_for_timeout(300);pg.click('[data-tk=en-ibnkathir]');pg.wait_for_timeout(1500);snap('tafsir_cmp')
    pg.keyboard.press('Escape');pg.wait_for_timeout(300)
    pg.goto(A+'app/#/duas');pg.wait_for_timeout(1300);snap('duas',True)
    pg.goto(A+'app/#/duas/1');pg.wait_for_timeout(1300);snap('dua')
    g=pg.query_selector('[data-grade]')
    if g: g.click();pg.wait_for_timeout(400);snap('grade_toast')
    with pg.expect_download() as dl: pg.click('[data-img] >> nth=0')
    dl.value.save_as('shots/v4/dua.png')
    pg.goto(A+'app/#/settings');pg.wait_for_timeout(1200);snap('settings');pg.click('a[href="#/settings/data"]');pg.wait_for_timeout(600);snap('settings_jump')
    pg.goto(A+'app/#/track');pg.wait_for_timeout(1000);pg.click('.daytxt summary');pg.click('#pz');pg.wait_for_timeout(400);snap('pause_sheet');pg.click('[data-pd="3"]');pg.wait_for_timeout(500);snap('track_paused',True)
    pg.goto(A+'app/#/learn/salat');pg.wait_for_timeout(800)
    for _ in range(3): pg.click('#sn');pg.wait_for_timeout(150)
    snap('step');
    if pg.query_selector('#sph'): pg.click('#sph');pg.wait_for_timeout(300);snap('step_phon')
    pg.goto(A+'app/#/qibla');pg.wait_for_timeout(800);snap('qibla')
    pg.goto(A+'fr/');pg.wait_for_timeout(1000);pg.click('.vidbtn');pg.wait_for_timeout(1500);snap('landing_video')
    print(json.dumps({'errors':errs}))
    b.close()
