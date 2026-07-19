'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, AlertCircle, RefreshCw, Download, IndianRupee, Clock, CheckCircle2, FileText, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePortalStore } from '@/store/usePortalStore'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function FeesPage() {
  const { fees, receipts, isSyncing, portalStatus } = usePortalStore()
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (receipt: any) => {
    if (!receipt.eventTarget) {
      toast.error("Download link not available for this receipt.");
      return;
    }

    try {
      setDownloading(receipt.eventTarget)
      const res = await fetch('/api/culko/download-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventTarget: receipt.eventTarget })
      })

      if (!res.ok) {
        throw new Error('Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${receipt.receiptNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error("Error downloading file", err);
      toast.error("Error downloading receipt. Please try again.");
    } finally {
      setDownloading(null)
    }
  }

  if (isSyncing && !fees && !receipts) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Fetching fee details...</p>
      </div>
    )
  }

  if (portalStatus === 'error') {
    return (
      <div className="p-6">
        <Card className="border-destructive bg-destructive/5 shadow-none rounded-3xl">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mb-4" />
            <h3 className="text-lg font-bold text-destructive mb-2">Failed to load fee records</h3>
            <p className="text-sm text-destructive/80 font-medium">There was an issue fetching your fee details from the portal.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingFees = fees?.pendingFees || []
  const history = fees?.history || []
  const receiptList = receipts || []

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Background glow */}
      <div className="absolute top-0 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter flex items-center gap-3">
            <Wallet className="w-8 h-8 text-primary" />
            Fees & Accounts
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Manage your pending dues and view payment history
          </p>
        </div>
      </header>

      <Tabs defaultValue="pending" className="w-full flex-col">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto mb-6 inline-flex flex-wrap w-full sm:w-auto items-center justify-start sm:justify-center">
          <TabsTrigger value="pending" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Pending Dues
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Payment History
          </TabsTrigger>
          <TabsTrigger value="receipts" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Receipts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 outline-none animate-in fade-in slide-in-from-bottom-4">
          {pendingFees.length === 0 ? (
            <Card className="glass-panel border-black/5 dark:border-white/5 rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2">No Pending Dues!</h3>
                <p className="text-muted-foreground font-medium">You have cleared all your current fee requirements.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingFees.map((fee: any, idx: number) => (
                <Card key={idx} className="glass-panel border-black/5 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-orange-500/10 p-3 rounded-2xl">
                        <Clock className="w-6 h-6 text-orange-500" />
                      </div>
                      {fee.dueDate && (
                        <span className="text-xs font-bold px-3 py-1 bg-muted rounded-full">
                          Due: {fee.dueDate}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{fee.type}</p>
                      <h3 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-1">
                        <IndianRupee className="w-6 h-6 text-primary" />
                        {fee.amount}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="outline-none animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-panel border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left py-4 px-6 font-bold text-muted-foreground">Receipt No.</th>
                    <th className="text-left py-4 px-6 font-bold text-muted-foreground">Date</th>
                    <th className="text-left py-4 px-6 font-bold text-muted-foreground">Mode</th>
                    <th className="text-right py-4 px-6 font-bold text-muted-foreground">Amount</th>
                    <th className="text-right py-4 px-6 font-bold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">No payment history found.</td>
                    </tr>
                  )}
                  {history.map((record: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-bold text-foreground">{record.receiptNo}</td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">{record.date}</td>
                      <td className="py-4 px-6 text-muted-foreground">
                        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-bold">
                          {record.paymentMode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-foreground">₹{record.amount}</td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-xs font-black uppercase tracking-wider text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                          {record.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="outline-none animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-panel border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left py-4 px-6 font-bold text-muted-foreground">Receipt No.</th>
                    <th className="text-left py-4 px-6 font-bold text-muted-foreground">Date</th>
                    <th className="text-right py-4 px-6 font-bold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-muted-foreground font-medium">No downloadable receipts found.</td>
                    </tr>
                  )}
                  {receiptList.map((receipt: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6 font-bold text-foreground flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        {receipt.receiptNo}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">{receipt.date}</td>
                      <td className="py-4 px-6 text-right">
                        {receipt.eventTarget ? (
                          <Button 
                            size="sm" 
                            className="rounded-xl font-bold bg-primary text-background shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                            onClick={() => handleDownload(receipt)}
                            disabled={downloading === receipt.eventTarget}
                          >
                            {downloading === receipt.eventTarget ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            {downloading === receipt.eventTarget ? 'Downloading' : 'Download'}
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
