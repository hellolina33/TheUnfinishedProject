"""Wave 7 checks: the 100 UX improvements and the make-up prayers reset.
Run a static server at the repo root on :8765, then: python3 tests/e2e_wave7.py"""
from playwright.sync_api import sync_playwright
import json, sys
A = 'http://localhost:8765/day-08-safa/app/'
LOC = {"name": "Paris", "country": "France", "iso2": "FR", "lat": 48.8566, "lng": 2.3522, "tz": "Europe/Paris"}
fails = []
def ok(cond, msg):
    print(('PASS ' if cond else 'FAIL ') + msg)
    if not cond: fails.append(msg)
def start(p, state, lang='fr'):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, locale='fr-FR', timezone_id='Europe/Paris')
    st = {"onboarded": True, "lang": lang, **state}
    ctx.add_init_script("if(!sessionStorage.getItem('x')){localStorage.setItem('safa.app.v1',JSON.stringify(%s));sessionStorage.setItem('x',1)}" % json.dumps(st))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    return b, ctx, pg, errs
with sync_playwright() as p:
    # 1. First visit without a city: the Pray tab still offers the guide.
    b, ctx, pg, errs = start(p, {"onboarded": False, "loc": None})
    pg.goto(A + '#/today'); pg.wait_for_timeout(700)
    ok(pg.locator('a[href="#/journey/prayer"]').count() > 0 and pg.locator('a[href="#/setup"]').count() > 0, 'no city: guide and city choice on Pray')
    pg.goto(A + '#/welcome'); pg.wait_for_timeout(500)
    ok(pg.locator('#go').count() == 1 and pg.locator('a[href="#/quran/1"][data-start]').count() == 1, 'first launch: three starting choices')
    ok(not errs, 'no errors on first visit'); b.close()
    # 2. Old state (no timestamps, huge make-up counts): clamps and resets.
    b, ctx, pg, errs = start(p, {"loc": LOC, "q": {"last": {"s": 114, "v": 1, "n": "An-Nas"}}, "qada": {"on": True, "p": {"fajr": 748615, "dhuhr": 748615, "asr": 748615, "maghrib": 748615, "isha": 748609}, "fast": 3, "perDay": 1, "started": True}})
    pg.goto(A + '#/qada'); pg.wait_for_timeout(700)
    ok(pg.eval_on_selector('[data-qn="fajr"]', 'e=>e.value') == '29220', 'qada: old counts clamped to 80 years')
    pg.click('#qreset'); pg.wait_for_timeout(300); pg.click('[data-qr="p"]'); pg.wait_for_timeout(300)
    ok(pg.eval_on_selector_all('.qn', 'e=>e.map(x=>x.value)') == ['0', '0', '0', '0', '0', '3'], 'qada: reset the five prayers, fasts kept')
    pg.click('#qundo'); pg.wait_for_timeout(300)
    ok(pg.eval_on_selector('[data-qn="isha"]', 'e=>e.value') == '29220', 'qada: undo restores')
    pg.goto(A + '#/home'); pg.wait_for_timeout(700)
    ok('114:1' in pg.inner_text('.home-quick'), 'home: resume shows the verse reference')
    ok(pg.locator('#home-hero').evaluate('e=>e.tagName') == 'A', 'home: whole next-prayer card is a link')
    pg.click('[data-unpin="duas"]'); pg.wait_for_timeout(300)
    ok(pg.locator('#pin-undo').count() == 1, 'home: unpin offers undo')
    pg.click('#pin-undo'); pg.wait_for_timeout(300)
    ok(pg.locator('[data-unpin="duas"]').count() == 1, 'home: undo puts the shortcut back')
    # Prayer times
    pg.goto(A + '#/today'); pg.wait_for_timeout(700)
    ok(pg.locator('.chk').count() == 0, 'today: no tick boxes when tracking was never used')
    pg.click('#tacts'); pg.wait_for_timeout(300); pg.click('[data-a="trk"]'); pg.wait_for_timeout(400)
    ok(pg.locator('.chk').count() == 5, 'today: tracking can be turned on')
    ok(' s' not in pg.inner_text('#cd'), 'today: countdown in minutes')
    # Reader: compact player, word panel, settings groups
    pg.goto(A + '#/quran/2'); pg.wait_for_timeout(1500)
    ok(not pg.locator('#pseek').is_visible(), 'reader: player compact by default')
    pg.click('#pmore'); pg.wait_for_timeout(200)
    ok(pg.locator('#pseek').is_visible(), 'reader: player expands on demand')
    pg.locator('#v2 button.w').first.click(); pg.wait_for_timeout(400)
    ok(pg.locator('#wlisten').count() == 1, 'reader: word panel opens with an explicit Listen button')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    pg.click('#rset'); pg.wait_for_timeout(700)
    ok(pg.locator('.sbody .shd').count() == 4, 'reader settings: Text, Listening, Memorise, Offline')
    pg.click('[data-dl="all"]'); pg.wait_for_timeout(300)
    ok(pg.locator('#dlconfirm .card').count() == 1, 'reader: whole-Quran download asks first')
    pg.click('[data-hide="2"]'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    ok(pg.locator('#unhide').count() == 1, 'reader: hidden words show a way back')
    # Search
    pg.goto(A + '#/ask'); pg.wait_for_timeout(500)
    pg.fill('#aq', '2:255'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1500)
    ok(pg.locator('.quote.exact').count() == 1, 'search: exact verse first for 2:255')
    pg.fill('#aq', 'dohr'); pg.keyboard.press('Enter'); pg.wait_for_timeout(1200)
    ok(pg.locator('a[href="#/journey/prayer/dhuhr"]').count() == 1, 'search: dohr finds the Dhuhr guide')
    ok(pg.locator('#arec .chip').count() >= 1, 'search: recent searches kept')
    # FAQ deep link, settings sections
    pg.goto(A + '#/journey/faq/26'); pg.wait_for_timeout(900)
    ok(pg.locator('#faq-26[open]').count() == 1, 'faq: a question has its own address')
    pg.goto(A + '#/settings'); pg.wait_for_timeout(600)
    ok(pg.locator('.sidx .home-row').count() == 6, 'settings: six short entries')
    pg.goto(A + '#/settings/times'); pg.wait_for_timeout(600)
    ok(pg.locator('[data-sec="times"] details.adv:not([open])').count() == 1, 'settings: minute offsets in advanced')
    pg.goto(A + '#/duas/27/2'); pg.wait_for_timeout(700)
    ok(pg.locator('article.dua:not([hidden])').count() == 1 and pg.locator('#dall').count() == 1, 'duas: opens on one invocation')
    ok(not errs, 'no errors: ' + '; '.join(errs)); b.close()
print('\n%d failure(s)' % len(fails)); sys.exit(1 if fails else 0)
