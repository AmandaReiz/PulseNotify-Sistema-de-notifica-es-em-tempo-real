import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Siren,
  Sparkles,
  UserRound,
  Wifi,
} from 'lucide-react'
import './App.css'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://pulsenotify-sistema-de-notifica-es-em-843h.onrender.com'
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  'wss://pulsenotify-sistema-de-notifica-es-em-843h.onrender.com/ws/notifications'

const eventTypes = [
  {
    label: 'Pedido saiu',
    icon: PackageCheck,
    title: 'Seu pedido esta a caminho',
    text: 'A cozinha confirmou o envio e o entregador ja esta em rota.',
    tone: 'green',
    type: 'package',
  },
  {
    label: 'Motorista chegou',
    icon: Navigation,
    title: 'Motorista chegou ao ponto',
    text: 'O veiculo esta aguardando no embarque principal.',
    tone: 'blue',
    type: 'driver',
  },
  {
    label: 'Nova mensagem',
    icon: MessageCircle,
    title: 'Nova mensagem recebida',
    text: 'O operador respondeu sua solicitacao em tempo real.',
    tone: 'yellow',
    type: 'message',
  },
  {
    label: 'Alerta critico',
    icon: Siren,
    title: 'Prioridade alta detectada',
    text: 'Uma notificacao urgente foi enviada para usuarios online.',
    tone: 'red',
    type: 'alert',
  },
]

const initialNotifications = [
  {
    id: 1,
    title: 'Aguardando backend',
    text: 'Quando o Spring Boot estiver online, as notificacoes chegam por WebSocket.',
    time: 'agora',
    tone: 'blue',
    Icon: Radio,
  },
  {
    id: 2,
    title: 'Redis reservado',
    text: 'O cache local vai guardar as mensagens recentes do sistema.',
    time: '1 min',
    tone: 'green',
    Icon: ShieldCheck,
  },
]

const users = [
  ['Marina', 'Cliente', 'Online'],
  ['Lucas', 'Entregador', 'Em rota'],
  ['Sofia', 'Suporte', 'Online'],
  ['Rafael', 'Operador', 'Monitorando'],
]

