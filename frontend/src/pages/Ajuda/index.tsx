import { useState } from 'react'
import { Header } from '../../components/Header'
import { decodeToken } from '../../services/api'
import styles from './style.module.css'

const user = decodeToken()

type UserRole = 'ADMIN' | 'RH' | 'OPERACIONAL' | 'DP'
type ModuleId = 'tickets' | 'contatos' | 'rh'

type HelpModule = {
  id: ModuleId
  label: string
  roles?: UserRole[]
  eyebrow: string
  title: string
  summary: string
  highlight: string
  principles: string[]
  sections: {
    title: string
    lead: string
    body: string[]
  }[]
  example: {
    badLabel: string
    bad: string
    goodLabel: string
    good: string
    note: string
  }
  checklist: string[]
  flow: {
    title: string
    description: string
  }[]
}

const HELP_MODULES: HelpModule[] = [
  {
    id: 'tickets',
    label: 'Tickets',
    eyebrow: 'Boas praticas de atendimento',
    title: 'Abra tickets que ja nascem prontos para serem resolvidos',
    summary:
      'Um ticket bem escrito reduz perguntas de retorno, evita redistribuicao entre setores e ajuda o responsavel a entender o impacto antes mesmo de iniciar o atendimento.',
    highlight:
      'O melhor ticket responde rapidamente: o que aconteceu, onde aconteceu, quem foi impactado e qual resultado voce esperava.',
    principles: [
      'Um assunto por ticket',
      'Titulo especifico',
      'Contexto antes de urgencia',
      'Destino correto',
    ],
    sections: [
      {
        title: 'Como definir um bom titulo',
        lead: 'O titulo deve funcionar como um resumo tecnico da demanda.',
        body: [
          'Evite titulos genericos como "Ajuda", "Urgente" ou "Nao funciona". Eles obrigam o responsavel a abrir o ticket para descobrir o assunto.',
          'Inclua o modulo, a acao e o comportamento observado. Um bom formato e: modulo + acao + problema. Exemplo: "RH - erro ao salvar candidato com CPF ja cadastrado".',
          'Se a solicitacao nao for erro, deixe claro o pedido. Exemplo: "Liberar acesso ao modulo de Logs para auditoria interna".',
        ],
      },
      {
        title: 'Como escrever a descricao',
        lead: 'A descricao deve transformar o problema em uma situacao reproduzivel.',
        body: [
          'Comece explicando o que voce estava tentando fazer. Depois descreva o que aconteceu e o que deveria ter acontecido.',
          'Informe dados que ajudem na analise, como nome do candidato, modulo acessado, horario aproximado, navegador usado ou mensagem de erro exibida.',
          'Se for possivel, anexe evidencias. Prints, arquivos e exemplos reduzem bastante o tempo de investigacao.',
        ],
      },
      {
        title: 'Departamento e responsavel',
        lead: 'Direcionar corretamente evita triagem manual e retrabalho.',
        body: [
          'Use TI para erros do sistema, acessos, configuracoes, equipamentos e falhas tecnicas.',
          'Use RH para processos de admissao, candidatos, formularios e documentos de colaboradores.',
          'Use DP para folha, beneficios, ferias, afastamentos e temas trabalhistas operacionais.',
          'Use Operacao para rotas, equipes de campo, promotores e demandas relacionadas a execucao.',
        ],
      },
    ],
    example: {
      badLabel: 'Titulo fraco',
      bad: 'Sistema com problema',
      goodLabel: 'Titulo bom',
      good: 'Tickets - erro ao anexar foto em solicitacao aberta',
      note:
        'O segundo titulo aponta o modulo, a acao e o erro. Isso permite priorizar e encaminhar sem adivinhar o contexto.',
    },
    checklist: [
      'O titulo explica o problema em uma frase?',
      'A descricao tem contexto, tentativa e resultado esperado?',
      'O departamento escolhido e o mais adequado?',
      'Existe evidencia anexada quando o problema e visual?',
      'O ticket trata de apenas um assunto?',
    ],
    flow: [
      {
        title: 'Solicite',
        description: 'Registre a demanda com titulo objetivo e contexto suficiente.',
      },
      {
        title: 'Acompanhe',
        description: 'Use o status do ticket para entender se esta aberto, em andamento, resolvido ou fechado.',
      },
      {
        title: 'Conclua',
        description: 'Valide a solucao antes de abrir outro ticket sobre o mesmo tema.',
      },
    ],
  },
  {
    id: 'contatos',
    label: 'Contatos',
    eyebrow: 'Agenda corporativa',
    title: 'Mantenha contatos confiaveis, pesquisaveis e faceis de acionar',
    summary:
      'A agenda centraliza pessoas importantes para a operacao. Quanto melhor o padrao de cadastro, mais rapido o time encontra telefones, e-mails e canais corretos.',
    highlight:
      'Um bom contato precisa ser facil de buscar, identificar e diferenciar de pessoas com nomes parecidos.',
    principles: [
      'Nome padronizado',
      'Telefone atualizado',
      'Origem identificada',
      'Sem duplicidade',
    ],
    sections: [
      {
        title: 'Padrao de nome',
        lead: 'O nome deve dizer quem e a pessoa e em qual contexto ela atua.',
        body: [
          'Use nome e sobrenome sempre que possivel. Evite apelidos isolados, abreviacoes confusas ou apenas primeiro nome.',
          'Quando fizer sentido, acrescente origem ou funcao. Exemplo: "Mariana Silva (ABC) - Supervisora".',
          'Para clientes e parceiros, inclua a empresa ou relacao. Isso evita confusao em buscas futuras.',
        ],
      },
      {
        title: 'Qualidade dos dados',
        lead: 'Um contato errado custa tempo para toda a equipe.',
        body: [
          'Confira DDD, numero, e-mail e area antes de salvar. Pequenos erros tornam a agenda menos confiavel.',
          'Antes de cadastrar, pesquise se a pessoa ja existe. Duplicatas dividem historico e confundem quem consulta.',
          'Atualize contatos antigos quando descobrir mudancas de telefone, equipe ou cargo.',
        ],
      },
    ],
    example: {
      badLabel: 'Cadastro confuso',
      bad: 'Joao',
      goodLabel: 'Cadastro claro',
      good: 'Joao Pereira (ABC) - Promotor Equipe Norte',
      note:
        'O cadastro claro facilita busca por nome, empresa, funcao e equipe, reduzindo contatos duplicados.',
    },
    checklist: [
      'Nome e sobrenome foram preenchidos?',
      'Telefone esta com DDD correto?',
      'A funcao ou origem ajuda a identificar a pessoa?',
      'Foi feita uma busca antes de criar novo contato?',
      'O contato ainda esta ativo e util para a operacao?',
    ],
    flow: [
      {
        title: 'Pesquise',
        description: 'Procure antes de cadastrar para evitar duplicidade.',
      },
      {
        title: 'Padronize',
        description: 'Use nome, origem e funcao de forma consistente.',
      },
      {
        title: 'Atualize',
        description: 'Corrija dados sempre que encontrar informacoes desatualizadas.',
      },
    ],
  },
  {
    id: 'rh',
    label: 'RH',
    roles: ['ADMIN', 'RH'],
    eyebrow: 'Fluxo de admissao',
    title: 'Conduza candidatos com dados completos e etapas bem acompanhadas',
    summary:
      'O modulo de RH organiza a entrada de candidatos, envio de formularios, revisao de documentos e progresso ate a aprovacao.',
    highlight:
      'Quanto mais completo o cadastro inicial, menor a chance de atrasar etapas posteriores do processo.',
    principles: [
      'Dados completos',
      'Status atualizado',
      'Documentos revisados',
      'Historico rastreavel',
    ],
    sections: [
      {
        title: 'Cadastro inicial',
        lead: 'O cadastro e o ponto de partida do processo de admissao.',
        body: [
          'Preencha informacoes essenciais com atencao, principalmente dados pessoais, contato e informacoes de rota quando aplicavel.',
          'Evite criar candidatos duplicados. Antes de cadastrar, busque por nome, CPF ou telefone.',
          'Dados incompletos podem impedir automacoes posteriores e gerar retrabalho para o time.',
        ],
      },
      {
        title: 'Acompanhamento de status',
        lead: 'O status mostra em que etapa o candidato esta.',
        body: [
          'Use Pendente quando o candidato ainda precisa preencher ou enviar informacoes.',
          'Use Em analise quando os dados ja foram recebidos e precisam de revisao.',
          'Use Aprovado apenas quando a admissao estiver validada. Esse status pode disparar etapas importantes do fluxo.',
        ],
      },
    ],
    example: {
      badLabel: 'Registro incompleto',
      bad: 'Candidato cadastrado sem telefone, rota e data de nascimento',
      goodLabel: 'Registro pronto para fluxo',
      good: 'Candidato com contato, documentos, rota e dados obrigatorios revisados',
      note:
        'Um cadastro completo evita pausas no processo e reduz a necessidade de contato manual para corrigir informacoes.',
    },
    checklist: [
      'O candidato ja existe no sistema?',
      'Os dados obrigatorios foram preenchidos?',
      'Documentos e informacoes de contato foram conferidos?',
      'O status reflete a etapa real do processo?',
      'Ha alguma pendencia clara para acompanhamento?',
    ],
    flow: [
      {
        title: 'Cadastre',
        description: 'Inclua dados suficientes para iniciar o processo sem bloqueios.',
      },
      {
        title: 'Revise',
        description: 'Confira documentos, formularios e informacoes essenciais.',
      },
      {
        title: 'Atualize',
        description: 'Mantenha o status coerente com a etapa atual.',
      },
    ],
  },
]

