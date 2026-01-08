"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuForm } from "./menu-form"
import { MenuItem, MenuFormData, MenuCategory } from "@/types/menu"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, FileDown, Trash, Pencil, Calendar } from "lucide-react"
import Image from "next/image"

export function MenuManager() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const categories: MenuCategory[] = ["Buffet", "Sushi", "Churrasco", "Sobremesa"]

  useEffect(() => {
    fetchItems()
  }, [date])

  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/menu?date=${date}`)
      const json = await res.json()
      if (res.ok) {
        setItems(json.data)
      } else {
        throw new Error(json.error)
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar cardápio",
        description: "Não foi possível carregar os itens do cardápio.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: MenuFormData) => {
    setIsSubmitting(true)
    try {
      if (editingItem) {
        // Edit single item
        // Note: New form returns array "items" even for edit? 
        // We need to decide if edit mode allows adding more or just editing the one.
        // For simplicity, if editingItem is not null, we assume we are editing THAT item.
        // But the form structure is different now.
        // Let's assume for Edit, we only take the first item from the array or we pass "items" with length 1.
        
        const firstItem = data.items[0]; 
        const payload = {
            date: data.date,
            category: data.category,
            subcategory: data.subcategory,
            name: firstItem.name,
            description: firstItem.description,
            image_url: firstItem.image_url
        }

        const res = await fetch(`/api/menu/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        toast({ title: "Item atualizado com sucesso" })
      } else {
        // Create multiple items
        const payloads = data.items.map(item => ({
            date: data.date,
            category: data.category,
            subcategory: data.subcategory,
            name: item.name,
            description: item.description,
            image_url: item.image_url
        }))

        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloads), // Send array
        })
        if (!res.ok) throw new Error()
        toast({ title: "Itens adicionados com sucesso" })
      }
      setIsDialogOpen(false)
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o item.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      toast({ title: "Item removido com sucesso" })
      fetchItems()
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      })
    }
  }

  const handleClearMenu = async () => {
    if (!confirm("ATENÇÃO: Isso excluirá TODOS os itens do cardápio desta data. Tem certeza?")) return

    setIsLoading(true)
    try {
        const res = await fetch(`/api/menu?date=${date}`, {
            method: "DELETE"
        })
        if (!res.ok) throw new Error()
        
        toast({ title: "Cardápio do dia limpo com sucesso" })
        fetchItems()
    } catch (error) {
        toast({
            title: "Erro ao limpar",
            description: "Não foi possível limpar o cardápio.",
            variant: "destructive"
        })
        setIsLoading(false)
    }
  }

  const handleExportPDF = () => {
    const url = `/api/menu/export-pdf?date=${date}`
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
            <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-9 w-[180px]"
                />
            </div>
            <div className="text-sm text-muted-foreground">
                {format(new Date(date + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="destructive" variant-outline="true" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleClearMenu} disabled={items.length === 0}>
                <Trash className="mr-2 h-4 w-4" />
                Limpar Dia
            </Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={items.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
            </Button>
            <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
            </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Novo Item do Cardápio"}</DialogTitle>
          </DialogHeader>
          <MenuForm
            initialData={editingItem ? {
                date: editingItem.date,
                category: editingItem.category,
                subcategory: editingItem.subcategory,
                items: [{
                    name: editingItem.name,
                    description: editingItem.description || "",
                    image_url: editingItem.image_url || ""
                }]
            } : { date }} 
            onSubmit={handleSave}
            onCancel={() => {
                setIsDialogOpen(false)
                setEditingItem(null)
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="Buffet" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="Buffet">Buffet</TabsTrigger>
            <TabsTrigger value="Sushi">Sushi</TabsTrigger>
            <TabsTrigger value="Churrasco">Churrasco</TabsTrigger>
            <TabsTrigger value="Sobremesa">Sobremesa</TabsTrigger>
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.filter(item => item.category === category).map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.image_url && (
                        <div className="relative h-48 w-full">
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        </div>
                    )}
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.subcategory && (
                                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                                    {item.subcategory}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                      {item.description && <CardDescription>{item.description}</CardDescription>}
                    </CardHeader>
                  </Card>
                ))}
                
                {items.filter(item => item.category === category).length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum item nesta categoria para este dia.
                    </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
