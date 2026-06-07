# Microsoft Edge Add-ons - Submission Kit

## Arquivos

- Pacote da extensão: `dist/NoShorts-1.0.0.zip`
- Logo obrigatório: `store-assets/edge/edge-logo-300.png`
- Tile pequeno opcional: `store-assets/edge/edge-small-tile-440x280.png`
- Tile grande opcional: `store-assets/edge/edge-large-tile-1400x560.png`
- Screenshot opcional: `store-assets/edge/edge-screenshot-1280x800.png`

## Campos sugeridos

### Extension name

NoShorts

### Short description

Remove Shorts do YouTube, bloqueia acessos diretos e força pesquisas no filtro Videos.

### Description

NoShorts mantem o YouTube focado em videos tradicionais. A extensao bloqueia paginas de Shorts, remove cards e prateleiras de Shorts, oculta atalhos da navegacao e aplica automaticamente o filtro Videos quando uma pesquisa e feita.

A extensao funciona com Manifest V3, sem dependencias externas e sem coleta de dados. As preferencias ficam salvas no navegador e podem ser ajustadas no popup ou na pagina de opcoes.

Recursos principais:

- Bloqueia URLs de Shorts, incluindo /shorts, abas de canal e hashtags de Shorts.
- Remove cards, shelves, lockups, chips e atalhos de Shorts no YouTube.
- Aplica automaticamente o filtro Videos na pesquisa do YouTube.
- Mantem preferencias locais por chrome.storage.
- Nao usa analytics, servidores externos ou codigo remoto.

### Search terms

youtube, shorts, block shorts, no shorts, videos, productivity, focus

### Category

Productivity

### Privacy purpose

Bloquear, ocultar e reduzir acesso a YouTube Shorts em paginas do YouTube.

### Permissions justification

`storage`: salva preferencias da extensao e contadores locais no navegador.

`declarativeNetRequest`: redireciona acessos diretos a URLs de Shorts sem ler conteudo sensivel das requisicoes.

`youtube.com` host permission: permite limpar elementos de Shorts da pagina e aplicar o filtro Videos na busca.

### Remote code

No. A extensao nao carrega nem executa codigo remoto.

### Data practices

A extensao nao coleta, transmite, vende ou compartilha dados pessoais. Ela armazena apenas preferencias e contadores locais no navegador.

### Test notes

1. Instale a extensao no Microsoft Edge.
2. Abra `https://www.youtube.com/results?search_query=minecraft`.
3. Verifique que os resultados ficam filtrados como videos e que cards de Shorts sao ocultados.
4. Abra uma URL `https://www.youtube.com/shorts/K_lBREBpwTI`.
5. Verifique que a navegacao e redirecionada para a pagina inicial do YouTube.

## Observacoes

A Microsoft Edge Add-ons pede uma conta Microsoft/Partner Center. Segundo a documentacao oficial da Microsoft, nao ha taxa de registro para o programa de extensoes do Edge.
