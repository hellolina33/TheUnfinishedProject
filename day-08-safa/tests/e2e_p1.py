"""P1 checks: notes, book mode, bookmarks, instant 2:255 and Ctrl+K, context and compare, sepia and translation size, month view, desktop panel.
Run a static server at the repo root on :8765, then: python3 tests/e2e_p1.py"""
from playwright.sync_api import sync_playwright
import json, sys
A = 'http://localhost:8765/day-08-safa/app/'
LOC = {"name": "Paris", "country": "France", "iso2": "FR", "lat": 48.8566, "lng": 2.3522, "tz": "Europe/Paris"}
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
def start(p, w=390, h=844, extra=None):
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': w, 'height': h}, locale='fr-FR', timezone_id='Europe/Paris')
    st = {"onboarded": True, "lang": "fr", "loc": LOC, "q": {"favs": ["2:255"]}}; st.update(extra or {})
    ctx.add_init_script("if(!sessionStorage.getItem('x')){localStorage.setItem('safa.app.v1',JSON.stringify(%s));sessionStorage.setItem('x',1)}" % json.dumps(st))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); return b, pg, errs
with sync_playwright() as p:
    b, pg, errs = start(p)
    pg.goto(A + '#/quran/2/255'); pg.wait_for_timeout(1800)
    # 1 notes
    pg.click('#v255 [data-note="255"]'); pg.wait_for_timeout(300); pg.fill('#ntext', 'Le Trône. À relire le soir.'); pg.click('#nsave'); pg.wait_for_timeout(300)
    ok(pg.locator('#v255 .vnote').count() == 1, 'note shown under the verse')
    # 3 bookmark
    pg.click('#v255 .vmenu'); pg.wait_for_timeout(300); pg.click('[data-a="mark"]'); pg.wait_for_timeout(300)
    pg.fill('[data-mn="0"]', 'Khatma'); pg.click('[data-ms="0"]'); pg.wait_for_timeout(300)
    ok(pg.evaluate("JSON.parse(localStorage.getItem('safa.app.v1')).q.marks[0].name") == 'Khatma', 'named bookmark saved')
    # 5 pin & compare
    pg.click('#v255 .vmenu'); pg.wait_for_timeout(300); pg.click('[data-a="pin"]'); pg.wait_for_timeout(300)
    pg.click('#v256 .vmenu'); pg.wait_for_timeout(300); pg.click('[data-a="pin"]'); pg.wait_for_timeout(300)
    ok(pg.locator('#cmpgo').count() == 1, 'pin bar appears')
    pg.click('#cmpgo'); pg.wait_for_timeout(1200); ok(pg.locator('.cmpcol').count() == 2, 'compare shows two verses'); pg.keyboard.press('Escape')
    # 2 book mode + 6 translation size
    pg.click('#rset'); pg.wait_for_timeout(600); pg.check('#sbook'); pg.click('[data-tfs="3"]'); pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
    ok(pg.locator('#rd.book.tfs3').count() == 1, 'book mode and large translation')
    ok(pg.evaluate("getComputedStyle(document.querySelector('#v255 .ar')).display") == 'none', 'book mode hides the Arabic')
    pg.screenshot(path='/tmp/p1_book.png')
    # notes list + export
    pg.goto(A + '#/quran'); pg.wait_for_timeout(700)
    ok(pg.locator('.mark').count() == 1, 'bookmark on the Quran list')
    pg.click('[data-tab="notes"]'); pg.wait_for_timeout(300)
    with pg.expect_download() as d: pg.click('[data-exp="md"]')
    ok(d.value.suggested_filename.endswith('.md'), 'notes export as Markdown')
    # 4 instant reference + Ctrl+K
    pg.goto(A + '#/today'); pg.wait_for_timeout(500); pg.keyboard.press('Control+k'); pg.wait_for_timeout(600)
    ok(pg.evaluate('location.hash') == '#/ask', 'Ctrl+K opens search')
    pg.type('#aq', '2:255', delay=30); pg.wait_for_timeout(900)
    ok(pg.locator('.quote.exact').count() == 1, '2:255 suggested while typing')
    pg.click('[data-ctxv]'); pg.wait_for_timeout(1500); ok(pg.locator('.cblk').count() == 7, 'read in context: 3 before, 3 after')
    pg.keyboard.press('Escape')
    # 6 sepia
    pg.goto(A + '#/settings/display'); pg.wait_for_timeout(500); pg.click('[data-theme="sepia"]'); pg.wait_for_timeout(300)
    ok(pg.evaluate("document.documentElement.classList.contains('sepia')"), 'sepia theme')
    # 7 month + paper
    pg.goto(A + '#/track'); pg.wait_for_timeout(600); pg.click('#paper'); pg.wait_for_timeout(300)
    ok(pg.locator('.mday.td .mq.paper').count() == 1, 'paper reading shows in the month')
    ok(not errs, 'no errors ' + ';'.join(errs)); b.close()
    # 8 desktop
    b, pg, errs = start(p, 1366, 900)
    pg.goto(A + '#/quran/2/255'); pg.wait_for_timeout(1800); pg.click('#v255 [data-ctx="255"]'); pg.wait_for_timeout(900)
    r = pg.evaluate("(()=>{const s=document.querySelector('.sheet').getBoundingClientRect(),v=document.querySelector('#view').getBoundingClientRect();return [Math.round(s.left),Math.round(s.height),Math.round(v.right)]})()")
    ok(r[0] > 900 and r[1] > 800 and r[2] <= r[0], 'desktop: panel on the right, text on the left %s' % r)
    pg.screenshot(path='/tmp/p1_desktop.png')
    ok(not errs, 'no errors on desktop'); b.close()
print('\n%d failure(s)' % len(fails)); sys.exit(1 if fails else 0)
