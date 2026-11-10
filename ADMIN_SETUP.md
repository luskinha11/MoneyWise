# Configuração do painel administrativo MoneyWise

O painel usa Firebase Authentication custom claims e funções seguras no projeto \`moneywise-90448\`.

## O que foi adicionado

- Visão geral com contagem de contas ativas, bloqueadas e administradores.
- Lista de usuários com dados básicos de perfil e status da conta.
- Bloqueio e reativação de contas comuns.
- Concessão e remoção de permissão administrativa.
- Proteções para impedir que o administrador altere a própria permissão ou bloqueie a si mesmo.
- Proteção para manter pelo menos um administrador.
- Auditoria das ações administrativas.
- Verificação de disponibilidade das funções e do Firestore.
- Configurações administrativas persistidas em \`configuracoes/admin\`.
- Regras do Firestore para manter dados financeiros privados.

## Credenciais e segurança

A chave privada do Firebase Admin SDK deve permanecer somente no computador. Nunca envie o JSON, publique no GitHub ou coloque a chave no navegador. O arquivo \`serviceAccountKey.json\` já está no \`.gitignore\`.

## Antes de publicar

As funções administrativas rodam no Firebase Cloud Functions, separadas do GitHub Pages. A implantação de Cloud Functions exige que o projeto esteja no plano Blaze (cobrança por uso). Não habilite cobrança sem conversar com o responsável pela conta e conferir limites e custos.

## Implantação

No Git Bash, na pasta raiz do projeto:

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase use moneywise-90448
cd functions
npm install
cd ..
firebase deploy --only functions,firestore:rules
\`\`\`

A implantação publica as funções na região \`southamerica-east1\` e as regras do Firestore. Se o Firebase CLI pedir para ativar APIs ou configurar faturamento, pare e confira o plano e os custos antes de continuar.

## Depois da implantação

1. Entre no MoneyWise com uma conta que tenha a custom claim \`admin: true\`.
2. Abra \`admin.html\`.
3. Use **Atualizar dados** para validar a comunicação com as funções.
4. Teste primeiro com uma conta de teste, nunca com a única conta administrativa.

## Limitações atuais

- O painel não mostra movimentações, metas, saldos ou carteiras de outros usuários.
- Contas administrativas não podem ser bloqueadas pelo painel.
- O administrador não pode remover a própria permissão; o sistema também protege o último administrador.
- O aviso e o modo de manutenção são armazenados como configurações, mas ainda precisam de integração nas páginas públicas para serem exibidos ou aplicados.
- O monitoramento atual verifica a API e registra ações administrativas. A coleta automática de erros JavaScript de todas as páginas ainda não está ativada.
- As funções e regras ainda precisam ser implantadas e testadas no projeto Firebase real. Até lá, os recursos que dependem dessas funções não estarão operacionais no site publicado.
