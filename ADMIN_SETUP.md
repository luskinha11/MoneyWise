# Painel administrativo MoneyWise

## Modo demonstração atual

O painel nesta branch funciona em modo de demonstração para permitir testar a interface sem ativar o plano Blaze nem publicar Cloud Functions.

- Acesso ao painel continua protegido pelo Firebase Authentication e pela custom claim `admin: true`.
- Usuários, estatísticas e atividades exibidos são dados fictícios definidos em `js/admin.js`.
- Pesquisa, filtros, navegação, simulação de bloqueio/reativação e simulação de permissões funcionam apenas na memória do navegador.
- As preferências de demonstração são salvas no armazenamento local do navegador.
- Nenhuma ação deste modo altera contas reais do Firebase Auth, dados de usuários no Firestore ou permissões administrativas reais.
- Recarregar a página restaura os dados fictícios iniciais; as preferências locais continuam no mesmo navegador.

## Recursos reais que exigem backend confiável

Bloquear/reativar contas reais do Firebase Authentication, conceder/remover custom claims, consultar todos os usuários do Auth e registrar auditoria confiável exigem código executado em ambiente confiável, como Firebase Cloud Functions ou servidor próprio. O navegador não deve receber credenciais administrativas.

A implantação de Cloud Functions exige o plano Blaze e pode gerar cobranças. Não habilite faturamento sem autorização do responsável pela conta e análise dos custos.

## Publicação

Esta implementação está na branch `feature/painel-admin-completo`. Ela não foi mesclada à branch `main` e não está publicada no site principal.

Para visualizar, use uma cópia local desta branch com Live Server e abra `admin.html`. O login Firebase e a custom claim administrativa continuam necessários para entrar no painel.
