# Círculo Financeiro — primeira versão funcional

Aplicação web em **Django 5.2 LTS + Django REST Framework, Vue 3, TypeScript, Tailwind CSS 4 e Vite**, com estrutura PWA. Interface em português, responsiva, com verde profundo, fundo claro, cartões, ícones e formulários rápidos. O projeto começa vazio: nenhum dado financeiro fictício aparece como se fosse real.

## O que já funciona

- Cadastro, login e logout com sessão do Django, senha com hash e proteção CSRF.
- Criação de vários círculos, contas separadas e autorização por associação ao círculo.
- Convites por código de uso único, válidos por sete dias; o responsável pode remover membros. O aplicativo não envia e-mails ou mensagens.
- Todos os membros de um círculo podem ver, criar, editar e excluir seus lançamentos, contas sem movimentações, dívidas, metas e limites. Apenas o responsável gera convites e remove membros. Não há despesas privadas dentro do mesmo círculo.
- Entradas e despesas com data, conta, categoria, observação, situação prevista/efetivada e indicação de essencial.
- Edição e exclusão de registros, filtro mensal, busca e filtro por tipo.
- Painel com resultado mensal previsto, entradas, despesas, dinheiro efetivado, benefício separado e categorias.
- Cadastro de dívidas com saldo, parcela, taxa mensal opcional, prioridade urgente e desconto em folha. Ordenação por maior taxa ou menor saldo.
- Limites por categoria e mês; metas com acompanhamento manual.
- Exportação do círculo em JSON (sem importação nesta versão).
- Manifest, ícones e service worker para instalação PWA em navegadores compatíveis. Aviso de atualização antes de recarregar.

## Instalação no Windows — passo a passo

Instale **Python 3.12** e **Node.js 22.12+ ou 24**. Extraia este ZIP e abra o PowerShell dentro da pasta `circulo`.

### 1. Preparar o backend

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Deixe esse terminal aberto. Se sua instalação usa outro comando Python, substitua `py -3.12` pelo executável Python 3.12+ disponível.

### 2. Preparar o frontend em outro terminal

Abra outro PowerShell na pasta `circulo`:

```powershell
cd frontend
npm ci
npm run dev
```

Abra **http://localhost:5173**. O Vite encaminha `/api/` ao Django. Use sempre esse endereço durante o desenvolvimento para manter a mesma origem dos cookies. Crie sua conta e seu círculo. Não há login ou senha padrão.

### 3. Testar a versão compilada e a PWA no PC

No terminal do frontend, interrompa o Vite com Ctrl+C e compile:

```powershell
npm run build
```

Reinicie o Django após a compilação e abra **http://127.0.0.1:8000**. O Django/WhiteNoise entrega os arquivos compilados e a API na mesma origem. O service worker é gerado na compilação; não é habilitado no servidor Vite de desenvolvimento.

A instalação depende de suporte do navegador e de HTTPS (localhost tem exceção). No Android/desktop, use “Instalar aplicativo” quando disponível. No iPhone/iPad, abra no Safari e use Compartilhar → Adicionar à Tela de Início. A compatibilidade em dispositivos físicos ainda precisa ser validada. Um endereço HTTP da rede local, como `192.168...`, não substitui HTTPS para PWA.

### Linux/macOS

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver
```

Frontend: os mesmos comandos `npm ci`, `npm run dev` e `npm run build`.

## Primeiro uso para o orçamento da família

1. Crie um círculo como “Nossa família”. As contas “Conta do dia a dia” e “Alelo / alimentação” são criadas automaticamente com saldo zero.
2. Em Meu círculo, ajuste os nomes e informe o saldo **imediatamente anterior ao primeiro lançamento**. Se começar com uma entrada de salário, não coloque esse mesmo salário também no saldo inicial. Após movimentações, tipo e saldo inicial são protegidos contra alteração.
3. Registre como entrada o salário **líquido realmente creditado**. Os R$ 4.200 mencionados só devem ser usados se esse for o valor efetivamente recebido após os descontos.
4. Registre os R$ 1.000 de alimentação como entrada na conta de benefício, quando efetivamente creditados. Eles não entram no resultado em dinheiro.
5. Registre energia, internet e demais compromissos como despesas previstas, com a data de vencimento. Marque como efetivados quando ocorrer o pagamento.
6. Cadastre o saldo atualizado das dívidas. Um consignado já abatido do salário líquido fica como dívida informativa; não lance novamente essa parcela como saída bancária.
7. Nesta versão, controle cartão **pela fatura**: uma despesa no vencimento, com a observação desejada. Não cadastre também as compras incluídas nessa fatura. Gestão detalhada de cartões, fechamento, parcelas futuras e pagamento de faturas fica para outra etapa.
8. Crie metas e limites realistas. O sistema não impõe percentuais fixos de reserva enquanto há déficit.
9. Gere um convite e compartilhe pessoalmente o código. O familiar cria sua própria conta e informa o código em Meu círculo ou na tela inicial.

## Regras dos cálculos

- **Resultado previsto do mês:** todas as entradas em dinheiro do mês menos todas as despesas em dinheiro do mês, previstas ou efetivadas. Não inclui saldo anterior, Alelo, metas ou cadastro de dívidas. Não é saldo bancário nem dinheiro livre para gastar.
- **Saldo em dinheiro hoje:** saldos iniciais + entradas efetivadas até hoje − despesas efetivadas até hoje, em todas as contas do tipo dinheiro e ao longo de todo o histórico. Não muda com o filtro mensal.
- **Benefício alimentação:** cálculo de saldo equivalente, apenas nas contas de benefício. Não é dinheiro disponível para pagar empréstimos.
- **Contas pendentes:** despesas em dinheiro do mês que não foram marcadas como efetivadas.
- **Categorias do painel:** despesas em dinheiro do mês. **Limites por categoria:** despesas de todas as contas, incluindo benefício, no mês.
- **Dívidas:** soma dos saldos manualmente informados; não amortiza automaticamente, não aplica juros e não duplica parcelas nos lançamentos.
- **Metas:** valores informativos, sem transferir dinheiro ou alterar o saldo. Atualize a quantia guardada manualmente.
- Valores monetários usam `Decimal` no backend, com duas casas; a formatação em reais é feita na interface.
- As datas determinam o mês do registro. Para análise por competência e data de pagamento separadas, será necessária expansão do modelo.

## PWA e offline

A PWA guarda somente arquivos da interface. As respostas da API **não são armazenadas pelo service worker**. É necessário estar online para autenticar, consultar e alterar finanças. Uma página que já estava aberta pode ainda mostrar em memória os últimos dados carregados; ao recarregar offline, os dados não são restaurados. Não há fila offline nem conciliação de conflitos. Feche a sessão em aparelhos compartilhados.

## Estrutura

O frontend foi refatorado para separar App.vue, layouts, views roteadas, componentes, formulários tipados, composables, services, types, utils e estilos. A arquitetura está detalhada em `docs/ARQUITETURA_FRONTEND.md`; as convenções obrigatórias para próximas alterações ficam em `AGENTS.md`.

O backend mantém `config/`, `core/` e as migrações existentes. Não houve mudança de banco nesta refatoração.

O ZIP de atualização contém apenas os arquivos novos e modificados. Consulte `COMO_APLICAR_REFATORACAO.md` para aplicá-lo ao projeto existente.

## Testes

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test core
cd ..\frontend
npm run typecheck
npm test
npm run build
```

