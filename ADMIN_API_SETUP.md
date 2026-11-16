# API administrativa real do MoneyWise

Esta versão substitui os dados fictícios do painel por consultas reais ao Firebase Authentication e à coleção Firestore `usuarios`.

## Requisitos
- Node.js instalado.
- Dependências do projeto instaladas (`npm install`).
- Arquivo privado `serviceAccountKey.json` na raiz do projeto, referente ao projeto Firebase `moneywise-90448`.
- A conta que acessa o painel precisa ter a custom claim `admin: true`.

## Iniciar
1. Abra o terminal na pasta raiz do projeto.
2. Execute `npm install` caso ainda não tenha instalado as dependências.
3. Em um terminal, execute `npm run admin-api`.
4. Confirme a mensagem `MoneyWise Admin API em http://127.0.0.1:3001`.
5. Em outro terminal, inicie o Live Server na raiz do projeto.
6. Abra `admin.html` pelo Live Server e entre com a conta administrativa.

Teste opcional da API: abra `http://127.0.0.1:3001/health`. Deve retornar status ok.

## O que consulta
- Lista de contas reais do Firebase Authentication: UID, nome, e-mail, foto, status, e-mail verificado, criação e último acesso.
- Nome e foto complementares da coleção `usuarios`, quando existir documento com o UID do usuário.
- Totais reais de contas ativas, bloqueadas e administradores.
- Histórico das ações executadas pelo painel na coleção `admin_logs`.
- Configurações administrativas no documento `configuracoes/admin`.

## Ações reais
Bloquear/reativar contas e conceder/remover permissão administrativa alteram o Firebase Authentication. Ações administrativas são registradas em `admin_logs`. Ao alterar a permissão de alguém, os tokens de atualização dessa conta são revogados e a pessoa precisará entrar novamente.

## Segurança importante
- **Nunca envie `serviceAccountKey.json` ao GitHub, nem compartilhe seu conteúdo.** O arquivo já está listado no `.gitignore`.
- A API escuta somente em `127.0.0.1`, não fica exposta publicamente.
- Cada rota administrativa exige um ID token válido do Firebase e a custom claim `admin: true`.
- O CORS aceita o Live Server local e o domínio GitHub Pages. Mesmo assim, GitHub Pages não consegue acessar o computador de quem visita: a API local só funciona no computador em que está rodando.
- Não publique esta API local nem abra a porta do roteador. Para painel público, será necessário hospedar a API em um servidor seguro e configurar segredos no provedor.

## Limites desta etapa
O histórico registra as ações feitas a partir deste painel, não todos os logins históricos do Firebase. O último acesso exibido é o valor disponibilizado pelos metadados do Firebase Authentication. As opções de aviso e manutenção são salvas no Firestore, mas ainda não alteram automaticamente o comportamento das demais páginas do site.
