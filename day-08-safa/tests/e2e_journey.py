from playwright.sync_api import sync_playwright
import os; os.makedirs('shots/v2',exist_ok=True); os.makedirs('shots/v4',exist_ok=True); os.makedirs('shots/v3',exist_ok=True)
import json,sys
A='http://localhost:8765/day-08-safa/app/'
loc=sys.argv[1] if len(sys.argv)>1 else 'fr-FR'
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale=loc,timezone_id='Europe/Paris',geolocation={'latitude':48.857,'longitude':2.352},permissions=['geolocation'])
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('console:'+m.text))
    n=[0];tag=loc[:2]
    def snap(name,full=False):
        n[0]+=1;pg.screenshot(path=f'shots/v2/{tag}_{n[0]:02d}_{name}.png',full_page=full)
    pg.goto(A);pg.wait_for_timeout(1200);snap('onb1')
    pg.click('#go');pg.wait_for_timeout(400);snap('onb2')
    pg.fill('#city input','Par');pg.wait_for_timeout(700);snap('onb2_typing')
    pg.click('#geo');pg.wait_for_timeout(2500);pg.click('[data-lvl=back]');snap('onb2_done')
    pg.click('#done');pg.wait_for_timeout(1500);snap('today',True)
    pg.click('li.pr >> nth=0');pg.wait_for_timeout(500);snap('today_tick')
    for h,nm,full in [('#/track','track',True),('#/lessons','lessons',False),('#/quran','qlist',False),('#/quran/1','reader',False),('#/hifz','hifz',False),('#/khatm','khatm',False),('#/ask','ask',False),('#/duas','duas',False),('#/duas/1','dua',False),('#/about','about',True),('#/settings','settings',True)]:
        pg.goto(A+h);pg.wait_for_timeout(1300);snap(nm,full)
    pg.goto(A+'#/quran/1');pg.wait_for_timeout(1300);pg.click('[data-menu="2"] >> nth=0');pg.wait_for_timeout(500);snap('vmenu')
    pg.keyboard.press('Escape');pg.click('[data-ctx="2"]');pg.wait_for_timeout(1500);snap('ctx')
    pg.goto(A+'#/ask');pg.wait_for_timeout(800);pg.fill('#aq','je veux mourir');pg.wait_for_timeout(2000);snap('ask_distress')
    out['errors']=errs
    b.close()
print(json.dumps(out,ensure_ascii=False))
