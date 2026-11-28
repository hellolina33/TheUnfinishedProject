"""Wave 8 checks: hizb quarters, pages, reader position, khatm by hizb, home moment, tasbih, glossary, sources, themes.
Run a static server at the repo root on :8765, then: python3 tests/e2e_wave8.py"""
from playwright.sync_api import sync_playwright
import json, sys
A = 'http://localhost:8765/day-08-safa/app/'
LOC = {"name": "Paris", "country": "France", "iso2": "FR", "lat": 48.8566, "lng": 2.3522, "tz": "Europe/Paris"}
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
def start(p, extra=None, lang='fr'):
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, locale='fr-FR', timezone_id='Europe/Paris')
    st = {"onboarded": True, "lang": lang, "loc": LOC}; st.update(extra or {})
    ctx.add_init_script("if(!sessionStorage.getItem('x')){localStorage.setItem('safa.app.v1',JSON.stringify(%s));sessionStorage.setItem('x',1)}" % json.dumps(st))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); return b, pg, errs
with sync_playwright() as p:
    b, pg, errs = start(p, {"q": {"last": {"s": 2, "v": 80, "n": "Al-Baqarah", "at": 5}}})
    pg.goto(A + '#/quran'); pg.wait_for_timeout(800); pg.click('[data-tab="hizb"]'); pg.wait_for_timeout(2000)
    ok(pg.locator('.hzrow').count() == 60 and pg.locator('.hzq a').count() == 180, 'hizb list with 3 quarter links each')
    ok('2:92' in pg.inner_text('.hzrow >> nth=1'), 'hizb 2 quarter starts at 2:92')
    ok('min' in pg.inner_text('[data-dur="1"]'), 'hizb listening time shown')
    pg.click('[data-tab="pages"]'); pg.wait_for_timeout(400); ok(pg.locator('#ql .srow').count() == 604, '604 pages')
    pg.goto(A + '#/quran'); pg.wait_for_timeout(500); ok(pg.locator('[data-tab="pages"][aria-selected="true"]').count() == 1, 'tab remembered')
    pg.fill('#qs', 'juz 30'); pg.wait_for_timeout(600); ok('78:1' in pg.inner_text('#ql'), 'search juz 30 -> 78:1')
    pg.goto(A + '#/quran/2/70'); pg.wait_for_timeout(2000)
    ok('hizb 1' in pg.inner_text('#rpos').lower() and 'médinoise' in pg.inner_text('#rpos').lower(), 'reader header shows place and hizb')
    ok(pg.locator('.rubm').count() >= 10, 'quarter markers in Al-Baqarah')
    pg.goto(A + '#/quran/7/200'); pg.wait_for_timeout(1800); pg.click('[data-sajda="206"]'); pg.wait_for_timeout(300)
    ok('hanafite' in pg.inner_text('.sheet'), 'sajda explanation'); pg.keyboard.press('Escape')
    pg.goto(A + '#/khatm'); pg.wait_for_timeout(600); pg.click('[data-hz="2"][data-hd="30"] >> nth=0'); pg.wait_for_timeout(300)
    ok('hizb' in pg.inner_text('#view').lower() and '30' in pg.inner_text('#view'), 'khatm by hizb')
    pg.goto(A + '#/home'); pg.wait_for_timeout(1500)
    ok(pg.locator('#votd .ar').inner_text().strip() != '', 'verse of the day loaded')
    ok(pg.locator('#home-language').count() == 0, 'language selector moved off Home')
    pg.goto(A + '#/tasbih'); pg.wait_for_timeout(400); [pg.click('#tb') for _ in range(5)]
    ok(pg.inner_text('#tn') == '5', 'tasbih counts')
    pg.goto(A + '#/journey/glossary'); pg.wait_for_timeout(800); ok(pg.locator('.gloss dt').count() >= 25, 'glossary')
    ok(pg.locator('[data-jlang]').count() == 0, 'no language chips on Learn pages')
    pg.goto(A + '#/journey/sources'); pg.wait_for_timeout(800); ok('quran-meta' in pg.inner_text('#view'), 'sources page')
    pg.goto(A + '#/journey/tajweed'); pg.wait_for_timeout(1200); ok(pg.locator('.tjr').count() == 5, 'tajweed page')
    pg.goto(A + '#/ask'); pg.wait_for_timeout(500); pg.click('#aex .chip >> nth=0'); pg.wait_for_timeout(2500)
    ok(pg.locator('#ao .quote').count() >= 5, 'theme search shows chosen verses')
    pg.goto(A + '#/hifz'); pg.wait_for_timeout(800); ok(pg.locator('.hm').count() == 114, 'memorisation map')
    pg.goto(A + '#/qibla'); pg.wait_for_timeout(600)
    pg.goto(A + '#/settings/times'); pg.wait_for_timeout(700); ok(pg.locator('[data-iq]').count() == 5, 'iqama settings')
    ok(not errs, 'no errors ' + ';'.join(errs)); b.close()
print('\n%d failure(s)' % len(fails)); sys.exit(1 if fails else 0)
