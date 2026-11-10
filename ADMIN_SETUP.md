# Configurar o primeiro administrador do MoneyWise

A permissão administrativa usa **Firebase Authentication custom claims**. Ela é concedida localmente pelo Firebase Admin SDK, nunca por uma comparação de e-mail no navegador.

## Antes de começar

1. Crie a conta normalmente no MoneyWise com o e-mail que será administrador e entre nela pelo menos uma vez.
2. Abra o projeto `moneywise-201d9` no Firebase Console.
3. Vá em **Configurações do projeto → Contas de serviço → Gerar nova chave privada**.
4. Baixe o JSON e coloque-o temporariamente na pasta raiz do projeto com o nome `serviceAccountKey.json`.
5. **Não envie esse arquivo para ninguém e não o publique.** O nome está no `.gitignore`.

## Windows PowerShell

Abra o terminal do VS Code na pasta principal do MoneyWise e execute:

```powershell
npm install
$env:GOOGLE_APPLICATION_CREDENTIALS=".\serviceAccountKey.json"
npm run set-admin -- andrieskilucas@gmail.com
```

O comando verifica se a chave pertence ao projeto MoneyWise, localiza a conta pelo e-mail e atribui a claim `admin: true`. Depois, revoga as sessões antigas para forçar a renovação do token.

## Finalizar

1. Quando o terminal confirmar sucesso, saia da conta no MoneyWise.
2. Entre novamente com a conta que recebeu a permissão.
3. O link **Admin** deverá aparecer no menu.
4. Acesse `admin.html`.

Se o comando disser que o usuário não foi encontrado, primeiro crie a conta no MoneyWise usando esse e-mail. Se houver erro de permissão, confira se a conta de serviço foi gerada no projeto correto e se ela tem acesso administrativo ao Firebase Authentication.

## Segurança e limites atuais

- O JSON da conta de serviço é uma credencial altamente privilegiada. Mantenha-o apenas no computador e apague-o quando terminar.
- Nunca coloque a chave privada em `js/firebase.js`, no navegador, no GitHub ou em mensagens.
- O painel inicial confirma a claim administrativa e mostra a identidade da conta. Ele ainda não oferece gerenciamento de usuários nem acesso administrativo aos dados financeiros.
- Antes de adicionar operações administrativas ou consultar dados de outros usuários, é necessário implantar uma API confiável no servidor e revisar as regras do Firestore para validar a claim `admin`. A interface sozinha não protege dados.
- O arquivo `package-lock.json` precisa ser atualizado pelo `npm install` depois da inclusão do Firebase Admin SDK.
