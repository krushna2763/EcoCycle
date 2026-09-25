import { useState, useRef, useEffect } from 'react'
import { io } from 'socket.io-client'
import {
  CheckCheck,
  Edit3,
  Info,
  Paperclip,
  Search,
  Send,
  Calendar,
} from 'lucide-react'

const SOCKET_URL = 'http://localhost:5000'

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    company: 'GreenCycle Pvt. Ltd.',
    logo: '🌿',
    logoBg: 'bg-emerald-100',
    online: true,
    lastMessage: 'Yes, we can collect it on 22 Aug at 11:00 AM.',
    time: '10:30 AM',
    unread: 2,
    collectionId: 'COL-2026-0816-001',
    messages: [
      { id: 1, sender: 'them', text: 'Hello Krushna, I am interested in your PET Plastic Bottles (50 kg). Is it available for pickup?', time: '10:15 AM', date: '16 Aug 2026' },
      { id: 2, sender: 'me', text: 'Yes, it is available. Please let me know when you can collect.', time: '10:17 AM', date: '16 Aug 2026' },
      { id: 3, sender: 'them', text: 'We can collect it on 22 Aug 2026 around 11:00 AM. Is that okay with you?', time: '10:18 AM', date: '16 Aug 2026' },
      { id: 4, sender: 'me', text: 'Yes, that works for me.', time: '10:19 AM', date: '16 Aug 2026' },
      { id: 5, sender: 'them', text: 'Great! We will confirm the schedule shortly.', time: '10:20 AM', date: '16 Aug 2026' },
      { id: 6, sender: 'them', text: 'We are on the way. We\'ll reach in around 20 minutes.', time: '10:40 AM', date: '22 Aug 2026' },
      { id: 7, sender: 'me', text: 'Okay, I will be here.', time: '10:41 AM', date: '22 Aug 2026' },
      { id: 8, sender: 'them', text: 'Thank you! We have collected the waste.', time: '11:15 AM', date: '22 Aug 2026' },
      { id: 9, sender: 'me', text: 'Thank you! Please confirm once marked as completed.', time: '11:16 AM', date: '22 Aug 2026' },
      { id: 10, sender: 'them', text: 'Yes, we have marked the collection as completed. Thank you!', time: '11:18 AM', date: '22 Aug 2026' },
    ],
  },
  {
    id: 2,
    company: 'Eco Recyclers',
    logo: '♻️',
    logoBg: 'bg-brand-100',
    online: true,
    lastMessage: 'Thank you! We have marked the collection as completed.',
    time: 'Yesterday',
    unread: 1,
    collectionId: 'COL-2026-0818-002',
    messages: [
      { id: 1, sender: 'them', text: 'Hi, we are interested in your HDPE Containers (25 kg).', time: '09:00 AM', date: '18 Aug 2026' },
      { id: 2, sender: 'me', text: 'Sure, when can you pick up?', time: '09:05 AM', date: '18 Aug 2026' },
      { id: 3, sender: 'them', text: 'We can schedule it for 20 Aug at 02:00 PM.', time: '09:10 AM', date: '18 Aug 2026' },
      { id: 4, sender: 'me', text: 'That works. Thank you!', time: '09:12 AM', date: '18 Aug 2026' },
      { id: 5, sender: 'them', text: 'Thank you! We have marked the collection as completed.', time: '03:00 PM', date: '20 Aug 2026' },
    ],
  },
  {
    id: 3,
    company: 'ReUse Industries',
    logo: '🏭',
    logoBg: 'bg-blue-100',
    online: false,
    lastMessage: 'Can you please confirm the location?',
    time: 'Yesterday',
    unread: 0,
    collectionId: 'COL-2026-0810-003',
    messages: [
      { id: 1, sender: 'them', text: 'Hello, we are interested in your Mixed Plastic (30 kg).', time: '11:00 AM', date: '10 Aug 2026' },
      { id: 2, sender: 'me', text: 'Great, it\'s available at Viman Nagar.', time: '11:05 AM', date: '10 Aug 2026' },
      { id: 3, sender: 'them', text: 'Can you please confirm the location?', time: '11:10 AM', date: '10 Aug 2026' },
    ],
  },
  {
    id: 4,
    company: 'Planet Recycle Co.',
    logo: '🌍',
    logoBg: 'bg-violet-100',
    online: false,
    lastMessage: 'We have a requirement for more plastic waste.',
    time: '2 Aug',
    unread: 0,
    collectionId: 'COL-2026-0801-004',
    messages: [
      { id: 1, sender: 'them', text: 'Hello, we have a requirement for more plastic waste.', time: '02:00 PM', date: '2 Aug 2026' },
    ],
  },
  {
    id: 5,
    company: 'Waste Management Inc.',
    logo: 'WM',
    logoBg: 'bg-amber-100',
    online: true,
    lastMessage: 'We\'ll reach in 10 minutes.',
    time: '1 Aug',
    unread: 0,
    collectionId: null,
    messages: [
      { id: 1, sender: 'them', text: 'We\'ll reach in 10 minutes.', time: '04:00 PM', date: '1 Aug 2026' },
    ],
  },
  {
    id: 6,
    company: 'Clean Earth Solutions',
    logo: '🌱',
    logoBg: 'bg-emerald-100',
    online: false,
    lastMessage: 'Please share the pickup address.',
    time: '31 Jul',
    unread: 0,
    collectionId: null,
    messages: [
      { id: 1, sender: 'them', text: 'Please share the pickup address.', time: '10:00 AM', date: '31 Jul 2026' },
    ],
  },
  {
    id: 7,
    company: 'Recycle India',
    logo: '♻️',
    logoBg: 'bg-brand-100',
    online: false,
    lastMessage: 'Looking forward to working with you!',
    time: '30 Jul',
    unread: 0,
    collectionId: null,
    messages: [
      { id: 1, sender: 'them', text: 'Looking forward to working with you!', time: '03:00 PM', date: '30 Jul 2026' },
    ],
  },
]

