# Convenções de desenvolvimento do Círculo Financeiro

Preferência explícita do usuário: aplicar padrões de arquitetura de software e convenções do ecossistema Vue. Não concentrar a aplicação em App.vue. Preservar essa organização nas próximas alterações.

## Frontend

- `App.vue` é o ponto de composição: inicialização e seleção da estrutura principal. Não contém telas, formulários, fetch ou regras financeiras.
- Views em `src/views` representam rotas; layout, navegação e componentes reutilizáveis ficam separados.
- Formulários em `src/components/forms` usam contratos TypeScript e props/emits/defineModel. Não chamam API.
- HTTP, CSRF e contratos de endpoints ficam em `src/services`. Nenhuma view ou formulário deve chamar fetch diretamente.
- Composables têm responsabilidades delimitadas. Não substituir um App.vue monolítico por um composable monolítico.
- Estado compartilhado desta versão pertence à instância de aplicação criada no composition root; acesso por provide/inject tipado. Não instanciar novamente composables compartilhados em cada view nem criar singletons mutáveis por conveniência.
- Modelos do domínio em `src/types`. Evitar `any`, tipos genéricos que apaguem o contrato e casts fora das fronteiras documentadas.
- Vue Router gerencia navegação. Rotas carregam views sob demanda. Preservar URLs, voltar/avançar e recarregamento.
- Requisições devem respeitar o círculo ativo. Invalidar respostas antigas, limpar estado no logout e impedir salvar um formulário em outro círculo.
- Componentes Vue em PascalCase; composables com prefixo use; services com sufixo `.service.ts`; alias `@/` para src.
- Não alterar regras financeiras, endpoints ou banco durante uma refatoração sem justificar e testar a alteração.

## Verificação e entrega

- Executar `npm run typecheck`, `npm test` e `npm run build` após mudanças relevantes no frontend.
- Acrescentar testes de comportamento e regressão para fluxos alterados. Não confundir montagem em jsdom com validação visual em dispositivo real.
- Executar testes Django quando houver mudanças no backend.
- Entregar ZIP com os arquivos alterados/criados e caminhos relativos preservados; não incluir node_modules, dist, banco, .venv, segredos, caches ou .git.
- Incluir instruções claras de aplicação e comandos necessários. Informar os limites da validação realizada.
