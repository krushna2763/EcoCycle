import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  MessageSquare,
  Search,
  Send,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { getSocket } from '../../services/socket'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { useSocketEvent } from '../../hooks/useLiveUpdates'
import { formatDate, formatTime, statusLabel, timeAgo } from '../../lib/format'

const AVATAR_BGS = ['bg-emerald-100', 'bg-brand-100', 'bg-blue-100', 'bg-violet-100', 'bg-amber-100']
const TYPING_IDLE_MS = 3000

const sameId = (a, b) => String(a) === String(b)

// Add a stored message once: it replaces its optimistic copy (by temp id, or the oldest pending
// copy with the same text when the socket echo arrives before the POST response)
const mergeMessage = (items, message, tempId) => {
  let rest = items
  if (tempId) {
    rest = items.filter((m) => m._id !== tempId)
  } else {
    const pendingIndex = items.findIndex((m) => m.pending && m.text === message.text)
    if (pendingIndex >= 0 && sameId(message.sender, items[pendingIndex].sender)) {
      rest = items.filter((_, i) => i !== pendingIndex)
    }
  }
  if (rest.some((m) => m._id === message._id)) return rest
  return [...rest, message]
}

function Avatar({ conversation, index, size = 'h-11 w-11 text-lg' }) {
  const src = assetUrl(conversation.participant.avatar)
  if (src) return <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full font-bold text-slate-700 ${AVATAR_BGS[index % AVATAR_BGS.length]}`}>
      {conversation.participant.name.charAt(0)}
    </span>
  )
}

export default function Messages() {
  const { seller: me } = useAuth()
  const myId = String(me?.id || me?._id || '')
  const isBuyer = me?.role === 'buyer'
  const base = isBuyer ? '/buyer/dashboard' : '/seller/dashboard'
  const { c: requestedConversation } = useSearch({ strict: false })

  const { data, loading, error, reload, setData } = useApi(() => api.getConversations(), [])
  const conversations = data?.conversations || []
  const [activeId, setActiveId] = useState(requestedConversation ? String(requestedConversation) : null)
  // conversationId -> { items, hasMore } once loaded, or { error }
  const [threads, setThreads] = useState({})
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Conversations')
  const [typingIn, setTypingIn] = useState(null)
  const chatEndRef = useRef(null)
  const typingTimer = useRef(null)
  const lastTypingSent = useRef(0)
  const activeIdRef = useRef(activeId)

  const active = conversations.find((c) => c.conversationId === activeId)
  const activeIndex = conversations.findIndex((c) => c.conversationId === activeId)
  const thread = threads[activeId]

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  const updateConversation = useCallback((conversationId, update) => {
    setData((prev) => prev && {
      ...prev,
      conversations: prev.conversations.map((c) => (c.conversationId === conversationId ? { ...c, ...update(c) } : c)),
    })
  }, [setData])

  const markRead = useCallback((conversationId) => {
    updateConversation(conversationId, () => ({ unread: 0 }))
    api.markConversationRead(conversationId).catch(() => {})
  }, [updateConversation])

  // Load the latest page of messages for a conversation
  const loadThread = useCallback((conversationId) =>
    api.getMessages(conversationId)
      .then((res) => {
        setThreads((prev) => ({ ...prev, [conversationId]: { items: res.messages, hasMore: res.hasMore } }))
        markRead(conversationId)
      })
      .catch((err) => setThreads((prev) => ({ ...prev, [conversationId]: { ...prev[conversationId], error: err.message } }))),
  [markRead])

  useEffect(() => {
    if (!activeId || !active) return undefined
    loadThread(activeId)
    const socket = getSocket()
    socket?.emit('join', activeId)
    return () => socket?.emit('leave', activeId)
    // Reload only when the selected conversation changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, Boolean(active)])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.items?.length, activeId])

  useSocketEvent('newMessage', (message) => {
    const { conversationId } = message
    if (!conversations.some((c) => c.conversationId === conversationId)) {
      reload()
      return
    }
    const fromMe = sameId(message.sender, myId)
    const isOpen = conversationId === activeIdRef.current
    setThreads((prev) => (prev[conversationId]?.items
      ? { ...prev, [conversationId]: { ...prev[conversationId], items: mergeMessage(prev[conversationId].items, message) } }
      : prev))
    updateConversation(conversationId, (c) => ({
      lastMessage: message.text,
      lastMessageFromMe: fromMe,
      time: message.createdAt,
      unread: !fromMe && !isOpen ? c.unread + 1 : c.unread,
    }))
    if (!fromMe && isOpen) markRead(conversationId)
    if (!fromMe && isOpen) setTypingIn(null)
  })

  useSocketEvent('messagesRead', ({ conversationId }) => {
    setThreads((prev) => (prev[conversationId]?.items
      ? {
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            items: prev[conversationId].items.map((m) => (sameId(m.sender, myId) ? { ...m, read: true } : m)),
          },
        }
      : prev))
  })

  useSocketEvent('presence', ({ userId, online }) => {
    setData((prev) => prev && {
      ...prev,
      conversations: prev.conversations.map((c) => (c.participant.id === userId ? { ...c, online } : c)),
    })
  })

  useSocketEvent('userTyping', ({ conversationId }) => {
    setTypingIn(conversationId)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => setTypingIn(null), TYPING_IDLE_MS)
  })
  useSocketEvent('userStopTyping', () => setTypingIn(null))

  // After a reconnect, catch up on anything missed and rejoin the open room
  useSocketEvent('connect', () => {
    reload()
    if (activeIdRef.current) {
      getSocket()?.emit('join', activeIdRef.current)
      loadThread(activeIdRef.current)
    }
  })

  useEffect(() => () => clearTimeout(typingTimer.current), [])

  const sendText = async (text, tempId) => {
    if (!thread?.items) return
    const conversationId = activeId
    const temp = { _id: tempId, conversationId, sender: myId, text, createdAt: new Date().toISOString(), pending: true }
    setThreads((prev) => ({
      ...prev,
      [conversationId]: { ...prev[conversationId], items: [...prev[conversationId].items.filter((m) => m._id !== tempId), temp] },
    }))
    try {
      const { message } = await api.sendMessage({ conversationId, text })
      setThreads((prev) => ({
        ...prev,
        [conversationId]: { ...prev[conversationId], items: mergeMessage(prev[conversationId].items, message, tempId) },
      }))
    } catch (err) {
      setThreads((prev) => ({
        ...prev,
        [conversationId]: {
          ...prev[conversationId],
          items: prev[conversationId].items.map((m) => (m._id === tempId ? { ...m, pending: false, failed: err.message } : m)),
        },
      }))
    }
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text || !active || !thread?.items) return
    setInput('')
    getSocket()?.emit('stopTyping', { conversationId: activeId })
    lastTypingSent.current = 0
    sendText(text, `tmp-${Date.now()}`)
  }

  const handleTyping = () => {
    const now = Date.now()
    if (!activeId || now - lastTypingSent.current < 2000) return
    lastTypingSent.current = now
    getSocket()?.emit('typing', { conversationId: activeId })
  }

  const loadOlder = async () => {
    const first = thread?.items.find((m) => !m.pending && !m.failed)
    if (!first) return
    try {
      const res = await api.getMessages(activeId, first.createdAt)
      setThreads((prev) => ({
        ...prev,
        [activeId]: { items: [...res.messages, ...prev[activeId].items], hasMore: res.hasMore },
      }))
    } catch (err) {
      setThreads((prev) => ({ ...prev, [activeId]: { ...prev[activeId], error: err.message } }))
    }
  }

  const handleSelectConversation = (id) => {
    setActiveId(id)
    setTypingIn(null)
  }

  const filteredConversations = conversations.filter((c) => {
    if (filter === 'Unread' && c.unread === 0) return false
    const term = search.trim().toLowerCase()
    return !term || c.participant.name.toLowerCase().includes(term) || c.request.listingTitle?.toLowerCase().includes(term)
  })

  // Group messages by date
  const groupedMessages = (thread?.items || []).reduce((acc, msg) => {
    const date = formatDate(msg.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  const requestLink = active && (['accepted', 'scheduled', 'in_progress', 'completed'].includes(active.request.status)
    ? `${base}/collections`
    : `${base}/requests`)

  return (
    <div className="flex h-[calc(100vh-4.5rem)]">
      {/* Conversation list */}
      <div className={`${active ? 'hidden sm:flex' : 'flex'} w-full flex-col border-r border-slate-200 bg-white sm:w-80 lg:w-96`}>
        {/* Search + filter */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
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
            </select>
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {loading && !data && (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          )}
          {error && (
            <div className="p-4 text-center text-xs text-red-600">
              {error}
              <button onClick={reload} className="mt-2 block w-full font-semibold underline">Try again</button>
            </div>
          )}
          {data && filteredConversations.length === 0 && (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                {conversations.length === 0
                  ? `Conversations start once ${isBuyer ? 'you send a request to a seller' : 'a buyer sends you a request'}.`
                  : 'No conversations match.'}
              </p>
            </div>
          )}
          {filteredConversations.map((conv) => (
            <button
              key={conv.conversationId}
              onClick={() => handleSelectConversation(conv.conversationId)}
              className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 ${
                conv.conversationId === activeId ? 'bg-brand-50/50' : ''
              }`}
            >
              <div className="relative shrink-0">
                <Avatar conversation={conv} index={conversations.indexOf(conv)} />
                {conv.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-slate-900">{conv.participant.name}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(conv.time)}</span>
                </div>
                <p className="truncate text-[11px] text-slate-400">{conv.request.listingTitle}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {conv.lastMessage ? `${conv.lastMessageFromMe ? 'You: ' : ''}${conv.lastMessage}` : 'No messages yet'}
                </p>
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
      <div className={`${active ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-white`}>
        {active ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Back to conversations"
                  onClick={() => setActiveId(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 sm:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="relative">
                  <Avatar conversation={active} index={activeIndex} size="h-10 w-10 text-lg" />
                  {active.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{active.participant.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${active.online ? 'bg-brand-500' : 'bg-slate-300'}`} />
                    {active.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <Link
                to={requestLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-white px-3.5 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                <Calendar className="h-3.5 w-3.5" />
                {statusLabel(active.request.status)} request
              </Link>
            </div>

            {/* System message */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-3">
              <p className="text-center text-xs text-slate-400">
                Conversation with <span className="font-medium text-slate-600">{active.participant.name}</span>
                {active.request.listingTitle && <> about <span className="font-medium text-slate-600">{active.request.listingTitle}</span></>}.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {!thread?.items && !thread?.error && (
                <div className="flex justify-center py-10">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
                </div>
              )}
              {thread?.error && (
                <div className="mb-3 flex items-center justify-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4" /> {thread.error}
                  <button onClick={() => loadThread(activeId)} className="font-semibold underline">Retry</button>
                </div>
              )}
              {thread?.hasMore && (
                <div className="mb-2 text-center">
                  <button onClick={loadOlder} className="text-xs font-semibold text-brand-700 hover:underline">
                    Load earlier messages
                  </button>
                </div>
              )}
              {thread?.items?.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">No messages yet. Say hello!</p>
              )}

              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">{date}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {msgs.map((msg) => {
                    const mine = sameId(msg.sender, myId)
                    return (
                      <div key={msg._id} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        {!mine && (
                          <span className="mr-2.5 mt-1">
                            <Avatar conversation={active} index={activeIndex} size="h-8 w-8 text-sm" />
                          </span>
                        )}
                        <div className={`max-w-md rounded-2xl px-4 py-3 ${
                          mine
                            ? `${msg.failed ? 'bg-red-500' : 'bg-brand-600'} rounded-br-md text-white`
                            : 'rounded-bl-md bg-slate-100 text-slate-900'
                        }`}>
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.text}</p>
                          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            mine ? 'text-white/70' : 'text-slate-400'
                          }`}>
                            <span>{formatTime(msg.createdAt)}</span>
                            {mine && msg.pending && <Clock className="h-3 w-3" />}
                            {mine && !msg.pending && !msg.failed && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                          </div>
                          {msg.failed && (
                            <button
                              onClick={() => sendText(msg.text, msg._id)}
                              className="mt-1 text-[11px] font-semibold underline"
                            >
                              Not sent — tap to retry
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Typing indicator */}
              {typingIn === activeId && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Avatar conversation={active} index={activeIndex} size="h-6 w-6 text-xs" />
                  <span>{active.participant.name} is typing...</span>
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
            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  maxLength={2000}
                  onChange={(e) => { setInput(e.target.value); handleTyping() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:bg-white"
                />
                <button
                  aria-label="Send message"
                  onClick={handleSend}
                  disabled={!input.trim() || !thread?.items}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-deep text-white transition-colors hover:bg-brand-deeper disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-400">{conversations.length ? 'Select a conversation' : 'No conversations yet'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
