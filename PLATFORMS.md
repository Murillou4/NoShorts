# Plataformas

## Chromium

Arquivo: `dist/NoShorts-1.0.0.zip`

Compatível com Chrome, Edge, Brave, Opera, Vivaldi, Arc e Chromium.

Instalação manual:

1. Extraia o ZIP.
2. Abra a página de extensões do navegador.
3. Ative o modo do desenvolvedor.
4. Clique em `Carregar sem compactação`.
5. Selecione a pasta extraída que contém `manifest.json`.

## Firefox

Arquivo: `dist/NoShorts-1.0.0-firefox.zip`

Esse pacote usa Manifest V3 com `background.scripts`, ID Gecko e declaração de coleta de dados como `none`. O pacote declara Firefox `140.0` ou superior para alinhar com a declaração de coleta exigida pela Mozilla.

Para testar:

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em `Load Temporary Add-on`.
3. Selecione o pacote Firefox ou um arquivo dentro da pasta extraída.

Para instalar permanentemente no Firefox normal, o pacote precisa ser assinado pela Mozilla via addons.mozilla.org ou `web-ext sign`.

## Safari no macOS

Arquivo: `dist/NoShorts-1.0.0-safari-source.zip`

Safari não instala um ZIP WebExtension diretamente. A extensão precisa ser convertida/empacotada em um app com as ferramentas do Xcode no macOS.

Fluxo no Mac:

1. Extraia `NoShorts-1.0.0-safari-source.zip`.
2. Rode o packager/conversor do Safari Web Extensions com Xcode:

```bash
xcrun safari-web-extension-packager /caminho/para/a/pasta-extraida
```

3. Abra o projeto gerado no Xcode.
4. Assine e rode o app para testar no Safari.
5. Para distribuir para outras pessoas, use App Store ou app assinado/notarizado.
