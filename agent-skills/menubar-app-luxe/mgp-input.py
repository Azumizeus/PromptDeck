#!/usr/bin/env python3
"""Outils d'input synthétique macOS pour l'audit E2E (CoreGraphics via ctypes).
Usage :
  python3 mgp-input.py mouse X Y        # déplace + clic gauche réel
  python3 mgp-input.py move X Y         # déplace le pointeur SANS cliquer (test stabilité)
  python3 mgp-input.py type "texte"     # tape du texte (unicode)
  python3 mgp-input.py key CODE [mods]  # keycode (36=Entrée, 53=Escape); mods: cmd,alt,shift,ctrl

⚠️ Incident du 25/09 (rapport Python-2026-09-25-135942.ips) : la 1ʳᵉ version SANS les
prototypes restype/argtypes ci-dessous segfaultait dans SLEventPost — ctypes tronquait
les CGEventRef 64 bits en 32 bits (adresse 0xffffffff… = extension de signe). Ne jamais
retirer ces déclarations.
"""
import sys, ctypes, ctypes.util, time

cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")

class CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]

# prototypes indispensables : sans restype explicite, ctypes tronque les CF*Ref en 32 bits → segfault
cg.CGEventCreateKeyboardEvent.restype = ctypes.c_void_p
cg.CGEventCreateKeyboardEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint16, ctypes.c_bool]
cg.CGEventCreateMouseEvent.restype = ctypes.c_void_p
cg.CGEventCreateMouseEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint32, CGPoint, ctypes.c_uint32]
cg.CGEventSetLocation.argtypes = [ctypes.c_void_p, CGPoint]
cg.CGEventSetFlags.argtypes = [ctypes.c_void_p, ctypes.c_uint64]
cg.CGEventKeyboardSetUnicodeString.argtypes = [ctypes.c_void_p, ctypes.c_ulong, ctypes.c_wchar_p]
cg.CGEventPost.argtypes = [ctypes.c_uint32, ctypes.c_void_p]

# éviter le warning d'accessibilité : activer AXManualAccessibility côté cible n'est pas
# nécessaire pour CGEventPost (session console active suffit).
kCGHIDEventTap = 0
kCGEventMouseMoved = 5
kCGEventLeftMouseDown = 1
kCGEventLeftMouseUp = 2
kCGEventKeyDown = 10
kCGEventKeyUp = 11
kCGKeyboardEventKeyDown = 10

def post(ev_type, pos=None, key=0, flags=0, unicode=None):
    ev = cg.CGEventCreateKeyboardEvent(None, key, ev_type in (kCGEventKeyDown, kCGKeyboardEventKeyDown))
    if pos is not None:
        cg.CGEventSetLocation(ev, pos)
    if flags:
        cg.CGEventSetFlags(ev, flags)
    if unicode:
        buf = ctypes.create_unicode_buffer(unicode)
        cg.CGEventKeyboardSetUnicodeString(ev, len(unicode), buf)
    cg.CGEventPost(kCGHIDEventTap, ev)

def mouse_click(x, y):
    p = CGPoint(float(x), float(y))
    mv = cg.CGEventCreateMouseEvent(None, kCGEventMouseMoved, p, 0)
    cg.CGEventPost(kCGHIDEventTap, mv)
    time.sleep(0.12)
    down = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, p, 0)
    cg.CGEventPost(kCGHIDEventTap, down)
    time.sleep(0.06)
    up = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, p, 0)
    cg.CGEventPost(kCGHIDEventTap, up)

def mouse_move(x, y):
    """Déplace le pointeur sans cliquer (séro-compatible, pour tests de stabilité)."""
    p = CGPoint(float(x), float(y))
    mv = cg.CGEventCreateMouseEvent(None, kCGEventMouseMoved, p, 0)
    cg.CGEventPost(kCGHIDEventTap, mv)

cg.CGEventCreateScrollWheelEvent.restype = ctypes.c_void_p
cg.CGEventCreateScrollWheelEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_uint32, ctypes.c_int32]

def scroll(x, y, ticks):
    """Molette synthétique au point (x, y) : ticks > 0 = haut, < 0 = bas."""
    p = CGPoint(float(x), float(y))
    mv = cg.CGEventCreateMouseEvent(None, kCGEventMouseMoved, p, 0)
    cg.CGEventPost(kCGHIDEventTap, mv)
    time.sleep(0.1)
    for _ in range(abs(int(ticks))):
        ev = cg.CGEventCreateScrollWheelEvent(None, 0, 1, -3 if ticks > 0 else 3)
        cg.CGEventPost(kCGHIDEventTap, ev)
        time.sleep(0.05)

def type_text(text):
    for ch in text:
        post(kCGEventKeyDown, key=0, unicode=ch)
        post(kCGEventKeyUp, key=0, unicode=ch)
        time.sleep(0.012)

MODS = {"cmd": 0x100000, "alt": 0x80000, "shift": 0x20000, "ctrl": 0x40000}

KCD = {"down": 1, "dragged": 6, "up": 2}  # kCGEventLeftMouse*

def cdgevent(variant, x, y):
    """Poste UN événement souris CG brut (down/dragged/up) au point écran (x,y)."""
    t = KCD[variant]
    pt = CGPoint(float(x), float(y))
    ev = cg.CGEventCreateMouseEvent(None, t, pt, 0)
    cg.CGEventPost(kCGHIDEventTap, ev)

def drag(x1, y1, x2, y2, steps=24):
    """Glisser réel : bouton enfoncé en (x1,y1), déplacements interpolés, relâche en (x2,y2)."""
    p1 = CGPoint(float(x1), float(y1))
    down = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseDown, p1, 0)
    cg.CGEventPost(kCGHIDEventTap, down)
    time.sleep(0.09)
    for i in range(1, steps + 1):
        x = x1 + (x2 - x1) * i / steps
        y = y1 + (y2 - y1) * i / steps
        mv = cg.CGEventCreateMouseEvent(None, cg.kCGEventLeftMouseDragged if hasattr(cg, 'kCGEventLeftMouseDragged') else 6, CGPoint(float(x), float(y)), 0)
        cg.CGEventPost(kCGHIDEventTap, mv)
        time.sleep(0.012)
    up = cg.CGEventCreateMouseEvent(None, kCGEventLeftMouseUp, CGPoint(float(x2), float(y2)), 0)
    cg.CGEventPost(kCGHIDEventTap, up)

def key_code(code, mods=()):
    flags = 0
    for m in mods:
        flags |= MODS.get(m, 0)
    post(kCGEventKeyDown, key=int(code), flags=flags)
    post(kCGEventKeyUp, key=int(code), flags=flags)

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "mouse":
        mouse_click(sys.argv[2], sys.argv[3])
    elif cmd == "drag":
        drag(*[float(v) for v in sys.argv[2:6]])
    elif cmd == "cdgevent":
        cdgevent(sys.argv[2], float(sys.argv[3]), float(sys.argv[4]))
    elif cmd == "move":
        mouse_move(sys.argv[2], sys.argv[3])
    elif cmd == "scroll":
        scroll(sys.argv[2], sys.argv[3], int(sys.argv[4]))
    elif cmd == "type":
        type_text(sys.argv[2])
    elif cmd == "key":
        key_code(sys.argv[2], sys.argv[3:])
    else:
        sys.exit("commande inconnue: " + cmd)
