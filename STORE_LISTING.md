# Chrome Web Store - NoShorts

## Nome

NoShorts

## Descrição curta

Remove Shorts do YouTube, bloqueia acessos diretos e força pesquisas no filtro Vídeos.

## Descrição detalhada

NoShorts mantém o YouTube focado em vídeos tradicionais. A extensão bloqueia páginas de Shorts, remove cards e prateleiras de Shorts, oculta atalhos da navegação e aplica automaticamente o filtro `Vídeos` quando uma pesquisa é feita.

Ela funciona sobre o YouTube atual com Manifest V3, sem dependências externas e sem coleta de dados. As preferências ficam salvas no navegador e podem ser ajustadas no popup ou na página de opções.

## Permissões explicadas

- `storage`: salva preferências e contadores locais.
- `declarativeNetRequest`: redireciona acessos diretos a URLs de Shorts.
- `youtube.com`: necessário para limpar elementos da página e aplicar o filtro `Vídeos` na busca.

## Uso único declarado

Bloquear, ocultar e reduzir acesso a YouTube Shorts em páginas do YouTube.

## Dados do usuário

Não coleta dados pessoais. Não usa analytics. Não envia dados para servidores.

## Instruções para revisão

1. Instale a extensão.
2. Abra `https://www.youtube.com/results?search_query=minecraft`.
3. Verifique que os resultados ficam filtrados como vídeos e que cards de Shorts são ocultados.
4. Abra uma URL `https://www.youtube.com/shorts/...`.
5. Verifique que a navegação é redirecionada.
