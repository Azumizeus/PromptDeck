// CSS de l'édition Luxe — injecté par le renderer
const css = document.createElement('style');
css.textContent = `
:root{
  --bg:#0b0c10; --panel:rgba(18,19,26,.86); --card:#14151c; --card2:#191b24;
  --line:#23252f; --line2:#31343f;
  --txt:#eef0f6; --txt2:#a8adbd; --mut:#6b7080;
  --vio:#9945ff; --grn:#14f195; --amb:#f5c518;
  --grad:linear-gradient(120deg,#9945ff,#14f195);
  --r:10px;
}
body.light{
  --bg:#f4f5f8; --panel:rgba(250,250,252,.92); --card:#fff; --card2:#f4f5f9;
  --line:#e4e6ee; --line2:#cfd3e0;
  --txt:#171923; --txt2:#4c5165; --mut:#8b90a2;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font:13.5px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  -webkit-font-smoothing:antialiased;background:transparent;color:var(--txt);overflow:hidden}
#app{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--panel);
  backdrop-filter:blur(28px) saturate(1.4);border:1px solid var(--line2);border-radius:14px;overflow:hidden}

/* ── header ── */
#top{display:flex;gap:10px;align-items:center;padding:11px 14px 9px;user-select:none}
#brand{font-size:12.5px;letter-spacing:.4px;display:flex;gap:7px;align-items:center}
#brand b{font-weight:700}
#counts{font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums;margin-left:2px}
#top button{min-width:28px;height:28px;border-radius:8px;border:1px solid var(--line);
  background:transparent;color:var(--txt2);cursor:pointer;font-size:13px;
  transition:border-color .15s,color .15s,transform .1s}
#top button:hover{border-color:var(--line2);color:var(--txt)}
#top button:active{transform:scale(.94)}

/* ── recherche ── */
#searchrow{display:flex;align-items:center;gap:9px;margin:2px 14px 10px;padding:9px 12px;
  background:var(--card);border:1px solid var(--line);border-radius:var(--r);
  transition:border-color .15s}
#searchrow:focus-within{border-color:var(--vio)}
#lupa{color:var(--mut);font-size:15px;line-height:1}
#q{flex:1;background:none;border:none;outline:none;color:var(--txt);
  font:inherit;font-size:14px}
#q::placeholder{color:var(--mut)}

/* ── onglets ── */
#tabs{display:flex;gap:4px;align-items:center;padding:0 14px 9px;user-select:none}
#tabs [data-f]{border:none;background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:11.5px;font-weight:600;padding:4px 9px;border-radius:99px;
  transition:color .12s,background .12s}
#tabs [data-f]:hover{color:var(--txt)}
#tabs [data-f][aria-selected="true"]{background:var(--card2);color:var(--txt)}
#sels{font-size:11px;color:var(--grn);font-variant-numeric:tabular-nums}
#compose{border:none;background:var(--grad);color:#0b0c10;cursor:pointer;
  font:inherit;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px}
#compose:hover{filter:brightness(1.08)}

/* ── liste ── */
#list{flex:1;overflow-y:auto;padding:0 8px 6px;scrollbar-width:thin;
  scrollbar-color:var(--line2) transparent}
#list::-webkit-scrollbar{width:8px}
#list::-webkit-scrollbar-thumb{background:var(--line2);border-radius:4px}
#void{padding:34px 20px;text-align:center;color:var(--mut);font-size:12.5px}
.it{display:flex;gap:11px;align-items:center;padding:8px 10px;border-radius:var(--r);
  cursor:pointer;position:relative;transition:background .1s}
.it:hover{background:var(--card2)}
.it.on{background:var(--card2)}
.it.on::before{content:'';position:absolute;left:0;top:9px;bottom:9px;width:2.5px;
  border-radius:2px;background:var(--grad)}
.it.copied{background:rgba(20,241,149,.12)}
.it.copied .ico::after{content:'✓';position:absolute;margin-left:2px;color:var(--grn);
  font-size:11px;font-weight:700}
.ico{font-size:15px;width:22px;text-align:center;position:relative;flex:none}
.mid{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.mid b{font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mid i{font-style:normal;font-size:11.5px;color:var(--mut);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tail{display:flex;gap:6px;align-items:center;flex:none}
.fv{color:var(--amb);font-size:11px}
.fb{border:none;background:none;color:var(--mut);cursor:pointer;font-size:13px;
  padding:2px 3px;border-radius:6px;opacity:0;transition:opacity .12s,color .12s}
.it:hover .fb,.it.on .fb{opacity:1}
.fb:hover{color:var(--amb)}
.k-skill .ico{filter:hue-rotate(0)}
.it.k-skill .mid b::after{content:'·';color:var(--line2);margin-left:8px}
.it.k-agent .mid b::after{content:'·';color:var(--line2);margin-left:8px}
.it.k-custom .mid b::after{content:'·';color:var(--line2);margin-left:8px}
.it.selc{background:rgba(153,69,255,.10)}
.it.selc .mid b{color:var(--vio)}
.it.k-team .mid b{color:var(--grn)}
.tk-team{color:var(--grn)}

/* ── footer ── */
#foot{display:flex;gap:13px;align-items:center;padding:8px 14px;border-top:1px solid var(--line);
  font-size:11px;color:var(--txt2);user-select:none}
#foot i{font-style:normal;color:var(--mut)}
#cnt{color:var(--mut);font-variant-numeric:tabular-nums}

/* ── modal ✍️ ── */
#modal{position:fixed;inset:0;background:rgba(5,6,10,.55);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;z-index:50}
#modal[hidden]{display:none}

/* ── tooltip flottant (survol skill/agent) ── */
#tip{position:absolute;z-index:60;width:300px;padding:11px 13px;border-radius:12px;
  background:var(--card);border:1px solid var(--line2);box-shadow:0 18px 50px rgba(0,0,0,.45);
  display:flex;flex-direction:column;gap:5px;pointer-events:auto;cursor:default}
#tip[hidden]{display:none}
#tip .tkind{font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:var(--grn)}
#tip .tkind.t-agent{color:var(--vio)}
#tip .tkind.t-custom{color:var(--amb)}
#tip .tkind .tf{color:var(--amb)}
#tip .tname{font-size:13.5px;font-weight:700}
#tip .tdesc{font-size:11.5px;line-height:1.5;color:var(--txt2)}
#tip .trow{display:flex;gap:7px;font-size:11px;color:var(--mut);align-items:baseline}
#tip .trow i{font-style:normal;flex:none}
#tip .trow b{font-weight:500;color:var(--txt2)}
#tip .thint{font-size:10.5px;color:var(--mut);border-top:1px solid var(--line);padding-top:6px;margin-top:2px}
#tip .tfav{font-size:10.5px;color:var(--amb)}

/* ── menu contextuel (clic droit) ── */
#ctx{position:absolute;z-index:70;min-width:210px;padding:6px;border-radius:12px;
  background:var(--card);border:1px solid var(--line2);box-shadow:0 18px 50px rgba(0,0,0,.5);
  display:flex;flex-direction:column}
#ctx[hidden]{display:none}
#ctx .chead{font-size:12px;font-weight:700;padding:6px 9px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ctx .csec{font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--mut);padding:4px 9px 3px}
#ctx button{border:none;background:none;color:var(--txt2);cursor:pointer;text-align:left;
  font:inherit;font-size:12.5px;font-weight:500;padding:7px 10px;border-radius:8px;
  transition:background .1s,color .1s}
#ctx button:hover{background:var(--card2);color:var(--txt)}
#ctx .csep{height:1px;background:var(--line);margin:5px 4px}

/* ── arborescence MEGA PROMPT (popup clic droit) ── */
#ctx .ctx-treehead{padding-top:7px}
#ctx .tree{display:block;max-height:200px;overflow-y:auto;margin:2px 2px 4px;
  background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:3px;scrollbar-width:thin}
#ctx .tree-root{display:flex;width:100%;font-size:11px;font-weight:700;color:var(--txt);
  padding:5px 8px;border-radius:7px;cursor:pointer;align-items:center}
#ctx .tree-root:hover{background:var(--card2)}
#ctx .trow-dir{display:flex;width:100%;font-size:11.5px;font-weight:600;color:var(--txt);
  padding:4px 8px;border-radius:7px;cursor:pointer;align-items:center;gap:6px;border:none;background:none;text-align:left}
#ctx .trow-dir:hover{background:var(--card2)}
#ctx .trow-dir i{font-style:normal;color:var(--grn);margin-left:auto;font-weight:700}
#ctx .trow-file{display:flex;width:100%;padding:2px 8px 2px 26px;border-radius:7px;
  cursor:pointer;border:none;background:none;text-align:left;align-items:center}
#ctx .trow-file:hover{background:var(--card2)}
#ctx .trow-file .tfn{font-size:11px;color:var(--txt2);white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis}
#ctx .trow-file:hover .tfn{color:var(--txt)}
#ctx .tree-empty{display:block;padding:9px 8px;color:var(--mut);font-size:11.5px}

/* ── toast ── */
#toast{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:80;
  background:var(--card);color:var(--txt);border:1px solid var(--line2);border-radius:99px;
  padding:8px 16px;font-size:12px;font-weight:600;box-shadow:0 14px 40px rgba(0,0,0,.45);
  max-width:86%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#toast[hidden]{display:none}
#toast.ok{border-color:rgba(20,241,149,.5);color:var(--grn)}
#toast.err{border-color:rgba(255,107,107,.5);color:#ff8a8a}

/* ── 🎓 visite guidée (pop-up flottant étape par étape) ── */
#tour{position:fixed;inset:0;background:rgba(5,6,10,.45);backdrop-filter:blur(4px);
  display:flex;align-items:flex-end;justify-content:center;padding:0 14px 64px;z-index:90}
#tour[hidden]{display:none}
#tourcard{width:min(460px,100%);background:var(--card);border:1px solid var(--line2);
  border-radius:16px;padding:16px 18px;box-shadow:0 24px 70px rgba(0,0,0,.55);
  display:flex;flex-direction:column;gap:8px;animation:tourin .25s ease-out}
@keyframes tourin{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}
#tourcard h3{font-size:14.5px;font-weight:800;margin:0}
#tourcard p{margin:0;font-size:12.5px;line-height:1.55;color:var(--txt2)}
#tourhelp{color:var(--grn)!important;font-size:11.5px!important}
.tstepnum{font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--vio)}
#tourtact{display:flex;align-items:center;gap:10px;margin-top:4px}
#tourtact button{border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:99px}
#tourtact button:hover{border-color:var(--line2);color:var(--txt)}
#tourtact .pri{background:var(--grad);border:none;color:#0b0c10}
#tourtact .pri:hover{filter:brightness(1.08);color:#0b0c10}
#tourdots{display:flex;gap:4px;align-items:center}
#tourdots i{width:6px;height:6px;border-radius:99px;background:var(--line2)}
#tourdots i.on{background:var(--grn);width:16px;transition:width .2s}
.tour-hl{outline:2px solid var(--vio)!important;outline-offset:2px;border-radius:10px;
  animation:tourpulse 1.4s ease-in-out infinite}
@keyframes tourpulse{0%,100%{outline-color:var(--vio)}50%{outline-color:var(--grn)}}

/* ── sélecteur de LLM (footer) + menu déroulant ── */
#llmwrap{position:relative;display:flex}
#llmbtn{border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;
  transition:border-color .15s,color .15s;white-space:nowrap}
#llmbtn:hover,#llmbtn[aria-expanded="true"]{border-color:var(--grn);color:var(--txt)}
#llmbtn b{color:var(--grn);font-weight:700}
#llmmenu{position:absolute;bottom:calc(100% + 8px);right:0;z-index:80;min-width:190px;
  padding:6px;border-radius:12px;background:var(--card);border:1px solid var(--line2);
  box-shadow:0 18px 50px rgba(0,0,0,.5)}
#llmmenu[hidden]{display:none}
#llmmenu button{display:flex;width:100%;border:none;background:none;color:var(--txt2);cursor:pointer;
  text-align:left;font:inherit;font-size:12px;padding:6px 9px;border-radius:8px;align-items:center;gap:4px}
#llmmenu button:hover{background:var(--card2);color:var(--txt)}
#llmmenu button.on{color:var(--grn);font-weight:700}
#llmmenu .csec{font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;
  color:var(--mut);padding:4px 9px 3px;display:block}
#llmmenu .llmwarn{color:var(--amb);text-transform:none;letter-spacing:0;font-weight:600}

/* ── bouton atelier (footer) ── */
#atb{border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;
  transition:border-color .15s,color .15s}
#atb:hover{border-color:var(--vio);color:var(--txt)}

/* ── atelier (création agents/skills) ── */
#wmodal{position:fixed;inset:0;background:rgba(5,6,10,.55);backdrop-filter:blur(6px);
  display:flex;align-items:center;justify-content:center;z-index:55}
#wmodal[hidden]{display:none}
#wbox{width:min(500px,94%);max-height:92%;overflow-y:auto;background:var(--card);
  border:1px solid var(--line2);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:11px;
  box-shadow:0 24px 70px rgba(0,0,0,.5);scrollbar-width:thin}
#wbox h3{font-size:14px;font-weight:700}
.wk{display:flex;align-items:center;gap:10px}
.wl{font-size:11.5px;color:var(--txt2);font-weight:600;flex:none}
.wseg{display:flex;border:1px solid var(--line);border-radius:9px;overflow:hidden}
.wseg button{border:none;background:none;color:var(--txt2);cursor:pointer;font:inherit;
  font-size:11.5px;font-weight:600;padding:6px 11px;transition:background .12s,color .12s}
.wseg button[aria-checked="true"]{background:var(--card2);color:var(--txt)}
.wl2{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:var(--txt2);font-weight:600}
#w-intent{background:var(--card2);border:1px solid var(--line);border-radius:8px;color:var(--txt);
  font:inherit;font-size:12.5px;padding:8px 10px;outline:none;resize:vertical;min-height:58px}
#w-intent:focus{border-color:var(--vio)}
#w-intent::placeholder{color:var(--mut)}
.wchk{display:flex;gap:8px;align-items:center;font-size:11.5px;color:var(--txt2);cursor:pointer}
.wchk input{accent-color:var(--vio);width:15px;height:15px}
.wk select{background:var(--card2);color:var(--txt);border:1px solid var(--line);
  border-radius:8px;font:inherit;font-size:11.5px;padding:3px 6px;max-width:150px}
.wk input[type="text"]{background:var(--card2);color:var(--txt);border:1px solid var(--line);
  border-radius:8px;font:inherit;font-size:11.5px;padding:3px 8px}
#w-runlist{display:flex;flex-direction:column;gap:4px}
#w-runlist .wact2 button{border:1px solid var(--grn);color:var(--grn);border-radius:8px;
  font-size:10.5px;font-weight:700;padding:3px 8px;cursor:pointer;background:none;white-space:nowrap}
#w-runlist .wact2 button:hover{background:rgba(20,241,149,.12)}
#w-runlist .wact2 button:disabled{opacity:.55;cursor:default}
#w-report{border-top:1px solid var(--line);padding-top:9px;display:flex;flex-direction:column;gap:7px}
#w-report[hidden]{display:none}
#w-report > b{font-size:12px}
#w-report pre{white-space:pre-wrap;word-break:break-word;background:var(--panel);
  border:1px solid var(--line);border-radius:10px;padding:10px;max-height:180px;overflow-y:auto;
  font-size:11px;line-height:1.5;margin:0;scrollbar-width:thin}
.wact{display:flex;gap:8px;align-items:center}
.wact button{border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;
  transition:border-color .15s,color .15s}
.wact button:hover{border-color:var(--line2);color:var(--txt)}
.wact .pri{background:var(--grad);border:none;color:#0b0c10}
.wact .pri:hover{filter:brightness(1.08);color:#0b0c10}
.wact .pri:disabled{opacity:.6;cursor:default}
.wlist-h{display:flex;gap:8px;align-items:baseline;border-top:1px solid var(--line);padding-top:10px}
.wlist-h b{font-size:12px}
.wmut{font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums}
#w-list{display:flex;flex-direction:column;gap:4px}
#w-list .wempty{padding:16px;text-align:center;color:var(--mut);font-size:12px}
.wit{display:flex;gap:9px;align-items:center;padding:7px 9px;border-radius:9px;
  border:1px solid var(--line);background:var(--card2);transition:border-color .12s}
.wit:hover{border-color:var(--line2)}
.wico{font-size:14px;flex:none}
.wmid{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.wmid b{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wmid i{font-style:normal;font-size:11px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wmid u{text-decoration:none;font-size:10px;color:var(--grn);font-variant-numeric:tabular-nums}
.wact2{display:flex;gap:4px;flex:none}
.wact2 button{border:none;background:none;color:var(--mut);cursor:pointer;font-size:12px;
  padding:4px 5px;border-radius:6px;transition:color .12s,background .12s}
.wact2 button:hover{color:var(--txt);background:var(--card)}
#mbox{width:min(420px,92%);background:var(--card);border:1px solid var(--line2);
  border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:11px;
  box-shadow:0 24px 70px rgba(0,0,0,.5)}
#mbox h3{font-size:14px;font-weight:700}
#mbox label{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:var(--txt2);font-weight:600}
#mbox input,#mbox textarea{background:var(--card2);border:1px solid var(--line);border-radius:8px;
  color:var(--txt);font:inherit;padding:8px 10px;outline:none;resize:vertical}
#mbox input:focus,#mbox textarea:focus{border-color:var(--vio)}
#erow{display:flex;gap:8px;align-items:center}
#erow button{border:1px solid var(--line);background:none;color:var(--txt2);cursor:pointer;
  font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;
  transition:border-color .15s,color .15s}
#erow button:hover{border-color:var(--line2);color:var(--txt)}
#erow .pri{background:var(--grad);border:none;color:#0b0c10}
#erow .pri:hover{filter:brightness(1.08);color:#0b0c10}

@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important}}
@media (prefers-contrast: more){
  :root{--txt:#fff;--txt2:#d5d9e5;--line2:#565b6b;--panel:rgba(10,11,16,.97)}
  body.light{--txt:#000;--txt2:#333;--panel:rgba(255,255,255,.97)}
}
`;
document.head.appendChild(css);