Os testes cobrem separação entre contas e círculos, acesso anônimo, CSRF/login/cadastro, convites, remoção de acesso, validação de valores, precisão decimal, limites duplicados e cálculo sem duplicar consignado nem somar benefícios ao dinheiro.

## Publicação real

Este pacote é um MVP para execução local e evolução. **Não foi publicado** e ainda não deve ser tratado como serviço financeiro pronto para produção. Para usar em vários dispositivos, todos precisam acessar uma hospedagem central com HTTPS.

A arquitetura mantém frontend e API na mesma origem. O build Vue é entregue por WhiteNoise; Django precisa de hospedagem que execute Python, por exemplo um servidor Linux com Gunicorn atrás de proxy TLS. O pacote Sites não hospeda o backend Django.

Antes de produção:

- Configurar `DEBUG=0`, `SECRET_KEY` aleatória forte, `ALLOWED_HOSTS` e `CSRF_TRUSTED_ORIGINS` com o domínio HTTPS. As variáveis devem ser definidas no ambiente da hospedagem; não há carregador de `.env` no projeto.
- Configurar proxy confiável/TLS de acordo com a hospedagem. `SECURE_SSL_REDIRECT` e cookies seguros ficam ativos quando `DEBUG=0`; se o proxy termina TLS, configure explicitamente `SECURE_PROXY_SSL_HEADER` somente se ele sobrescreve o cabeçalho com segurança. Sem isso, pode haver redirecionamento em loop.
- Instalar dependências, compilar frontend, executar `migrate` e `collectstatic --noinput`, depois iniciar Gunicorn em `config.wsgi:application`.
- Usar volume persistente para SQLite (`DB_PATH`), com backup consistente e teste de restauração. Para uso mais amplo/concurrente, migrar para PostgreSQL, configurar driver e credenciais e testar concorrência.
- Configurar rate limit de login no proxy e cache compartilhado entre processos. A limitação anônima do DRF é básica e usa cache local por processo nesta versão.
- Implementar recuperação/verificação de conta, auditoria de alterações e privacidade/retenção antes de disponibilizar a terceiros. Não existe recuperação de senha por e-mail nesta entrega.
- Revisar permissões, dependências, cabeçalhos de segurança, dispositivos reais e políticas de backup. Rodar `manage.py check --deploy` com as configurações de produção.

## Integração bancária futura

Não está implementada. O caminho é Open Finance, por meio de participante/parceiro habilitado e integração com consentimento explícito. O consentimento é revogável e a conexão deve respeitar os dados autorizados. O usuário não entrega a senha do banco a este aplicativo.

Antes de integrar: selecionar provedor e contrato, validar os requisitos atuais, implementar consentimentos/tokens no servidor, sincronização idempotente, conciliação de lançamentos, revogação e tratamento de falhas. Uma importação CSV/OFX revisável é uma etapa intermediária possível.

Referências: https://www.bcb.gov.br/meubc/faqs/s/open-finance • https://docs.djangoproject.com/en/5.2/ • https://www.django-rest-framework.org/ • https://vuejs.org/ • https://tailwindcss.com/docs/installation/using-vite

## Validação desta entrega

12 testes automatizados do backend aprovados e compilação Vue/TypeScript/PWA concluída. A conferência visual no navegador remoto não pôde acessar o servidor local deste ambiente; portanto, responsividade e instalação em dispositivos reais ainda precisam de validação visual e funcional.

## Refatoração arquitetural

App.vue agora é apenas o ponto de composição. Vue Router gerencia seis rotas com carregamento sob demanda, e dez testes de frontend verificam integração de componentes e regressões de estado. A conferência visual em dispositivos reais continua pendente.