export default function Messages() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState(1)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Conversations')
  const [socket, setSocket] = useState(null)
  const [typing, setTyping] = useState(null)
  const chatEndRef = useRef(null)

  const active = conversations.find((c) => c.id === activeId)
  const seller = JSON.parse(localStorage.getItem('sellerData') || '{}')

  // Connect to Socket.io
  useEffect(() => {
    const token = localStorage.getItem('sellerToken')
    if (!token) return

    const newSocket = io(SOCKET_URL, {
      auth: { token },
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('newMessage', (msg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            const newMsg = {
              id: c.messages.length + 1,
              sender: 'them',
              text: msg.text,
              time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              date: new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            }
            return { ...c, messages: [...c.messages, newMsg], lastMessage: msg.text, time: 'Just now' }
          }
          return c
        })
      )
    })

    newSocket.on('userTyping', (data) => {
      setTyping(data.userName)
      setTimeout(() => setTyping(null), 3000)
    })

    newSocket.on('userStopTyping', () => {
      setTyping(null)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Join/leave conversation rooms
  useEffect(() => {
    if (!socket || !active) return

    socket.emit('join', `conv-${active.id}`)

    return () => {
      socket.emit('leave', `conv-${active.id}`)
    }
  }, [socket, activeId])

  const filteredConversations = conversations.filter((c) =>
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  const handleSend = () => {
    if (!input.trim() || !active) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const newMsg = {
      id: active.messages.length + 1,
      sender: 'me',
      text: input.trim(),
      time: timeStr,
      date: dateStr,
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg.text, time: 'Just now' }
          : c
      )
    )

    // Emit via socket
    if (socket) {
      socket.emit('sendMessage', {
        conversationId: `conv-${active.id}`,
        text: input.trim(),
        receiverId: active.company,
        receiverName: active.company,
        senderName: seller.fullName || 'Seller',
      })

      socket.emit('stopTyping', { conversationId: `conv-${active.id}` })
    }

    setInput('')
  }

  const handleTyping = () => {
    if (socket && active) {
      socket.emit('typing', {
        conversationId: `conv-${active.id}`,
        userName: seller.fullName || 'Seller',
      })
    }
  }

  const handleSelectConversation = (id) => {
    setActiveId(id)
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c))
  }

  // Group messages by date
  const groupedMessages = active?.messages.reduce((acc, msg) => {
    if (!acc[msg.date]) acc[msg.date] = []
    acc[msg.date].push(msg)
    return acc
  }, {}) || {}

  return (
    <div className="flex h-[calc(100vh-4.5rem)]">
      {/* Conversation list */}
      <div className="flex w-full flex-col border-r border-slate-200 bg-white sm:w-80 lg:w-96">
        {/* Search + filter */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:bg-white"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none"
            >
              <option>All Conversations</option>
              <option>Unread</option>
              <option>Archived</option>
            </select>
            <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-white transition-colors hover:bg-brand-deeper">
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                conv.id === activeId ? 'bg-brand-50/50' : ''
              }`}
            >
              <div className="relative shrink-0">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${conv.logoBg}`}>
                  {conv.logo}
                </span>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{conv.company}</p>
                  <span className="text-[11px] text-slate-400">{conv.time}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-deep px-1.5 text-[10px] font-bold text-white">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="hidden flex-1 flex-col bg-white sm:flex">
        {active ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${active.logoBg}`}>
                    {active.logo}
                  </span>
                  {active.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{active.company}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    {active.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active.collectionId && (
                  <button className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50">
                    <Calendar className="h-3.5 w-3.5" />
                    View Collection
                  </button>
                )}
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* System message */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3">
              <p className="text-center text-xs text-slate-400">
                This is the beginning of your conversation with <span className="font-medium text-slate-600">{active.company}</span>
                {active.collectionId && <> about collection <span className="font-medium text-slate-600">{active.collectionId}</span></>}.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">{date}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {msgs.map((msg) => (
                    <div key={msg.id} className={`mb-3 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender !== 'me' && (
                        <span className={`mr-2.5 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${active.logoBg}`}>
                          {active.logo}
                        </span>
                      )}
                      <div className={`max-w-md rounded-2xl px-4 py-3 ${
                        msg.sender === 'me'
                          ? 'bg-brand-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-900 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          msg.sender === 'me' ? 'text-white/70' : 'text-slate-400'
                        }`}>
                          <span>{msg.time}</span>
                          {msg.sender === 'me' && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active.logoBg}`}>
                    {active.logo}
                  </span>
                  <span>{typing} is typing...</span>
                  <span className="flex gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => { setInput(e.target.value); handleTyping() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-white transition-colors hover:bg-brand-deeper disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-400">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}
