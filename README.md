# NoShorts

Extensão Manifest V3 para navegadores base Chromium que remove o acesso a YouTube Shorts, limpa cards/shelves de Shorts e força pesquisas do YouTube no filtro `Vídeos`.

Também há pacotes gerados para Firefox e fonte Safari. Veja `PLATFORMS.md`.

## O que ela faz

- Bloqueia navegação direta para URLs com o segmento `/shorts`, incluindo `/shorts/id`, `/feed/shorts`, `/@canal/shorts`, `/channel/.../shorts` e `/hashtag/.../shorts`.
- Remove atalhos de Shorts na navegação lateral, mini guia, chips e abas.
- Remove cards e prateleiras de Shorts em resultados, canais e páginas dinâmicas do YouTube.
- Ao pesquisar, aplica o filtro `Vídeos`; quando o YouTube não aceita clique sintético no chip, usa o fallback `sp=EgIQAQ==` e sincroniza o estado visual do chip.
- Mantém opções por `chrome.storage.sync` e contadores locais por `chrome.storage.local`.

## Como testar localmente

1. Abra `chrome://extensions`.
2. Ative `Modo do desenvolvedor`.
3. Clique em `Carregar sem compactação`.
4. Selecione esta pasta: `E:\Dev\Meus Projetos\NoShorts`.
5. Teste:
   - `https://www.youtube.com/results?search_query=minecraft`
   - `https://www.youtube.com/shorts/K_lBREBpwTI`
   - uma aba de canal terminando em `/shorts`

## Como gerar o ZIP

```powershell
npm run validate
npm run package
```

O pacote final fica em `dist/NoShorts-1.0.0.zip`.

Para gerar todos os pacotes:

```powershell
npm run package:all
```

## Evidência usada no YouTube atual

Auditoria feita em 2026-06-07 no YouTube renderizado em navegador:

- Home sem login: item Shorts em `ytd-mini-guide-entry-renderer > a[href="/shorts/"]`.
- Busca por `minecraft`: chip `Vídeos` em `yt-chip-cloud-chip-renderer`; ao clicar, o chip recebe `selected` e os links de Shorts caem de dezenas para somente o item de navegação.
- Busca sem filtro: Shorts aparecem em `grid-shelf-view-model` com `ytm-shorts-lockup-view-model-v2` e links `/shorts/...`.
- Página direta de Shorts: player em `ytd-shorts`, `ytd-reel-video-renderer` e `yt-reel-*`.
- Aba de canal: `/@dirt_mc/shorts` usa `ytm-shorts-lockup-view-model-v2` dentro de `ytd-rich-item-renderer`.

## Observação de manutenção

O YouTube muda o DOM com frequência. A extensão usa os seletores atuais e fallbacks por URL `/shorts`, mas uma revisão periódica dos seletores é recomendada antes de publicar updates.
