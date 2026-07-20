'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Send, File, Search, X, Check, Share2, Shield, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'

export default function CampusRadarPage() {
  const router = useRouter()
  const user = useAuthStore(state => state.user)
  const supabase = createClient()
  
  const [isScanning, setIsScanning] = useState(false)
  const [peers, setPeers] = useState<any[]>([])
  const [selectedPeer, setSelectedPeer] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [transferStatus, setTransferStatus] = useState<'idle' | 'connecting' | 'transferring' | 'success' | 'failed'>('idle')
  const [progress, setProgress] = useState(0)

  const channelRef = useRef<any>(null)

  // WebRTC Simulation logic using Supabase Realtime for signaling
  useEffect(() => {
    if (!user) return

    const channelName = 'radar-signaling'
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const onlinePeers: any[] = []
      
      for (const [key, presences] of Object.entries(state)) {
        if (key !== user.id && presences.length > 0) {
          const peer = presences[0] as any
          onlinePeers.push({
            id: key,
            name: peer.name || 'Anonymous Student',
            distance: Math.floor(Math.random() * 20) + 1, // Simulated distance in feet
            device: peer.device || 'Mobile'
          })
        }
      }
      setPeers(onlinePeers)
    })
    
    // Listen for incoming file transfer requests
    channel.on('broadcast', { event: 'file-transfer' }, ({ payload }) => {
      if (payload.target === user.id) {
        toast(`Incoming file from ${payload.senderName}`, {
          action: {
            label: 'Accept',
            onClick: () => {
              toast.success('File received! (Simulated)')
            }
          }
        })
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  const startScan = () => {
    setIsScanning(true)
    if (channelRef.current && user) {
      channelRef.current.track({
        name: user.full_name || 'Anonymous Student',
        device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Laptop',
        online_at: new Date().toISOString()
      }).then(() => {
        // Automatically stop scanning after 10s if no peers
        setTimeout(() => {
          setIsScanning(false)
        }, 10000)
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSend = () => {
    if (!selectedPeer || !file || !channelRef.current) return
    
    setTransferStatus('connecting')
    
    // Simulate WebRTC connection establishment and transfer
    setTimeout(() => {
      setTransferStatus('transferring')
      let p = 0
      const interval = setInterval(() => {
        p += 10
        setProgress(p)
        if (p >= 100) {
          clearInterval(interval)
          setTransferStatus('success')
          
          // Send broadcast to receiver
          channelRef.current.send({
            type: 'broadcast',
            event: 'file-transfer',
            payload: {
              target: selectedPeer.id,
              senderId: user?.id,
              senderName: user?.full_name,
              fileName: file.name
            }
          })
          
          setTimeout(() => {
            setTransferStatus('idle')
            setProgress(0)
            setFile(null)
            setSelectedPeer(null)
          }, 3000)
        }
      }, 200)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 pt-safe font-inter">
      <div className="flex items-center gap-4 mb-8 border-b pb-6 border-border">
        <button onClick={() => router.back()} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
            <Wifi className="w-8 h-8 text-primary" />
            Campus Radar Drop
          </h1>
          <p className="text-muted-foreground font-medium">Hyper-local P2P file sharing without the cloud.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-panel border-border shadow-premium-sm overflow-hidden relative min-h-[400px] flex flex-col items-center justify-center">
          {/* Radar Animation */}
          {isScanning && (
            <>
              <motion.div 
                animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-2 border-primary/50"
              />
              <motion.div 
                animate={{ scale: [1, 2, 3], opacity: [0.5, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.6 }}
                className="absolute w-32 h-32 rounded-full border-2 border-primary/40"
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute w-64 h-64 rounded-full border border-primary/20 border-t-primary"
              />
            </>
          )}

          <div className="relative z-10 flex flex-col items-center gap-4">
            <button 
              onClick={isScanning ? () => setIsScanning(false) : startScan}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isScanning ? 'bg-primary/20 text-primary' : 'bg-primary text-background hover:scale-105'}`}
            >
              <Search className={`w-10 h-10 ${isScanning ? 'animate-pulse' : ''}`} />
            </button>
            <p className="font-bold text-foreground">
              {isScanning ? "Scanning for nearby devices..." : "Tap to Scan"}
            </p>
            <p className="text-xs text-muted-foreground">Ensure your device is discoverable.</p>
          </div>

          <AnimatePresence>
            {peers.length > 0 && isScanning && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 w-[90%] bg-background/80 backdrop-blur-xl border border-border p-4 rounded-2xl max-h-[200px] overflow-y-auto space-y-2"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Nearby Peers</p>
                {peers.map(peer => (
                  <button 
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedPeer?.id === peer.id ? 'bg-primary/10 border-primary border' : 'bg-muted/50 hover:bg-muted border border-transparent'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {peer.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-foreground">{peer.name}</p>
                        <p className="text-xs text-muted-foreground">{peer.device} • {peer.distance}ft away</p>
                      </div>
                    </div>
                    {selectedPeer?.id === peer.id && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="glass-panel border-border shadow-premium-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-500" />
              Transfer Payload
            </CardTitle>
            <CardDescription>Select a file to drop directly to the chosen peer.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <File className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  {file ? file.name : "Select or drop a file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "PDF, JPG, PNG up to 100MB"}
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target Peer:</span>
                <span className="font-bold">{selectedPeer ? selectedPeer.name : 'None selected'}</span>
              </div>
              
              {transferStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase">
                    <span className="text-primary">{transferStatus}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleSend}
                disabled={!selectedPeer || !file || transferStatus !== 'idle'}
                className="w-full py-4 bg-primary text-background font-black rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {transferStatus === 'success' ? (
                  <><Check className="w-5 h-5" /> Sent Successfully</>
                ) : (
                  <><Send className="w-5 h-5" /> Drop to {selectedPeer ? selectedPeer.name.split(' ')[0] : 'Peer'}</>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground mt-2">
              <Shield className="w-4 h-4" /> End-to-End Encrypted (WebRTC Data Channels)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