const iconByType = {
  package: PackageCheck,
  driver: Navigation,
  message: MessageCircle,
  alert: Siren,
  system: ShieldCheck,
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selected, setSelected] = useState('Marina')
  const [connection, setConnection] = useState('Conectando')
  const [apiStatus, setApiStatus] = useState('Aguardando backend')
  const [sentCount, setSentCount] = useState(128)
  const [activeSection, setActiveSection] = useState('Painel')
  const [customMessage, setCustomMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [liveOnline, setLiveOnline] = useState(0)
  const [mapCentered, setMapCentered] = useState(false)

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return notifications
    }

    return notifications.filter((notification) =>
      `${notification.title} ${notification.text}`.toLowerCase().includes(query),
    )
  }, [notifications, searchQuery])

  useEffect(() => {
    let active = true

    fetch(`${API_URL}/api/notifications/status`)
      .then((response) => response.json())
      .then((data) => {
        if (!active) {
          return
        }

        setApiStatus('Spring Boot online')
        setLiveOnline(data.onlineUsers ?? 0)
      })
      .catch(() => active && setApiStatus('Backend offline'))

    fetch(`${API_URL}/api/notifications/recent`)
      .then((response) => response.json())
      .then((items) => {
        if (!active || !Array.isArray(items) || items.length === 0) {
          return
        }

        setNotifications(items.map(toViewNotification))
      })
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const socket = new WebSocket(`${WS_URL}?user=${encodeURIComponent(selected)}`)

    socket.addEventListener('open', () => setConnection('WebSocket online'))
    socket.addEventListener('close', () => setConnection('WebSocket fechado'))
    socket.addEventListener('error', () => setConnection('WebSocket com erro'))
    socket.addEventListener('message', (message) => {
      const data = JSON.parse(message.data)

      if (data.event === 'connected') {
        setConnection(`Conectado como ${data.user}`)
        setLiveOnline(data.onlineUsers ?? 1)
      }

      if (data.event === 'notification') {
        setNotifications((current) => [
          toViewNotification(data.payload),
          ...current,
        ].slice(0, 6))
      }
    })

    return () => socket.close()
  }, [selected])

  async function pushNotification(event) {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUser: selected,
          title: event.title,
          text: event.text,
          tone: event.tone,
          type: event.type,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setSentCount((current) => current + 1)
      return true
    } catch {
      setNotifications((current) => [
        {
          id: Date.now(),
          title: 'Backend nao respondeu',
          text: 'Abra o Spring Boot na porta 8080 para enviar notificacoes reais.',
          time: 'agora',
          tone: 'red',
          Icon: Siren,
        },
        ...current,
      ].slice(0, 6))
      return false
    }
  }

  async function sendCustomMessage(event) {
    event.preventDefault()

    const text = customMessage.trim()
    if (!text) {
      return
    }

    const sent = await pushNotification({
      title: `Mensagem para ${selected}`,
      text,
      tone: 'yellow',
      type: 'message',
    })

    if (sent) {
      setCustomMessage('')
    }
  }

  function handleLogin(event) {
    event.preventDefault()

    const username = credentials.username.trim()
    const password = credentials.password.trim()

    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true)
      setLoginError('')
      return
    }

    setLoginError('Use admin no login e admin na senha para acessar a demo.')
  }

  if (!isAuthenticated) {
    return (
      <main className="login-shell">
        <section className="login-card" aria-labelledby="login-title">
          <div className="brand login-brand">
            <div className="brand-mark">
              <Bell size={22} />
            </div>
            <div>
              <strong>PulseNotify</strong>
              <span>Dashboard em tempo real</span>
            </div>
          </div>

          <div>
            <p className="eyebrow">Acesso demo</p>
            <h1 id="login-title">Entre no painel operacional</h1>
            <p className="login-copy">
              Use as credenciais de demonstração para visualizar o fluxo de notificações,
              WebSocket e integração com a API online.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="username">Login</label>
            <input
              autoComplete="username"
              autoFocus
              id="username"
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              placeholder="admin"
              value={credentials.username}
            />

            <label htmlFor="password">Senha</label>
            <input
              autoComplete="current-password"
              id="password"
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="admin"
              type="password"
              value={credentials.password}
            />

            {loginError && <p className="login-error">{loginError}</p>}

            <button type="submit">
              <ShieldCheck size={18} />
              <span>Entrar</span>
            </button>
          </form>

          <div className="login-hint">
            <span>Login: admin</span>
            <span>Senha: admin</span>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegacao">
        <div className="brand">
          <div className="brand-mark">
            <Bell size={22} />
          </div>
          <div>
            <strong>PulseNotify</strong>
            <span>Real-time hub</span>
          </div>
        </div>

        <nav className="nav-list">
          {[
            ['Painel', Radio],
            ['Usuarios', UserRound],
            ['Eventos', Sparkles],
          ].map(([label, Icon]) => (
            <button
              className={activeSection === label ? 'nav-item active' : 'nav-item'}
              key={label}
              onClick={() => setActiveSection(label)}
              type="button"
              title={label}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="system-card">
          <div className="pulse-dot"></div>
          <span>Redis local ativo</span>
          <strong>localhost:6379</strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sistema de notificacoes em tempo real</p>
            <h1>Eventos vivos para usuarios conectados</h1>
            <span className="live-badge">Vendo: {activeSection}</span>
          </div>

          <label className="search-box">
            <Search size={18} />
            <input
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar no feed"
              value={searchQuery}
            />
          </label>
        </header>

        <section className="metrics-grid" aria-label="Metricas">
          <article>
            <Wifi size={20} />
            <span>Sessoes WebSocket reais</span>
            <strong>{liveOnline}</strong>
          </article>
          <article>
            <Clock3 size={20} />
            <span>Status da API</span>
            <strong className="status-text">{apiStatus}</strong>
          </article>
          <article>
            <PackageCheck size={20} />
            <span>Eventos enviados nesta demo</span>
            <strong>{sentCount}</strong>
          </article>
        </section>

        <section className="dashboard-grid">
          <div className="map-panel">
            <div className="map-header">
              <div>
                <span>Operacao ao vivo</span>
                <strong>Centro - Rio de Janeiro</strong>
              </div>
              <button
                onClick={() => setMapCentered((current) => !current)}
                type="button"
                title="Centralizar mapa"
              >
                <MapPin size={18} />
              </button>
            </div>

            <div className="city-map" aria-label="Mapa conceitual">
              <div className="route route-a"></div>
              <div className="route route-b"></div>
              <div className="route route-c"></div>
              <div className="pin pickup">
                <PackageCheck size={18} />
              </div>
              <div className="pin rider">
                <Bike size={18} />
              </div>
              <div className="pin user">
                <UserRound size={18} />
              </div>
              <div className="map-card eta">
                <span>ETA</span>
                <strong>{mapCentered ? '02 min' : '06 min'}</strong>
              </div>
              <div className="map-card delivery">
                <span>Mapa demo</span>
                <strong>{mapCentered ? 'Centralizado' : 'Em rota'}</strong>
              </div>
            </div>
          </div>

          <div className="notification-panel">
            <div className="section-title">
              <div>
                <span>Feed instantaneo</span>
                <strong>{connection}</strong>
              </div>
              <Bell size={20} />
            </div>

            <div className="notification-list">
              {filteredNotifications.map(({ id, title, text, time, tone, Icon }) => (
                <article className={`notification ${tone}`} key={id}>
                  <div className="notification-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <header>
                      <strong>{title}</strong>
                      <span>{time}</span>
                    </header>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="controls-panel">
            <div className="section-title">
              <div>
                <span>Simulador</span>
                <strong>Enviar evento real para {selected}</strong>
              </div>
              <Send size={20} />
            </div>

            <div className="recipient-row">
              {users.slice(0, 3).map(([name]) => (
                <button
                  className={selected === name ? 'selected' : ''}
                  key={name}
                  onClick={() => setSelected(name)}
                  type="button"
                >
                  {name}
                </button>
              ))}
            </div>

            <form className="custom-message" onSubmit={sendCustomMessage}>
              <label htmlFor="custom-message">Mensagem personalizada</label>
              <div>
                <input
                  id="custom-message"
                  onChange={(event) => setCustomMessage(event.target.value)}
                  placeholder="Ex: Seu pedido acabou de sair para entrega"
                  value={customMessage}
                />
                <button type="submit">
                  <Send size={16} />
                  <span>Enviar</span>
                </button>
              </div>
            </form>

            <div className="event-buttons">
              {eventTypes.map((event) => {
                const Icon = event.icon
                return (
                  <button
                    key={event.label}
                    onClick={() => pushNotification(event)}
                    type="button"
                  >
                    <Icon size={18} />
                    <span>{event.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="users-panel">
            <div className="section-title">
              <div>
                <span>Sessoes</span>
                <strong>Usuarios de exemplo</strong>
              </div>
              <CheckCircle2 size={20} />
            </div>

            <div className="user-list">
              {users.map(([name, role, status]) => (
                <article key={name}>
                  <div className="avatar">{name.charAt(0)}</div>
                  <div>
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                  <em>{status}</em>
                </article>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function toViewNotification(notification) {
  const Icon = iconByType[notification.type] ?? Bell

  return {
    id: notification.id,
    title: notification.title,
    text: notification.text,
    time: 'agora',
    tone: notification.tone,
    Icon,
  }
}

export default App