export function AjudaPage() {
  const [activeModule, setActiveModule] = useState<ModuleId>('tickets')
  const role = (user?.role ?? 'OPERACIONAL') as UserRole
  const visibleModules = HELP_MODULES.filter(module => !module.roles || module.roles.includes(role))
  const selectedModule = visibleModules.find(module => module.id === activeModule) ?? visibleModules[0]

  return (
    <>
      <Header moduleName="Ajuda" userName={user?.name ?? ''} />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>Central de conhecimento</span>
            <h1>Guias completos para usar o Acessus com mais clareza</h1>
            <p>
              Aprenda boas praticas, exemplos de preenchimento e criterios que ajudam cada modulo
              a funcionar com menos retrabalho e mais contexto.
            </p>
          </div>

          <div className={styles.heroPanel} aria-hidden="true">
            <div className={styles.heroPanelTop}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.heroLine} />
            <div className={styles.heroLineShort} />
            <div className={styles.heroChecklist}>
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>

        <section className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Categorias de ajuda">
            <span className={styles.sidebarLabel}>Modulos</span>
            {visibleModules.map(module => (
              <button
                key={module.id}
                type="button"
                className={`${styles.navButton} ${selectedModule.id === module.id ? styles.navButtonActive : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <strong>{module.label}</strong>
                <small>{module.eyebrow}</small>
              </button>
            ))}
          </aside>

          <article className={styles.article} key={selectedModule.id}>
            <header className={styles.articleHeader}>
              <span className={styles.articleEyebrow}>{selectedModule.eyebrow}</span>
              <h2>{selectedModule.title}</h2>
              <p>{selectedModule.summary}</p>
            </header>

            <div className={styles.highlight}>
              <span>Principio principal</span>
              <strong>{selectedModule.highlight}</strong>
            </div>

            <div className={styles.principles}>
              {selectedModule.principles.map((principle, index) => (
                <div key={principle} className={styles.principle}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{principle}</strong>
                </div>
              ))}
            </div>

            <div className={styles.content}>
              {selectedModule.sections.map(section => (
                <section key={section.title} className={styles.guideSection}>
                  <h3>{section.title}</h3>
                  <p className={styles.lead}>{section.lead}</p>
                  {section.body.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>

            <section className={styles.exampleBlock}>
              <div className={styles.exampleBad}>
                <span>{selectedModule.example.badLabel}</span>
                <strong>{selectedModule.example.bad}</strong>
              </div>
              <div className={styles.exampleGood}>
                <span>{selectedModule.example.goodLabel}</span>
                <strong>{selectedModule.example.good}</strong>
              </div>
              <p>{selectedModule.example.note}</p>
            </section>

            <section className={styles.bottomGrid}>
              <div className={styles.checklist}>
                <h3>Checklist antes de concluir</h3>
                <ul>
                  {selectedModule.checklist.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.flow}>
                <h3>Fluxo recomendado</h3>
                {selectedModule.flow.map((step, index) => (
                  <div key={step.title} className={styles.flowStep}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </section>
      </main>
    </>
  )
}
