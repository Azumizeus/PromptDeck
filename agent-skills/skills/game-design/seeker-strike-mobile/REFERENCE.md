# Référence technique — Seeker Strike Mobile

## Bridge WebView → MWA

Le HTML ne signe jamais directement. Le wrapper vérifie l’origine de la page, une allowlist de méthodes et le contenu de la transaction (programme attendu, comptes, montants, blockhash, taille) avant d’appeler MWA. Cet exemple est un squelette à compléter selon le programme Seeker Strike.

```tsx
const METHODS = new Set(['getWallet', 'signTransaction']);
const injected = `
(function () {
  const allowed = ${JSON.stringify([...METHODS])};
  window.seekerStrike = { request(method, params) {
    if (!allowed.includes(method)) return Promise.reject(new Error('Method not allowed'));
    const id = crypto.randomUUID();
    window.ReactNativeWebView.postMessage(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      (window.__pending ||= {})[id] = { resolve, reject };
    });
  }};
  window.__seekerStrikeReply = raw => {
    const { id, result, error } = JSON.parse(raw), p = window.__pending?.[id];
    if (!p) return;
    delete window.__pending[id];
    error ? p.reject(new Error(error)) : p.resolve(result);
  };
})(); true;`;

<WebView
  ref={webRef}
  originWhitelist={['https://seeker-strike.example']}
  source={{ uri: 'https://seeker-strike.example' }}
  javaScriptEnabled
  domStorageEnabled
  injectedJavaScriptBeforeContentLoaded={injected}
  onMessage={async ({ nativeEvent }) => {
    const msg = JSON.parse(nativeEvent.data);
    if (!METHODS.has(msg.method) || !validMessage(msg)) return;
    try {
      const result = msg.method === 'getWallet'
        ? await getWalletFromMwa()
        : await signValidatedForSeekerStrike(msg.params);
      webRef.current?.injectJavaScript(
        `window.__seekerStrikeReply(${JSON.stringify(JSON.stringify({ id: msg.id, result }))}); true;`
      );
    } catch (e) {
      const error = frenchWalletError(e);
      webRef.current?.injectJavaScript(
        `window.__seekerStrikeReply(${JSON.stringify(JSON.stringify({ id: msg.id, error }))}); true;`
      );
    }
  }}
/>
```

`validMessage` doit contrôler l’origine attendue, un JSON borné, un id non rejoué et les paramètres typés. `signValidatedForSeekerStrike` refuse tout programme, compte, montant SKR/GC ou instruction non prévu par le contrat. Ne jamais remplacer cette validation par un checksum côté HTML.

## MWA 2.x et web3.js 1.98

```ts
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { toByteArray } from 'base64-js';

const identity = { name: 'Seeker Strike', uri: 'https://seeker-strike.example', icon: '/icon.png' };
export async function connect() {
  return transact(async wallet => {
    const r = await wallet.authorize({ chain: 'solana:devnet', identity });
    return { authToken: r.auth_token, publicKey: new PublicKey(toByteArray(r.accounts[0].address)) };
  });
}
export async function reauthorize(authToken: string) {
  return transact(wallet => wallet.reauthorize({ auth_token: authToken, identity }));
}
export async function send(connection: Connection, payer: PublicKey, make: (blockhash: string) => Transaction) {
  const latest = await connection.getLatestBlockhash();
  const tx = make(latest.blockhash); tx.feePayer = payer;
  const [signed] = await transact(wallet => wallet.signTransactions({ transactions: [tx] }));
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({ signature, ...latest }, 'confirmed');
  return signature;
}
```

Pour SIWS, `sign_in_payload` contient un nonce frais du serveur et est vérifié côté serveur. Pour mainnet, simuler le CU, ajouter `ComputeBudgetProgram` et ne jamais réutiliser un blockhash expiré. `payerEnSOL()` et `rafraichirSoldes()` sont les points à revoir si une migration vers `@solana/kit` devient nécessaire ; la recommandation actuelle reste web3.js 1.98.

## Offline-first et tests

La file contient des intentions `{ id, kind, payload }`, jamais des transactions signées (blockhash expirant en environ 60–90 s). Dédupliquer côté client et contrat, traiter FIFO, requérir `isInternetReachable`, recréer blockhash puis signer. Tester obligatoirement :

```ts
import { renderHook } from '@testing-library/react-native';
test('Canvas reste jouable en mode avion', () => { /* simulation locale */ });
test('un claim SKR/GC idempotent ne double pas', () => { /* id + PDA */ });
test('le changement de compte invalide le profil', () => { /* reset/reload */ });
```

## Assets

Les emojis sont remplacés par des SVG inline uniquement, selon `ICONES-A-REMPLACER.md`. Noms PNG déjà couverts : `node_crystal_1`, `node_crystal_2`, `node_crystal_3`, `boss_vortex_face`, `boss_sentinelle`, `boss_fortress`. Icônes statistiques à créer : `dégâts`, `cadence`, `vitesse`, `PV`, `portée`, `chance`. Les décisions visuelles/audio/pixel et la reprise de session se trouvent dans les fichiers du dépôt cités dans `SKILL.md`.

## Publication et sécurité

```bash
npx @solana-mobile/dapp-store-cli init
npx @solana-mobile/dapp-store-cli publish
```

Avant publication : grep des secrets dans le bundle ; proxy RPC ; `auth_token` chiffré ; origins et méthodes du bridge allowlistés ; CSP ; deep links validés sans scheme `solana` ; `assetlinks.json` ; récompenses SKR/GC de valeur réelle validées on-chain ; PDA anti-double-claim ; blockhash frais ; décimales `getMint` ; priority fees ; tests mode avion et wallet absent. iOS n’a pas MWA : deep link/embedded/read-only, et le shoot’em up reste jouable sans signature.
