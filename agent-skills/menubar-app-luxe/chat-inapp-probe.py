#!/usr/bin/env python3
"""Probe chat IN-APP pour smoke-test.sh : ouvre la modale 💬 du panneau RÉEL, envoie un
message test, vérifie le badge provider (.chatprov) sur la bulle via l'historique persisté
(présence de provider/model/latency sur le dernier message assistant).
Usage : chat-inapp-probe.py <répertoire de l'app>   →  imprime INAPP: PASS|FAIL|SKIP …
"""
import json, os, subprocess, sys, time

APP_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
PREFS = os.path.expanduser('~/Library/Application Support/megapack-menubar-luxe/mgp-prefs.json')

def ax(query):
    return subprocess.run(['osascript', '-e', query], capture_output=True, text=True, timeout=20).stdout.strip()

def clic(x, y):
    subprocess.run(['python3', os.path.join(APP_DIR, 'mgp-input.py'), 'mouse', str(x), str(y)], check=True)

def main():
    # Accessibilité disponible ? (le harnais en a besoin — sinon SKIP honnête)
    r = subprocess.run(['python3', os.path.join(APP_DIR, 'mgp-input.py'), 'move', '2000', '800'],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print('INAPP: SKIP — harnais CGEvent indisponible (droits TCC absents)')
        return
    # fenêtre panneau ?
    out = ax('tell application "System Events" to tell process "MEGA PACK"\n'
             'if (count of windows) > 0 then\n'
             '  set p to position of window 1\n'
             '  return (item 1 of p as text) & "," & (item 2 of p as text)\n'
             'else\n  return "NOWIN"\nend if\nend tell')
    if not out or out == 'NOWIN':
        subprocess.run(['open', '-a', 'MEGA PACK']); time.sleep(3)
        out = ax('tell application "System Events" to tell process "MEGA PACK"\n'
                 'set p to position of window 1\nreturn (item 1 of p as text) & "," & (item 2 of p as text)\nend tell')
        if not out or out == 'NOWIN':
            print('INAPP: SKIP — panneau non affiché')
            return
    wx, wy = (int(v) for v in out.split(',')[:2])
    # bouton 💬 du footer : rel(967..990, 722..740) → centre ≈ (978, 731)
    clic(wx + 978, wy + 731); time.sleep(1.6)
    # champ de saisie de la modale : rel(435..790, 490..515) → centre ≈ (560, 500)
    clic(wx + 560, wy + 500); time.sleep(0.5)
    subprocess.run(['python3', os.path.join(APP_DIR, 'mgp-input.py'), 'type', 'smoke test'], check=True)
    time.sleep(0.3)
    subprocess.run(['python3', os.path.join(APP_DIR, 'mgp-input.py'), 'key', '36'], check=True)
    # la cascade peut traverser les quarantaines → 25 s max
    deadline = time.time() + 25
    last = ''
    while time.time() < deadline:
        time.sleep(2)
        try:
            prefs = json.load(open(PREFS))
            chat = prefs.get('chat') or []
            if chat and chat[-1].get('role') == 'assistant' and chat[-1].get('provider'):
                m = chat[-1]
                print('INAPP: PASS badge=%s · %s ms · « %s »' % (m.get('provider'), m.get('latency'), str(m.get('content'))[:30]))
                return
            last = chat[-1].get('content', '')[:50] if chat else ''
        except Exception as e:
            last = str(e)[:50]
    print('INAPP: FAIL — pas de réponse badgée (dernier état : %s)' % last)

if __name__ == '__main__':
    main()
