#!/usr/bin/env python3
# pilote-ecosysteme.py — le « pilote » de l'écosystème.
# Un petit serveur local qui attend une demande de réparation et remet
# omniroute en marche : rallume Docker s'il est éteint, démarre le conteneur,
# attend qu'il réponde. Lancé automatiquement par macOS au démarrage.
import json
import os
import shutil
import subprocess
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 8777
CONTENEUR = "practical_goldberg"

REGLAGES = os.path.expanduser("~/.config/ecosysteme/reglages.json")
JOURNAL_BILAN = os.path.expanduser("~/Library/Logs/bilan-ecosysteme.log")

_etat = {"enCours": False, "etape": "", "debut": None, "dernierResultat": None}


def binaire_docker():
    """Trouve la commande docker, même quand macOS ne connaît pas tous les dossiers."""
    p = shutil.which("docker")
    if p:
        return p
    for c in ["/usr/local/bin/docker", "/opt/homebrew/bin/docker",
              os.path.expanduser("~/.docker/bin/docker")]:
        if os.path.exists(c):
            return c
    return None


def lire_reglages():
    try:
        with open(REGLAGES, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def antiveille_actif():
    """Le Mac est-il maintenu éveillé par notre caffeinate (robot Telegram) ?"""
    code, out = cmd(["pmset", "-g", "assertions"], timeout=10)
    return code == 0 and "caffeinate command-line tool" in out


def probe_http(url, timeout=4):
    """Renvoie True si le service répond (n'importe quel code HTTP)."""
    code, _ = cmd(["curl", "-s", "-m", str(timeout), "-o", "/dev/null",
                   "-w", "%{http_code}", url], timeout=timeout + 2)
    return code == 0


def journal_extrait(chemin, n=6):
    p = os.path.expanduser(chemin)
    try:
        lignes = [l for l in open(p, encoding="utf-8", errors="replace").read().splitlines() if l.strip()]
        return lignes[-n:]
    except Exception:
        return ["(journal vide ou absent)"]


_cache_sonde = [0.0, {}]


def cerveau_en_vie():
    """Le cerveau du robot (routeur local FreeLLMAPI :8000, modèle auto) vit-il ?
    Vérifie la liste des modèles avec la clé FREELLMAPI_KEY (~/.secrets)."""
    try:
        cle = ""
        for l in open(os.path.expanduser("~/.secrets"), encoding="utf-8", errors="replace"):
            if l.startswith("FREELLMAPI_KEY="):
                cle = l.split("=", 1)[1].strip().strip('"').strip("'")
        req = urllib.request.Request(
            "http://127.0.0.1:8000/v1/models",
            headers={"Authorization": "Bearer " + cle})
        with urllib.request.urlopen(req, timeout=4) as r:
            return r.status == 200
    except Exception:
        return False


def telegram_infos():
    """État du robot Telegram + nombre de messages reçus aujourd'hui."""
    import glob
    import datetime
    actif = probe_http("http://127.0.0.1:23333/health", 3)
    aujourd_hui = datetime.date.today()
    n_msgs, dernier_ts = 0, None
    if actif:
        for f in glob.glob(os.path.expanduser(
                "~/.understudy/agent/sessions/*/*.jsonl")):
            try:
                if datetime.date.fromtimestamp(os.path.getmtime(f)) != aujourd_hui:
                    continue
                for l in open(f, encoding="utf-8", errors="replace"):
                    if '"user"' not in l:
                        continue
                    try:
                        e = json.loads(l)
                        m = e.get("message", e)
                    except Exception:
                        continue
                    if m.get("role") == "user":
                        n_msgs += 1
                        ts = m.get("timestamp") or e.get("timestamp")
                        if isinstance(ts, (int, float)) and ts > 0:
                            if ts > 1e12:  # horodatage en millisecondes → secondes
                                ts = ts / 1000
                            dernier_ts = max(dernier_ts or 0, ts)
            except Exception:
                continue
    return {"telegram": actif, "telegramMsgs": n_msgs,
            "telegramDernier": dernier_ts}


def understudy_sante():
    """Santé détaillée du robot Telegram (gateway Understudy, port 23333) :
    version, durée de vie, état du canal telegram, dernière réponse du bot
    et nombre d'images qu'elle contient (veille anti « images fantômes »)."""
    import glob
    sante = {"understudyVersion": None, "understudyUptime": None,
             "telegramRuntime": None, "understudyDerniere": None,
             "understudyDerniereAge": None, "imagesDerniere": None}
    # 1) /health : version + temps de vie du processus
    code, out = cmd(["curl", "-s", "-m", "4",
                     "http://127.0.0.1:23333/health"], timeout=8)
    if code == 0:
        try:
            h = json.loads(out)
            sante["understudyVersion"] = h.get("version")
            sante["understudyUptime"] = h.get("uptime")
        except Exception:
            pass
    # 2) /channels : le canal telegram tourne-t-il vraiment (pas juste le process) ?
    code, out = cmd(["curl", "-s", "-m", "4",
                     "http://127.0.0.1:23333/channels"], timeout=8)
    if code == 0:
        try:
            for ch in json.loads(out).get("channels", []):
                if ch.get("id") == "telegram":
                    sante["telegramRuntime"] = (ch.get("runtime") or {}).get("state")
        except Exception:
            pass
    # 3) dernière réponse du bot (sessions les plus récentes d'abord)
    fichiers = sorted(glob.glob(os.path.expanduser(
        "~/.understudy/agent/sessions/*/*.jsonl")),
        key=os.path.getmtime, reverse=True)
    for f in fichiers[:5]:
        dernier_asst = None
        try:
            for l in open(f, encoding="utf-8", errors="replace"):
                if '"assistant"' not in l:
                    continue
                try:
                    m = json.loads(l).get("message", {})
                except Exception:
                    continue
                if m.get("role") == "assistant":
                    dernier_asst = m
        except Exception:
            continue
        if not dernier_asst:
            continue
        ts = dernier_asst.get("timestamp")
        if isinstance(ts, (int, float)) and ts > 1e12:  # ms → s
            ts = ts / 1000
        if isinstance(ts, (int, float)) and ts > 0:
            sante["understudyDerniereAge"] = max(0, int(time.time() - ts))
        n_images, textes = 0, []
        for b in dernier_asst.get("content") or []:
            if not isinstance(b, dict):
                continue
            if b.get("type") == "image":
                n_images += 1
            elif b.get("type") == "text" and b.get("text"):
                textes.append(b["text"])
        sante["imagesDerniere"] = n_images
        texte = " ".join(textes).strip()
        if texte:
            sante["understudyDerniere"] = texte[:140] + ("…" if len(texte) > 140 else "")
        break
    return sante


def sonde():
    """Vérifie tous les services d'un coup (avec 5 s de cache pour ne pas marteler)."""
    if time.time() - _cache_sonde[0] < 5:
        return _cache_sonde[1]
    r = {
        "docker": docker_pret(),
        "omniroute": omniroute_en_vie(),
        "cdp": probe_http("http://127.0.0.1:9222/json/version"),
        "chatdeck": probe_http("http://127.0.0.1:5199"),
        "solscan": probe_http("http://127.0.0.1:3001/api/settings"),
        "opencode": cmd(["pgrep", "-x", "OpenCode"], timeout=5)[0] == 0,
        "agentmemory": probe_http("http://127.0.0.1:3114"),
        "understudy": probe_http("http://127.0.0.1:23333/health"),
        "cerveau": cerveau_en_vie(),
        "pilote": True,
        "antiveille": antiveille_actif(),
        **telegram_infos(),
        **understudy_sante(),
    }
    _cache_sonde[0], _cache_sonde[1] = time.time(), r
    return r


def relancer_navigateur_agents():
    """Rallume le navigateur des agents (CDP 9222) et rebranche les agents dessus."""
    u = f"gui/{os.getuid()}"
    cmd(["pkill", "-f", "remote-debugging-port=9222"])
    cmd(["launchctl", "bootout", u, "com.mickael.browser-use-cdp-keeper"])
    time.sleep(1)
    cmd(["launchctl", "bootstrap", u,
         os.path.expanduser("~/Library/LaunchAgents/com.mickael.browser-use-cdp-keeper.plist")])
    ok = attendre(lambda: probe_http("http://127.0.0.1:9222/json/version", 3), 40,
                  "relance du navigateur des agents…")
    if ok:
        # les agents gardaient l'ancienne adresse : le chien de garde les rebranche
        cmd(["pkill", "-f", "browser_harness.daemon"])
        cmd(["launchctl", "kickstart", u, "com.mickael.browser-use-watchdog"])
        time.sleep(5)
    return ok


def cmd(args, timeout=30):
    """Lance une commande, renvoie (code, texte). Ne bloque jamais longtemps."""
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except Exception as e:  # commande absente, délai dépassé…
        return 1, str(e)


def docker_pret():
    d = binaire_docker()
    if not d:
        return False
    code, _ = cmd([d, "info", "--format", "ok"], timeout=15)
    return code == 0


def omniroute_en_vie():
    code, _ = cmd(["curl", "-s", "-m", "8", "-o", "/dev/null", "-w", "%{http_code}",
                   "http://127.0.0.1:20128/v1/models"], timeout=15)
    return code == 0


def attendre(fonction, secondes_max, etape):
    debut = time.time()
    while time.time() - debut < secondes_max:
        if fonction():
            return True
        _etat["etape"] = f"{etape} ({int(time.time() - debut)} s)…"
        time.sleep(4)
    return fonction()


def reparer():
    try:
        _etat.update(enCours=True, etape="vérification du moteur…",
                     debut=time.time(), dernierResultat=None)
        # 0) Si omniroute répond déjà, rien à faire (cas le plus courant)
        if omniroute_en_vie():
            _etat.update(enCours=False, etape="", dernierResultat={
                "ok": True, "message": "omniroute était déjà en route — tout va bien ✅"})
            return
        # 1) Docker doit être allumé (le « sous-sol » de la machine)
        if not binaire_docker():
            _etat.update(enCours=False, etape="", dernierResultat={
                "ok": False,
                "message": "commande docker introuvable — ouvre l'application Docker à la main."})
            return
        for _ in range(3):
            if docker_pret():
                break
            _etat["etape"] = "Docker est éteint — je le rallume…"
            subprocess.run(["open", "-a", "Docker"], check=False)
            if attendre(docker_pret, 75, "attente du démarrage de Docker…"):
                break
        if not docker_pret():
            _etat.update(enCours=False, etape="", dernierResultat={
                "ok": False,
                "message": "Docker ne démarre pas — ouvre l'application Docker à la main."})
            return
        # 2) Si omniroute répond déjà, rien à faire
        if omniroute_en_vie():
            _etat.update(enCours=False, etape="", dernierResultat={
                "ok": True, "message": "omniroute était déjà en route — tout va bien ✅"})
            return
        # 3) Démarre le conteneur et attends qu'il réponde
        _etat["etape"] = "je démarre le moteur omniroute…"
        cmd([binaire_docker(), "start", CONTENEUR], timeout=30)
        ok = attendre(omniroute_en_vie, 90, "attente de la réponse d'omniroute…")
        duree = int(time.time() - (_etat.get("debut") or time.time()))
        _etat.update(enCours=False, etape="", dernierResultat={
            "ok": ok,
            "message": ("omniroute est de nouveau en ligne ✅" if ok
                        else "omniroute ne répond toujours pas — regarde l'application Docker."),
            "secondes": duree})
    except Exception as e:  # pragma: no cover
        _etat.update(enCours=False, etape="",
                     dernierResultat={"ok": False, "message": f"erreur : {e}"})


class Pilote(BaseHTTPRequestHandler):
    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        if self.path.startswith("/reglages"):
            # Les réglages de l'écosystème (pour le tableau de bord)
            reg = lire_reglages()
            reg.setdefault("voixBilan", True)
            reg.setdefault("voix", "Thomas")
            reg.setdefault("vitesse", 172)
            self._json(reg)
        elif self.path.startswith("/journaux"):
            # Extraits des journaux, pour le mémo d'urgence
            journaux = [("bilan du matin", "~/Library/Logs/bilan-ecosysteme.log"),
                        ("gardien IA", "~/Library/Logs/agents-premium-gardien.log"),
                        ("surveillance OpenCode", "~/Library/Logs/opencode-watch.log"),
                        ("navigateur agents", "~/Library/Logs/browser-use-cdp-keeper.log"),
                        ("robot Telegram", "~/Library/Logs/understudy-gateway.log"),
                        ("correctif images bot", "~/Library/Logs/understudy-imagepatch.log"),
                        ("pilote", "~/Library/Logs/pilote-ecosysteme.log")]
            self._json({"journaux": [{"nom": nom, "lignes": journal_extrait(ch)}
                                      for nom, ch in journaux]})
        elif self.path.startswith("/bilan"):
            # Le dernier bilan du matin, prêt à afficher
            try:
                with open(JOURNAL_BILAN, encoding="utf-8") as f:
                    lignes = f.read().splitlines()
                i = max(i for i, l in enumerate(lignes) if l.startswith("== Bilan du "))
                self._json({"texte": "\n".join(lignes[i:]).strip()})
            except Exception:
                self._json({"texte": "aucun bilan pour l'instant"})
        elif self.path.startswith("/status"):
            self._json({"enCours": _etat["enCours"], "etape": _etat["etape"],
                        "dernierResultat": _etat["dernierResultat"], **sonde()})
        elif self.path.startswith("/reparer-omniroute"):
            if _etat["enCours"]:
                self._json({"dejaEnCours": True, "etape": _etat["etape"]})
                return
            threading.Thread(target=reparer, daemon=True).start()
            self._json({"lance": True,
                        "message": "réparation lancée — 1 à 3 minutes en général."})
        else:
            self._json({"service": "pilote-ecosysteme",
                        "endpoints": ["/status", "/reparer-omniroute"]})

    def do_POST(self):
        # Le navigateur envoie d'abord une demande « OPTIONS » avant un POST ;
        # on y répond gentiment, et on traite POST comme GET.
        if self.path.startswith("/reglage"):
            # Change un réglage, ex. {"cle": "voixBilan", "valeur": false}
            longueur = int(self.headers.get("Content-Length") or 0)
            corps = self.rfile.read(longueur).decode("utf-8") if longueur else "{}"
            try:
                demande = json.loads(corps)
                cle, valeur = demande.get("cle"), demande.get("valeur")
                if cle == "voixBilan" and isinstance(valeur, bool):
                    pass  # oui/non : ok
                elif cle == "voix" and isinstance(valeur, str) and valeur and len(valeur) <= 40:
                    pass  # nom de voix : ok
                elif cle == "vitesse" and isinstance(valeur, int) and 100 <= valeur <= 300:
                    pass  # vitesse de lecture : ok
                else:
                    self._json({"ok": False, "erreur": "réglage ou valeur inconnue"}, code=400)
                    return
                try:
                    reg = lire_reglages()
                except Exception:
                    reg = {}
                reg[cle] = valeur
                os.makedirs(os.path.dirname(REGLAGES), exist_ok=True)
                with open(REGLAGES, "w", encoding="utf-8") as f:
                    json.dump(reg, f, ensure_ascii=False, indent=2)
                self._json({"ok": True, cle: valeur})
            except Exception as e:
                self._json({"ok": False, "erreur": str(e)}, code=400)
        elif self.path.startswith("/action"):
            # Les gestes d'urgence du mémo
            longueur = int(self.headers.get("Content-Length") or 0)
            corps = self.rfile.read(longueur).decode("utf-8") if longueur else "{}"
            try:
                action = json.loads(corps).get("action")
                if action == "tester-voix":
                    reg = lire_reglages()
                    subprocess.run(["say", "-v", str(reg.get("voix", "Thomas")),
                                    "-r", str(reg.get("vitesse", 172)),
                                    "Bonjour ! Voici ma voix pour le bilan du matin."],
                                   check=False)
                    self._json({"ok": True, "message": "voix de test jouée"})
                elif action == "relancer-navigateur":
                    ok = relancer_navigateur_agents()
                    self._json({"ok": ok, "message":
                                "navigateur des agents relancé ✅" if ok else
                                "le navigateur ne revient pas — regarde le journal « navigateur agents »"})
                elif action == "ouvrir-docker":
                    subprocess.run(["open", "-a", "Docker"], check=False)
                    self._json({"ok": True, "message": "application Docker ouverte"})
                elif action == "sonder-cerveau":
                    ok = cerveau_en_vie()
                    self._json({"ok": True, "vivant": ok,
                                "message": "cerveau du robot : " + ("✅ en vie" if ok else "❌ DOWN — plan de secours à l'œuvre")})
                elif action == "basculer-antiveille":
                    u = f"gui/{os.getuid()}"
                    if antiveille_actif():
                        cmd(["launchctl", "bootout", u, "com.mickaeldunoyer.robot-antiveille"])
                        time.sleep(2)
                        self._json({"ok": True, "actif": False,
                                    "message": "anti-veille désactivé — le Mac peut dormir"})
                    else:
                        cmd(["launchctl", "bootstrap", u,
                             os.path.expanduser(
                                 "~/Library/LaunchAgents/com.mickaeldunoyer.robot-antiveille.plist")])
                        time.sleep(2)
                        ok = antiveille_actif()
                        self._json({"ok": ok, "actif": ok,
                                    "message": "anti-veille activé — le Mac reste éveillé pour le robot"
                                    if ok else "impossible d'activer l'anti-veille"})
                else:
                    self._json({"ok": False, "erreur": "action inconnue"}, code=400)
            except Exception as e:
                self._json({"ok": False, "erreur": str(e)}, code=400)
        elif self.path.startswith("/reparer-omniroute"):
            self.do_GET()
        else:
            self._json({"erreur": "adresse inconnue"}, code=404)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, fmt, *args):
        print(time.strftime("%Y-%m-%d %H:%M:%S"), "-", fmt % args, flush=True)


if __name__ == "__main__":
    try:
        serveur = ThreadingHTTPServer(("127.0.0.1", PORT), Pilote)
    except OSError:
        # Le port est déjà pris : une autre copie tourne déjà → on s'arrête
        # tranquillement (sinon macOS le relancerait en boucle).
        print(f"le pilote tourne déjà sur le port {PORT}", flush=True)
        raise SystemExit(0)
    print(f"Pilote de l'écosystème à l'écoute sur http://127.0.0.1:{PORT}", flush=True)
    serveur.serve_forever()
