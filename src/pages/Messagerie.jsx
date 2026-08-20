import React, { useState, useEffect, useRef } from 'react'
import { messagesAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Messagerie() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const loadContacts = async () => {
    try {
      const res = await messagesAPI.contacts()
      setContacts(res.data?.contacts || [])
    } catch {} finally { setLoading(false) }
  }

  const loadMessages = async (contactId) => {
    try {
      const res = await messagesAPI.conversation(contactId, {})
      setMessages(res.data?.messages || [])
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch {}
  }

  useEffect(() => { loadContacts() }, [])

  useEffect(() => {
    if (!selectedContact) return
    loadMessages(selectedContact.id)
    const interval = setInterval(() => loadMessages(selectedContact.id), 10000)
    return () => clearInterval(interval)
  }, [selectedContact])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact) return
    try {
      await messagesAPI.send(selectedContact.id, newMessage)
      setNewMessage('')
      loadMessages(selectedContact.id)
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" /></div>

  return (
    <div className="flex gap-4 py-4 h-[calc(100vh-120px)]">
      <div className="w-64 flex flex-col gap-2 overflow-y-auto">
        <h2 className="font-semibold text-white mb-2">Conversations</h2>
        {contacts.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun contact</p>
        ) : contacts.map(c => (
          <button key={c.id} onClick={() => setSelectedContact(c)}
            className={`text-left px-3 py-2 rounded-lg transition-colors ${selectedContact?.id === c.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            <p className="font-medium text-sm">{c.full_name || c.email}</p>
            <p className="text-xs opacity-70">{c.role}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">Sélectionnez une conversation</div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="font-semibold text-white">{selectedContact.full_name || selectedContact.email}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${m.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    <p>{m.content}</p>
                    <p className="text-xs opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-slate-700 flex gap-2">
              <input className="input" placeholder="Votre message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
              <button type="submit" className="btn-primary px-4">Envoyer</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
